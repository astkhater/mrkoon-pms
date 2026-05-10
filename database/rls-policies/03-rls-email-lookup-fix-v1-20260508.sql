-- =================================================================
-- Mrkoon PMS — RLS email-lookup fix v1 + HR write access
-- Date: 2026-05-08
--
-- The original RLS uses auth.uid() compared to def.users.id, but since
-- def.users.id is now independent (we lookup users by email, not by
-- auth user id), the "self" policies were broken for everyone except
-- Khater (whose row was created with auth.uid() match).
--
-- Fix: introduce public.app_user_id() that resolves def.users.id from
-- the email of the current session, and use it in all self/manager
-- policies. Also adds HR/Manager write access on track.kpi_actuals
-- so HR can enter on behalf of BC-tier employees (Mahasen, Shahd) and
-- managers can correct entries for direct reports.
-- =================================================================

create or replace function public.app_user_id() returns uuid
language sql stable security definer set search_path = public, def as $func$
  select u.id from def.users u
   where u.email = (select email from auth.users where id = auth.uid())
   limit 1;
$func$;

-- Refresh helpers that used auth.uid() directly
create or replace function public.app_user_dept() returns uuid
language sql stable security definer set search_path = public, def as $func$
  select department_id from def.users where id = public.app_user_id();
$func$;

create or replace function public.app_user_functional_role() returns uuid
language sql stable security definer set search_path = public, def as $func$
  select functional_role_id from def.users where id = public.app_user_id();
$func$;

create or replace function public.app_manages(p_employee_id uuid) returns boolean
language sql stable security definer set search_path = public, def as $func$
  select exists(select 1 from def.users where id = p_employee_id and manager_id = public.app_user_id())
$func$;

-- track.kpi_actuals — fix self + add HR/Manager write
drop policy if exists track_actuals_self on track.kpi_actuals;
create policy track_actuals_self on track.kpi_actuals for all to authenticated
  using (employee_id = public.app_user_id())
  with check (employee_id = public.app_user_id());

drop policy if exists track_actuals_hr_write on track.kpi_actuals;
create policy track_actuals_hr_write on track.kpi_actuals for all to authenticated
  using (public.app_is_hr())
  with check (public.app_is_hr());

drop policy if exists track_actuals_mgr_write on track.kpi_actuals;
create policy track_actuals_mgr_write on track.kpi_actuals for all to authenticated
  using (public.app_manages(employee_id))
  with check (public.app_manages(employee_id));

-- Appraisals — self/manager lookups via app_user_id
drop policy if exists appraisals_self on track.appraisals;
create policy appraisals_self on track.appraisals for all to authenticated
  using (employee_id = public.app_user_id() or public.app_manages(employee_id) or public.app_is_hr() or public.app_is_admin() or public.app_is_dept_head() or public.app_is_clevel())
  with check (employee_id = public.app_user_id() or public.app_manages(employee_id) or public.app_is_hr() or public.app_is_admin() or public.app_is_dept_head());

drop policy if exists appraisal_kpi_scores_self on track.appraisal_kpi_scores;
create policy appraisal_kpi_scores_self on track.appraisal_kpi_scores for all to authenticated
  using (exists (select 1 from track.appraisals a where a.id = appraisal_id and (a.employee_id = public.app_user_id() or public.app_manages(a.employee_id) or public.app_is_hr() or public.app_is_admin())))
  with check (exists (select 1 from track.appraisals a where a.id = appraisal_id and (a.employee_id = public.app_user_id() or public.app_manages(a.employee_id) or public.app_is_hr() or public.app_is_admin())));

drop policy if exists appraisal_competency_scores_self on track.appraisal_competency_scores;
create policy appraisal_competency_scores_self on track.appraisal_competency_scores for all to authenticated
  using (exists (select 1 from track.appraisals a where a.id = appraisal_id and (a.employee_id = public.app_user_id() or public.app_manages(a.employee_id) or public.app_is_hr() or public.app_is_admin())))
  with check (exists (select 1 from track.appraisals a where a.id = appraisal_id and (a.employee_id = public.app_user_id() or public.app_manages(a.employee_id) or public.app_is_hr() or public.app_is_admin())));

grant execute on function public.app_user_id() to authenticated;
notify pgrst, 'reload schema';
