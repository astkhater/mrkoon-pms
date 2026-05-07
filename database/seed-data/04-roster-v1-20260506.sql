-- =================================================================
-- Mrkoon PMS — Employee Roster Import v1
-- Date: 2026-05-06
-- Source: cost-impact-analysis-v5-20260424.xlsx (Inputs sheet, rows 23-62)
--
-- Imports 40 active employees (excludes 4 planned hires #41-44).
-- Khater's existing admin row is preserved via on conflict (email) do nothing.
-- Emails are placeholder (emp_<role>_<seq>@mrkoonapp.local) — to be replaced
-- with real emails when individuals are onboarded into the system.
--
-- AuthContext was updated to lookup by email (not id) so def.users.id can
-- be a fresh UUID independent of auth.users.id.
-- =================================================================

-- Stage 1: Insert all employees without manager_id
-- Strategy: temp tag email so we can update manager_id in stage 2

insert into def.users (id, email, full_name_en, full_name_ar, role_code, functional_role_id, department_id, level_id, active)
values
  -- C-Suite (Khater preserved separately)
  (uuid_generate_v4(), 'm.shalabi@mrkoonapp.local',     'Mohamed Elsayed Shalabi',        'محمد الصيادي شلبي',         'c_level',  null, (select id from def.departments where code='MGMT'), (select id from config.levels where code='L9'), true),
  (uuid_generate_v4(), 'a.mamdouh@mrkoonapp.local',     'Ahmed Mamdouh Abdelmoez',        'أحمد ممدوح عبدالمعز',       'c_level',  null, (select id from def.departments where code='MGMT'), (select id from config.levels where code='L9'), true),
  (uuid_generate_v4(), 'a.amir@mrkoonapp.local',        'Ahmed Amir Ahmed',                'أحمد عامر أحمد',             'c_level',  null, (select id from def.departments where code='MGMT'), (select id from config.levels where code='L9'), true),
  (uuid_generate_v4(), 'a.shalabi@mrkoonapp.local',     'Alaa Shalabi',                    'علاء شلبي',                  'c_level',  null, (select id from def.departments where code='MGMT'), (select id from config.levels where code='L9'), true),

  -- Operations
  (uuid_generate_v4(), 'm.zaaid@mrkoonapp.local',       'Mohamed Hussein Zaaid',           'محمد حسين زيد',              'manager',  (select id from def.functional_roles where code='OPS-TL'),    (select id from def.departments where code='OPS'), (select id from config.levels where code='L4'), true),
  (uuid_generate_v4(), 'm.tawfeek@mrkoonapp.local',     'Mohamed Waheed Tawfeek',          'محمد وحيد توفيق',            'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L3'), true),
  (uuid_generate_v4(), 'k.metwally@mrkoonapp.local',    'Khaled Ahmed Metwally',           'خالد أحمد متولي',            'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 's.sobhy@mrkoonapp.local',       'Sayed Sobhy Sayed Mohamed',       'سيد صبحي سيد محمد',         'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 'z.elsayed@mrkoonapp.local',     'Ziad Moataz El Sayed',            'زياد معتز السيد',            'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'm.mousa@mrkoonapp.local',       'Mohamed Ahmed Mousa',             'محمد أحمد موسى',             'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'y.ahmed@mrkoonapp.local',       'Youssef Mohamed Ahmed',           'يوسف محمد أحمد',             'employee', (select id from def.functional_roles where code='OPS-FIELD'), (select id from def.departments where code='OPS'), (select id from config.levels where code='L2'), true),

  -- Commercial-VM
  (uuid_generate_v4(), 's.khalil@mrkoonapp.local',      'Samah Esmail Khalil',             'سماح إسماعيل خليل',          'employee', (select id from def.functional_roles where code='VM-SALES'),  (select id from def.departments where code='VM'),  (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 'w.osama@mrkoonapp.local',       'Wegdan Osama Mohamed',            'وجدان أسامة محمد',           'employee', (select id from def.functional_roles where code='VM-SALES'),  (select id from def.departments where code='VM'),  (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 'm.helal@mrkoonapp.local',       'Mai Tarek Mohamed Helal',         'مي طارق محمد هلال',          'employee', (select id from def.functional_roles where code='VM-SALES'),  (select id from def.departments where code='VM'),  (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 's.hamed@mrkoonapp.local',       'Samar Osama Hamed',               'سمر أسامة حامد',             'employee', (select id from def.functional_roles where code='VM-SALES'),  (select id from def.departments where code='VM'),  (select id from config.levels where code='L1'), true),

  -- Onboarding
  (uuid_generate_v4(), 'i.zakria@mrkoonapp.local',      'Ismael Zakria Mahmoud',           'إسماعيل زكريا محمود',        'manager',  (select id from def.functional_roles where code='ONB-SP'),    (select id from def.departments where code='ONB'), (select id from config.levels where code='L3'), true),
  (uuid_generate_v4(), 'i.ahmed@mrkoonapp.local',       'Ismael Ahmed Ismael',             'إسماعيل أحمد إسماعيل',       'employee', (select id from def.functional_roles where code='ONB-SP'),    (select id from def.departments where code='ONB'), (select id from config.levels where code='L1'), true),

  -- BD-AM (Account Management)
  (uuid_generate_v4(), 'a.shams@mrkoonapp.local',       'Amany Fawzy Shams',               'أماني فوزي شمس',             'manager',  (select id from def.functional_roles where code='AM-AM'),     (select id from def.departments where code='AM'),  (select id from config.levels where code='L4'), true),

  -- BD (Acquisition)
  (uuid_generate_v4(), 'y.hesham@mrkoonapp.local',      'Yassin Hesham Mohamed',           'ياسين هشام محمد',            'manager',  (select id from def.functional_roles where code='BD-AM'),     (select id from def.departments where code='BD'),  (select id from config.levels where code='L4'), true),
  (uuid_generate_v4(), 'm.salah@mrkoonapp.local',       'Mohamed Salah Eldeen El Sayed',   'محمد صلاح الدين السيد',      'employee', (select id from def.functional_roles where code='BD-AM'),     (select id from def.departments where code='BD'),  (select id from config.levels where code='L2'), true),

  -- Marketing
  (uuid_generate_v4(), 'a.hassan@mrkoonapp.local',      'Ali Mohamed Hassan',              'علي محمد حسن',                'manager',  (select id from def.functional_roles where code='MKT-MGR'),   (select id from def.departments where code='MKT'), (select id from config.levels where code='L3'), true),
  (uuid_generate_v4(), 'h.hassan@mrkoonapp.local',      'Habiba Mohamed Hassan',           'حبيبة محمد حسن',              'employee', (select id from def.functional_roles where code='MKT-MGR'),   (select id from def.departments where code='MKT'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'm.saad@mrkoonapp.local',        'Mayar Badr Saad',                 'ميار بدر سعد',                'employee', (select id from def.functional_roles where code='MKT-MGR'),   (select id from def.departments where code='MKT'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'a.salah@mrkoonapp.local',       'Asmaa Salah Abdallah',            'أسماء صلاح عبدالله',         'employee', (select id from def.functional_roles where code='MKT-MGR'),   (select id from def.departments where code='MKT'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'a.hesham@mrkoonapp.local',      'Aya Hesham Sayed',                'آية هشام سيد',                'employee', (select id from def.functional_roles where code='MKT-MGR'),   (select id from def.departments where code='MKT'), (select id from config.levels where code='L1'), true),

  -- Technology
  (uuid_generate_v4(), 'h.soliman@mrkoonapp.local',     'El-Hussien Salah Hamed Soliman',  'الحسين صلاح حامد سليمان',    'manager',  (select id from def.functional_roles where code='TECH-PO'),   (select id from def.departments where code='TECH'),(select id from config.levels where code='L3'), true),
  (uuid_generate_v4(), 'a.naeem@mrkoonapp.local',       'Abdelrahman Saleh Naeem',         'عبدالرحمن صالح نعيم',        'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 't.awad@mrkoonapp.local',        'Tarneem Hatem Awad',              'ترنيم حاتم عوض',             'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'a.ramadan@mrkoonapp.local',     'Ahmed Alaa Ramadan',              'أحمد علاء رمضان',            'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'r.ibrahiem@mrkoonapp.local',    'Rawan Sayed Ibrahiem',            'روان سيد إبراهيم',           'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'm.lotfy@mrkoonapp.local',       'Martina Yousry Lotfy',            'مارتينا يسري لطفي',          'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 'a.othman@mrkoonapp.local',      'Ahmed Othman Ali',                'أحمد عثمان علي',             'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'a.mostafa.qa@mrkoonapp.local',  'Ahmed Mostafa (QA)',              'أحمد مصطفى',                 'employee', (select id from def.functional_roles where code='TECH-MOB'),  (select id from def.departments where code='TECH'),(select id from config.levels where code='L1'), true),

  -- Finance
  (uuid_generate_v4(), 'm.omar@mrkoonapp.local',        'Mustafa Omar Abdelmajeed',        'مصطفى عمر عبدالمجيد',        'finance',  (select id from def.functional_roles where code='FIN-AC'),    (select id from def.departments where code='FIN'), (select id from config.levels where code='L4'), true),
  (uuid_generate_v4(), 'a.mostafa@mrkoonapp.local',     'Ahmed Mostafa Ahmed',             'أحمد مصطفى أحمد',            'finance',  (select id from def.functional_roles where code='FIN-AC'),    (select id from def.departments where code='FIN'), (select id from config.levels where code='L2'), true),
  (uuid_generate_v4(), 'm.ayman@mrkoonapp.local',       'Mohamed Ayman Hassan Amer',       'محمد أيمن حسن عامر',         'finance',  (select id from def.functional_roles where code='FIN-AC'),    (select id from def.departments where code='FIN'), (select id from config.levels where code='L2'), true),

  -- HR & Admin
  (uuid_generate_v4(), 'm.ibraheim@mrkoonapp.local',    'Mai Hesham Ibraheim',             'مي هشام إبراهيم',            'hr',       (select id from def.functional_roles where code='HR-SP'),     (select id from def.departments where code='HR'),  (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 'm.mahasen@mrkoonapp.local',     'Mahasen Ahmed Mohamed',           'محاسن أحمد محمد',            'employee', (select id from def.functional_roles where code='HR-SP'),     (select id from def.departments where code='HR'),  (select id from config.levels where code='L1'), true),
  (uuid_generate_v4(), 's.ehab@mrkoonapp.local',        'Shahd Ehab Amin',                 'شهد إيهاب أمين',             'employee', (select id from def.functional_roles where code='HR-SP'),     (select id from def.departments where code='HR'),  (select id from config.levels where code='L1'), true)
on conflict (email) do nothing;

-- Stage 2: Set manager_id (cascade)
-- CEO (Mohamed Shalabi) is at the top. C-suite report to CEO.
update def.users set manager_id = (select id from def.users where email='m.shalabi@mrkoonapp.local')
  where email in ('a.mamdouh@mrkoonapp.local','a.amir@mrkoonapp.local','a.shalabi@mrkoonapp.local','a.khater@mrkoonapp.com');

-- Khater (CCO) manages commercial dept_heads
update def.users set manager_id = (select id from def.users where email='a.khater@mrkoonapp.com')
  where email in (
    'm.zaaid@mrkoonapp.local',     -- OPS TL
    'i.zakria@mrkoonapp.local',    -- ONB head
    'a.shams@mrkoonapp.local',     -- AM head
    'y.hesham@mrkoonapp.local',    -- BD head
    'a.hassan@mrkoonapp.local',    -- MKT head
    's.khalil@mrkoonapp.local','w.osama@mrkoonapp.local','m.helal@mrkoonapp.local','s.hamed@mrkoonapp.local'  -- VM (no head; report to CCO)
  );

-- OPS team report to Mohamed Hussein Zaaid (TL)
update def.users set manager_id = (select id from def.users where email='m.zaaid@mrkoonapp.local')
  where email in ('m.tawfeek@mrkoonapp.local','k.metwally@mrkoonapp.local','s.sobhy@mrkoonapp.local','z.elsayed@mrkoonapp.local','m.mousa@mrkoonapp.local','y.ahmed@mrkoonapp.local');

-- ONB intern reports to Ismael Zakria
update def.users set manager_id = (select id from def.users where email='i.zakria@mrkoonapp.local')
  where email = 'i.ahmed@mrkoonapp.local';

-- BD: Mohamed Salah reports to Yassin
update def.users set manager_id = (select id from def.users where email='y.hesham@mrkoonapp.local')
  where email = 'm.salah@mrkoonapp.local';

-- MKT: team reports to Ali Mohamed Hassan
update def.users set manager_id = (select id from def.users where email='a.hassan@mrkoonapp.local')
  where email in ('h.hassan@mrkoonapp.local','m.saad@mrkoonapp.local','a.salah@mrkoonapp.local','a.hesham@mrkoonapp.local');

-- TECH: under CTO Ahmed Amir; El-Hussien is Sr PO
update def.users set manager_id = (select id from def.users where email='a.amir@mrkoonapp.local')
  where email = 'h.soliman@mrkoonapp.local';
update def.users set manager_id = (select id from def.users where email='h.soliman@mrkoonapp.local')
  where email in ('a.naeem@mrkoonapp.local','t.awad@mrkoonapp.local','a.ramadan@mrkoonapp.local','r.ibrahiem@mrkoonapp.local','m.lotfy@mrkoonapp.local','a.othman@mrkoonapp.local','a.mostafa.qa@mrkoonapp.local');

-- FIN: under CFO Alaa; Mustafa is Sr Acct
update def.users set manager_id = (select id from def.users where email='a.shalabi@mrkoonapp.local')
  where email = 'm.omar@mrkoonapp.local';
update def.users set manager_id = (select id from def.users where email='m.omar@mrkoonapp.local')
  where email in ('a.mostafa@mrkoonapp.local','m.ayman@mrkoonapp.local');

-- HR: Mai reports to CEO; Mahasen + Shahd report to Mai
update def.users set manager_id = (select id from def.users where email='m.shalabi@mrkoonapp.local')
  where email = 'm.ibraheim@mrkoonapp.local';
update def.users set manager_id = (select id from def.users where email='m.ibraheim@mrkoonapp.local')
  where email in ('m.mahasen@mrkoonapp.local','s.ehab@mrkoonapp.local');

-- =================================================================
-- Verification queries (run after import)
-- =================================================================
-- select count(*) as total_users from def.users where active = true;
-- select d.code, count(u.id) as headcount from def.departments d left join def.users u on u.department_id = d.id and u.active = true group by d.code order by d.code;
-- select role_code, count(*) from def.users where active = true group by role_code;
