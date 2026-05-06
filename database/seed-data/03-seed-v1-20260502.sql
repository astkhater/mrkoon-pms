-- =================================================================
-- Mrkoon OKR/KPI/Appraisal Web App — Seed Data v1
-- Date: 2026-05-02
-- Source: handover-note v1 §4 + §5; Phase 0 confirmation §3,5,8
-- Run order: AFTER 01-schema and 02-rls
--
-- This seed produces a runnable system with empty tracking tables.
-- Real KPI definition rows are placeholders for 36 IDs; full names,
-- formulas, role weights filled by Build session iterating with
-- handover note's KPI Definitions tab.
-- =================================================================

-- ============= ROLES =============
insert into def.roles (code, name_en, name_ar, is_primary) values
  ('employee',  'Employee',         'موظف',                 true),
  ('manager',   'Manager',          'مدير مباشر',           true),
  ('dept_head', 'Department Head',  'رئيس قسم',             true),
  ('hr',        'HR',               'الموارد البشرية',       true),
  ('finance',   'Finance',          'المالية',              true),
  ('c_level',   'C-Level',          'الإدارة التنفيذية',    true),
  ('admin',     'Admin',            'مسؤول النظام',          true)
on conflict (code) do nothing;

-- ============= DEPARTMENTS =============
insert into def.departments (code, name_en, name_ar, comp_model) values
  ('BD',   'Business Development', 'تطوير الأعمال',     'COGS'),
  ('AM',   'Account Management',   'إدارة الحسابات',    'COGS'),
  ('OPS',  'Operations',           'العمليات',          'COGS'),
  ('VM',   'Value Marketing',      'التسويق الميداني',  'COGS'),
  ('ONB',  'Onboarding',           'التهيئة',           'COGS'),
  ('MKT',  'Marketing',            'التسويق',           'OpEx'),
  ('TECH', 'Technology',           'التكنولوجيا',       'OpEx'),
  ('FIN',  'Finance',              'المالية',           'OpEx'),
  ('HR',   'Human Resources',      'الموارد البشرية',    'OpEx'),
  ('MGMT', 'Management',           'الإدارة',            'OpEx')
on conflict (code) do nothing;

-- ============= FUNCTIONAL ROLES =============
-- (Sample baseline. Admin will extend per real org.)
insert into def.functional_roles (code, name_en, name_ar, department_id, level) values
  ('BD-AM',     'BD Account Manager (acquisition)', 'مسؤول تطوير أعمال', (select id from def.departments where code='BD'),  'L2'),
  ('AM-AM',     'Account Manager (retention)',      'مدير حسابات',        (select id from def.departments where code='AM'),  'L2'),
  ('VM-SALES',  'VM Sales',                         'مسؤول مبيعات ميداني', (select id from def.departments where code='VM'),  'L2'),
  ('OPS-FIELD', 'Operations Field',                 'عمليات ميدانية',     (select id from def.departments where code='OPS'), 'L1'),
  ('OPS-TL',    'Operations Team Lead',             'قائد فريق العمليات',  (select id from def.departments where code='OPS'), 'L3'),
  ('ONB-SP',    'Onboarding Specialist',            'أخصائي تهيئة',       (select id from def.departments where code='ONB'), 'L1'),
  ('MKT-MGR',   'Marketing Manager',                'مدير التسويق',       (select id from def.departments where code='MKT'), 'L3'),
  ('TECH-PO',   'Senior Product Owner',             'مالك منتج أول',      (select id from def.departments where code='TECH'),'L3'),
  ('TECH-MOB',  'Mobile Developer',                 'مطور موبايل',        (select id from def.departments where code='TECH'),'L2'),
  ('FIN-AC',    'Finance Accountant',               'محاسب',              (select id from def.departments where code='FIN'), 'L2'),
  ('HR-SP',     'HR Specialist',                    'أخصائي موارد بشرية', (select id from def.departments where code='HR'),  'L2');

-- ============= SALARY BANDS =============
insert into config.salary_bands (level, min_pct, max_pct, min_score_qualify) values
  ('L1', 0.05, 0.10, 3.0),
  ('L2', 0.08, 0.15, 3.0),
  ('L3', 0.10, 0.20, 3.0),
  ('L4', 0.12, 0.25, 3.0),
  ('L5', 0.15, 0.30, 3.0)
on conflict (level) do nothing;

-- ============= RATING BANDS =============
insert into config.rating_bands (min_score, max_score, label_en, label_ar, triggers_pip, ord) values
  (1.00, 1.49, 'Unsatisfactory',     'غير مرضي',         true, 1),
  (1.50, 2.49, 'Needs Improvement',  'يحتاج تحسين',      true, 2),
  (2.50, 3.49, 'Meets',              'يلبي التوقعات',    false, 3),
  (3.50, 4.49, 'Exceeds',            'يتجاوز التوقعات',  false, 4),
  (4.50, 5.00, 'Exceptional',        'استثنائي',         false, 5);

-- ============= TARGETS (Target-300 anchors) =============
insert into config.targets (key, value, unit, period, notes) values
  ('gp_target_2026',          30000000, 'EGP',   'FY2026',  '30M EGP GP target; conservative scenario 25M'),
  ('clients_target_2026',     300,      'count', 'FY2026',  '300 active clients by EOY'),
  ('clients_per_quarter',     75,       'count', 'quarter', 'Marketing throughput'),
  ('bd_per_quarter_per_rep',  25,       'count', 'quarter', 'BD per-rep target'),
  ('bd_count',                4,        'count', 'FY2026',  'Yassin, Salah, +2 hires from May 2026'),
  ('active_baseline',         104,      'count', '2026-04', 'Locked 2026-05-01')
on conflict (key) do nothing;

-- ============= THRESHOLDS =============
insert into config.thresholds (key, value, applies_to, notes) values
  ('bd_kicker_min_accounts',  13,       'BD-COMM-Q-v7',  'GP Kicker: accounts ≥ 13 AND gp ≥ 300k'),
  ('bd_kicker_min_gp',        300000,   'BD-COMM-Q-v7',  'GP Kicker GP floor (EGP)'),
  ('bd_kicker_pct',           0.05,     'BD-COMM-Q-v7',  '5% of realized GP'),
  ('bd_account_cap',          30,       'BD-COMM-Q-v7',  'Max accounts paid (120%)'),
  ('bd_portfolio_cap',        20,       'BD',            'Active accounts before AM handoff'),
  ('vm_attendance_floor',     6,        'VM-COMM-v7',    'Merchant attendance floor per auction'),
  ('vm_hire_trigger_per_day', 15,       'KPI-036',       'Auctions/VM/day sustained over rolling 22-day window'),
  ('huss_tl_monthly_cap',     5500,     'OPS-TL-GATES-v7','Hussein TL cap'),
  ('onb_monthly_cap',         5000,     'ONB-COMM-v7',   'Onboarding monthly cap'),
  ('onb_clawback_days',       30,       'ONB-COMM-v7',   '30-day no-first-auction clawback window'),
  ('opex_min_score',          3.0,      'OPEX-QTR-v7',   'Min quarterly score to qualify'),
  ('pip_red_threshold',       2.5,      'annual',        'Red threshold triggers PIP')
on conflict (key) do nothing;

-- ============= COMMISSION SCHEMES =============
insert into def.commission_schemes (id, name_en, name_ar, cadence, comp_model, description) values
  ('BD-COMM-Q-v7',      'BD Acquisition Commission',          'عمولة استحواذ تطوير الأعمال', 'quarterly', 'COGS', 'Per-account quarterly with rate scale + GP kicker'),
  ('AM-COMM-v7',        'Account Manager Commission',         'عمولة مدير الحسابات',         'monthly',   'COGS', '6-component: retention/reactivation/upsell/referral/volume/portfolio'),
  ('VM-COMM-v7',        'VM Sales Commission',                'عمولة المبيعات الميدانية',    'monthly',   'COGS', 'Per-auction with attendance floor ≥6'),
  ('OPS-BONUS-v7',      'Operations Bonus',                   'حوافز العمليات',              'monthly',   'COGS', '4-bonus: quality/volume/speed/referral'),
  ('OPS-TL-GATES-v7',   'Operations TL Gates',                'مكافآت قائد العمليات',        'monthly',   'COGS', '5-gate, capped at 5,500 EGP/month'),
  ('ONB-COMM-v7',       'Onboarding Commission',              'عمولة التهيئة',               'monthly',   'COGS', '150 EGP per merchant, 5,000 cap, 30-day clawback'),
  ('OPEX-QTR-v7',       'Quarterly OpEx Bonus',               'مكافأة المصاريف التشغيلية',   'quarterly', 'OpEx', 'L1–L5 salary bands, min score 3.0'),
  ('ANNUAL-BONUS-v7',   'Annual Bonus',                       'المكافأة السنوية',            'annual',    'OpEx', 'Annual rating-driven; COGS gets non-target portion only')
on conflict (id) do nothing;

-- ============= COMPENSATION RATES (per scheme) =============
-- BD rate scale (achievement → EGP per account). Stored as JSON; calculator fn maps to band.
insert into config.compensation_rates (scheme_ref, key, value_json, notes) values
  ('BD-COMM-Q-v7', 'rate_scale', jsonb_build_array(
    jsonb_build_object('min_achievement',0.50,'rate',400),
    jsonb_build_object('min_achievement',0.60,'rate',500),
    jsonb_build_object('min_achievement',0.70,'rate',600),
    jsonb_build_object('min_achievement',0.80,'rate',700),
    jsonb_build_object('min_achievement',0.90,'rate',850),
    jsonb_build_object('min_achievement',1.00,'rate',1000),
    jsonb_build_object('min_achievement',1.10,'rate',1200),
    jsonb_build_object('min_achievement',1.20,'rate',1400)
  ), 'Intermediate steps inferred linearly between 50%→1.20%; verify against BD-Commission-Calculator.xlsx during go-live'),
  ('AM-COMM-v7', 'retention_per_client',          jsonb_build_object('amount',200), 'EGP/active client/month'),
  ('AM-COMM-v7', 'reactivation_per_event',        jsonb_build_object('amount',500,'monthly_cap',1500,'min_retained_months',2), null),
  ('AM-COMM-v7', 'upsell_per_category',           jsonb_build_object('amount',300), null),
  ('AM-COMM-v7', 'referral',                      jsonb_build_object('amount',1000), null),
  ('AM-COMM-v7', 'volume_bonus',                  jsonb_build_object('amount',1500,'min_avg_txns',2), null),
  ('AM-COMM-v7', 'portfolio_bonus',               jsonb_build_object('amount',1000,'min_clients',40,'min_transacting_pct',0.80), null),
  ('VM-COMM-v7', 'success_base',                  jsonb_build_object('amount',500), 'auction with ≥1 bidder'),
  ('VM-COMM-v7', 'extra_bidder',                  jsonb_build_object('amount',50),  'per bidder above 1'),
  ('VM-COMM-v7', 'non_success_flat',              jsonb_build_object('amount',250), null),
  ('OPS-BONUS-v7', 'quality',                     jsonb_build_object('amount',750,'min_zero_issue_rate',0.95), null),
  ('OPS-BONUS-v7', 'volume_per_10_loadings',      jsonb_build_object('amount',1000), null),
  ('OPS-BONUS-v7', 'speed',                       jsonb_build_object('amount',200,'min_on_time_rate',0.90), null),
  ('OPS-BONUS-v7', 'referral',                    jsonb_build_object('amount',2000), null),
  ('OPS-TL-GATES-v7', 'ops_gate_1_zero_issue',    jsonb_build_object('amount',1500,'threshold',0.95), null),
  ('OPS-TL-GATES-v7', 'ops_gate_2_on_time',       jsonb_build_object('amount',1000,'threshold',0.90), null),
  ('OPS-TL-GATES-v7', 'ops_gate_3_no_escalation', jsonb_build_object('amount',500), null),
  ('OPS-TL-GATES-v7', 'vm_gate_1_fill_rate',      jsonb_build_object('amount',1500,'threshold',0.80), null),
  ('OPS-TL-GATES-v7', 'vm_gate_2_avg_bidders',    jsonb_build_object('amount',1000,'threshold',4),    null),
  ('ONB-COMM-v7', 'per_merchant',                 jsonb_build_object('amount',150,'monthly_cap',5000,'clawback_amount',150,'clawback_window_days',30), null),
  ('OPEX-QTR-v7', 'band_scaling',                 jsonb_build_object('mode','linear_within_band','min_score',3.0), null),
  ('ANNUAL-BONUS-v7', 'cogs_non_target_split',    jsonb_build_object('sop_pct',0.30,'reporting_pct',0.20), null),
  ('ANNUAL-BONUS-v7', 'opex_scaled_by_band',      jsonb_build_object('mode','full_band'), null);

-- ============= CYCLE PERIODS (current FY 2026) =============
insert into config.cycle_periods (type, label, start_date, end_date, status) values
  ('quarterly', 'Q1 2026', '2026-01-01', '2026-03-31', 'closed'),
  ('quarterly', 'Q2 2026', '2026-04-01', '2026-06-30', 'open'),
  ('quarterly', 'Q3 2026', '2026-07-01', '2026-09-30', 'open'),
  ('quarterly', 'Q4 2026', '2026-10-01', '2026-12-31', 'open'),
  ('annual',    'FY 2026', '2026-01-01', '2026-12-31', 'open'),
  ('monthly',   'May 2026','2026-05-01', '2026-05-31', 'open'),
  ('monthly',   'Apr 2026','2026-04-01', '2026-04-30', 'closed');

-- ============= COMPETENCIES (baseline) =============
insert into def.competencies (code, name_en, name_ar, description) values
  ('OWNERSHIP',     'Ownership',     'المسؤولية',   'Takes responsibility for outcomes, not just tasks'),
  ('COLLABORATION', 'Collaboration', 'التعاون',     'Works effectively with peers, gives and receives feedback'),
  ('QUALITY',       'Quality',       'الجودة',      'Attention to detail; accurate work; meets standards'),
  ('CLIENT_FOCUS',  'Client Focus',  'تركيز على العميل','Centers decisions on client value and experience'),
  ('LEARNING',      'Learning',      'التعلم',      'Develops skills proactively; applies new knowledge'),
  ('COMMUNICATION', 'Communication', 'التواصل',     'Clear, timely, bilingual where required');

-- ============= SOPs (10) =============
insert into def.sops (id, title_en, title_ar, department_id, owner_role_code, cycle, category, last_reviewed) values
  ('SOP-001','Client Onboarding',                  'تهيئة العملاء',          (select id from def.departments where code='BD'),  'manager','quarterly','onboarding','2026-04-15'),
  ('SOP-002','Merchant Onboarding',                'تهيئة التجار',           (select id from def.departments where code='ONB'), 'manager','quarterly','onboarding','2026-04-15'),
  ('SOP-003','Auction Management',                 'إدارة المزادات',         (select id from def.departments where code='OPS'), 'manager','quarterly','operations','2026-04-15'),
  ('SOP-004','Payment & Collection',               'الدفع والتحصيل',         (select id from def.departments where code='FIN'), 'manager','quarterly','finance','2026-04-15'),
  ('SOP-005','Dispute Resolution',                 'حل النزاعات',            (select id from def.departments where code='OPS'), 'manager','quarterly','operations','2026-04-15'),
  ('SOP-006','Logistics Coordination',             'تنسيق اللوجستيات',       (select id from def.departments where code='OPS'), 'manager','quarterly','operations','2026-04-15'),
  ('SOP-007','Marketing Operations',               'عمليات التسويق',         (select id from def.departments where code='MKT'), 'manager','quarterly','marketing','2026-04-15'),
  ('SOP-008','Account Management',                 'إدارة الحسابات',         (select id from def.departments where code='AM'),  'manager','quarterly','retention','2026-04-15'),
  ('SOP-009','Listing Creation & Quality Review',  'إنشاء القوائم ومراجعة الجودة',(select id from def.departments where code='OPS'), 'manager','quarterly','operations',null),
  ('SOP-010','Fulfilment & Deal Closure',          'الإيفاء وإتمام الصفقة',  (select id from def.departments where code='OPS'), 'manager','quarterly','operations',null);

-- ============= COMPANY OBJECTIVES (6 obj from handover) =============
insert into def.objectives (code, level, period_id, title_en, title_ar) values
  ('OBJ-1', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Acquire 75 clients/quarter to reach 300 EOY', 'الاستحواذ على 75 عميل ربعياً للوصول إلى 300 بنهاية العام'),
  ('OBJ-2', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Retain ≥95% of active clients',                'الاحتفاظ بـ ≥95% من العملاء النشطين'),
  ('OBJ-3', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Increase auction efficiency',                  'تحسين كفاءة المزادات'),
  ('OBJ-4', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Improve payment & collection',                 'تحسين الدفع والتحصيل'),
  ('OBJ-5', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Strengthen marketing throughput',              'تعزيز إنتاجية التسويق'),
  ('OBJ-6', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Hit 30M EGP GP target',                        'تحقيق هدف الربح الإجمالي 30 مليون جنيه');

-- Ops department OKRs (4 obj)
insert into def.objectives (code, level, department_id, period_id, title_en, title_ar) values
  ('O-OBJ-1', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Auction operational excellence',          'التميز التشغيلي للمزادات'),
  ('O-OBJ-2', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Loading efficiency and reliability',      'كفاءة ومصداقية التحميل'),
  ('O-OBJ-3', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Merchant base activation',                'تنشيط قاعدة التجار'),
  ('O-OBJ-4', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Quality and dispute reduction',           'الجودة وتقليل النزاعات');

-- KEY RESULTS — sample skeleton; full 28+17 to be expanded by Build session
-- Company KR sample
insert into def.key_results (code, objective_id, title_en, title_ar, target_value, unit, weight) values
  ('KR1.1', (select id from def.objectives where code='OBJ-1'), '25 BD acquisitions per BD per quarter', '25 صفقة استحواذ لكل مسؤول تطوير ربعياً', 25, 'count', 1.0),
  ('KR1.2', (select id from def.objectives where code='OBJ-1'), '50 marketing-sourced clients per quarter', '50 عميل من التسويق ربعياً', 50, 'count', 1.0),
  ('KR1.3', (select id from def.objectives where code='OBJ-1'), 'Onboarding cycle ≤ 14 days', 'دورة التهيئة ≤ 14 يوم', 14, 'days', 1.0),
  ('KR1.4', (select id from def.objectives where code='OBJ-1'), 'Onboarding throughput keeps pace with intake', 'إنتاجية التهيئة تتماشى مع المدخلات', 1, 'ratio', 1.0),
  ('KR2.1', (select id from def.objectives where code='OBJ-2'), '95% client retention quarterly', '95% احتفاظ بالعملاء ربعياً', 0.95, 'ratio', 1.0),
  ('O-KR2.1', (select id from def.objectives where code='O-OBJ-2'), 'On-time loading ≥ 90%', 'التحميل في الوقت ≥ 90%', 0.90, 'ratio', 1.0),
  ('O-KR2.2', (select id from def.objectives where code='O-OBJ-1'), 'Avg merchant attendance per auction ≥ 6', 'متوسط حضور التجار للمزاد ≥ 6', 6, 'count', 1.0),
  ('O-KR2.3', (select id from def.objectives where code='O-OBJ-2'), 'Loading distribution balance index', 'مؤشر توازن توزيع التحميل', 1, 'index', 0.5),
  ('O-KR3.3', (select id from def.objectives where code='O-OBJ-3'), 'Merchant DB activation rate', 'معدل تنشيط قاعدة التجار', 0.50, 'ratio', 1.0);

-- ============= KPIS (36 — placeholder skeleton; build session iterates with handover KPI Definitions tab to fill name_ar, formula, weights) =============
-- We seed 36 ids with default placeholders; Admin/HR fills full content via UI.

do $$
declare i int;
begin
  for i in 1..36 loop
    insert into def.kpis (id, name_en, name_ar, frequency, weight_default, is_dashboard_only)
    values (
      'KPI-' || lpad(i::text, 3, '0'),
      'KPI ' || i,
      'KPI ' || i,
      'monthly',
      0.0,
      i in (33,34,35,36)
    ) on conflict (id) do nothing;
  end loop;
end$$;

-- Tag the 4 new dashboard-only KPIs explicitly (names/frequencies)
update def.kpis set name_en='Auctions per VM',                   name_ar='عدد المزادات لكل مسؤول ميداني',  frequency='daily',   sop_ref='SOP-003' where id='KPI-033';
update def.kpis set name_en='Loading distribution',              name_ar='توزيع التحميل',                    frequency='monthly', sop_ref='SOP-006' where id='KPI-034';
update def.kpis set name_en='Merchant DB activation rate',       name_ar='معدل تنشيط قاعدة التجار',          frequency='monthly', sop_ref='SOP-002' where id='KPI-035';
update def.kpis set name_en='Auctions per VM per day (hire trigger)', name_ar='المزادات لكل مسؤول يومياً (محفز التوظيف)', frequency='daily', sop_ref='SOP-003' where id='KPI-036';

-- ============= KPI ↔ SOP LINKS (per handover §5) =============
-- SOP-001 → KPI-005,006,007
insert into def.kpi_sop_links (kpi_id, sop_id) values
  ('KPI-005','SOP-001'),('KPI-006','SOP-001'),('KPI-007','SOP-001'),
  ('KPI-019','SOP-002'),('KPI-020','SOP-002'),('KPI-035','SOP-002'),
  ('KPI-004','SOP-003'),('KPI-013','SOP-003'),('KPI-028','SOP-003'),('KPI-029','SOP-003'),('KPI-033','SOP-003'),('KPI-036','SOP-003'),
  ('KPI-016','SOP-004'),('KPI-017','SOP-004'),('KPI-018','SOP-004'),
  ('KPI-010','SOP-006'),('KPI-011','SOP-006'),('KPI-012','SOP-006'),('KPI-031','SOP-006'),('KPI-034','SOP-006'),
  ('KPI-014','SOP-007'),('KPI-015','SOP-007'),('KPI-025','SOP-007'),('KPI-032','SOP-007'),
  ('KPI-008','SOP-008'),('KPI-009','SOP-008'),('KPI-030','SOP-008')
on conflict do nothing;

-- ============= DONE =============
-- Next steps post-Khater approval:
-- 1. Create at least one Admin user via Supabase Auth, then insert def.users row with role_code='admin'
-- 2. Backfill remaining KR rows (28 company + 17 ops) via Admin UI / direct insert
-- 3. Fill 36 KPI rows (frequency, formula, role_weights, scheme_ref) via Admin UI
-- 4. Run isolation tests (per Phase 1 gate)
-- =================================================================
