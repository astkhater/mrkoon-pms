-- =================================================================
-- Mrkoon PMS — OKR-KPI Framework v6-20260617 fixes
-- Date: 2026-06-17
-- Source: okr-kpi-framework-v6-20260617.xlsx (CURRENT-VERSIONS.md)
--
-- Two changes:
--   1. VM Gate 2 KR reference: KR1.4 → KR3.1
--      Affects: def.kpis where id = 'OPS-GATE-05'
--      Reason: KR1.4 was wrong target; VM Gate 2 (price quality) belongs
--      under CO3 (active bidders / quality), not CO1.
--   2. CS-* KPIs removed from Team KPIs scope
--      (CS = Customer Success; was a transitional bucket that no longer
--      maps to any active role. Deactivate rather than delete so historical
--      payouts/appraisals retain their refs.)
-- =================================================================

begin;

-- 1. Re-point VM Gate 2 (OPS-GATE-05) from KR1.4 to KR3.1
--    KR codes follow pattern CO{objective}.KR{idx} in def.key_results.code
update def.kpis
   set kr_ref = (select id from def.key_results where code = 'CO3.KR1')
 where id = 'OPS-GATE-05'
   and kr_ref is distinct from (select id from def.key_results where code = 'CO3.KR1');

-- Verify both KR codes exist before we trust the update (will raise if missing)
do $$
declare v_new uuid;
begin
  select id into v_new from def.key_results where code = 'CO3.KR1';
  if v_new is null then
    raise warning 'OKR-KPI v6 fix: KR code CO3.KR1 not found in def.key_results — VM Gate 2 update skipped.';
  end if;
end $$;

-- 2. Deactivate CS-prefixed KPIs (Customer Success bucket removed from Team scope in v6)
--    Idempotent: rows with active=false stay false.
update def.kpis
   set active = false
 where id like 'CS-%'
   and active = true;

-- 3. Trigger PostgREST schema reload so frontend picks up changes
notify pgrst, 'reload schema';

commit;

-- Verification:
-- select id, kr_ref from def.kpis where id = 'OPS-GATE-05';
-- select id, name_en, active from def.kpis where id like 'CS-%';
