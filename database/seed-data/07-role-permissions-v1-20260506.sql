-- =================================================================
-- Mrkoon PMS — Role/Permissions Refactor v1
-- Date: 2026-05-06
--
-- Splits role_code into:
--   - role_code  = organizational position (employee/manager/dept_head/c_level/admin)
--   - permissions text[] = functional access overlays (hr, finance, admin)
--
-- A user can be role_code='manager' AND permissions={'hr'} — meaning they
-- show as a manager in headcount but have HR menu/RLS access.
-- =================================================================

-- Step 1: Add permissions overlay column
alter table def.users add column if not exists permissions text[] not null default array[]::text[];
create index if not exists users_permissions_gin on def.users using gin(permissions);

-- Step 2: Reclassify users mis-tagged with functional role_code
-- Mai Hesham (HR Specialist L1) → manager (leads Mahasen + Shahd) + hr permission
update def.users
   set role_code='manager', permissions=array['hr']::text[]
 where email='m.ibraheim@mrkoonapp.local';

-- Mustafa Omar (Sr Accountant L4) → manager + finance permission
update def.users
   set role_code='manager', permissions=array['finance']::text[]
 where email='m.omar@mrkoonapp.local';

-- Ahmed Mostafa, Mohamed Ayman (FIN L2) → employee + finance permission
update def.users
   set role_code='employee', permissions=array['finance']::text[]
 where email in ('a.mostafa@mrkoonapp.local','m.ayman@mrkoonapp.local');

-- Khater (CCO/GM Egypt L9) → c_level + admin permission
update def.users
   set role_code='c_level', permissions=array['admin']::text[]
 where email='a.khater@mrkoonapp.com';

-- Step 3: Fix Khater's department_id (was UNK, should be MGMT)
update def.users
   set department_id=(select id from def.departments where code='MGMT')
 where email='a.khater@mrkoonapp.com';

-- Step 4: Update RLS helper functions to check role_code OR permissions
create or replace function public.app_user_permissions() returns text[]
language sql stable security definer set search_path = public, def as $$
  select coalesce(permissions, array[]::text[]) from def.users where id = auth.uid();
$$;

create or replace function public.app_is_admin() returns boolean
language sql stable security definer set search_path = public, def as $$
  select role_code = 'admin' or 'admin' = any(coalesce(permissions, array[]::text[]))
  from def.users where id = auth.uid();
$$;

create or replace function public.app_is_hr() returns boolean
language sql stable security definer set search_path = public, def as $$
  select role_code = 'hr' or 'hr' = any(coalesce(permissions, array[]::text[]))
  from def.users where id = auth.uid();
$$;

create or replace function public.app_is_finance() returns boolean
language sql stable security definer set search_path = public, def as $$
  select role_code = 'finance' or 'finance' = any(coalesce(permissions, array[]::text[]))
  from def.users where id = auth.uid();
$$;

-- Verification queries:
-- select email, role_code, permissions from def.users where permissions <> array[]::text[];
-- select role_code, count(*) from def.users where active=true group by role_code order by 1;
