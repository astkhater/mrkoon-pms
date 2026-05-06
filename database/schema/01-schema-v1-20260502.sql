-- =================================================================
-- Mrkoon OKR/KPI/Appraisal Web App — Database Schema v1
-- Date: 2026-05-02
-- Source: Phase 0 confirmation + handover-note v1
--
-- Run order: 01-schema → 02-rls → 03-seed (in this folder)
-- Apply via Supabase SQL Editor; copy-paste section by section.
-- =================================================================

-- ============= EXTENSIONS =============
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============= SCHEMAS =============
create schema if not exists config;
create schema if not exists def;
create schema if not exists track;
create schema if not exists calc;
create schema if not exists audit;

comment on schema config is 'Source of truth: rates, targets, thresholds, salary bands. Edited by Admin/Finance only.';
comment on schema def is 'Definitions: KPIs, OKRs, SOPs, schemes, roles, users, departments.';
comment on schema track is 'Operational tracking: actuals, events, appraisals, payouts.';
comment on schema calc is 'Computed views and RPCs over def + track + config.';
comment on schema audit is 'Immutable audit log. No deletes permitted.';

-- =================================================================
-- AUDIT INFRASTRUCTURE (created first; used by triggers below)
-- =================================================================

create table audit.events (
  id            uuid primary key default uuid_generate_v4(),
  actor         uuid,                     -- auth.users.id; null if system
  action        text not null check (action in ('INSERT','UPDATE','DELETE')),
  schema_name   text not null,
  table_name    text not null,
  row_pk        text not null,
  before_json   jsonb,
  after_json    jsonb,
  at            timestamptz not null default now()
);
create index audit_events_table_idx on audit.events(schema_name, table_name);
create index audit_events_actor_idx on audit.events(actor);
create index audit_events_at_idx on audit.events(at desc);

create or replace function audit.log_change()
returns trigger language plpgsql security definer as $$
declare
  pk_text text;
  actor_id uuid;
begin
  begin
    actor_id := auth.uid();
  exception when others then
    actor_id := null;
  end;
  if (tg_op = 'DELETE') then
    pk_text := coalesce((to_jsonb(old)->>'id')::text,'(no id)');
    insert into audit.events(actor,action,schema_name,table_name,row_pk,before_json,after_json)
    values (actor_id,'DELETE',tg_table_schema,tg_table_name,pk_text,to_jsonb(old),null);
    return old;
  elsif (tg_op = 'UPDATE') then
    pk_text := coalesce((to_jsonb(new)->>'id')::text,'(no id)');
    insert into audit.events(actor,action,schema_name,table_name,row_pk,before_json,after_json)
    values (actor_id,'UPDATE',tg_table_schema,tg_table_name,pk_text,to_jsonb(old),to_jsonb(new));
    return new;
  else
    pk_text := coalesce((to_jsonb(new)->>'id')::text,'(no id)');
    insert into audit.events(actor,action,schema_name,table_name,row_pk,before_json,after_json)
    values (actor_id,'INSERT',tg_table_schema,tg_table_name,pk_text,null,to_jsonb(new));
    return new;
  end if;
end;$$;

-- Helper: attach audit triggers consistently
create or replace function audit.attach(p_schema text, p_table text)
returns void language plpgsql as $$
begin
  execute format(
    'create trigger %I_audit_trg after insert or update or delete on %I.%I for each row execute function audit.log_change()',
    p_table || '_audit', p_schema, p_table
  );
end;$$;

-- Helpers for created/updated stamping
create or replace function audit.stamp_row()
returns trigger language plpgsql as $$
declare
  uid uuid;
begin
  begin uid := auth.uid(); exception when others then uid := null; end;
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := uid;
    new.updated_at := now();
    new.updated_by := uid;
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    new.updated_by := uid;
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  return new;
end;$$;

-- =================================================================
-- AUTH HELPERS (used by RLS in 02-rls.sql)
-- =================================================================
-- These are placeholders that will be filled in 02-rls.sql.
-- Defined here as stable signatures so def.users can reference roles.

create or replace function auth.user_role() returns text
language sql stable as $$ select 'employee'::text $$;
create or replace function auth.user_id_text() returns text
language sql stable as $$ select coalesce(auth.uid()::text,'') $$;

-- =================================================================
-- CONFIG SCHEMA — single source of truth values
-- =================================================================

create table config.compensation_rates (
  id              uuid primary key default uuid_generate_v4(),
  scheme_ref      text not null,             -- e.g. BD-COMM-Q-v7
  key             text not null,             -- e.g. base_per_account_at_50pct
  value_numeric   numeric,
  value_json      jsonb,
  effective_from  date not null default current_date,
  effective_to    date,
  notes           text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (scheme_ref, key, effective_from)
);
create trigger compensation_rates_stamp before insert or update on config.compensation_rates for each row execute function audit.stamp_row();
select audit.attach('config','compensation_rates');

create table config.targets (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,          -- e.g. gp_target_2026
  value       numeric not null,
  unit        text,                          -- EGP, count, pct
  period      text,                          -- 2026, FY2026, Q2-2026
  notes       text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger targets_stamp before insert or update on config.targets for each row execute function audit.stamp_row();
select audit.attach('config','targets');

create table config.thresholds (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       numeric not null,
  applies_to  text,                          -- KPI-036, BD-COMM-Q-v7, etc.
  notes       text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger thresholds_stamp before insert or update on config.thresholds for each row execute function audit.stamp_row();
select audit.attach('config','thresholds');

create table config.salary_bands (
  level             text primary key,        -- L1..L5
  min_pct           numeric not null,        -- e.g. 0.05
  max_pct           numeric not null,        -- e.g. 0.10
  min_score_qualify numeric not null default 3.0,
  notes             text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger salary_bands_stamp before insert or update on config.salary_bands for each row execute function audit.stamp_row();
select audit.attach('config','salary_bands');

create table config.rating_bands (
  id            uuid primary key default uuid_generate_v4(),
  min_score     numeric not null,
  max_score     numeric not null,
  label_en      text not null,
  label_ar      text not null,
  triggers_pip  boolean not null default false,
  ord           int not null,
  unique (ord)
);
create trigger rating_bands_stamp before insert or update on config.rating_bands for each row execute function audit.stamp_row();
select audit.attach('config','rating_bands');

create table config.cycle_periods (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('monthly','quarterly','annual')),
  label       text not null,                 -- "May 2026", "Q2 2026", "2026"
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'open' check (status in ('open','closed','archived')),
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (type, label)
);
create trigger cycle_periods_stamp before insert or update on config.cycle_periods for each row execute function audit.stamp_row();
select audit.attach('config','cycle_periods');

-- =================================================================
-- DEF SCHEMA — definitions
-- =================================================================

create table def.departments (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,          -- BD, AM, OPS, ONB, MKT, TECH, FIN, HR, MGMT
  name_en     text not null,
  name_ar     text not null,
  comp_model  text not null check (comp_model in ('COGS','OpEx')),
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger departments_stamp before insert or update on def.departments for each row execute function audit.stamp_row();
select audit.attach('def','departments');

create table def.roles (
  id              uuid primary key default uuid_generate_v4(),
  code            text not null unique,      -- employee, manager, dept_head, hr, finance, c_level, admin
  name_en         text not null,
  name_ar         text not null,
  is_primary      boolean not null default true,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger roles_stamp before insert or update on def.roles for each row execute function audit.stamp_row();
select audit.attach('def','roles');

create table def.functional_roles (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,          -- BD, AM, VM, OpsTL, OpsField, Onb, MKT, etc.
  name_en     text not null,
  name_ar     text not null,
  department_id uuid references def.departments(id),
  level       text references config.salary_bands(level),
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger functional_roles_stamp before insert or update on def.functional_roles for each row execute function audit.stamp_row();
select audit.attach('def','functional_roles');

create table def.users (
  id                  uuid primary key,         -- = auth.users.id
  email               text not null unique,
  full_name_en        text not null,
  full_name_ar        text,
  role_code           text not null references def.roles(code),
  functional_role_id  uuid references def.functional_roles(id),
  department_id       uuid references def.departments(id),
  manager_id          uuid references def.users(id),
  active              boolean not null default true,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index users_role_idx on def.users(role_code);
create index users_dept_idx on def.users(department_id);
create index users_mgr_idx  on def.users(manager_id);
create trigger users_stamp before insert or update on def.users for each row execute function audit.stamp_row();
select audit.attach('def','users');

create table def.objectives (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,           -- OBJ-1, O-OBJ-1, etc.
  level       text not null check (level in ('company','department','individual')),
  department_id uuid references def.departments(id),
  owner_user_id uuid references def.users(id),
  period_id   uuid references config.cycle_periods(id),
  title_en    text not null,
  title_ar    text not null,
  description text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger objectives_stamp before insert or update on def.objectives for each row execute function audit.stamp_row();
select audit.attach('def','objectives');

create table def.key_results (
  id              uuid primary key default uuid_generate_v4(),
  code            text not null unique,       -- KR1.1, O-KR2.2
  objective_id    uuid not null references def.objectives(id) on delete cascade,
  parent_kr_id    uuid references def.key_results(id),  -- cascade link individual→dept→company
  title_en        text not null,
  title_ar        text not null,
  target_value    numeric,
  unit            text,
  weight          numeric not null default 1.0,
  status          text not null default 'open' check (status in ('open','locked','closed','archived')),
  approved_by     uuid references def.users(id),
  approved_at     timestamptz,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index key_results_obj_idx on def.key_results(objective_id);
create trigger key_results_stamp before insert or update on def.key_results for each row execute function audit.stamp_row();
select audit.attach('def','key_results');

create table def.sops (
  id              text primary key,           -- SOP-001..SOP-010
  title_en        text not null,
  title_ar        text not null,
  department_id   uuid references def.departments(id),
  owner_role_code text references def.roles(code),
  cycle           text,                       -- review cadence
  doc_url         text,
  category        text,
  last_reviewed   date,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger sops_stamp before insert or update on def.sops for each row execute function audit.stamp_row();
select audit.attach('def','sops');

create table def.commission_schemes (
  id            text primary key,             -- BD-COMM-Q-v7, AM-COMM-v7, etc.
  name_en       text not null,
  name_ar       text not null,
  cadence       text not null check (cadence in ('monthly','quarterly','annual')),
  comp_model    text not null check (comp_model in ('COGS','OpEx')),
  description   text,
  active        boolean not null default true,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger commission_schemes_stamp before insert or update on def.commission_schemes for each row execute function audit.stamp_row();
select audit.attach('def','commission_schemes');

create table def.kpis (
  id                  text primary key,       -- KPI-001..KPI-036
  name_en             text not null,
  name_ar             text not null,
  formula_text        text,
  formula_engine_ref  jsonb,                  -- { type, inputs[], expression, threshold? }
  unit                text,
  frequency           text not null check (frequency in ('daily','weekly','monthly','quarterly','annual')),
  owner_role_code     text references def.roles(code),
  owner_functional_id uuid references def.functional_roles(id),
  target_value        numeric,
  threshold_amber     numeric,
  threshold_red       numeric,
  sop_ref             text references def.sops(id),
  kr_ref              uuid references def.key_results(id),
  scheme_ref          text references def.commission_schemes(id),
  weight_default      numeric not null default 0.0,
  is_dashboard_only   boolean not null default false,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index kpis_freq_idx on def.kpis(frequency);
create trigger kpis_stamp before insert or update on def.kpis for each row execute function audit.stamp_row();
select audit.attach('def','kpis');

create table def.kpi_role_weights (
  kpi_id              text not null references def.kpis(id) on delete cascade,
  functional_role_id  uuid not null references def.functional_roles(id) on delete cascade,
  weight              numeric not null,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  primary key (kpi_id, functional_role_id)
);
create trigger kpi_role_weights_stamp before insert or update on def.kpi_role_weights for each row execute function audit.stamp_row();
select audit.attach('def','kpi_role_weights');

-- Bidirectional SOP↔KPI link (closes handover gap)
create table def.kpi_sop_links (
  kpi_id   text not null references def.kpis(id) on delete cascade,
  sop_id   text not null references def.sops(id) on delete cascade,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  primary key (kpi_id, sop_id)
);
create index kpi_sop_links_sop_idx on def.kpi_sop_links(sop_id, kpi_id);
create trigger kpi_sop_links_stamp before insert or update on def.kpi_sop_links for each row execute function audit.stamp_row();
select audit.attach('def','kpi_sop_links');

create table def.competencies (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  name_en     text not null,
  name_ar     text not null,
  description text,
  applies_to_role_codes text[],                -- null = all
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger competencies_stamp before insert or update on def.competencies for each row execute function audit.stamp_row();
select audit.attach('def','competencies');

-- =================================================================
-- TRACK SCHEMA — operational data
-- =================================================================

create table track.kpi_actuals (
  id              uuid primary key default uuid_generate_v4(),
  kpi_id          text not null references def.kpis(id),
  employee_id     uuid not null references def.users(id),
  period_id       uuid not null references config.cycle_periods(id),
  actual_value    numeric not null,
  evidence_ref    text,
  override_comment text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (kpi_id, employee_id, period_id)
);
create index kpi_actuals_emp_idx on track.kpi_actuals(employee_id, period_id);
create trigger kpi_actuals_stamp before insert or update on track.kpi_actuals for each row execute function audit.stamp_row();
select audit.attach('track','kpi_actuals');

-- Generic transactional event store (auctions, loadings, onboarding, referrals, etc.)
create table track.events (
  id              uuid primary key default uuid_generate_v4(),
  event_type      text not null,              -- auction, loading, onboarding, referral, txn, reactivation, upsell
  occurred_at     timestamptz not null,
  employee_id     uuid references def.users(id),
  payload         jsonb not null,             -- type-specific fields
  related_kpi_id  text references def.kpis(id),
  related_scheme_id text references def.commission_schemes(id),
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index events_emp_type_idx on track.events(employee_id, event_type, occurred_at);
create index events_type_at_idx  on track.events(event_type, occurred_at);
create trigger events_stamp before insert or update on track.events for each row execute function audit.stamp_row();
select audit.attach('track','events');

create table track.appraisal_cycles (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('monthly','quarterly','annual')),
  period_id   uuid not null references config.cycle_periods(id),
  status      text not null default 'open' check (status in ('open','locked','closed','archived')),
  deadline    date,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (type, period_id)
);
create trigger appraisal_cycles_stamp before insert or update on track.appraisal_cycles for each row execute function audit.stamp_row();
select audit.attach('track','appraisal_cycles');

create table track.appraisals (
  id                  uuid primary key default uuid_generate_v4(),
  cycle_id            uuid not null references track.appraisal_cycles(id),
  employee_id         uuid not null references def.users(id),
  status              text not null default 'draft' check (status in ('draft','submitted','manager_reviewed','calibrated','hr_signoff','closed','incomplete')),
  self_score          numeric,
  manager_score       numeric,
  dept_head_score     numeric,
  hr_signoff          boolean default false,
  final_rating        numeric,
  rating_band_id      uuid references config.rating_bands(id),
  self_reflection     text,
  manager_comment     text,
  dept_head_comment   text,
  signed_off_at       timestamptz,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (cycle_id, employee_id)
);
create index appraisals_emp_idx on track.appraisals(employee_id);
create trigger appraisals_stamp before insert or update on track.appraisals for each row execute function audit.stamp_row();
select audit.attach('track','appraisals');

create table track.appraisal_kpi_scores (
  id              uuid primary key default uuid_generate_v4(),
  appraisal_id    uuid not null references track.appraisals(id) on delete cascade,
  kpi_id          text not null references def.kpis(id),
  self_rating     numeric,
  manager_rating  numeric,
  weight_used     numeric,
  comment         text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (appraisal_id, kpi_id)
);
create trigger appraisal_kpi_scores_stamp before insert or update on track.appraisal_kpi_scores for each row execute function audit.stamp_row();
select audit.attach('track','appraisal_kpi_scores');

create table track.appraisal_competency_scores (
  id              uuid primary key default uuid_generate_v4(),
  appraisal_id    uuid not null references track.appraisals(id) on delete cascade,
  competency_id   uuid not null references def.competencies(id),
  self_rating     numeric,
  manager_rating  numeric,
  comment         text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (appraisal_id, competency_id)
);
create trigger appraisal_competency_scores_stamp before insert or update on track.appraisal_competency_scores for each row execute function audit.stamp_row();
select audit.attach('track','appraisal_competency_scores');

create table track.commission_payouts (
  id              uuid primary key default uuid_generate_v4(),
  scheme_id       text not null references def.commission_schemes(id),
  period_id       uuid not null references config.cycle_periods(id),
  employee_id     uuid not null references def.users(id),
  total_amount    numeric not null,
  status          text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected','exported')),
  approved_by     uuid references def.users(id),
  approved_at     timestamptz,
  exported_at     timestamptz,
  notes           text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  unique (scheme_id, period_id, employee_id)
);
create index payouts_period_idx on track.commission_payouts(period_id);
create trigger commission_payouts_stamp before insert or update on track.commission_payouts for each row execute function audit.stamp_row();
select audit.attach('track','commission_payouts');

create table track.payout_breakdown (
  id              uuid primary key default uuid_generate_v4(),
  payout_id       uuid not null references track.commission_payouts(id) on delete cascade,
  step_no         int not null,
  step_label      text not null,
  formula         text,
  inputs_json     jsonb,
  intermediate    numeric,
  amount          numeric,
  notes           text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create index payout_breakdown_payout_idx on track.payout_breakdown(payout_id, step_no);
create trigger payout_breakdown_stamp before insert or update on track.payout_breakdown for each row execute function audit.stamp_row();
select audit.attach('track','payout_breakdown');

create table track.pip_records (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references def.users(id),
  triggered_by_appraisal_id uuid references track.appraisals(id),
  triggered_at    timestamptz not null default now(),
  status          text not null default 'open' check (status in ('open','in_progress','completed','closed')),
  notes           text,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid
);
create trigger pip_records_stamp before insert or update on track.pip_records for each row execute function audit.stamp_row();
select audit.attach('track','pip_records');

-- =================================================================
-- CALC SCHEMA — views and RPCs
-- =================================================================

-- KPI score view: actual / target → ratio + traffic light
create or replace view calc.vw_kpi_score as
select
  a.id           as actual_id,
  a.kpi_id,
  a.employee_id,
  a.period_id,
  k.target_value,
  a.actual_value,
  case when k.target_value is null or k.target_value = 0 then null
       else a.actual_value / k.target_value end as ratio,
  case
    when k.target_value is null or k.target_value = 0 then 'gray'
    when a.actual_value / k.target_value >= 1.0 then 'green'
    when a.actual_value / k.target_value >= coalesce(k.threshold_amber,0.7) then 'amber'
    else 'red'
  end as traffic_light
from track.kpi_actuals a
join def.kpis k on k.id = a.kpi_id;

-- OKR cascade progress (rolled up from KR weights)
create or replace view calc.vw_okr_progress as
with kr_progress as (
  select
    kr.id, kr.objective_id, kr.weight, kr.target_value,
    coalesce(
      (select avg(actual_value)
         from track.kpi_actuals ta
         join def.kpis k on k.id = ta.kpi_id
        where k.kr_ref = kr.id),
      0) as actual_avg
  from def.key_results kr
)
select
  kr.objective_id,
  sum(case when kr.target_value > 0 then least(kr.actual_avg / kr.target_value, 1.0) * kr.weight else 0 end)
    / nullif(sum(kr.weight),0) as progress
from kr_progress kr
group by kr.objective_id;

-- Quarterly appraisal score view
create or replace view calc.vw_appraisal_quarterly_score as
select
  a.id as appraisal_id,
  a.employee_id,
  a.cycle_id,
  -- weighted KPI avg
  (select sum(ks.manager_rating * coalesce(ks.weight_used,1))
        / nullif(sum(coalesce(ks.weight_used,1)),0)
     from track.appraisal_kpi_scores ks where ks.appraisal_id = a.id) as kpi_avg,
  -- competency avg
  (select avg(cs.manager_rating)
     from track.appraisal_competency_scores cs where cs.appraisal_id = a.id) as competency_avg,
  a.manager_score
from track.appraisals a;

-- Annual aggregator: averages 4 quarters + applies 70/20/10 weights
create or replace view calc.vw_appraisal_annual_score as
with quarters as (
  select
    a.employee_id,
    cp.start_date,
    extract(year from cp.start_date) as year,
    qs.kpi_avg,
    qs.competency_avg,
    a.manager_score as manager_avg
  from track.appraisals a
  join track.appraisal_cycles c on c.id = a.cycle_id and c.type = 'quarterly'
  join config.cycle_periods cp on cp.id = c.period_id
  join calc.vw_appraisal_quarterly_score qs on qs.appraisal_id = a.id
),
agg as (
  select
    employee_id, year,
    count(*) as q_count,
    avg(kpi_avg)        as kpi_avg,
    avg(competency_avg) as competency_avg,
    avg(manager_avg)    as manager_avg
  from quarters
  group by employee_id, year
)
select
  employee_id, year, q_count,
  kpi_avg, competency_avg, manager_avg,
  (coalesce(kpi_avg,0)*0.7 + coalesce(competency_avg,0)*0.2 + coalesce(manager_avg,0)*0.1) as final_score,
  case when q_count < 4 then 'incomplete' else 'complete' end as status
from agg;

-- Bidirectional SOP↔KPI helpers
create or replace view calc.vw_kpis_by_sop as
select s.id as sop_id, s.title_en as sop_title_en, k.id as kpi_id, k.name_en as kpi_name_en
from def.kpi_sop_links l
join def.sops s on s.id = l.sop_id
join def.kpis k on k.id = l.kpi_id;

create or replace view calc.vw_sops_by_kpi as
select k.id as kpi_id, k.name_en as kpi_name_en, s.id as sop_id, s.title_en as sop_title_en
from def.kpi_sop_links l
join def.kpis k on k.id = l.kpi_id
join def.sops s on s.id = l.sop_id;

-- ==================================================================
-- COMMISSION CALCULATORS — RPC functions per scheme
-- These are skeletons; full per-scheme math implemented in 03-functions.sql (Phase 6 stage)
-- ==================================================================

create or replace function calc.fn_run_bd_commission(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_payout_id uuid;
  v_accounts int;
  v_gp numeric;
  v_target int := 25;
  v_achievement numeric;
  v_rate_per_account numeric;
  v_capped_accounts int;
  v_base numeric;
  v_kicker numeric := 0;
  v_kicker_threshold int;
  v_kicker_gp_floor numeric;
begin
  select coalesce(value::int,13) into v_kicker_threshold from config.thresholds where key='bd_kicker_min_accounts';
  select coalesce(value,300000) into v_kicker_gp_floor from config.thresholds where key='bd_kicker_min_gp';

  select count(*) into v_accounts from track.events
   where event_type='bd_account_close' and employee_id=p_employee_id
     and occurred_at >= (select start_date from config.cycle_periods where id=p_period_id)
     and occurred_at <  (select end_date+1 from config.cycle_periods where id=p_period_id);

  select coalesce(sum((payload->>'gp')::numeric),0) into v_gp from track.events
   where event_type='bd_account_close' and employee_id=p_employee_id
     and occurred_at >= (select start_date from config.cycle_periods where id=p_period_id)
     and occurred_at <  (select end_date+1 from config.cycle_periods where id=p_period_id);

  v_achievement := v_accounts::numeric / v_target;
  v_capped_accounts := least(v_accounts, 30);

  -- Rate scale lookup from config.compensation_rates value_json (table)
  select value_json into v_rate_per_account from config.compensation_rates
   where scheme_ref='BD-COMM-Q-v7' and key='rate_scale' limit 1;
  -- placeholder simple mapping; full scale handled in 03-functions.sql
  v_rate_per_account := case
    when v_achievement >= 1.20 then 1400
    when v_achievement >= 1.00 then 1000
    when v_achievement >= 0.80 then 700
    when v_achievement >= 0.50 then 400
    else 0 end;

  v_base := v_capped_accounts * v_rate_per_account;
  if v_accounts >= v_kicker_threshold and v_gp >= v_kicker_gp_floor then
    v_kicker := 0.05 * v_gp;
  end if;

  insert into track.commission_payouts(scheme_id, period_id, employee_id, total_amount, status)
  values ('BD-COMM-Q-v7', p_period_id, p_employee_id, v_base + v_kicker, 'pending_approval')
  on conflict (scheme_id, period_id, employee_id) do update set total_amount=excluded.total_amount, status='pending_approval'
  returning id into v_payout_id;

  delete from track.payout_breakdown where payout_id = v_payout_id;
  insert into track.payout_breakdown(payout_id, step_no, step_label, formula, inputs_json, intermediate, amount) values
    (v_payout_id, 1, 'Inputs', null, jsonb_build_object('accounts',v_accounts,'gp',v_gp,'target',v_target), null, null),
    (v_payout_id, 2, 'Achievement', 'accounts/target', null, v_achievement, null),
    (v_payout_id, 3, 'Rate per account', 'lookup BD-COMM-Q-v7 rate_scale', null, v_rate_per_account, null),
    (v_payout_id, 4, 'Base commission', 'min(accounts,30) * rate', jsonb_build_object('capped',v_capped_accounts), null, v_base),
    (v_payout_id, 5, 'Kicker', '5% * gp if accts>=13 AND gp>=300k', jsonb_build_object('eligible', v_accounts>=v_kicker_threshold and v_gp>=v_kicker_gp_floor), null, v_kicker),
    (v_payout_id, 6, 'TOTAL', 'base + kicker', null, null, v_base + v_kicker);

  return v_payout_id;
end;$$;

-- Stubs for other scheme calculators (full math added in 03-functions.sql later)
create or replace function calc.fn_run_am_commission(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_vm_commission(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_ops_bonus(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_huss_tl_gates(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_onb_commission(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_opex_quarterly(p_period_id uuid, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;
create or replace function calc.fn_run_annual_bonus(p_year int, p_employee_id uuid)
returns uuid language plpgsql as $$ begin return null; end;$$;

-- Auto-trigger PIP on annual lock < 2.5
create or replace function track.fn_check_pip_on_annual_lock()
returns trigger language plpgsql as $$
begin
  if new.status='closed' and (old.status is null or old.status<>'closed') and new.final_rating is not null and new.final_rating < 2.5 then
    insert into track.pip_records(employee_id, triggered_by_appraisal_id, status)
    values (new.employee_id, new.id, 'open');
  end if;
  return new;
end;$$;

create trigger appraisal_pip_check after update on track.appraisals
for each row execute function track.fn_check_pip_on_annual_lock();

-- =================================================================
-- END OF SCHEMA v1
-- Next: 02-rls-policies-v1.sql
-- =================================================================
