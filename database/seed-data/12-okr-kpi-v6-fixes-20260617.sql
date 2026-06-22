-- =================================================================
-- Mrkoon PMS — OKR-KPI Framework v6-20260617 fixes
-- Date: 2026-06-17 (cleaned 2026-06-19)
-- Source: okr-kpi-framework-v6-20260617.xlsx
--
-- v6 changes applied:
--   1. VM Gate 2 (OPS-GATE-05) kr_ref: KR1.4 -> CO3.KR1
--   2. CS-* deactivation: SKIPPED — no CS-* rows exist in def.kpis
--      (originally the file used `set active = false` but def.kpis has no
--      `active` column; left as documentation in case a future schema
--      adds one and the CS bucket actually has rows.)
-- =================================================================

begin;

update def.kpis
   set kr_ref = (select id from def.key_results where code = 'CO3.KR1')
 where id = 'OPS-GATE-05'
   and kr_ref is distinct from (select id from def.key_results where code = 'CO3.KR1');

do $$
declare v_new uuid;
begin
  select id into v_new from def.key_results where code = 'CO3.KR1';
  if v_new is null then
    raise warning 'OKR-KPI v6 fix: KR code CO3.KR1 not found in def.key_results — VM Gate 2 update skipped.';
  end if;
end $$;

-- Note: CS-* deactivation skipped — no rows match (and no `active` column on def.kpis).

notify pgrst, 'reload schema';

commit;

-- Verification:
-- select id, kr_ref, scheme_ref from def.kpis where id = 'OPS-GATE-05';
