-- =================================================================
-- Mrkoon PMS — Phase 4b: KR/KPI target_value derivation from assumptions
-- Date: 2026-05-08
--
-- Adds formula_ref column to def.key_results and def.kpis.
-- formula_ref is a key in config.assumptions.key, pointing to the
-- single-source-of-truth value. The new calc views surface either
-- the derived value (if formula_ref set) or the static stored value.
--
-- This means: change GP_TARGET in Admin → Assumptions, and the value
-- ripples to every KR/KPI that has formula_ref='gp_target_annual'.
-- =================================================================

-- 1. Add column (nullable; static values still allowed)
alter table def.key_results add column if not exists formula_ref text;
alter table def.kpis        add column if not exists formula_ref text;

create index if not exists kr_formula_ref_idx  on def.key_results(formula_ref);
create index if not exists kpi_formula_ref_idx on def.kpis(formula_ref);

-- 2. Map known KRs to their assumption keys (CO* → assumption keys)
update def.key_results set formula_ref = 'gp_target_annual'           where code = 'CO1.KR1';
update def.key_results set formula_ref = 'weekly_gmv_target'          where code = 'CO1.KR2';
update def.key_results set formula_ref = 'weekly_txns_target'         where code = 'CO1.KR3';
update def.key_results set formula_ref = 'new_clients_year_target'    where code = 'CO1.KR4';
update def.key_results set formula_ref = 'blended_gp_margin'          where code = 'CO1.KR6';
update def.key_results set formula_ref = 'retention_rate_min'         where code = 'CO2.KR1';
update def.key_results set formula_ref = 'reactivation_rate_quarter'  where code = 'CO2.KR2';
update def.key_results set formula_ref = 'avg_txns_per_client_month'  where code = 'CO2.KR3';
update def.key_results set formula_ref = 'auction_success_rate_min'   where code = 'CO3.KR1';
update def.key_results set formula_ref = 'paid_insurance_per_auction' where code = 'CO3.KR2';
update def.key_results set formula_ref = 'active_bidders_per_auction' where code = 'CO3.KR3';
update def.key_results set formula_ref = 'loading_zero_issue_rate'    where code = 'CO3.KR4';
update def.key_results set formula_ref = 'onboarding_max_days'        where code = 'CO3.KR5';
update def.key_results set formula_ref = 'linkedin_leads_per_month'   where code = 'CO4.KR1';
update def.key_results set formula_ref = 'linkedin_cpl_max'           where code = 'CO4.KR2';
update def.key_results set formula_ref = 'meta_leads_per_cat_month'   where code = 'CO4.KR3';
update def.key_results set formula_ref = 'meta_cpl_max'               where code = 'CO4.KR4';
update def.key_results set formula_ref = 'product_roadmap_delivery'   where code = 'CO5.KR1';
update def.key_results set formula_ref = 'platform_uptime_min'        where code = 'CO5.KR2';
update def.key_results set formula_ref = 'critical_bug_resolution_hr' where code = 'CO5.KR3';
update def.key_results set formula_ref = 'time_to_fill_max_days'      where code = 'CO6.KR2';
update def.key_results set formula_ref = 'new_hire_90day_retention'   where code = 'CO6.KR3';
update def.key_results set formula_ref = 'people_cost_gp_ratio_max'   where code = 'CO6.KR4';

-- 3. Map a few KPIs whose target_value is a direct assumption value
update def.kpis set formula_ref = 'retention_rate_min'         where id = 'AM-01';
update def.kpis set formula_ref = 'reactivation_rate_quarter'  where id = 'AM-02';
update def.kpis set formula_ref = 'avg_txns_per_client_month'  where id = 'AM-03';
update def.kpis set formula_ref = 'auction_success_rate_min'   where id = 'VM-02';
update def.kpis set formula_ref = 'paid_insurance_per_auction' where id = 'VM-03';
update def.kpis set formula_ref = 'active_bidders_per_auction' where id = 'VM-04';
update def.kpis set formula_ref = 'linkedin_leads_per_month'   where id = 'MKT-TL-01';
update def.kpis set formula_ref = 'linkedin_cpl_max'           where id = 'MKT-TL-02';
update def.kpis set formula_ref = 'meta_leads_per_cat_month'   where id = 'MKT-TL-03';
update def.kpis set formula_ref = 'meta_cpl_max'               where id = 'MKT-TL-04';
update def.kpis set formula_ref = 'platform_uptime_min'        where id = 'TECH-PO-02';

-- 4. Calc views surfacing derived target (formula_ref overrides static target_value when set)
-- Drop & recreate to force schema reload
drop view if exists calc.vw_kr_target cascade;
create view calc.vw_kr_target as
select
  kr.id,
  kr.code,
  kr.objective_id,
  kr.title_en,
  kr.title_ar,
  kr.unit,
  kr.weight,
  kr.status,
  kr.formula_ref,
  -- derived target = assumption value if formula_ref set; else stored static
  coalesce(
    (select a.value_numeric
       from config.assumptions a
      where a.key = kr.formula_ref
        and a.department_code is null
        and a.period = 'FY2026'
      limit 1),
    kr.target_value
  ) as effective_target,
  kr.target_value as static_target
from def.key_results kr;

drop view if exists calc.vw_kpi_target cascade;
create view calc.vw_kpi_target as
select
  k.id,
  k.name_en,
  k.name_ar,
  k.frequency,
  k.unit,
  k.weight_default,
  k.weight_type_default,
  k.formula_ref,
  k.kr_ref,
  coalesce(
    (select a.value_numeric
       from config.assumptions a
      where a.key = k.formula_ref
        and a.department_code is null
        and a.period = 'FY2026'
      limit 1),
    k.target_value
  ) as effective_target,
  k.target_value as static_target
from def.kpis k;

grant select on calc.vw_kr_target  to authenticated;
grant select on calc.vw_kpi_target to authenticated;

notify pgrst, 'reload schema';

-- Verification:
-- select code, formula_ref, static_target, effective_target from calc.vw_kr_target where formula_ref is not null order by code;
-- select id, formula_ref, static_target, effective_target from calc.vw_kpi_target where formula_ref is not null order by id;
