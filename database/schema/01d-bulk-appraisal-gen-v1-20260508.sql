-- =================================================================
-- Mrkoon PMS — Bulk appraisal generation function v1
-- Date: 2026-05-08
--
-- Function: track.fn_generate_appraisals_for_cycle(p_cycle_id uuid)
-- Creates one track.appraisals row per active employee for the cycle
-- + pre-populates appraisal_kpi_scores for each KPI assigned to the
-- employee's functional_role + appraisal_competency_scores for all
-- six competencies. Skips employees who already have an appraisal.
-- =================================================================

create or replace function track.fn_generate_appraisals_for_cycle(p_cycle_id uuid)
returns int language plpgsql security definer as $$
declare
  v_count int := 0;
  v_emp record;
  v_appr_id uuid;
  v_kpi record;
  v_comp record;
begin
  for v_emp in
    select u.id as employee_id, u.functional_role_id
      from def.users u
     where u.active = true
       and not exists (
         select 1 from track.appraisals a
          where a.cycle_id = p_cycle_id and a.employee_id = u.id
       )
  loop
    -- 1) Create the appraisal shell
    insert into track.appraisals (cycle_id, employee_id, status)
    values (p_cycle_id, v_emp.employee_id, 'draft')
    returning id into v_appr_id;
    v_count := v_count + 1;

    -- 2) Pre-populate KPI score rows for this employee's functional role
    if v_emp.functional_role_id is not null then
      for v_kpi in
        select w.kpi_id, w.weight, w.weight_type
          from def.kpi_role_weights w
         where w.functional_role_id = v_emp.functional_role_id
      loop
        insert into track.appraisal_kpi_scores (appraisal_id, kpi_id, weight_used, weight_type_used)
        values (v_appr_id, v_kpi.kpi_id, v_kpi.weight, coalesce(v_kpi.weight_type, 'scored'))
        on conflict do nothing;
      end loop;
    end if;

    -- 3) Pre-populate competency rows (all six)
    for v_comp in
      select id from def.competencies
    loop
      insert into track.appraisal_competency_scores (appraisal_id, competency_id)
      values (v_appr_id, v_comp.id)
      on conflict do nothing;
    end loop;
  end loop;

  return v_count;
end; $$;

grant execute on function track.fn_generate_appraisals_for_cycle(uuid) to authenticated;
