-- =================================================================
-- Mrkoon PMS — BCF v11 migration (Hussein TL pure-management model)
-- Date: 2026-06-19
-- Source: bonus-commission-framework-v11.xlsx
--
-- ID convention (continued from v8-r2):
--   def.commission_schemes.id = major version only (HUSSEIN-MGMT-v11)
--   config.compensation_rates tracks revisions via:
--     - effective_from / effective_to (time-series)
--     - value_json.revision tag ('v11-r1') for traceability
--
-- v11 deltas vs v8-r2:
--   1. Gate model: 6 → 7 gates (3 Ops + 3 VM + 1 Resolution NEW)
--   2. Monthly cap: 6,500 → 7,000 (= natural sum of all 7 gates)
--   3. VM Gate 2 (Price Quality) amount: 1,500 → 1,000
--   4. NEW Resolution gate: ≥90% team self-resolved, 500 EGP
--   5. NEW Participant Bonus: 100 EGP per auction ≥6 paid merchants (uncapped)
--   6. NEW Referral commission: Client/Supplier 2,000 · Merchant Bid 50 · Win 500 (uncapped)
--   7. NO personal field ops items — pure management model
--   8. VM gates earmarked to transfer to future VM-TL when role is hired
--      (handled in future migration; for now all 7 gates live on HUSSEIN-MGMT-v11)
-- =================================================================

do $$ declare v_today date := current_date; v_rev text := 'v11-r1'; begin

-- 1. Ensure v11 commission schemes exist (idempotent)
insert into def.commission_schemes (id, name_en, name_ar, cadence, comp_model, description, active) values
  ('HUSSEIN-MGMT-v11',
   'Hussein TL Management Gates & Commission v11',
   'مكافآت ومُحفّزات قائد العمليات v11',
   'monthly', 'COGS',
   '7 gates (3 Ops + 3 VM + Resolution) cap 7,000 + Participant Bonus (uncapped) + Referrals (uncapped). Pure management model — no personal field ops. Revision: ' || v_rev || '.',
   true)
on conflict (id) do update
  set name_en     = excluded.name_en,
      name_ar     = excluded.name_ar,
      description = excluded.description,
      active      = true;

-- 2. Deactivate prior Hussein TL scheme versions
update def.commission_schemes set active = false where id in ('OPS-TL-GATES-v7','OPS-TL-GATES-v8');

-- 3. Close out any currently-open compensation_rates rows we are about to revise
update config.compensation_rates
   set effective_to = v_today - 1
 where effective_to is null
   and (scheme_ref in ('OPS-TL-GATES-v7','OPS-TL-GATES-v8','HUSSEIN-MGMT-v11')
        or key = 'huss_tl_monthly_cap');

-- 4. Insert v11 HUSSEIN-MGMT rows — gates, participant bonus, referrals, cap
insert into config.compensation_rates (scheme_ref, key, value_numeric, value_json, effective_from, notes) values
  -- PART A: OPS TEAM GATES (3)
  ('HUSSEIN-MGMT-v11','ops_gate_1_zero_issue',         1500, jsonb_build_object('amount',1500,'threshold',0.95,'revision', v_rev,'part','A'), v_today, 'Team Zero-Issue Rate ≥95%'),
  ('HUSSEIN-MGMT-v11','ops_gate_2_speed',              1000, jsonb_build_object('amount',1000,'threshold',0.90,'revision', v_rev,'part','A'), v_today, 'Team Speed (On-time loading) ≥90%'),
  ('HUSSEIN-MGMT-v11','ops_gate_3_doc_compliance',      500, jsonb_build_object('amount', 500,'threshold',1.00,'revision', v_rev,'part','A'), v_today, 'Team Documentation 100%'),
  -- PART B: VM TEAM GATES (3) — earmarked to transfer to VM TL when hired
  ('HUSSEIN-MGMT-v11','vm_gate_1_auction_fill',        1500, jsonb_build_object('amount',1500,'threshold',0.80,'revision', v_rev,'part','B','transfers_to','VM-TL-GATES-v11'), v_today, 'VM Auction Fill ≥80%'),
  ('HUSSEIN-MGMT-v11','vm_gate_2_price_quality',       1000, jsonb_build_object('amount',1000,'threshold',0.80,'revision', v_rev,'part','B','transfers_to','VM-TL-GATES-v11','prior',1500), v_today, 'VM Price Quality ≥80%. Reduced 1,500→1,000 in v11.'),
  ('HUSSEIN-MGMT-v11','vm_gate_3_avg_bidders',         1000, jsonb_build_object('amount',1000,'threshold',4,    'revision', v_rev,'part','B','transfers_to','VM-TL-GATES-v11'), v_today, 'Avg active bidders per auction ≥4'),
  -- PART C: RESOLUTION GATE (1) — NEW in v11
  ('HUSSEIN-MGMT-v11','resolution_gate',                500, jsonb_build_object('amount', 500,'threshold',0.90,'revision', v_rev,'part','C','new_in','v11'), v_today, 'NEW v11: ≥90% issues resolved without escalation.'),
  -- PART D: PARTICIPANT BONUS (uncapped, per qualifying auction)
  ('HUSSEIN-MGMT-v11','participant_bonus_rate',         100, jsonb_build_object('amount',100,'per_unit','auction','trigger_min_bidders',6,'revision', v_rev,'part','D','uncapped',true), v_today, 'Participant Bonus: 100 EGP per qualifying auction (≥6 paid merchants).'),
  -- PART E: REFERRAL COMMISSION (uncapped, per event)
  ('HUSSEIN-MGMT-v11','referral_client_supplier',      2000, jsonb_build_object('amount',2000,'per_unit','referral','revision', v_rev,'part','E','uncapped',true,'kind','client_or_supplier'), v_today, 'Referral: Client or Supplier introduction.'),
  ('HUSSEIN-MGMT-v11','referral_merchant_bid',           50, jsonb_build_object('amount',  50,'per_unit','referral','revision', v_rev,'part','E','uncapped',true,'kind','merchant_bid'),        v_today, 'Referral: Merchant placed a bid.'),
  ('HUSSEIN-MGMT-v11','referral_merchant_win',          500, jsonb_build_object('amount', 500,'per_unit','referral','revision', v_rev,'part','E','uncapped',true,'kind','merchant_win'),        v_today, 'Referral: Merchant won an auction.'),
  -- COMBINED: gates cap
  ('HUSSEIN-MGMT-v11','gates_cap_monthly',             7000, jsonb_build_object('amount',7000,'applies_to','parts_A_B_C','prior',6500,'revision', v_rev,'note','Natural max = sum of all 7 gates'), v_today, 'Cap on summed gate income (A+B+C). Bumped 6,500→7,000.'),
  -- Legacy compat key (used by older calc paths)
  ('HUSSEIN-MGMT-v11','huss_tl_monthly_cap',           7000, jsonb_build_object('amount',7000,'prior',6500,'revision', v_rev), v_today, 'Legacy alias — same value as gates_cap_monthly.')
on conflict (scheme_ref, key, effective_from) do update
  set value_numeric = excluded.value_numeric,
      value_json    = excluded.value_json,
      notes         = excluded.notes;

end $$;

-- 5. Add NEW gate KPI for Resolution (OPS-GATE-07)
insert into def.kpis
  (id, name_en, name_ar, formula_text, frequency, target_value, weight_default, weight_type_default, scheme_ref, kr_ref, gate_amount, gate_threshold)
values (
  'OPS-GATE-07',
  'Resolution Gate: ≥90% team self-resolved',
  'بوابة الحل: ≥90% من المشكلات تحل داخلياً',
  '(Self-resolved issues) / (Total issues raised) — period total',
  'monthly', 0.90, null, 'gate', 'HUSSEIN-MGMT-v11',
  (select id from def.key_results where code = 'CO3.KR4'),
  500, 0.90
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

-- 6. Update existing OPS-GATE-01..06 to point at HUSSEIN-MGMT-v11 (was OPS-TL-GATES-v8)
--    Also: bump VM Gate 2 (OPS-GATE-05) gate_amount 1,500 → 1,000 per v11.
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount=1500, gate_threshold=0.95 where id='OPS-GATE-01';
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount=1000, gate_threshold=0.90 where id='OPS-GATE-02';
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount= 500                       where id='OPS-GATE-03';
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount=1500, gate_threshold=0.80 where id='OPS-GATE-04';
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount=1000, gate_threshold=0.80 where id='OPS-GATE-05';  -- amount changed 1500→1000
update def.kpis set scheme_ref='HUSSEIN-MGMT-v11', gate_amount=1000, gate_threshold=4    where id='OPS-GATE-06';

notify pgrst, 'reload schema';

-- =================================================================
-- Verification (run after migration completes):
-- 1. All 7 Hussein gates on v11 scheme:
--    select id, name_en, scheme_ref, gate_amount, gate_threshold
--      from def.kpis where id like 'OPS-GATE-0%' order by id;
--    -- Expect rows OPS-GATE-01..07 all on HUSSEIN-MGMT-v11.
--
-- 2. Rate set complete:
--    select key, value_numeric, value_json->>'part' as part, value_json->>'revision' as rev
--      from config.compensation_rates
--     where scheme_ref = 'HUSSEIN-MGMT-v11' and effective_to is null
--     order by part, key;
--    -- Expect 13 rows: 7 gates + 1 participant_bonus_rate + 3 referrals + 2 cap aliases.
--
-- 3. Prior v8 rows closed:
--    select count(*) from config.compensation_rates
--     where scheme_ref = 'OPS-TL-GATES-v8' and effective_to is null;
--    -- Expect 0.
--
-- 4. Scheme audit:
--    select id, active from def.commission_schemes
--     where id in ('OPS-TL-GATES-v8','HUSSEIN-MGMT-v11');
--    -- Expect: v8 inactive, v11 active.
-- =================================================================
