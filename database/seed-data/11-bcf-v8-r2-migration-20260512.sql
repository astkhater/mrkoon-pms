-- =================================================================
-- Mrkoon PMS — BCF v8-r2 migration (Hussein TL Gates 5→6)
-- Date: 2026-05-12
-- Source: bonus-commission-framework-v8-r2.xlsx
--                                       ^^ revision marker
--
-- ID convention:
--   def.commission_schemes.id = major version only (VM-COMM-v8, OPS-TL-GATES-v8)
--   config.compensation_rates tracks revisions via:
--     - effective_from / effective_to (time-series)
--     - value_json.revision tag ("v8-r2", "v8-r3", "v9-r1" ...) for traceability
--
-- Future rev pattern (r3, r4, v9):
--   1. CLOSE OUT current open row:
--      update config.compensation_rates
--         set effective_to = current_date - 1
--       where scheme_ref = X and key = Y and effective_to is null;
--   2. INSERT new row with effective_from = current_date, fresh notes/revision.
--   That preserves every prior amount/threshold change with a date range.
--
-- This file does it for v8-r2 below.
-- =================================================================

-- 0. Track today's effective date for repeatable rerun
do $$ declare v_today date := current_date; v_rev text := 'v8-r2'; begin

-- 1. Ensure v8 commission schemes exist (idempotent)
insert into def.commission_schemes (id, name_en, name_ar, cadence, comp_model, description, active) values
  ('VM-COMM-v8',      'VM Sales Commission v8',
                      'عمولة المبيعات الميدانية v8',
                      'monthly', 'COGS',
                      'Per-auction with attendance floor ≥6. Current revision: ' || v_rev || '.',
                      true),
  ('OPS-TL-GATES-v8', 'Operations TL Gates v8',
                      'مكافآت قائد العمليات v8',
                      'monthly', 'COGS',
                      '6 gates (3 Ops + 3 VM), capped at 6,500 EGP/month. Current revision: ' || v_rev || '.',
                      true)
on conflict (id) do update
  set name_en     = excluded.name_en,
      name_ar     = excluded.name_ar,
      description = excluded.description,
      active      = true;

-- 2. Deactivate v7 schemes (keep rows for audit; mark inactive)
update def.commission_schemes set active = false where id in ('VM-COMM-v7', 'OPS-TL-GATES-v7');

-- 3. Close out any currently-open compensation_rates rows we're about to revise.
--    This stamps a clean "ended" date on the v7 / v8-r1 values so history is preserved.
update config.compensation_rates
   set effective_to = v_today - 1
 where effective_to is null
   and (
     scheme_ref in ('VM-COMM-v7','OPS-TL-GATES-v7','VM-COMM-v8','OPS-TL-GATES-v8')
     or key = 'huss_tl_monthly_cap'
   );

-- 4. Insert NEW v8-r2 rows on the v8 scheme refs. Each carries the revision tag in JSON
--    so reports / audits can trace which rev introduced which value.
--    Pattern: every row stamped with effective_from = today, effective_to = null.

-- 4a. VM-COMM-v8 (per-auction mechanics carried forward unchanged from v7)
insert into config.compensation_rates (scheme_ref, key, value_numeric, value_json, effective_from, notes) values
  ('VM-COMM-v8', 'success_base',     500, jsonb_build_object('amount',500,'rule','auction with ≥1 bidder AND attendance ≥ 6','revision', v_rev), v_today, 'Carried from v7'),
  ('VM-COMM-v8', 'extra_bidder',     50,  jsonb_build_object('amount',50,'revision', v_rev),  v_today, 'Carried from v7'),
  ('VM-COMM-v8', 'non_success_flat', 250, jsonb_build_object('amount',250,'revision', v_rev), v_today, 'Carried from v7')
on conflict (scheme_ref, key, effective_from) do update
  set value_numeric = excluded.value_numeric,
      value_json    = excluded.value_json,
      notes         = excluded.notes;

-- 4b. OPS-TL-GATES-v8 (6 gates: 3 Ops + 3 VM, cap 6,500)
insert into config.compensation_rates (scheme_ref, key, value_numeric, value_json, effective_from, notes) values
  ('OPS-TL-GATES-v8', 'ops_gate_1_zero_issue',    1500, jsonb_build_object('amount',1500,'threshold',0.95,'revision', v_rev), v_today, 'Zero-issue loading rate ≥95%'),
  ('OPS-TL-GATES-v8', 'ops_gate_2_on_time',       1000, jsonb_build_object('amount',1000,'threshold',0.90,'revision', v_rev), v_today, 'On-time loading ≥90%'),
  ('OPS-TL-GATES-v8', 'ops_gate_3_report_compliance', 500, jsonb_build_object('amount',500,'threshold',1.00,'revision', v_rev), v_today, 'v8-r2 rename: was "No Client Escalation" in v7'),
  ('OPS-TL-GATES-v8', 'vm_gate_1_merchant_coverage', 1500, jsonb_build_object('amount',1500,'threshold',0.80,'revision', v_rev), v_today, 'Qualifying auctions / total ≥80%'),
  ('OPS-TL-GATES-v8', 'vm_gate_2_price_quality',     1500, jsonb_build_object('amount',1500,'threshold',0.80,'revision', v_rev), v_today, 'v8-r2 rename: was "Avg Bidders ≥4" in v7. Now 125%-rule auctions ≥80%.'),
  ('OPS-TL-GATES-v8', 'vm_gate_3_avg_bidders',       1000, jsonb_build_object('amount',1000,'threshold',4,   'revision', v_rev), v_today, 'NEW in v8-r2: avg active bidders per auction ≥4')
on conflict (scheme_ref, key, effective_from) do update
  set value_numeric = excluded.value_numeric,
      value_json    = excluded.value_json,
      notes         = excluded.notes;

-- 4c. Hussein TL monthly cap — bump 5500 → 6500, new effective row
insert into config.compensation_rates (scheme_ref, key, value_numeric, value_json, effective_from, notes) values
  ('OPS-TL-GATES-v8', 'huss_tl_monthly_cap', 6500, jsonb_build_object('amount',6500,'prior',5500,'revision', v_rev), v_today,
   'Cap raised 5,500 → 6,500 for v8-r2 (added VM Gate 3).')
on conflict (scheme_ref, key, effective_from) do update
  set value_numeric = excluded.value_numeric,
      value_json    = excluded.value_json,
      notes         = excluded.notes;

end $$;

-- 5. Add the NEW OPS-GATE-06 KPI tagged with v8 scheme
insert into def.kpis
  (id, name_en, name_ar, formula_text, frequency, target_value, weight_default, weight_type_default, scheme_ref, kr_ref, gate_amount, gate_threshold)
values (
  'OPS-GATE-06',
  'VM GATE 3: Avg Active Bidders ≥4',
  'بوابة إدارة البائعين 3: متوسط المزايدين النشطين ≥4',
  'Avg active bidders per auction across all auctions in the period',
  'monthly', 4, null, 'gate', 'OPS-TL-GATES-v8',
  (select id from def.key_results where code = 'CO3.KR3'),
  1000, 4
)
on conflict (id) do update
  set name_en             = excluded.name_en,
      name_ar             = excluded.name_ar,
      formula_text        = excluded.formula_text,
      target_value        = excluded.target_value,
      weight_type_default = excluded.weight_type_default,
      scheme_ref          = excluded.scheme_ref,
      kr_ref              = excluded.kr_ref,
      gate_amount         = excluded.gate_amount,
      gate_threshold      = excluded.gate_threshold;

-- 6. Backfill scheme_ref + gate_amount + gate_threshold on the 5 existing OPS-GATE-* KPIs
--    so all 6 gates reference OPS-TL-GATES-v8 consistently
update def.kpis set scheme_ref='OPS-TL-GATES-v8', gate_amount=1500, gate_threshold=0.95 where id='OPS-GATE-01';
update def.kpis set scheme_ref='OPS-TL-GATES-v8', gate_amount=1000, gate_threshold=0.90 where id='OPS-GATE-02';
update def.kpis set scheme_ref='OPS-TL-GATES-v8', gate_amount=500                         where id='OPS-GATE-03';
update def.kpis set scheme_ref='OPS-TL-GATES-v8', gate_amount=1500, gate_threshold=0.80 where id='OPS-GATE-04';
update def.kpis set scheme_ref='OPS-TL-GATES-v8', gate_amount=1500, gate_threshold=0.80 where id='OPS-GATE-05';

-- 7. Tag all VM-* KPIs to v8 commission scheme
update def.kpis set scheme_ref='VM-COMM-v8' where id like 'VM-%';

notify pgrst, 'reload schema';

-- =================================================================
-- HOW TO ADD r3 (or future r4, v9...) — TEMPLATE
-- =================================================================
-- 1. Update the do-block's v_rev variable: e.g. v_rev := 'v8-r3'
-- 2. Run the same UPDATE step that closes effective_to on rows being revised
-- 3. INSERT new rows with the same scheme_ref + new effective_from = today
-- 4. JSON revision tag tracks which rev introduced which value
-- That preserves a full time-series of every comp rate change.
-- =================================================================

-- Verification:
-- select scheme_ref, key, value_numeric, effective_from, effective_to,
--        value_json->>'revision' as rev
--   from config.compensation_rates
--  where scheme_ref like 'OPS-TL-GATES%' or key = 'huss_tl_monthly_cap'
--  order by scheme_ref, key, effective_from desc;
