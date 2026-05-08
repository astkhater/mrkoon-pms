-- =================================================================
-- Mrkoon PMS — config.assumptions seed v1
-- Date: 2026-05-06
-- Source: okr-kpi-framework-v6 Inputs sheet + cost-impact-analysis-v5 Inputs sheet
--
-- Populates the single source of truth for company-wide assumptions.
-- Calc views read these to derive KR targets and KPI thresholds.
-- =================================================================

-- Wipe any prior seed and reload
delete from config.assumptions where department_code is null;

insert into config.assumptions (department_code, period, key, value_numeric, unit, notes, source) values
  -- Revenue / GP model
  (null, 'FY2026', 'gp_target_annual',           30000000, 'EGP',   'FY2026 GP target', 'okr-kpi-framework-v6 Inputs B5'),
  (null, 'FY2026', 'gp_forecast_annual',         29369727, 'EGP',   'Finance v5 forecast', 'okr-kpi-framework-v6 Inputs B6'),
  (null, 'FY2026', 'blended_gp_margin',          0.049,    'ratio', 'Weighted across offerings', 'okr-kpi-framework-v6 Inputs B8'),
  (null, 'FY2026', 'monthly_churn_rate',         0.0293,   'ratio', 'Monthly client churn', 'okr-kpi-framework-v6 Inputs B10'),
  (null, 'FY2026', 'starting_active_base_eoq1',  120,      'count', 'Active client base end of Q1 2026', 'okr-kpi-framework-v6 Inputs B11'),

  -- Operational targets
  (null, 'FY2026', 'weekly_gmv_target',          1000000,  'EGP',   'Weekly GMV target (CO1.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'weekly_txns_target',         20,       'count', 'Weekly transactions (CO1.KR3)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'new_clients_year_target',    196,      'count', '8/month × 4 BD reps from May (CO1.KR4)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'auction_success_rate_min',   0.80,     'ratio', '125% rule pass rate (CO3.KR1)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'paid_insurance_per_auction', 6,        'count', 'Min merchants per auction (CO3.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'active_bidders_per_auction', 3,        'count', 'Min active bidders (CO3.KR3)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'loading_zero_issue_rate',    0.95,     'ratio', 'Quality target (CO3.KR4)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'onboarding_max_days',        5,        'days',  'Onboarding SLA (CO3.KR5)', 'okr-kpi-framework-v6 Company OKRs'),

  -- Retention & growth
  (null, 'FY2026', 'retention_rate_min',         0.85,     'ratio', 'Monthly retention (CO2.KR1)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'reactivation_rate_quarter',  0.20,     'ratio', 'Quarterly reactivation (CO2.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'avg_txns_per_client_month',  2,        'count', 'Avg transactions per client (CO2.KR3)', 'okr-kpi-framework-v6 Company OKRs'),

  -- Marketing
  (null, 'FY2026', 'linkedin_leads_per_month',   40,       'count', 'Qualified client leads (CO4.KR1)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'linkedin_cpl_max',           700,      'EGP',   'Max client CPL on LinkedIn (CO4.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'meta_leads_per_cat_month',   100,      'count', 'Trusted merchant leads (CO4.KR3)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'meta_cpl_max',               100,      'EGP',   'Max merchant CPL on Meta (CO4.KR4)', 'okr-kpi-framework-v6 Company OKRs'),

  -- Platform
  (null, 'FY2026', 'product_roadmap_delivery',   0.85,     'ratio', 'Roadmap completion (CO5.KR1)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'platform_uptime_min',        0.995,    'ratio', 'Uptime SLA (CO5.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'critical_bug_resolution_hr', 4,        'hours', 'P1 bug fix SLA (CO5.KR3)', 'okr-kpi-framework-v6 Company OKRs'),

  -- People / cost ratios (cost-impact v5)
  (null, 'FY2026', 'time_to_fill_max_days',      45,       'days',  'Hiring SLA (CO6.KR2)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'new_hire_90day_retention',   0.90,     'ratio', '90-day retention (CO6.KR3)', 'okr-kpi-framework-v6 Company OKRs'),
  (null, 'FY2026', 'people_cost_gp_ratio_max',   0.60,     'ratio', 'People cost / GP cap (CO6.KR4)', 'cost-impact-analysis-v5 Section 4'),
  (null, 'FY2026', 'fixed_cost_gp_ratio_max',    0.60,     'ratio', 'Fixed cost / GP threshold', 'cost-impact-analysis-v5 Section 4'),
  (null, 'FY2026', 'variable_cost_gp_ratio_max', 0.20,     'ratio', 'Variable cost / GP threshold', 'cost-impact-analysis-v5 Section 4'),

  -- Commission / bonus (BCF v7)
  (null, 'FY2026', 'bd_quarterly_target_acct',   25,       'count', 'BD quarterly acquisition target', 'BCF v7 D1'),
  (null, 'FY2026', 'bd_portfolio_cap',           20,       'count', 'BD portfolio cap', 'BCF v7'),
  (null, 'FY2026', 'gp_kicker_threshold',        300000,   'EGP',   'BD GP kicker activates above', 'BCF v7'),
  (null, 'FY2026', 'gp_kicker_rate',             0.05,     'ratio', 'BD GP kicker rate above threshold', 'BCF v7'),
  (null, 'FY2026', 'gp_kicker_min_accounts',     13,       'count', 'Min accounts for kicker eligibility', 'BCF v7'),

  -- Revenue forecast (cost-impact monthly GP)
  (null, '2026-04', 'monthly_gp_forecast', 1800000, 'EGP', 'Apr-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-05', 'monthly_gp_forecast', 2000000, 'EGP', 'May-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-06', 'monthly_gp_forecast', 2200000, 'EGP', 'Jun-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-07', 'monthly_gp_forecast', 2400000, 'EGP', 'Jul-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-08', 'monthly_gp_forecast', 2700000, 'EGP', 'Aug-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-09', 'monthly_gp_forecast', 3000000, 'EGP', 'Sep-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-10', 'monthly_gp_forecast', 3200000, 'EGP', 'Oct-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-11', 'monthly_gp_forecast', 3500000, 'EGP', 'Nov-26 monthly GP', 'cost-impact-analysis-v5 Section 3'),
  (null, '2026-12', 'monthly_gp_forecast', 3800000, 'EGP', 'Dec-26 monthly GP', 'cost-impact-analysis-v5 Section 3')
on conflict (department_code, functional_role_code, period, key) do update
  set value_numeric = excluded.value_numeric,
      notes         = excluded.notes,
      source        = excluded.source;

-- Verification:
-- select count(*) from config.assumptions where department_code is null;  -- expect 39
-- select key, value_numeric, unit from config.assumptions where period='FY2026' order by key;
