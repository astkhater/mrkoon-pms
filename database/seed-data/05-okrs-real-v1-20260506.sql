-- =================================================================
-- Mrkoon PMS — Real OKRs Import v1
-- Date: 2026-05-06
-- Source: okr-kpi-framework-v6-20260502.xlsx, sheet "Company OKRs"
--
-- Replaces placeholder OBJ-1..OBJ-6 from seed-v2 with the actual
-- 6-objective FY2026 framework (30M GP, retain & grow, operational
-- excellence, lead gen, scale platform, team capacity).
-- =================================================================

-- Step 1: Wipe placeholder objectives and their KRs (cascade)
delete from def.key_results where code like 'O-KR%' or code like 'KR1.%' or code like 'KR2.%';
delete from def.objectives where code like 'OBJ-%' or code like 'O-OBJ-%';

-- Step 2: Insert 6 Company Objectives (FY2026)
insert into def.objectives (code, level, period_id, owner_user_id, title_en, title_ar) values
  ('CO1', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='m.shalabi@mrkoonapp.local'),
    'Achieve 30M GP target',
    'تحقيق هدف 30 مليون جنيه ربح إجمالي'),
  ('CO2', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='a.shams@mrkoonapp.local'),
    'Retain and grow client base',
    'الاحتفاظ بالعملاء وتنمية القاعدة'),
  ('CO3', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='m.zaaid@mrkoonapp.local'),
    'Deliver operational excellence at scale',
    'تقديم تميز تشغيلي على نطاق واسع'),
  ('CO4', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='a.hassan@mrkoonapp.local'),
    'Build scalable lead generation engine',
    'بناء محرك توليد عملاء محتملين قابل للتوسع'),
  ('CO5', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='h.soliman@mrkoonapp.local'),
    'Scale platform for 300-client volume',
    'توسيع المنصة لحجم 300 عميل'),
  ('CO6', 'company', (select id from config.cycle_periods where label='FY 2026' and type='annual'),
    (select id from def.users where email='m.ibraheim@mrkoonapp.local'),
    'Build team capacity for growth',
    'بناء قدرات الفريق للنمو');

-- Step 3: Insert all KRs (25 total)
insert into def.key_results (code, objective_id, title_en, title_ar, target_value, unit, weight) values
  -- CO1: Achieve 30M GP target
  ('CO1.KR1', (select id from def.objectives where code='CO1'), 'Annual GP >= 30,000,000 EGP', 'الربح الإجمالي السنوي >= 30,000,000 جنيه', 30000000, 'EGP', 1.0),
  ('CO1.KR2', (select id from def.objectives where code='CO1'), 'Weekly GMV >= 1,000,000 EGP', 'إجمالي القيمة الأسبوعية >= 1,000,000 جنيه', 1000000, 'EGP/week', 1.0),
  ('CO1.KR3', (select id from def.objectives where code='CO1'), 'Complete >= 20 transactions per week', 'إتمام >= 20 معاملة أسبوعياً', 20, 'txns/week', 1.0),
  ('CO1.KR4', (select id from def.objectives where code='CO1'), 'Onboard >= 196 new clients (8/month × 4 reps from May)', 'ضم >= 196 عميل جديد', 196, 'clients', 1.0),
  ('CO1.KR5', (select id from def.objectives where code='CO1'), 'GP per BD rep >= target', 'الربح الإجمالي لكل مسؤول تطوير أعمال', null, 'EGP/rep', 1.0),
  ('CO1.KR6', (select id from def.objectives where code='CO1'), 'Blended GP margin >= 4.9%', 'هامش الربح الإجمالي المختلط >= 4.9%', 0.049, 'ratio', 1.0),

  -- CO2: Retain and grow client base
  ('CO2.KR1', (select id from def.objectives where code='CO2'), 'Client retention rate >= 85% MoM', 'معدل الاحتفاظ بالعملاء >= 85% شهرياً', 0.85, 'ratio', 1.0),
  ('CO2.KR2', (select id from def.objectives where code='CO2'), 'Reactivate >= 20% churned clients/quarter', 'إعادة تفعيل >= 20% من العملاء المتوقفين/ربع', 0.20, 'ratio', 1.0),
  ('CO2.KR3', (select id from def.objectives where code='CO2'), 'Avg transactions per client >= 2/month', 'متوسط المعاملات لكل عميل >= 2/شهر', 2, 'txns/client/month', 1.0),
  ('CO2.KR4', (select id from def.objectives where code='CO2'), '>= 2 new scrap categories/quarter from existing clients', '>= 2 فئات خردة جديدة/ربع من العملاء الحاليين', 2, 'categories/quarter', 1.0),

  -- CO3: Deliver operational excellence
  ('CO3.KR1', (select id from def.objectives where code='CO3'), 'Auction success rate >= 80% (125% rule)', 'معدل نجاح المزاد >= 80%', 0.80, 'ratio', 1.0),
  ('CO3.KR2', (select id from def.objectives where code='CO3'), '>= 6 paid-insurance merchants per auction', '>= 6 تجار مؤمنين لكل مزاد', 6, 'merchants/auction', 1.0),
  ('CO3.KR3', (select id from def.objectives where code='CO3'), '>= 3 active bidders per auction', '>= 3 مزايدين نشطين لكل مزاد', 3, 'bidders/auction', 1.0),
  ('CO3.KR4', (select id from def.objectives where code='CO3'), 'Loading quality >= 95% zero-issue', 'جودة التحميل >= 95% بدون مشاكل', 0.95, 'ratio', 1.0),
  ('CO3.KR5', (select id from def.objectives where code='CO3'), 'Onboarding time <= 5 business days', 'وقت التأهيل <= 5 أيام عمل', 5, 'days', 1.0),

  -- CO4: Lead generation engine
  ('CO4.KR1', (select id from def.objectives where code='CO4'), '>= 40 qualified client leads/month (LinkedIn)', '>= 40 عميل محتمل مؤهل/شهر (لينكدإن)', 40, 'leads/month', 1.0),
  ('CO4.KR2', (select id from def.objectives where code='CO4'), 'Client CPL <= 700 EGP (LinkedIn)', 'تكلفة العميل المحتمل <= 700 جنيه', 700, 'EGP', 1.0),
  ('CO4.KR3', (select id from def.objectives where code='CO4'), '>= 100 trusted merchant leads/category/month (Meta)', '>= 100 تاجر محتمل موثوق/فئة/شهر (ميتا)', 100, 'leads/cat/month', 1.0),
  ('CO4.KR4', (select id from def.objectives where code='CO4'), 'Merchant CPL <= 100 EGP (Meta)', 'تكلفة التاجر المحتمل <= 100 جنيه', 100, 'EGP', 1.0),

  -- CO5: Scale platform
  ('CO5.KR1', (select id from def.objectives where code='CO5'), 'Product roadmap delivery >= 85%', 'تسليم خارطة المنتج >= 85%', 0.85, 'ratio', 1.0),
  ('CO5.KR2', (select id from def.objectives where code='CO5'), 'Platform uptime >= 99.5%', 'وقت تشغيل المنصة >= 99.5%', 0.995, 'ratio', 1.0),
  ('CO5.KR3', (select id from def.objectives where code='CO5'), 'Critical bug resolution <= 4 hours', 'حل الأخطاء الحرجة <= 4 ساعات', 4, 'hours', 1.0),

  -- CO6: Team capacity
  ('CO6.KR1', (select id from def.objectives where code='CO6'), 'Hiring plan on track (100%)', 'خطة التوظيف على المسار', 1.0, 'ratio', 1.0),
  ('CO6.KR2', (select id from def.objectives where code='CO6'), 'Time to fill <= 45 days', 'وقت ملء المنصب <= 45 يوم', 45, 'days', 1.0),
  ('CO6.KR3', (select id from def.objectives where code='CO6'), '90-day new hire retention >= 90%', 'احتفاظ الموظفين الجدد (90 يوم) >= 90%', 0.90, 'ratio', 1.0),
  ('CO6.KR4', (select id from def.objectives where code='CO6'), 'People cost / GP ratio <= 60%', 'نسبة تكلفة الموظفين / الربح الإجمالي <= 60%', 0.60, 'ratio', 1.0);

-- Verification:
-- select count(*) from def.objectives where code like 'CO%';   -- expect 6
-- select count(*) from def.key_results where code like 'CO%';  -- expect 25
