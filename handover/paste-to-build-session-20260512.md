# Paste-note for KPI App Build session
From: OKR alignment session (Watch Mode)
Date: 2026-05-12
Subject: v9 BCF + v6-20260512 KPI Master — ingestion gate

---

## TL;DR
You're aligned with everything except: (1) BCF migration is at v8-r2 but canonical is now v9 — write the v9 migration; (2) before final KPI weight ingest from v6 KPI Master, wait for KPI session to fix 3 data issues (Tech PO 0.75 weight, 5 missing KR refs, KR5.4 orphan affecting 22 cells).

---

## Action 1 — Write v9 BCF migration (NEW)

**Why:** `CURRENT-VERSIONS.md` updated 2026-05-12 to name `bonus-commission-framework-v9.xlsx` as canonical. Your latest migration is `11-bcf-v8-r2-migration-20260512.sql`. v9 introduces material changes that need to flow into the schema.

**What v9 changes vs v8-r2** (from `shared/hr/commission-schemes/bonus-commission-framework-v9.xlsx`, Framework Overview + Rates & Config Section E):

| Item | v8-r2 | v9 |
|---|---|---|
| Hussein TL Gates | 6-gate model (3 Ops + 3 VM) | **7-Gate model** (3 Ops + 3 VM + new participant bonus) |
| TL ≥6 Participant Bonus | (didn't exist) | **NEW** — 100 EGP per qualifying auction (Rates & Config R67). Hussein earns this for each auction where VM team brings ≥6 paid-insurance merchants. |
| Cap (Section E) | 6,500 EGP/month | **0 = no cap active** (formula preserved; admin sets value to activate) |
| VM-Sales Commission | Single calculator | **7 scenarios in separate rows** with auto-notes (Success / Non-Success × Fulfillment × Lift × Replacement × Participant variants) |
| Operations Bonus, BD/AM/Onboarding | unchanged | unchanged |

**Migration file:** `12-bcf-v9-migration-20260512.sql` (or similar incremental number, following your naming)

**Pattern to follow** (same as v8-r2 migration's "Future rev pattern" comment):
1. CLOSE OUT current open v8-r2 rows in `config.compensation_rates`:
   ```sql
   update config.compensation_rates
      set effective_to = current_date - 1
    where scheme_ref in ('OPS-TL-GATES-v8', 'VM-COMM-v8')
      and effective_to is null;
   ```
2. INSERT v9 rows with `effective_from = current_date`, `value_json.revision = 'v9-r1'`, fresh notes.

**Specific data to seed for v9:**
- 7 Hussein TL gates (rows 61-66 of Rates & Config) — amounts and conditions as currently in v9
- TL participant bonus rate (100 EGP per qualifying auction, threshold ≥6 merchants)
- Section E cap = 0 (no-cap state, formula preserved)
- VM-Sales 7 scenarios (rows in `VM-Sales Commission` tab)

**Verification after migration:**
- All 7 Hussein gates queryable via `config.compensation_rates` filtered to `effective_to is null` and `scheme_ref = 'OPS-TL-GATES-v9'`
- VM commission scheme has 7 scenario branches
- TL participant bonus accessible as a separate scheme entry or as v9 gate config

---

## Action 2 — Wait on KPI weight ingest (BLOCKED on KPI session)

**Why:** Build log says: *"Still pending: workspace return → parse v6 KPI Master xlsx → seed real weights via panels."* Workspace is back. But v6 KPI Master has 3 data issues that should not be ingested as-is:

### Block 1: Tech PO weights sum 0.75
- 6 scored TECH-PO KPIs sum to 0.75 instead of 1.00
- If ingested, `def.kpi_role_weights` for Sr PO & Mobile Dev role would fail the deferred sum-check trigger (per schema v2 design)
- KPI session is fixing — ETA: ASAP

### Block 2: 5 KPIs in KPI Definitions have empty KR refs
- KPI-017, 018, 021, 022, 023, 024 (5 + 1 dashboard)
- If your `def.kpis.kr_id` is NOT NULL, ingestion will reject these rows
- If your `def.kpis.kr_id` allows NULL, KPI-021/022/023 will be left dangling without an OKR link
- KPI session is assigning KR refs

### Block 3: KR5.4 orphan referenced in 22 cells
- v6 references KR5.4 across Marketing KPIs + KPI Definitions + KPI Master
- Company OKRs has only KR5.1, KR5.2, KR5.3 — KR5.4 doesn't exist
- If your schema enforces FK `kpi_role_weights.kr_ref → okrs.kr_id`, 22 rows will fail FK validation
- KPI session is either adding KR5.4 to Company OKRs or remapping the 22 references

**Recommended path:**
1. Add validation in your ingestion script: flag rows with `kr_ref` referencing a non-existent KR (catches KR5.4 + future drift)
2. Add validation: flag roles whose `weight` sum ≠ 1.00 (catches Tech PO + future drift)
3. Wait for KPI session signal that v6 is "ingest-ready" (will arrive via paste-note `clear-to-ingest-XXXXXXXX.md` in `mrkoon-okr-build/handover/`)

---

## Action 3 — Optional now: build the v9 migration in parallel

Action 1 (v9 migration) is **independent of Action 2** (KPI weights from v6). You can write and apply the v9 BCF migration now — it only touches `config.compensation_rates`, not `def.kpis` or `def.kpi_role_weights`.

The KPI weight blockers are about ingesting `def.kpis` + `def.kpi_role_weights` from v6 KPI Master, which is a separate Supabase table.

So: **proceed with v9 migration now, wait on weight ingest until KPI session clears v6.**

---

## What you already have right

Verified clean:
- Reads `CURRENT-VERSIONS.md` per D-40 ✓
- Schema decisions D-35 to D-40 all aligned with v6 reality ✓
- weight_type enum (scored/monitor/gate/dashboard) handles all 4 KPI categories cleanly ✓
- Ops TL dual rendering pattern (D-37) handles the gate/scored split ✓
- Tech PO split pattern (D-38) correctly treats TECH-PO-07/08/09 as monitor-only ✓
- Versioning pattern (effective_from/to + value_json.revision) is the right design for BCF revisions ✓
- 40 KPI placeholder slots gives 4-slot buffer beyond v6's KPI-036 (forward room) ✓
- Real ingest seeds (04-roster, 05-okrs-real, 06-kpis-real, 09-sop-kpi-links, etc.) confirm forward progress ✓

---

## Reference

- Full review verdict: in OKR alignment session log 2026-05-12
- Watch Mode log: `mrkoon-okr-build/review-log.txt`
- Source of truth: `shared/CURRENT-VERSIONS.md`
- KPI session companion paste-note: `mrkoon-okr-build/handover/paste-to-kpi-session-20260512.md`

End of paste-note. Reach back via `mrkoon-okr-build/handover/build-questions-XXXXXXXX.md` if anything in v9 BCF doesn't translate cleanly into the existing schema pattern.
