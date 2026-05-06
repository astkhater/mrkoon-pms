-- =================================================================
-- Mrkoon OKR Webapp — RLS Policies v3
-- Date: 2026-05-02
-- Reflects deployed reality on mrkoon-okr-staging (ref: ngfwrylotxnsodfyvegv).
--
-- Change from v2 (RLS):
--   - Helpers moved from `auth.*` to `public.app_*` because Supabase reserves
--     the `auth` schema (CREATE FUNCTION fails with permission denied).
--   - All policies updated to call `public.app_is_admin()`, `public.app_manages()`, etc.
--   - `auth.uid()` (Supabase built-in) still called directly inside helpers.
--
-- Run AFTER 01-schema-v2.sql.
-- =================================================================

-- ============= AUTH HELPERS (public schema) =============
create or replace function public.app_user_role() returns text
language sql stable security definer set search_path = public, def as $$
  select role_code from def.users where id = auth.uid();
$$;

create or replace function public.app_user_dept() returns uuid
language sql stable security definer set search_path = public, def as $$
  select department_id from def.users where id = auth.uid();
$$;

create or replace function public.app_user_functional_role() returns uuid
language sql stable security definer set search_path = public, def as $$
  select functional_role_id from def.users where id = auth.uid();
$$;

create or replace function public.app_is_admin()    returns boolean language sql stable security definer as $$ select public.app_user_role() = 'admin' $$;
create or replace function public.app_is_hr()       returns boolean language sql stable security definer as $$ select public.app_user_role() = 'hr' $$;
create or replace function public.app_is_finance()  returns boolean language sql stable security definer as $$ select public.app_user_role() = 'finance' $$;
create or replace function public.app_is_clevel()   returns boolean language sql stable security definer as $$ select public.app_user_role() = 'c_level' $$;
create or replace function public.app_is_dept_head() returns boolean language sql stable security definer as $$ select public.app_user_role() = 'dept_head' $$;
create or replace function public.app_is_manager()  returns boolean language sql stable security definer as $$ select public.app_user_role() = 'manager' $$;
create or replace function public.app_is_employee() returns boolean language sql stable security definer as $$ select public.app_user_role() = 'employee' $$;

create or replace function public.app_manages(p_employee_id uuid) returns boolean
language sql stable security definer set search_path = public, def as $$
  select exists(select 1 from def.users where id = p_employee_id and manager_id = auth.uid())
$$;

create or replace function public.app_in_my_dept(p_employee_id uuid) returns boolean
language sql stable security definer set search_path = public, def as $$
  select exists(select 1 from def.users where id = p_employee_id and department_id = public.app_user_dept())
$$;

-- ============= ENABLE RLS =============
alter table config.compensation_rates enable row level security;
alter table config.targets             enable row level security;
alter table config.thresholds          enable row level security;
alter table config.salary_bands        enable row level security;
alter table config.levels              enable row level security;
alter table config.assumptions         enable row level security;
alter table config.rating_bands        enable row level security;
alter table config.cycle_periods       enable row level security;

alter table def.departments         enable row level security;
alter table def.roles               enable row level security;
alter table def.functional_roles    enable row level security;
alter table def.users               enable row level security;
alter table def.objectives          enable row level security;
alter table def.key_results         enable row level security;
alter table def.sops                enable row level security;
alter table def.commission_schemes  enable row level security;
alter table def.kpis                enable row level security;
alter table def.kpi_role_weights    enable row level security;
alter table def.kpi_sop_links       enable row level security;
alter table def.competencies        enable row level security;

alter table track.kpi_actuals                enable row level security;
alter table track.events                     enable row level security;
alter table track.appraisal_cycles           enable row level security;
alter table track.appraisals                 enable row level security;
alter table track.appraisal_kpi_scores       enable row level security;
alter table track.appraisal_competency_scores enable row level security;
alter table track.commission_payouts         enable row level security;
alter table track.payout_breakdown           enable row level security;
alter table track.pip_records                enable row level security;

alter table audit.events enable row level security;

-- ============= CONFIG =============
create policy config_rates_admin_finance on config.compensation_rates for all using (public.app_is_admin() or public.app_is_finance()) with check (public.app_is_admin() or public.app_is_finance());
create policy config_targets_admin on config.targets for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy config_targets_read on config.targets for select using (true);
create policy config_thresholds_admin on config.thresholds for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy config_thresholds_read on config.thresholds for select using (true);
create policy config_salary_bands_admin_finance on config.salary_bands for all using (public.app_is_admin() or public.app_is_finance()) with check (public.app_is_admin() or public.app_is_finance());
create policy config_levels_admin_hr on config.levels for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy config_levels_read on config.levels for select using (true);
create policy config_assumptions_admin_hr_finance on config.assumptions for all using (public.app_is_admin() or public.app_is_hr() or public.app_is_finance()) with check (public.app_is_admin() or public.app_is_hr() or public.app_is_finance());
create policy config_assumptions_dept_head_read on config.assumptions for select using (public.app_is_dept_head() and (department_code is null or department_code = (select code from def.departments where id = public.app_user_dept())));
create policy config_assumptions_manager_read on config.assumptions for select using (public.app_is_manager() and (department_code is null or department_code = (select code from def.departments where id = public.app_user_dept())));
create policy config_assumptions_employee_read on config.assumptions for select using (public.app_is_employee() and (functional_role_code is null or functional_role_code = (select code from def.functional_roles where id = public.app_user_functional_role())));
create policy config_assumptions_clevel_read on config.assumptions for select using (public.app_is_clevel());
create policy config_rating_bands_admin_hr on config.rating_bands for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy config_rating_bands_read on config.rating_bands for select using (true);
create policy config_periods_admin_hr on config.cycle_periods for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy config_periods_read on config.cycle_periods for select using (true);

-- ============= DEF =============
create policy def_departments_read on def.departments for select using (true);
create policy def_departments_admin on def.departments for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy def_roles_read on def.roles for select using (true);
create policy def_roles_admin on def.roles for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy def_functional_roles_read on def.functional_roles for select using (true);
create policy def_functional_roles_admin on def.functional_roles for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy def_users_self on def.users for select using (id = auth.uid());
create policy def_users_manager_reports on def.users for select using (manager_id = auth.uid());
create policy def_users_dept_head on def.users for select using (public.app_is_dept_head() and department_id = public.app_user_dept());
create policy def_users_hr_finance_clevel_admin on def.users for select using (public.app_is_admin() or public.app_is_hr() or public.app_is_finance() or public.app_is_clevel());
create policy def_users_admin_hr_write on def.users for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy def_objectives_read on def.objectives for select using (true);
create policy def_objectives_write on def.objectives for all
  using (public.app_is_admin() or public.app_is_clevel() or (public.app_is_dept_head() and department_id = public.app_user_dept()) or owner_user_id = auth.uid())
  with check (public.app_is_admin() or public.app_is_clevel() or (public.app_is_dept_head() and department_id = public.app_user_dept()) or owner_user_id = auth.uid());
create policy def_kr_read on def.key_results for select using (true);
create policy def_kr_write on def.key_results for all
  using (public.app_is_admin() or public.app_is_clevel() or exists (select 1 from def.objectives o where o.id = key_results.objective_id and (o.owner_user_id = auth.uid() or (public.app_is_dept_head() and o.department_id = public.app_user_dept()))))
  with check (public.app_is_admin() or public.app_is_clevel() or exists (select 1 from def.objectives o where o.id = key_results.objective_id and (o.owner_user_id = auth.uid() or (public.app_is_dept_head() and o.department_id = public.app_user_dept()))));
create policy def_sops_read on def.sops for select using (true);
create policy def_sops_admin_hr on def.sops for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy def_schemes_read on def.commission_schemes for select using (true);
create policy def_schemes_admin_finance on def.commission_schemes for all using (public.app_is_admin() or public.app_is_finance()) with check (public.app_is_admin() or public.app_is_finance());
create policy def_kpis_read on def.kpis for select using (true);
create policy def_kpis_admin_hr on def.kpis for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy def_kpi_weights_read on def.kpi_role_weights for select using (true);
create policy def_kpi_weights_admin_hr on def.kpi_role_weights for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy def_links_read on def.kpi_sop_links for select using (true);
create policy def_links_admin_hr on def.kpi_sop_links for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy def_competencies_read on def.competencies for select using (true);
create policy def_competencies_admin_hr on def.competencies for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());

-- ============= TRACK =============
create policy track_actuals_self on track.kpi_actuals for all using (employee_id = auth.uid()) with check (employee_id = auth.uid());
create policy track_actuals_mgr on track.kpi_actuals for select using (public.app_manages(employee_id));
create policy track_actuals_dept_head on track.kpi_actuals for select using (public.app_is_dept_head() and public.app_in_my_dept(employee_id));
create policy track_actuals_hr_admin_clevel on track.kpi_actuals for select using (public.app_is_admin() or public.app_is_hr() or public.app_is_clevel());
create policy track_actuals_finance_scheme on track.kpi_actuals for select using (public.app_is_finance() and exists (select 1 from def.kpis k where k.id = kpi_actuals.kpi_id and k.scheme_ref is not null));
create policy track_actuals_admin_full on track.kpi_actuals for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_events_self on track.events for select using (employee_id = auth.uid());
create policy track_events_mgr on track.events for select using (public.app_manages(employee_id));
create policy track_events_dept_head on track.events for select using (public.app_is_dept_head() and public.app_in_my_dept(employee_id));
create policy track_events_hr_admin_clevel on track.events for select using (public.app_is_admin() or public.app_is_hr() or public.app_is_clevel());
create policy track_events_finance on track.events for select using (public.app_is_finance());
create policy track_events_admin_write on track.events for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_cycles_read on track.appraisal_cycles for select using (true);
create policy track_cycles_admin_hr on track.appraisal_cycles for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());
create policy track_apps_self_rw on track.appraisals for all using (employee_id = auth.uid()) with check (employee_id = auth.uid());
create policy track_apps_mgr_read on track.appraisals for select using (public.app_manages(employee_id));
create policy track_apps_mgr_update on track.appraisals for update using (public.app_manages(employee_id)) with check (public.app_manages(employee_id));
create policy track_apps_dept_head on track.appraisals for all using (public.app_is_dept_head() and public.app_in_my_dept(employee_id)) with check (public.app_is_dept_head() and public.app_in_my_dept(employee_id));
create policy track_apps_hr on track.appraisals for select using (public.app_is_hr());
create policy track_apps_hr_signoff on track.appraisals for update using (public.app_is_hr()) with check (public.app_is_hr());
create policy track_apps_clevel_read on track.appraisals for select using (public.app_is_clevel());
create policy track_apps_admin_full on track.appraisals for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_app_kpi_self on track.appraisal_kpi_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and a.employee_id = auth.uid())) with check (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and a.employee_id = auth.uid()));
create policy track_app_kpi_mgr on track.appraisal_kpi_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and public.app_manages(a.employee_id))) with check (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and public.app_manages(a.employee_id)));
create policy track_app_kpi_dh on track.appraisal_kpi_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and public.app_is_dept_head() and public.app_in_my_dept(a.employee_id))) with check (exists(select 1 from track.appraisals a where a.id = appraisal_kpi_scores.appraisal_id and public.app_is_dept_head() and public.app_in_my_dept(a.employee_id)));
create policy track_app_kpi_hr_admin on track.appraisal_kpi_scores for select using (public.app_is_admin() or public.app_is_hr());
create policy track_app_kpi_admin on track.appraisal_kpi_scores for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_app_comp_self on track.appraisal_competency_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and a.employee_id = auth.uid())) with check (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and a.employee_id = auth.uid()));
create policy track_app_comp_mgr on track.appraisal_competency_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and public.app_manages(a.employee_id))) with check (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and public.app_manages(a.employee_id)));
create policy track_app_comp_dh on track.appraisal_competency_scores for all using (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and public.app_is_dept_head() and public.app_in_my_dept(a.employee_id))) with check (exists(select 1 from track.appraisals a where a.id = appraisal_competency_scores.appraisal_id and public.app_is_dept_head() and public.app_in_my_dept(a.employee_id)));
create policy track_app_comp_admin on track.appraisal_competency_scores for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_payouts_self on track.commission_payouts for select using (employee_id = auth.uid() and status in ('approved','exported'));
create policy track_payouts_mgr_read on track.commission_payouts for select using (public.app_manages(employee_id));
create policy track_payouts_dh_read on track.commission_payouts for select using (public.app_is_dept_head() and public.app_in_my_dept(employee_id));
create policy track_payouts_finance on track.commission_payouts for all using (public.app_is_finance()) with check (public.app_is_finance());
create policy track_payouts_clevel_read on track.commission_payouts for select using (public.app_is_clevel());
create policy track_payouts_admin on track.commission_payouts for all using (public.app_is_admin()) with check (public.app_is_admin());
create policy track_breakdown_view on track.payout_breakdown for select using (
  exists (select 1 from track.commission_payouts p where p.id = payout_breakdown.payout_id and (
    (p.employee_id = auth.uid() and p.status in ('approved','exported'))
    or public.app_manages(p.employee_id)
    or (public.app_is_dept_head() and public.app_in_my_dept(p.employee_id))
    or public.app_is_finance() or public.app_is_admin()
  ))
);
create policy track_breakdown_finance_admin_write on track.payout_breakdown for all using (public.app_is_finance() or public.app_is_admin()) with check (public.app_is_finance() or public.app_is_admin());
create policy track_pip_self on track.pip_records for select using (employee_id = auth.uid());
create policy track_pip_mgr on track.pip_records for select using (public.app_manages(employee_id));
create policy track_pip_dh on track.pip_records for select using (public.app_is_dept_head() and public.app_in_my_dept(employee_id));
create policy track_pip_hr_admin on track.pip_records for all using (public.app_is_admin() or public.app_is_hr()) with check (public.app_is_admin() or public.app_is_hr());

-- ============= AUDIT =============
create policy audit_read_admin_hr_finance_clevel on audit.events for select using (public.app_is_admin() or public.app_is_hr() or public.app_is_finance() or public.app_is_clevel());

-- =================================================================
-- END RLS v3 (deployed reality)
-- =================================================================
