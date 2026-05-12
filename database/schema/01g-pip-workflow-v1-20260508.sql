-- =================================================================
-- Mrkoon PMS — Performance Improvement Plan (PIP) workflow v1
-- Date: 2026-05-08
-- =================================================================

create table if not exists track.pips (
  id                       uuid primary key default uuid_generate_v4(),
  employee_id              uuid not null references def.users(id),
  opened_from_appraisal_id uuid references track.appraisals(id),
  opened_at                timestamptz not null default now(),
  target_close_date        date,
  status                   text not null default 'active' check (status in ('active','closed_success','closed_fail','escalated','cancelled')),
  plan_text                text,
  outcome_text             text,
  closed_at                timestamptz,
  closed_by                uuid references def.users(id),
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index if not exists pips_employee_idx on track.pips(employee_id, status);
create index if not exists pips_status_idx on track.pips(status);

alter table track.pips enable row level security;

-- PIP visibility: HR/admin all; manager their reports; employee their own; dept head their dept
drop policy if exists pip_view on track.pips;
create policy pip_view on track.pips for select to authenticated using (
  employee_id = public.app_user_id()
  or public.app_manages(employee_id)
  or public.app_is_hr() or public.app_is_admin() or public.app_is_clevel()
  or (public.app_is_dept_head() and public.app_in_my_dept(employee_id))
);

drop policy if exists pip_write on track.pips;
create policy pip_write on track.pips for all to authenticated using (
  public.app_is_hr() or public.app_is_admin() or public.app_manages(employee_id)
) with check (
  public.app_is_hr() or public.app_is_admin() or public.app_manages(employee_id)
);

grant select, insert, update on track.pips to authenticated;

-- Trigger: when appraisal closes with rating in a triggers_pip band → auto-create active PIP
create or replace function track.tg_pip_open_on_close() returns trigger language plpgsql security definer as $$
declare v_pip_id uuid; v_band record; v_emp_name text; v_mgr uuid;
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status = 'closed' then
    if new.final_rating is not null then
      select * into v_band from config.rating_bands
       where new.final_rating between min_score and max_score limit 1;
      if found and v_band.triggers_pip = true then
        -- Skip if an active PIP already exists for this employee
        if not exists (select 1 from track.pips where employee_id = new.employee_id and status = 'active') then
          insert into track.pips (employee_id, opened_from_appraisal_id, target_close_date, plan_text)
          values (new.employee_id, new.id, current_date + interval '90 days',
                  'Auto-opened from appraisal close. Final rating: ' || new.final_rating || ' (' || v_band.label_en || ').')
          returning id into v_pip_id;
          select full_name_en into v_emp_name from def.users where id = new.employee_id;
          select manager_id into v_mgr from def.users where id = new.employee_id;
          -- Notify HR + manager
          perform track.fn_notify(hr.id, 'pip.opened',
            'PIP opened: ' || coalesce(v_emp_name, ''),
            'تم فتح خطة تحسين أداء: ' || coalesce(v_emp_name, ''),
            null, null, 'track', 'pips', v_pip_id::text, '/pips')
          from def.users hr where hr.role_code = 'hr' or 'hr' = any(coalesce(hr.permissions, array[]::text[]));
          if v_mgr is not null then
            perform track.fn_notify(v_mgr, 'pip.opened',
              'PIP opened for your report: ' || coalesce(v_emp_name, ''),
              'خطة تحسين أداء لأحد موظفيك: ' || coalesce(v_emp_name, ''),
              null, null, 'track', 'pips', v_pip_id::text, '/pips');
          end if;
          -- Also notify employee
          perform track.fn_notify(new.employee_id, 'pip.opened',
            'A Performance Improvement Plan has been opened for you',
            'تم فتح خطة تحسين أداء لك',
            'Review the plan with your manager and HR.',
            'راجع الخطة مع مديرك والموارد البشرية.',
            'track', 'pips', v_pip_id::text, '/pips');
        end if;
      end if;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists pip_open_trg on track.appraisals;
create trigger pip_open_trg after update on track.appraisals
  for each row execute function track.tg_pip_open_on_close();

notify pgrst, 'reload schema';
