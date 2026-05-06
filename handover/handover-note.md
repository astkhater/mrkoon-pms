# Mrkoon OKR/KPI/Commission/Appraisal/SOP — Handover Note v1
For: Build session (digitalization)
Date: 2026-05-01
Owner of this note: Khater (alignment session output)

This is the handover from the OKR alignment review (28 files reviewed across 7 phases, 22 fixes applied). Read this before writing any code or data model. The consolidated review (`consolidated-review-v1-20260501.md`) sits alongside this note with the full finding-by-finding detail; this note is the build-ready summary.

---

## 1. The data model — derived from the files

The system has four conceptual layers. Build accordingly.

**Layer 1 — Source of Truth (Configuration)**
- Targets, rates, thresholds, comp parameters, salary bands. Almost no formulas, only values.
- Lives in: `Rates & Config` (v7) + `Inputs` (v5) + `Inputs` (ops model) + `Inputs` (taskforces). These are configuration tables that everything else reads.
- Build target: one config table per domain (compensation, capacity, financial). All calculators reference these by name, never duplicate values.

**Layer 2 — Definitions**
- KPIs (32 + 4 new = 36), Objectives + KRs (Company 6/28 + Ops 4/17), SOPs (10 production), comp schemes (BD/AM/VM/Onboarding/Ops/HussTL/QuarterlyOpEx/Annual).
- Lives in: v5 KPI Definitions, v5 KPI Master, v5 Company OKRs, v5 Department OKRs - Ops (new), sop-index, v7 Framework Overview.
- Build target: one schema per definition type with primary keys (KPI-001…036, KR_id, SOP-001…010, scheme codes).

**Layer 3 — Calculations**
- Take definitions + actuals + config and produce scores/payouts. Heavy formula files.
- Lives in: v5 GP analytics tabs (Per Rep / Per Offering / Per Mktg Spend), v7 calculators (BD/AM/VM/etc.), appraisal-annual (annual scoring), appraisal-quarterly (quarterly scoring), monitoring-cadence-matrix, target-gp30m-ops-model.
- Build target: pure functions over definitions + actuals + config. No hard-coded values from Layer 1 in formulas.

**Layer 4 — Tracking (Actuals + Forms)**
- Daily/weekly/monthly/quarterly inputs from operations.
- Should live in: dedicated tracker files / database tables. Currently broken — 5 empty shells were doing this badly. Now deprecated with README pointers.
- Build target: per-employee per-period actuals with transactional inputs (commission events, loading events, auction events, etc.).

---

## 2. File register — what each file is, what it does

### Source layer (mrkoon-chro/source/)
- **Mrkoon_EGY_TaskForce_v8_0.xlsx** — Egypt BD task-force model. 12 sheets, 675 formulas. Drives 300-account / 30M GP target. Active baseline locked at 104 (this session).
- **Mrkoon_KSA_TaskForce_v3_3.xlsx** — Saudi market-entry SaaS model. 7 sheets, 331 formulas. Tier-based subscription + transaction commission. Has hard-coded Egypt-shared cost cells that should become live links in build.
- **Mrkoon_SOP_KPI_Framework.xlsx** — Original SOP/KPI register. Largely superseded by v5 framework + sop-index. **Status: candidate-list (closed). Mapping documented in sop-candidate-to-production-map.**
- **BD_Commission Calculator.xlsx** — RELOCATED to shared/hr/commission-schemes/BD-Commission-Calculator.xlsx (canonical). Source renamed `.RELOCATED-20260501.xlsx`.

### OKR/KPI Framework (canonical: shared/hr/)
- **okr-kpi-framework-v5-20260424.xlsx** — Master OKR/KPI register. 18 sheets (17 + new Department OKRs - Ops). Inputs hub feeds 6 Company Objectives × 28 KRs, 7 dept KPI sheets, KPI Definitions (36 KPIs after this session), KPI Master (with Commission Scheme Ref column), 3 GP analytics tabs.
- Mirror at `shared/commercial/target-300/okr-kpi-framework-v5-20260424.xlsx` is byte-identical. Build can pick either; recommend hr/ as canonical.
- `shared/company/kpis-master.xlsx` and `okrs.xlsx` — DEPRECATED empty shells. Use v5 directly.

### Bonus/Commission (canonical: shared/hr/commission-schemes/)
- **bonus-commission-framework-v7.xlsx** — 11 sheets. `Rates & Config` is gold-standard single-source pattern. Calculators for BD (per-account), AM (6-component), VM-Sales (per-auction), Onboarding (per-merchant), Operations (4-bonus), Hussein TL (5-gate), Quarterly OpEx, Annual Bonus. Mirror at chro/performance/ is byte-identical.
- **bonus-commission-framework-v7-vm.xlsx** — VM-only variant. Has 3 VM sheets (one is paste artifact `(3)` to clean up). Rows 30-40 formula bug fixed this session.
- **BD-Commission-Calculator.xlsx** — Standalone printable BD calculator (logic also lives in v7 BD Commission tab).

### Appraisals (canonical: mrkoon-chro/performance/)
- **appraisal-annual-v2.xlsx** — 22 role-specific tabs + Instructions + KPI Source. INDEX/MATCH on KPI ID. Aggregates Q1-Q4 scores, applies 70/20/10 weighting (KPI/Competency/Manager). Bilingual EN/AR. Comp Model tag per role.
- **appraisal-quarterly-v2.xlsx** — Same 22-tab structure. Per-tab fields: KR Ref, Target, Actual, Score, Weight, Weighted Score.
- **monitoring-cadence-matrix-v2.xlsx** — 72-row daily/weekly/monthly/quarterly cadence per role × KPI with reviewer + tool + threshold + comp model.
- **appraisal-form-annual-v1.docx, appraisal-form-quarterly-v1.docx, monthly-checkpoint-form-v1.docx** — Print/sign-ready paper versions. Annual form's Performance Gates table now blank in template (named individuals removed this session).

### SOPs (canonical: mrkoon-chro/sop/)
- **Mrkoon-SOP-Manual-v1.docx** — 1,139-paragraph bilingual manual. TOC SOP-001 through SOP-008.
- **sop-index-v1.xlsx** — Now extended with SOP-007, SOP-008, plus 5 metadata columns (KPI/KR Ref, Owner, Cycle, Last Reviewed) and Category column.
- **SOP-001 through SOP-008** — Individual procedure docs. SOP-007 has cross-link methodology already. SOP-001-006 still need KPI/KR cross-refs added in body (SOP session work).

### Ops layer (canonical: mrkoon-ops/)
- **target-gp30m-ops-model-v1-20260424.xlsx** — Capacity model. Inputs hub + 5 analytical sheets. Drives headcount triggers. Active baseline locked at 104 this session. VM hire trigger now operational (≥15 auctions/VM/day) instead of client-count.
- **vm-onsite-ops-analysis-v1-20260425.docx** — Analytical report (April 25). Findings drove 3 of the 4 new KPIs (per-VM, loading distribution, merchant activation). Concentration risk findings stay in the analysis layer (Khater: not OKR/KPI material).
- `shared/ops/loading-tracker.xlsx` — DEPRECATED empty shell.

### Targets/Hiring (canonical: shared/commercial/)
- **target-300-master-brief-v2-20260422.md** — The strategic anchor. 30M GP target, 104 baseline, 75 clients/quarter marketing throughput, 25 acct/quarter BD throughput. Brief explicitly says "client count and revenue are outputs, not inputs — model works backward from GP."
- **hiring-plan-target-300-v2-20260424.xlsx** — 4 sheets: Inputs / Hiring Timeline / Sourcing Plan / Cost Projection. Updated this session with VM operational trigger.
- `shared/commercial/bd-targets.xlsx` and `commission-actuals.xlsx` — DEPRECATED empty shells. Live tracking happens in CRM v15, appraisal-quarterly Q-BD tabs, and v7 calculators.

### New artifact (this session)
- **mrkoon-okr-build/handover/sop-candidate-to-production-map-v1-20260501.xlsx** — Closes the SOP-S01 vs SOP-001 reconciliation. 26 entries (24 source candidates + 2 production-only) with status (MAPPED/ABSORBED/KILLED/PRODUCTION) + reason + lock date.

---

## 3. How files connect — the data flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STRATEGIC ANCHOR                                                │
│   target-300-master-brief-v2 (markdown)                         │
│   → 30M GP target, 104 baseline, 300 clients, 75/quarter        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ OKR/KPI FRAMEWORK (v5 — canonical at shared/hr/)                │
│   Inputs hub → Company OKRs (6 obj/28 KR) → 7 dept KPI sheets   │
│   + KPI Definitions (36 KPIs) + KPI Master                      │
│   + Department OKRs - Ops (NEW: 4 obj/17 KR with O-KR prefix)   │
└─────────────────────────────────────────────────────────────────┘
        │                              │                          │
        ▼                              ▼                          ▼
┌─────────────────┐          ┌──────────────────┐    ┌────────────────────┐
│ COMMISSION (v7) │          │ APPRAISAL        │    │ SOPs               │
│ Rates & Config  │◄─INDEX───│ KPI Source       │    │ sop-index v1       │
│ → 8 calculators │          │ → 22 role tabs   │    │ → 10 SOPs (001-010)│
│ + v7-vm variant │          │ → Annual Q1-Q4   │    │ + SOP Manual       │
└─────────────────┘          │ → Monitoring     │    │ + Forms (printable)│
        │                    │   cadence matrix │    └────────────────────┘
        ▼                    └──────────────────┘                │
┌─────────────────┐                  │                           │
│ OPS / CAPACITY  │                  ▼                           │
│ target-gp30m    │          ┌──────────────────┐                │
│ → 4 Ops OKRs    │          │ TRACKING         │                │
│ → headcount     │          │ (currently weak) │                │
│   triggers (now │          │ → CRM v15        │                │
│   operational)  │          │ → Fawry Payday   │                │
└─────────────────┘          │ → field-ops sheet│                │
        │                    │ (5 empty shells  │                │
        ▼                    │  deprecated)     │                │
┌─────────────────┐          └──────────────────┘                │
│ HIRING PLAN     │                                              │
│ → triggers tied │◄─────────────────────────────────────────────┘
│   to VM KPI-036 │                                       (SOP refs in
│   not clients   │                                        every layer)
└─────────────────┘
```

**Key linkages:**
- v5 KPI Definitions has SOP Reference column → links every KPI to its measuring SOP (one-way; reverse direction only in SOP-007/008 currently)
- v5 KPI Master has KR Reference + Commission Scheme Ref columns → links every KPI to its parent KR + which v7 scheme it pays under
- Appraisal annual + quarterly + monitoring cadence all use INDEX/MATCH on KPI ID against KPI Source (currently 4 byte-identical copies — must consolidate, see §5)
- v7 Rates & Config is referenced by every v7 calculator via formula (`'Rates & Config'!B5` etc.) — clean architecture, replicate this pattern
- Ops capacity model ↔ hiring plan now share the VM operational trigger (KPI-036 ≥15 auctions/VM/day)

---

## 4. Commission and bonus rules — locked

### BD Acquisition (per-account, quarterly)
- Quarterly target: 25 accounts/BD
- Rate table: 50% achievement → 400 EGP/account, scales to 120% → 1,400 EGP/account
- Cap: 30 accounts (120% achievement)
- GP Kicker: requires BOTH (a) accounts closed ≥ **13** AND (b) realized quarterly GP ≥ 300,000 EGP. Kicker = 5% of total realized quarterly GP.
- BD portfolio cap: 20 active accounts (after which client transitions to AM)
- Comp model: COGS (commission only)
- Scheme code: BD-COMM-Q-v7 (renamed from DEC-41)
- Reference: v7 → BD Commission tab + Rates & Config Section A. Standalone calc at shared/hr/commission-schemes/BD-Commission-Calculator.xlsx.

### AM (Shams El-Din, monthly, 6-component)
- Retention: 200 EGP per active client/month (no cap)
- Reactivation: 500 EGP per event, 1,500 EGP/month cap, requires ≥2 retained months
- Upsell: 300 EGP per new category
- Referral: 1,000 EGP per signed referral
- Volume Bonus: 1,500 EGP if portfolio avg ≥2 txns/client/month (Y/N input — needs derivation in build)
- Portfolio Bonus: 1,000 EGP if ≥40 clients AND ≥80% transacting
- Comp model: COGS
- Scheme code: AM-COMM-v7 (renamed from DEC-60)
- Transition note: Shams transitioned BD → AM 2026-05-01 (no retroactive comp on past BD work)

### VM-Sales (per-auction, monthly)
- Success base: 500 EGP (auction with ≥1 bidder)
- Per extra bidder: 50 EGP (above 1)
- Non-success flat: 250 EGP
- Comp model: COGS
- Scheme code: VM-COMM-v7
- New constraint (locked 2026-05-01): merchant attendance floor ≥6 per auction (SOP-003 / O-KR2.2)

### Operations Bonus (individual, monthly)
- Quality bonus: 750 EGP if ≥95% zero-issue rate
- Volume bonus: 1,000 EGP per 10 loadings
- Speed bonus: 200 EGP if ≥90% on-time
- Referral: 2,000 EGP per signed client referral
- Scheme code: OPS-BONUS-v7

### Hussein TL Gates (5-gate, monthly, max 5,500 EGP/month cap)
- Ops Gate 1 (Zero-Issue ≥95%): 1,500 EGP
- Ops Gate 2 (On-Time ≥90%): 1,000 EGP
- Ops Gate 3 (No Client Escalation): 500 EGP
- VM Gate 1 (Auction Fill ≥80%): 1,500 EGP
- VM Gate 2 (Avg Bidders ≥4): 1,000 EGP
- Scheme code: OPS-TL-GATES-v7

### Onboarding Commission (per-merchant)
- 150 EGP per merchant (5,000 EGP monthly cap)
- 30-day clawback if no first auction (clawback rate 150 EGP)
- Scheme code: ONB-COMM-v7

### Quarterly OpEx Bonus (Marketing/Tech/Finance/HR)
- Score-based on quarterly appraisal
- L1: 5-10% of salary | L2: 8-15% | L3: 10-20% | L4: 12-25% | L5: 15-30%
- Min appraisal score 3.0 to qualify (otherwise no bonus)

### Annual Appraisal (all teams)
- Weights: KPI 70% + Competency 20% + Manager 10%
- Rating bands: 4.5-5 Exceptional / 3.5-4.49 Exceeds / 2.5-3.49 Meets / 1.5-2.49 Needs Improvement / 1-1.49 Unsatisfactory
- Red threshold: 2.5 (below = PIP)
- COGS teams: drives non-target KPIs (SOP 30%, Reporting 20%) only
- OpEx teams: drives full quarterly bonus payout

---

## 5. SOP references linked to each KPI

The full mapping is in v5 KPI Definitions (SOP Ref column) and the SOP candidate-to-production map. Summary:

| SOP | Title | Linked KPIs (sample) | Linked KRs |
|-----|---|---|---|
| SOP-001 | Client Onboarding | KPI-005, 006, 007 | KR1.4, KR2.1 |
| SOP-002 | Merchant Onboarding | KPI-019, 020, 035 (new) | O-KR3.3 |
| SOP-003 | Auction Management | KPI-004, 013, 028, 029, 033 (new) | KR3.1, KR3.2, O-KR2.1, O-KR2.2 |
| SOP-004 | Payment & Collection | KPI-016, 017, 018 | KR4.4 (corrected) |
| SOP-005 | Dispute Resolution | — | O-KR2.5, O-KR4.2 |
| SOP-006 | Logistics Coordination | KPI-010, 011, 012, 031, 034 (new) | KR3.4, O-KR2.3, O-KR4.1 |
| SOP-007 | Marketing Operations | KPI-014, 015, 025, 032 | KR4.1-4 |
| SOP-008 | Account Management | KPI-008, 009, 030 | KR2.1-4 |
| SOP-009 (NEW) | Listing Creation & Quality Review | TBD by SOP session | — |
| SOP-010 (NEW) | Fulfilment & Deal Closure | TBD by SOP session | — |

**Build session: build the database to support both directions of this map** — query "which SOP measures KPI-005?" AND "which KPIs measure SOP-001?" Both must be O(1).

---

## 6. What was created vs what already existed (this session output)

### New artifacts created
- `mrkoon-okr-build/consolidated-review-v1-20260501.md` — full review output
- `mrkoon-okr-build/handover/sop-candidate-to-production-map-v1-20260501.xlsx` — closes SOP-S01 ↔ SOP-001 reconciliation
- `mrkoon-okr-build/handover/handover-note.md` — this file
- `mrkoon-okr-build/phase-1-findings.md` — Phase 1 source layer findings (kicker threshold lock)
- `mrkoon-okr-build/review-log.txt` — Watch Mode log baseline
- 5 README pointers replacing empty shells in shared/

### Modified existing files (with backups)
All backups end in `.PRE-FIX-20260501-*.xlsx` or `.PRE-FIX-20260501-*.docx`:
- `mrkoon-chro/source/Mrkoon_EGY_TaskForce_v8_0.xlsx` — baseline 120→104
- `mrkoon-chro/source/BD_Commission Calculator.xlsx` — kicker threshold (now relocated)
- `shared/hr/okr-kpi-framework-v5-20260424.xlsx` — KR fixes, DEC rename, Ops OKRs sheet, 4 new KPIs, GP forecast date-stamp
- `shared/commercial/target-300/okr-kpi-framework-v5-20260424.xlsx` — same as above (mirror)
- `shared/hr/commission-schemes/bonus-commission-framework-v7.xlsx` — DEC rename
- `mrkoon-chro/performance/bonus-commission-framework-v7.xlsx` — DEC rename (mirror)
- `mrkoon-chro/performance/bonus-commission-framework-v7-vm.xlsx` — rows 30-40 formula fix
- `mrkoon-chro/sop/sop-index-v1.xlsx` — version fix, SOP-007/008 added, 5 metadata columns + Category
- `mrkoon-chro/sop/SOP-007-Marketing-Operations-v1.docx` — header partial normalization
- `mrkoon-chro/performance/appraisal-form-annual-v1.docx` — Performance Gates blanked
- `mrkoon-ops/plans/target-gp30m-ops-model-v1-20260424.xlsx` — baseline 120→104, VM trigger, label cleanup
- `shared/commercial/target-300/hiring-plan-target-300-v2-20260424.xlsx` — VM trigger update

### Deprecated (renamed + README pointer in place)
- `shared/company/kpis-master.xlsx`
- `shared/company/okrs.xlsx`
- `shared/commercial/commission-actuals.xlsx`
- `shared/ops/loading-tracker.xlsx`
- `shared/commercial/bd-targets.xlsx`

### Files NOT touched (already correct or out-of-scope)
- KSA Taskforce, all individual SOPs (SOP-002 through SOP-008 except SOP-007 partial), SOP Manual, target-300-master-brief, vm-onsite-ops-analysis, all unrelated CRM/cost/finance files.

---

## 7. What the build session needs to know before writing any code

### Locked decisions (binding inputs) — current as of 2026-05-02
1. **Active client baseline = 104** (Apr 2026, locked 2026-05-01)
2. **GP target = 30M EGP** (all files aim for 30M; 25M is the conservative scenario)
3. **300-client target by EOY 2026**, 75/quarter throughput
4. **BD count = 4** (Yassin, Salah, 2 new hires from May 2026)
5. **BD GP Kicker threshold = 13 accounts**
6. **BD portfolio cap = 20** (then handoff to AM)
7. **Merchant attendance floor = ≥6 per auction**
8. **VM hire trigger = 15 auctions/VM/day sustained over rolling 22-day window** (operational, not client-count)
9. **SOP numbering = sequential global** (SOP-001…010), department as metadata column
10. **SOP set = 10 production SOPs** (all 10 BUILT by SOP session 2026-05-02; SOP Manual v2 with "Measured By" KPI metadata blocks)
11. **KPI Source consolidation = Option B** (one master workbook merging v6 + appraisals + monitoring cadence — build session task; KPI Source byte-aligned to v6 across all consumers as of 2026-05-02)
12. **Performance Gates removed from universal templates** — must be auto-flagged outcomes from the digital platform
13. **DEC codes renamed to scheme codes** in shared files — applied to v5+v7 by alignment session 2026-05-01; LOST in v6 rebuild — flagged to CHRO for reapplication decision (not yet redone in v6)
14. **5 empty shells deprecated** — do not rebuild as Excel; design as proper data tables in the platform
15. **Canonical OKR/KPI framework = v6** (`okr-kpi-framework-v6-20260502.xlsx`). v5 archived. Reference `shared/CURRENT-VERSIONS.md`.
16. **No headcount/named individuals in process workflows** (locked 2026-05-01) — workflow docs are role-based and people-count agnostic
17. **FIN01 + FIN03 are LIVE processes** — FIN01 lives in SOP-004 Payment & Collection (invoice generation step); FIN03 lives in SOP-005 Dispute Resolution (refund section). Documented in MAP-001 Sections 9.1/9.2. Not standalone SOPs; sub-processes within existing SOPs.

### Architectural patterns to replicate
- **Single Source of Truth pattern (v7 `Rates & Config`)** — every calculator references config by formula, never duplicates values. Make this the universal pattern.
- **INDEX/MATCH on KPI ID** — appraisals already use this. Continue but link to a single canonical source, not 4 copies.
- **Inputs hub feeding multiple analytical tabs** (v5, v7, ops-model, EGY taskforce all use this) — replicate as one input table per workbook in the platform schema.
- **Bilingual EN/AR throughout** — every KPI name, KR, SOP title, rating band has Arabic counterpart.

### Anti-patterns to NOT replicate
- **Empty shells** in shared/ that claim a tracking role they don't fill — 5 of these are now deprecated; don't recreate them.
- **Hard-code-by-copy** — same numbers (300, 30M, 0.05, 25, 4, 6) appear in 6+ files as static values. Build must reference a single canonical store.
- **One-way SOP↔KPI linkage** — currently KPI Definitions reference SOPs but only SOP-007 references KPIs back. Build the bidirectional link.
- **Two-format duplication** — appraisal-annual.xlsx + appraisal-form-annual.docx are parallel versions of the same content. Build one source and generate both views from it.
- **DEC code exposure in shared documents** — internal governance codes should never appear in user-visible labels.
- **People-count and named individuals in process workflows** — Khater locked 2026-05-01: process docs are role-based and people-count agnostic. Headcount/names belong in org chart, hiring plan, headcount summary, appraisal forms only.
- **Plaintext cross-references across files** — referencing "KPI-005" or "SOP-001" or "DEC-41" by literal string anywhere creates rename/rot risk. Build a referential-integrity layer where annotations are ID-tokens validated against a canonical store, with bidirectional drift detection.

### Known gaps the build will need to close
- **Quarterly → Annual appraisal auto-aggregation** — currently a manual transcription. Build a formula or query that pulls Q1-Q4 scores into the annual aggregator.
- **Per-VM performance tracking** (KPI-033 added, no data source yet) — needs auction system instrumentation per VM.
- **Loading distribution tracking** (KPI-034 added) — needs loading log to capture specialist ID per loading.
- **Merchant DB activation rate** (KPI-035 added) — needs CRM/merchant DB cross-reference with auction system.
- **Auctions per VM per day** (KPI-036 added, hire trigger) — daily granularity required for trigger to work.
- **Concentration risk alerting** — not in OKR/KPI per Khater (analytical layer), but build can surface as a dashboard alert independent of KPI scoring.

### Out of scope for build session
- SOP-009 + SOP-010 content drafting (SOP session)
- SOP-001 through SOP-006 body-text KPI/KR additions (SOP session)
- Salah salary reconciliation (not needed — locked at 12K)
- DEC code governance decisions (CHRO/CoS)
- Real-world data backfill (Operations + Finance sessions)

---

## 8. Open items at handover

| # | Item | Owner | Notes |
|---|---|---|---|
| 1 | SOP-009 + SOP-010 build | SOP session | Per Khater 2026-05-01 |
| 2 | SOP-005 Refund & Credit Note section addition | SOP session | Absorbs SOP-FIN03 |
| 3 | SOP-001-006 KPI/KR body-text cross-references | SOP session | Use SOP-007 as template |
| 4 | KPI Source consolidation Option B (single master workbook merging v5 + appraisals + monitoring cadence) | Build session | This handover's primary trigger. Note: as of 2026-05-01 self-audit, all 4 KPI Source copies are now byte-aligned with v5 KPI Master, so consolidation can begin from a clean state |
| 5 | SOP-007 dept/version paragraph insertion | Whoever next touches SOP-007 docx | Title lines done; dept/version line still needed |
| 6 | KSA Egypt-shared cost live link | Build session or KSA session | Currently hard-coded |
| 7 | v7-vm rate sheet cross-link to canonical v7 | Build session | Currently duplicated, not linked |
| 8 | **Operations Team Lead KPIs sum 0.50 — needs rebalance or missing KPIs added** | CHRO session | Pre-existing bug, surfaced 2026-05-01 |
| 9 | **Tech Sr PO & Mobile Dev KPIs sum 1.35 — over-weighted** | CHRO session | Pre-existing bug, surfaced 2026-05-01 |
| 10 | Weight = 0 on the 4 new KPIs (KPI-033 to KPI-036) — currently informational/dashboard metrics. CHRO must decide if any belong in scored appraisal weights and rebalance affected role | CHRO session | Set 2026-05-01 to preserve existing role weight sums |
| 11 | MAP-001 Process & Workflow Map needs v2 refresh — see Section 8d directives D1, D2, D3 in consolidated review for full design rules | Build session | Real path: `mrkoon-chro/workflows/mrkoon-master-process-map-v1.html`. v2 must: (a) restore SOP-FIN01 + SOP-FIN03 as live processes within SOP-004/SOP-005, (b) strip ALL headcount/named-individual mentions from process flows, (c) add ID-token annotations (KPI/KR/SOP/scheme) backed by referential-integrity layer |
| 12 | sop-index MAP-001 row pointer says `sop/mrkoon-master-process-map-v1.html`; actual is `workflows/...` | Next session start | Workspace was unavailable when discovered |
| 13 | sop-candidate-to-production-map xlsx: FIN01 status KILLED → MAPPED to SOP-004; FIN03 status ABSORBED → MAPPED to SOP-005; Summary tab counts updated (KILLED 9→7, MAPPED 5→7) | Next session start | Workspace was down when Khater issued the correction |
| 14 | **Build session deliverable: referential-integrity layer.** ID-token annotations on workflow nodes (and Excel cells) with one-way canonical store + bidirectional integrity checks. Solves the staleness problem across map, appraisals, commission framework, SOPs in one architectural move | Build session | Detailed in consolidated review Section 8d D3 |
| 15 | Design principle for ALL workflow documentation going forward: **process flows are people-count agnostic**. No BD/VM/AM/Ops headcount or named-individual references in workflow docs. People-count belongs in org chart, hiring plan, headcount summary, appraisal forms only | All sessions | Khater 2026-05-01 |

---

## 9. Watch Mode going forward

This alignment session continues in Watch Mode at every session start. Baseline established 2026-05-01:
- `shared/hr/commission-schemes/` — modified 2026-04-23
- `shared/commercial/bd-targets.xlsx` — DEPRECATED (will not change)

If CHRO, Finance, or BD sessions modify shared/ files affecting KPIs or commissions, this session will flag and propose updates without applying them.

---

End of handover note v1. Companion: `consolidated-review-v1-20260501.md`.
