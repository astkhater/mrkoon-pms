-- =================================================================
-- Mrkoon OKR Webapp — Seed Data v2
-- Date: 2026-05-02
-- Run AFTER 01-schema-v2 + 02-rls-policies-v2.
--
-- Changes from v1:
--  + 10 levels seeded (Khater Q1 — TL active; Manager/Sr Mgr/Head/Director dormant)
--  + config.assumptions seed examples (BD, AM activity assumptions)
--  + def.kpis weight_type_default applied per CHRO handoff for Ops TL gates / Tech PO monitor / VM-09/10
--  + def.functional_roles linked to level_id (not text)
--  * BD rate scale kept as v1 placeholder (linear interpolation) — Khater fills exact via Admin → Compensation Inputs panel
--  * Real KPI×role weights for v6 framework will be ingested via xlsx parse when bash workspace returns;
--    placeholder rows are intentionally minimal so the panel UI shows the structure but no false numbers.
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

-- ============= SALARY BANDS =============
insert into config.salary_bands (level, min_pct, max_pct, min_score_qualify) values
  ('L1', 0.05, 0.10, 3.0),
  ('L2', 0.08, 0.15, 3.0),
  ('L3', 0.10, 0.20, 3.0),
  ('L4', 0.12, 0.25, 3.0),
  ('L5', 0.15, 0.30, 3.0)
on conflict (level) do nothing;

-- ============= LEVELS (NEW v2 — Khater Q1) =============
-- 10 levels. TL active first-line. Manager/Sr Manager/Head/Director dormant per Khater 2026-05-02.
-- Titles below are placeholders by ord; Admin edits via Levels panel using salary-bands-level-framework-v2.xlsx.
insert into config.levels (code, ord, title_en, title_ar, active, comp_band, notes) values
  ('L1',  1, 'Junior Specialist',     'أخصائي مبتدئ',      true,  'L1', 'Default first level'),
  ('L2',  2, 'Specialist',            'أخصائي',            true,  'L2', null),
  ('L3',  3, 'Senior Specialist',     'أخصائي أول',        true,  'L3', null),
  ('L4',  4, 'Team Lead (TL)',        'قائد فريق',          true,  'L3', 'First active supervision layer'),
  ('L5',  5, 'Manager',               'مدير',              false, 'L4', 'DORMANT — activate when first hire'),
  ('L6',  6, 'Senior Manager',        'مدير أول',          false, 'L4', 'DORMANT'),
  ('L7',  7, 'Head',                  'رئيس قسم',          false, 'L5', 'DORMANT'),
  ('L8',  8, 'Director',              'مدير عام',          false, 'L5', 'DORMANT'),
  ('L9',  9, 'C-Level',               'الإدارة التنفيذية', true,  'L5', 'CEO / COO / CTO / CFO / CCO'),
  ('L10',10, 'Founder/Board',         'المؤسسون / مجلس',   true,  'L5', null)
on conflict (code) do nothing;

-- ============= FUNCTIONAL ROLES (linked to level_id) =============
insert into def.functional_roles (code, name_en, name_ar, department_id, level_id) values
  ('BD-AM',     'BD Account Manager (acquisition)', 'مسؤول تطوير أعمال', (select id from def.departments where code='BD'),  (select id from config.levels where code='L2')),
  ('AM-AM',     'Account Manager (retention)',      'مدير حسابات',        (select id from def.departments where code='AM'),  (select id from config.levels where code='L2')),
  ('VM-SALES',  'VM Sales',                         'مسؤول مبيعات ميداني', (select id from def.departments where code='VM'),  (select id from config.levels where code='L2')),
  ('OPS-FIELD', 'Operations Field',                 'عمليات ميدانية',     (select id from def.departments where code='OPS'), (select id from config.levels where code='L1')),
  ('OPS-TL',    'Operations Team Lead',             'قائد فريق العمليات',  (select id from def.departments where code='OPS'), (select id from config.levels where code='L4')),
  ('ONB-SP',    'Onboarding Specialist',            'أخصائي تهيئة',       (select id from def.departments where code='ONB'), (select id from config.levels where code='L1')),
  ('MKT-MGR',   'Marketing Manager',                'مدير التسويق',       (select id from def.departments where code='MKT'), (select id from config.levels where code='L4')),
  ('TECH-PO',   'Senior Product Owner',             'مالك منتج أول',      (select id from def.departments where code='TECH'),(select id from config.levels where code='L4')),
  ('TECH-MOB',  'Mobile Developer',                 'مطور موبايل',        (select id from def.departments where code='TECH'),(select id from config.levels where code='L2')),
  ('FIN-AC',    'Finance Accountant',               'محاسب',              (select id from def.departments where code='FIN'), (select id from config.levels where code='L2')),
  ('HR-SP',     'HR Specialist',                    'أخصائي موارد بشرية', (select id from def.departments where code='HR'),  (select id from config.levels where code='L2'));

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
  ('pip_red_threshold',       2.5,      'annual',        'Red threshold triggers PIP'),
  ('am_dormant_months',       3,        'AM-COMM-v7',    'Khater 2026-05-02: client with no txn in last 3 months = dormant; reactivation event when re-engaged with ≥1 selling action'),
  ('am_min_reactivations',    2,        'AM-COMM-v7',    'Khater 2026-05-02: ≥2 reactivation events/month qualifies for the bonus pool')
on conflict (key) do nothing;

-- ============= COMMISSION SCHEMES =============
insert into def.commission_schemes (id, name_en, name_ar, cadence, comp_model, description) values
  ('BD-COMM-Q-v7',      'BD Acquisition Commission',          'عمولة استحواذ تطوير الأعمال', 'quarterly', 'COGS', 'Per-account quarterly with rate scale + GP kicker'),
  ('AM-COMM-v7',        'Account Manager Commission',         'عمولة مدير الحسابات',         'monthly',   'COGS', '6-component: retention/reactivation/upsell/referral/volume/portfolio'),
  ('VM-COMM-v7',        'VM Sales Commission',                'عمولة المبيعات الميدانية',    'monthly',   'COGS', 'Per-auction with attendance floor ≥6'),
  ('OPS-BONUS-v7',      'Operations Bonus',                   'حوافز العمليات',              'monthly',   'COGS', '4-bonus: quality/volume/speed/referral'),
  ('OPS-TL-GATES-v7',   'Operations TL Gates',                'مكافآت قائد العمليات',        'monthly',   'COGS', '5-gate, capped at 5,500 EGP/month — Ops 3,000 + VM 2,500'),
  ('ONB-COMM-v7',       'Onboarding Commission',              'عمولة التهيئة',               'monthly',   'COGS', '150 EGP per merchant, 5,000 cap, 30-day clawback'),
  ('OPEX-QTR-v7',       'Quarterly OpEx Bonus',               'مكافأة المصاريف التشغيلية',   'quarterly', 'OpEx', 'L1–L5 salary bands, min score 3.0'),
  ('ANNUAL-BONUS-v7',   'Annual Bonus',                       'المكافأة السنوية',            'annual',    'OpEx', 'Annual rating-driven; COGS gets non-target portion only')
on conflict (id) do nothing;

-- ============= COMPENSATION RATES (placeholder; Khater fills exact via Admin Inputs panel) =============
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
  ), 'PLACEHOLDER linear-interpolation. Khater fills exact via Admin → Compensation Inputs panel using BD-Commission-Calculator.xlsx'),
  ('AM-COMM-v7', 'retention_per_client',          jsonb_build_object('amount',200), null),
  ('AM-COMM-v7', 'reactivation_per_event',        jsonb_build_object('amount',500,'monthly_cap',1500,'min_reactivations',2,'dormant_months',3), 'Khater 2026-05-02: 2 dormant-3mo clients re-engaged with ≥1 selling action'),
  ('AM-COMM-v7', 'upsell_per_category',           jsonb_build_object('amount',300), null),
  ('AM-COMM-v7', 'referral',                      jsonb_build_object('amount',1000), null),
  ('AM-COMM-v7', 'volume_bonus',                  jsonb_build_object('amount',1500,'min_avg_txns',2,'eval_mode','snapshot_at_close'), 'Khater 2026-05-02: snapshot at month close'),
  ('AM-COMM-v7', 'portfolio_bonus',               jsonb_build_object('amount',1000,'min_clients',40,'min_transacting_pct',0.80), null),
  ('VM-COMM-v7', 'success_base',                  jsonb_build_object('amount',500), 'auction with ≥1 bidder AND attendance ≥ 6'),
  ('VM-COMM-v7', 'extra_bidder',                  jsonb_build_object('amount',50),  null),
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

-- ============= ASSUMPTIONS (NEW v2 — D-34 Khater Q3) =============
-- Operational expectations from TaskForce sheet. Drive activity dashboards + "expected volume" displays, not payouts.
-- Khater fills/extends via Admin → Assumptions panel. Examples seeded here for BD.
insert into config.assumptions (department_code, functional_role_code, period, key, value_numeric, unit, notes, source) values
  ('BD',  'BD-AM', null, 'min_quarterly_acquisitions',      13,    'count',   'Floor below which kicker not triggered',                            'TaskForce v8'),
  ('BD',  'BD-AM', null, 'target_quarterly_acquisitions',   25,    'count',   'Quarterly target',                                                  'TaskForce v8'),
  ('BD',  'BD-AM', null, 'expected_monthly_acquisitions',   8,     'count',   '~8/month implies 25/quarter',                                       'TaskForce v8'),
  ('BD',  'BD-AM', null, 'expected_monthly_meetings_min',   16,    'count',   'Activity assumption — feed BD activity dashboard, not payouts',     'TaskForce v8'),
  ('BD',  'BD-AM', null, 'expected_monthly_meetings_max',   20,    'count',   null,                                                                 'TaskForce v8'),
  ('BD',  'BD-AM', null, 'expected_monthly_qualif_calls_min',40,   'count',   null,                                                                 'TaskForce v8'),
  ('BD',  'BD-AM', null, 'expected_monthly_qualif_calls_max',50,   'count',   null,                                                                 'TaskForce v8'),
  ('BD',   null,   null, 'team_size_2026',                  4,     'count',   'Yassin, Salah, +2 from May 2026',                                   'cost-impact-analysis-v5'),
  ('AM',  'AM-AM', null, 'dormant_threshold_months',        3,     'months',  'A client with 0 txn in last 3 months counts as dormant',            'Khater 2026-05-02'),
  ('AM',  'AM-AM', null, 'min_reactivations_for_bonus',     2,     'count',   'Threshold for reactivation bonus pool',                             'Khater 2026-05-02'),
  ('OPS', 'OPS-TL',null, 'gate_max_payout_total',           5500,  'EGP',     'Ops 3,000 + VM 2,500',                                              'CHRO handoff 2026-05-02'),
  ('VM',  'VM-SALES',null,'attendance_floor_per_auction',   6,     'count',   'Floor for VM success commission',                                   'Khater + handover'),
  ('OPS', 'OPS-FIELD',null,'on_time_loading_target',        0.90,  'ratio',   'Speed bonus threshold',                                             'OPS-BONUS-v7');

-- ============= CYCLE PERIODS =============
insert into config.cycle_periods (type, label, start_date, end_date, status) values
  ('quarterly', 'Q1 2026', '2026-01-01', '2026-03-31', 'closed'),
  ('quarterly', 'Q2 2026', '2026-04-01', '2026-06-30', 'open'),
  ('quarterly', 'Q3 2026', '2026-07-01', '2026-09-30', 'open'),
  ('quarterly', 'Q4 2026', '2026-10-01', '2026-12-31', 'open'),
  ('annual',    'FY 2026', '2026-01-01', '2026-12-31', 'open'),
  ('monthly',   'May 2026','2026-05-01', '2026-05-31', 'open'),
  ('monthly',   'Apr 2026','2026-04-01', '2026-04-30', 'closed');

-- ============= COMPETENCIES =============
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
  ('SOP-009','Listing Creation & Quality Review',  'إنشاء القوائم ومراجعة الجودة',(select id from def.departments where code='OPS'), 'manager','quarterly','operations','2026-04-15'),
  ('SOP-010','Fulfilment & Deal Closure',          'الإيفاء وإتمام الصفقة',  (select id from def.departments where code='OPS'), 'manager','quarterly','operations','2026-04-15');

-- ============= COMPANY OBJECTIVES =============
insert into def.objectives (code, level, period_id, title_en, title_ar) values
  ('OBJ-1', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Acquire 75 clients/quarter to reach 300 EOY', 'الاستحواذ على 75 عميل ربعياً للوصول إلى 300 بنهاية العام'),
  ('OBJ-2', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Retain ≥95% of active clients',                'الاحتفاظ بـ ≥95% من العملاء النشطين'),
  ('OBJ-3', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Increase auction efficiency',                  'تحسين كفاءة المزادات'),
  ('OBJ-4', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Improve payment & collection',                 'تحسين الدفع والتحصيل'),
  ('OBJ-5', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Strengthen marketing throughput',              'تعزيز إنتاجية التسويق'),
  ('OBJ-6', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Hit 30M EGP GP target',                        'تحقيق هدف الربح الإجمالي 30 مليون جنيه');

insert into def.objectives (code, level, department_id, period_id, title_en, title_ar) values
  ('O-OBJ-1', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Auction operational excellence',          'التميز التشغيلي للمزادات'),
  ('O-OBJ-2', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Loading efficiency and reliability',      'كفاءة ومصداقية التحميل'),
  ('O-OBJ-3', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Merchant base activation',                'تنشيط قاعدة التجار'),
  ('O-OBJ-4', 'department', (select id from def.departments where code='OPS'), (select id from config.cycle_periods where label='FY 2026' and type='annual'), 'Quality and dispute reduction',           'الجودة وتقليل النزاعات');

-- ============= KEY RESULTS (sample) =============
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

-- ============= KPIS — placeholder skeleton =============
-- IDs are the v6 schema (KPI-001..KPI-040). Real names/formulas/role weights ingested from
-- okr-kpi-framework-v6-20260502.xlsx when bash workspace returns OR via Admin → KPI Master panel.
do $$
declare i int;
begin
  for i in 1..40 loop
    insert into def.kpis (id, name_en, name_ar, frequency, weight_default, weight_type_default)
    values (
      'KPI-' || lpad(i::text, 3, '0'),
      'KPI ' || i,
      'KPI ' || i,
      'monthly',
      null,
      'scored'
    ) on conflict (id) do nothing;
  end loop;
end$$;

-- Tag the new dashboard-only / monitor / gate KPIs per CHRO handoff
update def.kpis set name_en='Auctions per VM',                   name_ar='عدد المزادات لكل مسؤول ميداني',  frequency='daily',   sop_ref='SOP-003', weight_type_default='dashboard' where id='KPI-033';
update def.kpis set name_en='Loading distribution',              name_ar='توزيع التحميل',                    frequency='monthly', sop_ref='SOP-006', weight_type_default='dashboard' where id='KPI-034';
update def.kpis set name_en='Merchant DB activation rate',       name_ar='معدل تنشيط قاعدة التجار',          frequency='monthly', sop_ref='SOP-002', weight_type_default='scored'    where id='KPI-035';
update def.kpis set name_en='Auctions per VM per day (hire trigger)', name_ar='المزادات لكل مسؤول يومياً (محفز التوظيف)', frequency='daily', sop_ref='SOP-003', weight_type_default='dashboard' where id='KPI-036';
-- VM-09, VM-10 added in v6 (placeholder rows; admin renames + assigns roles via panel)
insert into def.kpis (id, name_en, name_ar, frequency, weight_type_default) values
  ('KPI-037','VM Auction Quality (VM-09)',    'جودة مزادات VM-09',  'monthly','scored'),
  ('KPI-038','VM DB Activation (VM-10)',      'تنشيط قاعدة VM-10',  'monthly','scored'),
  ('KPI-039','OPS-NEW-01 (dashboard only)',   'OPS-NEW-01',          'monthly','dashboard'),
  ('KPI-040','OPS-NEW-02 (dashboard only)',   'OPS-NEW-02',          'monthly','dashboard')
on conflict (id) do nothing;

-- Ops TL gate KPIs explicitly tagged 'gate' for OPS-TL functional role
-- (real KPI IDs live in v6 KPI Master; placeholder labels here)
update def.kpis set weight_type_default='gate', gate_amount=1500, gate_threshold=0.95, scheme_ref='OPS-TL-GATES-v7', name_en='Ops Gate 1 — Zero-Issue ≥95%' where id='KPI-021';
update def.kpis set weight_type_default='gate', gate_amount=1000, gate_threshold=0.90, scheme_ref='OPS-TL-GATES-v7', name_en='Ops Gate 2 — On-Time ≥90%'    where id='KPI-022';
update def.kpis set weight_type_default='gate', gate_amount=500,                       scheme_ref='OPS-TL-GATES-v7', name_en='Ops Gate 3 — No Escalation'  where id='KPI-023';
update def.kpis set weight_type_default='gate', gate_amount=1500, gate_threshold=0.80, scheme_ref='OPS-TL-GATES-v7', name_en='VM Gate 1 — Fill Rate ≥80%'  where id='KPI-024';
update def.kpis set weight_type_default='gate', gate_amount=1000, gate_threshold=4,    scheme_ref='OPS-TL-GATES-v7', name_en='VM Gate 2 — Avg Bidders ≥4'  where id='KPI-025';

-- Tech PO monitor KPIs (07/08/09)
update def.kpis set weight_type_default='monitor', name_en='TECH-PO-07 (monitor)' where id='KPI-026';
update def.kpis set weight_type_default='monitor', name_en='TECH-PO-08 (monitor)' where id='KPI-027';
update def.kpis set weight_type_default='monitor', name_en='TECH-PO-09 (monitor)' where id='KPI-028';

-- ============= KPI ↔ SOP LINKS =============
insert into def.kpi_sop_links (kpi_id, sop_id) values
  ('KPI-005','SOP-001'),('KPI-006','SOP-001'),('KPI-007','SOP-001'),
  ('KPI-019','SOP-002'),('KPI-020','SOP-002'),('KPI-035','SOP-002'),
  ('KPI-004','SOP-003'),('KPI-013','SOP-003'),('KPI-029','SOP-003'),('KPI-033','SOP-003'),('KPI-036','SOP-003'),('KPI-037','SOP-003'),
  ('KPI-016','SOP-004'),('KPI-017','SOP-004'),('KPI-018','SOP-004'),
  ('KPI-010','SOP-006'),('KPI-011','SOP-006'),('KPI-012','SOP-006'),('KPI-031','SOP-006'),('KPI-034','SOP-006'),
  ('KPI-014','SOP-007'),('KPI-015','SOP-007'),('KPI-032','SOP-007'),
  ('KPI-008','SOP-008'),('KPI-009','SOP-008'),('KPI-030','SOP-008'),('KPI-038','SOP-008')
on conflict do nothing;

-- =================================================================
-- DONE
-- Next: Khater fills exact values via Admin panels:
--   - Levels panel       → titles, salary band linkage, activate dormant ones
--   - Compensation Inputs → BD rate scale (from BD-Commission-Calculator.xlsx)
--   - KPI Master panel    → real KPI×role weights from v6 framework
--   - Assumptions panel   → extend the BD/AM examples for all roles
-- Until ingestion: dashboards show structure with "value pending" placeholders.
-- =================================================================
