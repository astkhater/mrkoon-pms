-- =================================================================
-- Mrkoon PMS — Bulk commission runner v1
-- Date: 2026-05-08
--
-- Function: calc.fn_run_commission_bulk(p_period_id, p_scheme_filter)
-- Iterates each active employee whose functional_role matches the scheme,
-- calls the right scheme-specific function, and counts payouts created.
-- =================================================================

create or replace function calc.fn_run_commission_bulk(
  p_period_id uuid,
  p_scheme_filter text default null  -- null = run all schemes
) returns table(scheme text, payouts_created int) language plpgsql security definer as $$
declare
  v_count int;
  v_emp record;
begin
  -- BD acquisition (functional_role_code='BD-AM' which is BD acquisition rep)
  if p_scheme_filter is null or p_scheme_filter = 'BD' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'BD-AM'
    loop
      perform calc.fn_run_bd_commission(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'BD'::text, v_count;
  end if;

  -- AM retention
  if p_scheme_filter is null or p_scheme_filter = 'AM' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'AM-AM'
    loop
      perform calc.fn_run_am_commission(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'AM'::text, v_count;
  end if;

  -- VM Sales
  if p_scheme_filter is null or p_scheme_filter = 'VM' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'VM-SALES'
    loop
      perform calc.fn_run_vm_commission(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'VM'::text, v_count;
  end if;

  -- Operations field
  if p_scheme_filter is null or p_scheme_filter = 'OPS' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'OPS-FIELD'
    loop
      perform calc.fn_run_ops_bonus(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'OPS'::text, v_count;
  end if;

  -- Operations TL gates (Hussein)
  if p_scheme_filter is null or p_scheme_filter = 'OPS-TL' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'OPS-TL'
    loop
      perform calc.fn_run_huss_tl_gates(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'OPS-TL'::text, v_count;
  end if;

  -- Onboarding
  if p_scheme_filter is null or p_scheme_filter = 'ONB' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.functional_roles fr on fr.id = u.functional_role_id
       where u.active = true and fr.code = 'ONB-SP'
    loop
      perform calc.fn_run_onb_commission(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'ONB'::text, v_count;
  end if;

  -- OpEx quarterly bonus pool (MKT, TECH, FIN, HR)
  if p_scheme_filter is null or p_scheme_filter = 'OPEX' then
    v_count := 0;
    for v_emp in
      select u.id from def.users u
        join def.departments d on d.id = u.department_id
       where u.active = true and d.code in ('MKT','TECH','FIN','HR')
    loop
      perform calc.fn_run_opex_quarterly(p_period_id, v_emp.id);
      v_count := v_count + 1;
    end loop;
    return query select 'OPEX'::text, v_count;
  end if;
end; $$;

grant execute on function calc.fn_run_commission_bulk(uuid, text) to authenticated;
