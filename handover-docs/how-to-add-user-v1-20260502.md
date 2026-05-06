# How to add a new user
Date: 2026-05-02

## Standard flow
1. Have HR/Admin invite via Supabase Auth → invite user with email.
2. User clicks magic link → auth.users row created.
3. Admin/HR opens Admin → Users → "Map user".
4. Find the new auth user, fill:
   - Full name EN + AR
   - Role code (employee/manager/dept_head/hr/finance/c_level/admin)
   - Functional role (BD-AM, AM-AM, VM-SALES, etc.)
   - Department
   - Manager (direct manager; null for dept heads/c-level)
   - Active flag
5. Save → row created in `def.users` linking auth.users.id.

## Notes
- **Never** create accounts on behalf of users (per safety rule).
- **Never** auto-fill passwords (Supabase magic link only — no passwords needed in v1).
- Salary master is NOT in this app. Salary lives in payroll/ERP. The web app only uses salary band reference for OpEx bonus calc.
- Removing a user: set `active=false`, do not delete (audit integrity).

## Direct SQL fallback
```sql
-- After auth.users is created via invite
insert into def.users (id, email, full_name_en, full_name_ar, role_code, functional_role_id, department_id, manager_id)
values ('<auth_uid>', 'new@mrkoon.com', 'Full Name', 'الاسم الكامل', 'employee', '<func_role_uuid>', '<dept_uuid>', '<mgr_uuid>');
```
