-- =================================================================
-- Mrkoon PMS — Phase 7b: Notifications inbox v1
-- Date: 2026-05-08
-- =================================================================

create table if not exists track.notifications (
  id              uuid primary key default uuid_generate_v4(),
  recipient_id    uuid not null references def.users(id) on delete cascade,
  kind            text not null,                       -- e.g. 'appraisal.submitted','kr.approved','payout.pending','cycle.opened'
  ref_schema      text,
  ref_table       text,
  ref_id          text,                                -- target record id (uuid::text or text PK)
  title_en        text not null,
  title_ar        text,
  body_en         text,
  body_ar         text,
  link_url        text,
  read_at         timestamptz,
  dismissed_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists notif_recipient_unread_idx on track.notifications(recipient_id) where read_at is null and dismissed_at is null;
create index if not exists notif_recipient_at_idx on track.notifications(recipient_id, created_at desc);

alter table track.notifications enable row level security;
create policy "notif read own"   on track.notifications for select to authenticated using (recipient_id = auth.uid() or public.app_is_admin());
create policy "notif update own" on track.notifications for update to authenticated using (recipient_id = auth.uid() or public.app_is_admin());
create policy "notif insert any" on track.notifications for insert to authenticated with check (true);

grant select, insert, update on track.notifications to authenticated;

-- Helper to insert a notification
create or replace function track.fn_notify(
  p_recipient_id uuid, p_kind text, p_title_en text, p_title_ar text,
  p_body_en text default null, p_body_ar text default null,
  p_ref_schema text default null, p_ref_table text default null, p_ref_id text default null,
  p_link_url text default null
) returns uuid language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into track.notifications (recipient_id, kind, ref_schema, ref_table, ref_id, title_en, title_ar, body_en, body_ar, link_url)
  values (p_recipient_id, p_kind, p_ref_schema, p_ref_table, p_ref_id, p_title_en, p_title_ar, p_body_en, p_body_ar, p_link_url)
  returning id into v_id;
  return v_id;
end; $$;
grant execute on function track.fn_notify(uuid,text,text,text,text,text,text,text,text,text) to authenticated;

-- Trigger: appraisal status change → notify the next reviewer in chain
create or replace function track.tg_appraisal_notify() returns trigger language plpgsql security definer as $$
declare v_mgr uuid; v_dept_head uuid; v_emp_name text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    select full_name_en into v_emp_name from def.users where id = new.employee_id;
    if new.status = 'submitted' then
      select manager_id into v_mgr from def.users where id = new.employee_id;
      if v_mgr is not null then
        perform track.fn_notify(v_mgr, 'appraisal.submitted',
          v_emp_name || ' submitted an appraisal for review',
          v_emp_name || ' أرسل تقييمه للمراجعة',
          null, null, 'track', 'appraisals', new.id::text, '/appraisals/' || new.id::text);
      end if;
    elsif new.status = 'manager_reviewed' then
      -- Notify dept head: assume employee's manager's manager is dept_head
      select u2.id into v_dept_head from def.users u
        join def.users u2 on u2.id = u.manager_id
        where u.id = (select manager_id from def.users where id = new.employee_id);
      if v_dept_head is not null then
        perform track.fn_notify(v_dept_head, 'appraisal.mgr_reviewed',
          v_emp_name || ' — ready for dept head review',
          v_emp_name || ' — جاهز لمراجعة رئيس القسم',
          null, null, 'track', 'appraisals', new.id::text, '/appraisals/' || new.id::text);
      end if;
    elsif new.status in ('calibrated','hr_signoff') then
      -- Notify all HR users
      perform track.fn_notify(hr.id, 'appraisal.ready_hr',
        v_emp_name || ' — ready for HR sign-off',
        v_emp_name || ' — جاهز لاعتماد الموارد البشرية',
        null, null, 'track', 'appraisals', new.id::text, '/appraisals/' || new.id::text)
      from def.users hr where hr.role_code = 'hr' or 'hr' = any(coalesce(hr.permissions, array[]::text[]));
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists appraisal_notify_trg on track.appraisals;
create trigger appraisal_notify_trg after update on track.appraisals
  for each row execute function track.tg_appraisal_notify();

-- Trigger: KR locked → notify objective owner
create or replace function track.tg_kr_notify() returns trigger language plpgsql security definer as $$
declare v_owner uuid; v_obj_code text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'locked' then
    select o.owner_user_id, o.code into v_owner, v_obj_code from def.objectives o where o.id = new.objective_id;
    if v_owner is not null then
      perform track.fn_notify(v_owner, 'kr.approved',
        'KR approved: ' || coalesce(new.code, 'KR'),
        'تم اعتماد النتيجة الرئيسية: ' || coalesce(new.code, ''),
        null, null, 'def', 'key_results', new.id::text, '/okrs');
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists kr_notify_trg on def.key_results;
create trigger kr_notify_trg after update on def.key_results
  for each row execute function track.tg_kr_notify();

-- Trigger: payout pending_approval → notify all finance users
create or replace function track.tg_payout_notify() returns trigger language plpgsql security definer as $$
declare v_emp_name text;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'pending_approval' then
    select full_name_en into v_emp_name from def.users where id = new.employee_id;
    perform track.fn_notify(fin.id, 'payout.pending',
      'Payout pending approval: ' || coalesce(v_emp_name, ''),
      'دفعة في انتظار الاعتماد: ' || coalesce(v_emp_name, ''),
      null, null, 'track', 'commission_payouts', new.id::text, '/bonus')
    from def.users fin where fin.role_code = 'finance' or 'finance' = any(coalesce(fin.permissions, array[]::text[]));
  end if;
  return new;
end; $$;
drop trigger if exists payout_notify_trg on track.commission_payouts;
create trigger payout_notify_trg after update on track.commission_payouts
  for each row execute function track.tg_payout_notify();

notify pgrst, 'reload schema';
