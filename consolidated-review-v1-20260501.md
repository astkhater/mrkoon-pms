# Mrkoon OKR/KPI/Commission/Appraisal/SOP — Consolidated Review v1
Date: 2026-05-01
Owner: Khater (alignment session)
Files reviewed: 28 (all 7 phases complete)

---

## 1. Locked decisions captured this session

| # | Decision | Locked at | Status | Affects |
|---|---|---|---|---|
| 1 | GP Kicker threshold = 13 accounts | 2026-05-01 | Applied to BD Commission Calculator | v7 Rates B13 already 13 ✓ |
| 2 | Active client baseline = 104 (Apr 2026) | 2026-05-01 | Applied to v5 + EGY taskforce + ops-model | KSA model unaffected |
| 3 | Merchant attendance per auction = >6 (canonical floor ≥7) | 2026-05-01 | Pending | v5 KR3.2, SOP-003, v7 VM commission, Ops OKRs |
| 4 | GP target = 30M EGP (all files aim for 30M, 25M = conservative) | 2026-05-01 | All files already aligned | No fixes needed |
| 5 | VM hiring trigger = 15 auctions/VM/day (operational, not client count) | 2026-05-01 | Pending | hiring-plan + ops-model + new KPI required |
| 6 | SOP numbering = sequential global (SOP-001…010), dept = metadata | (SOP session) | Methodology view delivered | All SOP-related files |
| 7 | SOP set = 10 SOPs (8 existing + 2 new), 13 source items killed, refund absorbed into SOP-005 | (SOP session) | Build pending in SOP session | sop-index, KPI Definitions cross-refs, SOP Manual |
| 8 | KPI Source consolidation = Option B (merge v5 + appraisals + cadence into one master workbook) | 2026-05-01 | Pending build session | 4 files |
| 9 | Performance Gates = removed from universal templates, must be auto-flagged outcomes | 2026-05-01 | Pending | appraisal-form-annual-v1.docx |

---

## 2. Fixes already applied this session

1. **BD Commission Calculator** — kicker threshold drift corrected at R59 (≥12 → ≥13) and R79C2 (12 ≥ 12 → 13 ≥ 13). Backup: `BD_Commission Calculator.PRE-FIX-20260501.xlsx`.
2. **EGY Taskforce v8.0** — Inputs R48 set to 104 (was 120). Source/evidence note updated. Backup: `Mrkoon_EGY_TaskForce_v8_0.PRE-FIX-20260501.xlsx`.
3. **target-gp30m-ops-model v1** — Inputs R6 set to 104 (was 120). Source note updated. Label cleanups in Inputs A47, Business Ops Scale E5, Headcount Summary D4. Backup: `target-gp30m-ops-model-v1-20260424.PRE-FIX-20260501.xlsx`.
4. **bonus-commission-framework-v7-vm** — VM-Sales Commission rows 30-40 corrected (formulas were drifting to wrong Rates & Config cells). Rows 11-29 normalized to absolute references ($B$41/$B$42/$B$43) to prevent future drift. Backup: `bonus-commission-framework-v7-vm.PRE-FIX-20260501.xlsx`.

---

## 3. What is complete, correct, and ready

- **Mrkoon_EGY_TaskForce_v8_0** — model integrity solid. Inputs hub feeds 7 outputs cleanly. 675 internal formulas, zero external links.
- **BD Commission Calculator (logic)** — correct after threshold lock. 130 formulas, full per-client GP view + GP kicker logic.
- **okr-kpi-framework-v5** — strong methodology. SMART targets, bilingual, every KR has Owner + Frequency + Measurement Method. KPI Definitions has Data Source + SOP Ref + Formula. The two copies (commercial/target-300/ and hr/) are byte-identical — clean canonicalization.
- **bonus-commission-framework-v7 architecture** — `Rates & Config` single-source pattern is the gold standard for the entire stack. Every calculator pulls from it via formulas. Two copies (shared/hr and chro/performance) byte-identical.
- **Appraisal architecture** — annual + quarterly + monitoring cadence all use INDEX/MATCH on KPI Source. 22 role-specific tabs each. Weights match KPI Master. Rating bands match v7.
- **Mrkoon-SOP-Manual-v1** — comprehensive 1,139-paragraph bilingual manual with TOC for SOP-001 through SOP-008.
- **target-gp30m-ops-model** — Inputs hub + capacity sheets + headcount + Ops OKRs. 149 internal formulas. Strong structure.
- **Ops OKRs sheet** (inside target-gp30m-ops-model) — 4 Objectives × ~17 KRs with quarterly ramp + steady state + SOP refs. **This is ready to lift directly into v5 framework as the ops layer.**
- **target-300-master-brief-v2** — internally consistent, 104 baseline already locked, marketing throughput correct.
- **hiring-plan-target-300-v2** — milestones + sourcing + cost projection logic clean.

---

## 4. What works manually but needs logic adjustment for digital use

- **AM Volume/Portfolio bonus uses "Y/N" text input** in v7 — should derive from KPI data programmatically.
- **BD Roster Section I (v7) uses free-text status** ("Active — Full Capacity") — not machine-readable.
- **v7-vm rate sheet duplicated, not linked** to canonical v7 Rates & Config — drift risk.
- **Quarterly → Annual appraisal transcription is manual.** No formula link from quarterly Q-tabs to annual A-tab Q1-Q4 columns. Replace with cross-workbook reference (or solve via the consolidation in Decision #8).
- **Annual + docx printable forms are two parallel formats** — drift risk between digital + printable. Either source one from the other or accept periodic manual sync.
- **Monthly checkpoint Y/N "On Track?" column** — manual binary, fine on paper, breaks in any aggregation pipeline.
- **Static SOP Manual** is a re-bundled snapshot. No mechanism to pull individual SOPs at runtime — drifts when individual SOPs evolve (already happened: SOP-001 v1.1 vs Manual v1.0).
- **target-gp30m-ops-model hard-codes** 30M GP, 300 clients, 0.05 GP rate, 4 VMs, etc. — should reference v5/v7 canonical cells via cross-workbook formulas.
- **Hiring plan hard-codes 25 acct/quarter, 6/month closing, portfolio cap 20** — same hard-code-by-copy pattern.
- **5 empty shells in shared/** — kpis-master, okrs, commission-actuals, loading-tracker, bd-targets — claim roles they aren't filling. Either populate with cross-workbook formulas or deprecate via README pointer to canonical source.

---

## 5. What needs fixing or linking

### High priority (cascades through multiple files)

- **KR linkage errors in v5** — propagate to appraisals + monitoring cadence:
  - BD-01 / KPI-005 (Lead First-Contact Time) → currently `KR5.3` (Tech bug-resolution); should be `KR1.4` (onboard 196 new clients)
  - KPI-015 (Merchant CPL) → currently `KR3.3`; should be `KR4.4` (Merchant CPL ≤100 EGP)
  - KPI-026 (Item Onboarding Time) → currently `KR6.1` (hiring); should be `KR3.5` (onboarding ≤5 days)
- **DEC code exposure in shared files**:
  - v5 KPI Master `Commission Ref` column has `DEC-41` for BD/AM rows — rename column or replace with non-DEC label (e.g. "BD-COMM-Q-v7")
  - v7 `Framework Overview` has DEC-41/48/59-64 throughout — file is in `shared/hr/commission-schemes/`, violates output-restriction policy
- **KPI Source duplication (4 files identical)** — v5 KPI Master + appraisal-annual KPI Source + appraisal-quarterly KPI Source + monitoring cadence KPI Source — all byte-identical static copies. Per Decision #8: consolidate into one master workbook in build session.
- **Merchant attendance threshold drift** — propagate Decision #3 (≥7) to v5 KR3.2, SOP-003, v7 VM commission triggers, Ops OKRs KR2.2.
- **Inherited KR-ref bug in appraisals** — fixing v5 cascades to quarterly + annual + monitoring cadence (all use INDEX/MATCH on KPI ID, so renaming KR refs in source propagates).

### Medium priority (single-file)

- **BD Commission Calculator** — relocate from `mrkoon-chro/source/` to `shared/hr/commission-schemes/`; rename to remove space (`BD-Commission-Calculator.xlsx`). Live calculator already exists in v7 `BD Commission` tab — decide whether the standalone file is now redundant or kept as a printable.
- **SOP-001 versioning** — filename v1.1, body header v1.0, index says v1.0 and points to a non-existent `v1.docx` file. Pick one truth, align all three.
- **SOP Index** — add SOP-007 + SOP-008 (currently missing); add KPI Reference, KR Reference, Process Owner, Review Cycle, Last Reviewed columns; separate SOP rows from EXT-* / TPL-* / MAP-001 (5 artifact types in one register).
- **SOP-007 header format normalization** — match the bilingual block of the other 7.
- **SOP-001 through SOP-006 body text** — add KPI/KR cross-references like SOP-007 does. One-way KPI→SOP linkage isn't enough.
- **target-gp30m-ops-model** — promote Ops OKRs into v5 framework with prefixed KR IDs (e.g. `O-KR1.1`) to avoid collision with v5 company KRs.
- **VM hiring trigger** — replace client-count milestone in hiring-plan + ops-model with `15 auctions/VM/day` operational trigger (Decision #5). Add `auctions per VM per day` as a tracked KPI in v5 (currently auctions-per-VM-per-month exists, but daily granularity needed for hire trigger).
- **Salah salary** — hiring-plan R6 = 12K, BD L2 standard = 13K. HR to reconcile.
- **hiring-plan vs ops-model VM headcount conflict** — superseded by Decision #5; both files now need the new operational trigger.

### Low priority (cosmetic, defer)

- BD Commission rate-table indicator formula (`OR(13=20, B7<A14)` literal pattern) — works correctly, stylistically brittle, no fix unless touched.
- Hard-coded GP forecast in v5 Inputs!B7 (29.37M) — date-stamp as snapshot or formula-derive from offering analysis.
- Cosmetic label drift in target-gp30m-ops-model after baseline relabel (Inputs A47 reads "current base (current base)"). Tidy up next time the file is touched.

---

## 6. What is genuinely missing and must be created

### New KPIs (confirmed by Phase 6 decision — concentration risk excluded as analytical, not KPI)

- **Per-VM specialist performance KPI** — auctions handled, avg merchants/auction vs SOP minimum (≥7). Currently v5 VM-Sales KPIs treat the team as one. v7-vm tracks per-VM auctions but enforces no SOP-minimum threshold.
- **Loading distribution KPI** — no single field specialist > X% of monthly loadings (recommend ≤30% as ceiling). Surfaced by VM analysis (سيد Sobhy at 59%).
- **Merchant activation rate KPI** — % of identified-but-dormant merchants activated per quarter. Surfaced by VM analysis (235 known but inactive).
- **Auctions per VM per day** — operational metric needed for the new VM hiring trigger (Decision #5).

### New cross-references / schemas

- **Ops layer in v5 OKR cascade** — lift the 4 Ops Objectives + ~17 KRs from target-gp30m-ops-model into v5 with prefixed KR IDs.
- **SOP-S01 ↔ SOP-001 mapping table** — produce the candidate-scope-list mapping each old source ID to: SOP-NNN (built), absorbed into (SOP-XXX), killed (with reason).
- **Cross-workbook canonical map** — one document naming the canonical source for each file family (deliverable for handover note, Task 9).

### New SOPs (SOP session scope, not this session)

- SOP-009 Listing Creation & Quality Review
- SOP-010 Fulfilment & Deal Closure
- SOP-005 Refund & Credit Note section addition

### Files to populate or deprecate (single decision applies to all 5)

- shared/company/kpis-master.xlsx
- shared/company/okrs.xlsx
- shared/commercial/commission-actuals.xlsx
- shared/ops/loading-tracker.xlsx
- shared/commercial/bd-targets.xlsx

---

## 7. Methodology deviations that matter

- **Rates & Config single-source pattern (v7)** is the gold standard. Replicate this pattern across the stack — every workbook should have one config sheet that all calculators reference, never duplicate.
- **One-way SOP↔KPI linkage** — v5 KPI Definitions reference SOPs by ID, but 6 of 8 SOPs don't reference KPIs in their body text. SOP-007 demonstrates the right pattern (3 KPI mentions + 14 KR refs).
- **Empty shell anti-pattern (5 files)** — files that claim a tracking/aggregation role but contain only headers. Largest single anti-pattern in the stack.
- **Hard-code-by-copy** — same 30M / 300 / 4 BDs / 0.05 GP rate / 25 acct/qtr appears as static numbers in 6+ files. One change requires editing many places. Live-link-to-canonical needed.
- **DEC code exposure in shared files** — v5 + v7 both leak DEC-41/48/59-64 into shared/ paths. Rename or move per output-restriction policy.
- **Versioning inconsistency on SOP-001** — three sources of truth disagree on version (filename v1.1, body v1.0, index v1.0). Violates CURRENT-VERSIONS.md protocol.
- **KPI dashboard methodology gaps in source SOP_KPI_Framework** — TBD targets, no per-KPI owner, no data-source column, hard-coded status emoji, broken formulas. v5 has superseded this file's KPI role; recommend deprecating the SOP_KPI_Framework dashboard or migrating its remaining unique content into v5.
- **Ops layer missing from company OKR cascade** — ops session built strong OKRs, but they live outside v5. Sub-cascade (Company OKRs → Department OKRs → Individual KPIs) exists conceptually but the middle tier isn't represented in canonical v5.
- **Threshold drift across files** — merchant attendance (4 files, 4 thresholds before today's lock) is the most visible example. Same risk for any number that lives in multiple places.

---

## 8. Canonical-source map (for build session)

Recommended canonical owners per file family. All other locations become README pointers.

| File family | Canonical location | Mirrors / shells to deprecate |
|---|---|---|
| OKR/KPI Framework v5 | `shared/hr/okr-kpi-framework-v5-20260424.xlsx` | `shared/commercial/target-300/...` (byte-identical) |
| Bonus/Commission v7 | `shared/hr/commission-schemes/bonus-commission-framework-v7.xlsx` | `mrkoon-chro/performance/...` (byte-identical) |
| BD Commission Calculator | `shared/hr/commission-schemes/BD-Commission-Calculator.xlsx` (after move/rename) | Standalone copy in `mrkoon-chro/source/` becomes printable archive or deleted |
| VM Commission variant | `shared/hr/commission-schemes/bonus-commission-framework-v7-vm.xlsx` (after move) | Currently in `mrkoon-chro/performance/` |
| KPI Master (single source) | v5 framework → consolidated into one master workbook (Decision #8) | Drop appraisal-annual KPI Source, appraisal-quarterly KPI Source, monitoring cadence KPI Source as separate copies |
| Source taskforces | `mrkoon-chro/source/` (already canonical) | None |
| SOP Manual + 10 individual SOPs | `mrkoon-chro/sop/` (already canonical) | Source SOP_KPI_Framework SOP register becomes candidate-list with kill/map status |
| Ops capacity model | `mrkoon-ops/plans/target-gp30m-ops-model-v1-20260424.xlsx` (already canonical) | None |
| Company OKR/KPI roll-up view | Drop separate `shared/company/kpis-master.xlsx` and `okrs.xlsx`; use v5 directly | Replace both with README pointers |
| BD targets tracking | CRM v15 Weekly Progress tab + appraisal-quarterly Q-BD per-rep | Drop `shared/commercial/bd-targets.xlsx` |
| Commission actuals | v7 `BD Commission`/`AM Commission` calculators + Fawry Payday source | Drop `shared/commercial/commission-actuals.xlsx` |
| Loading tracker | mrkoon-ops field-ops sheet (when populated) | Drop `shared/ops/loading-tracker.xlsx` empty shell |

---

## 8e. v6 transition — Watch Mode 2026-05-02

CHRO session shipped v6 (`okr-kpi-framework-v6-20260502.xlsx`) along with appraisal v3, SOP Manual v2 (which built SOP-009 + SOP-010 and absorbed FIN03 into SOP-005, with "Measured By" KPI metadata blocks). v6 was built from a clean v5 baseline — the modifications I applied to v5 on 2026-05-01 (with Khater's approval) did not carry over.

**v6 wins (preserved or improved beyond what I had):**
- VM-NEW-01/02 properly named VM-09/VM-10 in KPI Master (cleaner than my placeholder)
- VM rebalanced ×0.80 + 2 new = 10 KPIs sum 1.00 (cleaner than my weight-0 informational approach)
- OPS-NEW-01/02 explicitly tagged DASHBOARD-ONLY in KPI Source (cleaner separation)
- Ops TL weight 0.50→1.00, Tech PO 1.35→1.00 (the 2 pre-existing bugs from 8b — resolved)
- All 20 roles at exactly 1.00 ✓
- SOP Manual v2 with "Measured By" KPI metadata blocks — bidirectional SOP↔KPI link delivered
- SOP-009 + SOP-010 built; SOP-005 absorbed FIN03 refund section
- Versioning policy applied (v5 archived, v6 in CURRENT-VERSIONS.md)

**Re-applied to v6 by this session (load-bearing, 3 mirrors):**
- KR linkage corrections: KPI Definitions KPI-005 KR5.3→KR1.4, KPI-015 KR3.3→KR4.4, KPI-026 KR6.1→KR3.5
- KR linkage: KPI Master BD-01 KR5.3→KR1.4
- KPI Definitions schema completion: added KPI-033 (Per-VM Auction Quality), KPI-034 (Merchant DB Activation), KPI-035 (Loading Distribution Concentration [DASHBOARD]), KPI-036 (Auctions per VM per Day [DASHBOARD]). KPI Master had VM-09/VM-10 + dashboard refs without matching definition rows — schema now consistent.
- Backups: `*.PRE-FIX-20260502.xlsx` for all 3 v6 mirrors
- Synced monitoring-cadence-matrix-v2 KPI Source to v6 KPI Master (byte-aligned)

**Flagged to CHRO (policy/preference items, NOT applied to v6):**
- DEC-code rename in shared files (DEC-41/48/59-64 → scheme codes BD-COMM-Q-v7/etc.) — output-restriction policy
- `Department OKRs - Ops` sheet (4 Ops Objectives + ~17 KRs lifted from ops-model with O-KR prefix) — methodology decision
- GP forecast date-stamp in Inputs!A7 (`(snapshot 2026-04-24, refresh quarterly)`) — annotation preference

**Workspace-queued fixes also applied this session:**
- sop-index MAP-001 pointer corrected: `sop/mrkoon-master-process-map-v1.html` → `workflows/mrkoon-master-process-map-v1.html`
- sop-candidate-to-production-map: FIN01 status KILLED → MAPPED → SOP-004; FIN03 status ABSORBED → MAPPED → SOP-005 (per Khater's clarification 2026-05-01 + SOP Manual v2 confirmation)
- Summary tab counts adjusted: KILLED 9→7, MAPPED 5→7, ABSORBED 7→6

---

## 8d. Khater corrections after MAP-001 review (2026-05-01, late afternoon)

Three directives received and locked:

### D1. SOP-FIN01 + SOP-FIN03 are LIVE processes — reverse the kill

The earlier KILLED status was a misunderstanding. They are live processes — exactly as documented in the workflow map. Correct status:

- **SOP-FIN01 (Invoice Generation)** — MAPPED to SOP-004 Payment & Collection (invoice generation is a step within payment flow). Live in Finance domain. Documented in MAP-001 Section 9.1.
- **SOP-FIN03 (Refund & Credit Note)** — MAPPED to SOP-005 Dispute Resolution (refund section per Khater's earlier directive). Live in Finance domain. Documented in MAP-001 Section 9.2.

Net SOP scope change: KILLED count drops from 9 → 7, MAPPED count rises from 5 → 7. Final production set still 10 SOPs (001-010); FIN01/FIN03 are sub-processes within SOP-004/SOP-005, not standalone files.

**xlsx update queued:** sop-candidate-to-production-map-v1 needs FIN01 + FIN03 rows updated + Summary tab counts adjusted. Workspace was down at directive time; fix applied at next session start under Watch Mode.

### D2. No headcount or capacity caps in workflow documentation

Process workflows are people-count agnostic. Workflows describe what happens, not how many people do it. Remove from MAP-001 v2 refresh:
- "3 BD Executives" → "BD Executive(s)"
- Named individuals in process flows: "Yassin, Salah, Shams", "Ali (MTL)", "Waheed", "Ismael Zakaria", "Hussein TL", etc. → role labels only
- "4-person Marketing team" / "Onboarding Exec + Specialist" → "Marketing team" / "Onboarding role"
- "Sr Accountant + Accountant" → "Finance role(s)"
- All BD/AM/VM/Onsite headcount caps and counts → removed from process flow documentation

People-count and individual-name references belong in: org chart, hiring plan, headcount summary, appraisal forms — NOT in process workflows.

### D3. Annotation drift problem — design rule for bidirectional sync

Khater's question: *"referencing the SOPs or OKRs or company target in workflow makes it easily outdated, correct? however add the annotations but add a mechanism for it to be updated whenever those references change in files or the digital OKR/KPI system and vice versa."*

Yes — direct embedded references go stale silently. The fix is referential integrity at the digital layer, not avoiding annotations.

**Design rule for the build session (referential-integrity layer):**

1. **Annotations on workflow nodes are ID-tokens, not text** — e.g., a node carries metadata `{kpi_ids: ["KPI-005", "KPI-006"], sop_id: "SOP-001", scheme_ref: "BD-COMM-Q-v7", kr_id: "KR1.4"}`. Display layer renders "Lead First-Contact Time KPI-005" by joining with the canonical name from v5 KPI Definitions at render time.
2. **Source of truth is one-way** — the digital OKR/KPI system holds canonical KPI/KR/SOP/comp-scheme records. The map references them by ID. Renaming "KPI-005" or its display name in the canonical store auto-propagates everywhere it's referenced.
3. **Bidirectional integrity check** — when a KPI/KR/SOP/scheme is removed or renamed, the system flags every workflow node that references it as "stale-ref" requiring review. When a workflow node's annotation is removed, the system flags the canonical record as "no process coverage" (which itself becomes a methodology gap signal).
4. **Map source format** — current MAP-001 is hand-coded HTML+Mermaid. To support ID-token annotations, the map source becomes a structured format (JSON / YAML / database-driven) and the HTML is generated from that source. This is the build session's call.
5. **Until the digital layer ships:** map can carry plaintext annotations as a stopgap, but flagged as "manual sync required — replace with ID-tokens after build session ships referential integrity."

This is the larger architectural pattern that solves the same problem in the Excel layer too — every place that references "KPI-005" or "DEC-41" or "SOP-001" by literal string is fragile. The build session's referential-integrity layer fixes the map, the appraisals, the commission framework, the SOPs, all at once.

---

## 8c. Phase 5 addendum — MAP-001 Process & Workflow Map (added 2026-05-01)

Reviewed `mrkoon-chro/workflows/mrkoon-master-process-map-v1.html` (12-section interactive HTML, 12 Mermaid flowcharts). Was not in original Phase 5 file list; added as addendum after Khater flagged.

**Status: not outdated structurally, partially outdated on roster, materially missing on integration.**

**Structurally current:** process flows match how Mrkoon operates (≥6 merchant threshold, 125% reserve rule, terminology, 14 handoffs, KSA founder model, merchant lifecycle states, COGS/OpEx tagging).

**Outdated on roster:**
- Lists Shams as BD Executive (transitioned to AM 2026-05-01)
- "3 BD Executives" (current is 4)
- Implies SOP-FIN01 + SOP-FIN03 still live (both KILLED per Khater 2026-05-01)

**Materially missing — integration-layer gaps (the bigger issue):**
- No KPI cross-references on process steps
- No SOP-ID references in process flows (one-way linkage gap, same as SOPs)
- No Ops OKR overlay on process steps
- No comp scheme trigger annotations (e.g. "Auction Success → VM-COMM-v7")
- AM retention role (Shams's new scope) conflated with field-ops AM
- No section yet for SOP-009 (Listing Quality) + SOP-010 (Fulfilment & Closure) — both newly built by SOP session
- Repeat-client / re-engagement flow still flagged as gap inside the map (not yet built)
- VM saturation trigger KPI-036 not represented
- Concentration risks (single-client GMV, single-VM, single-loader) not in map's gap list
- 4 new KPIs from today (033-036) not on flows

**Pointer error in sop-index:** says path is `sop/mrkoon-master-process-map-v1.html`; actual path is `workflows/mrkoon-master-process-map-v1.html`. Fix queued for next session (workspace unavailable at addendum time).

**Recommended action:** map needs a v1.1 / v2 refresh after SOP session finishes SOP-009/010 builds and CHRO resolves role-weight bugs. The refresh should add KPI ID + KR ID + SOP ID + comp scheme code annotations to every relevant node — closing the integration-layer gap is more valuable than fixing the roster details (which would re-stale next month anyway as people move).

---

## 8a. Self-audit corrections (2026-05-01, post-batch)

After Khater flagged the sop-index Department label miss, a self-audit surfaced and corrected the following misses:

| # | Miss | Resolution |
|---|---|---|
| A1 | sop-index Department column had 6 wrong dept labels (SOP-001 "Supplier Ops → Client Ops", SOP-003 "Auction Ops", SOP-004 "Finance", SOP-005 "Fulfilment", SOP-006 "Fulfilment", SOP-002 short form) | All 6 aligned to actual SOP body header values |
| A2 | sop-index SOP-004 KR Ref I introduced ("KR4.4 (corrected)") was nonsense — KR4.4 is Marketing CPL, irrelevant to Payment SOP | Replaced with honest "— (no direct Company KR; supports KR1.2 indirectly via GMV settlement)" |
| A3 | SOP-001 body header still said "v1.0" (filename and index were updated to v1.1, body wasn't) | Body header updated to v1.1 in both EN + AR lines |
| A4 | KPI Source schema divergence — added 4 new KPIs to v5 KPI Master only; appraisal-annual / appraisal-quarterly / monitoring-cadence KPI Source copies were stale (also missed the DEC-code rename + KR ref fix propagation) | Full v5 KPI Master content replicated to all 3 downstream KPI Source sheets — byte-aligned |
| A5 | I introduced 4 phantom role labels ("VM Specialist", "Ops TL", "Ops TL / Field") not in existing taxonomy ("VM Executive", "Operations Team Lead", "Field Operations Specialist") | Re-aligned to existing role names; weights set to 0 (informational/dashboard metrics) so existing role weight sums (1.0) are preserved |

## 8b. Pre-existing bugs surfaced during audit (NOT introduced this session, NOT fixed)

| # | Bug | Severity | Recommended owner |
|---|---|---|---|
| B1 | **Operations / Operations Team Lead role weights sum to 0.50** — OPS-TL-01 (0.15) + OPS-TL-02 (0.15) + OPS-TL-03 (0.10) + OPS-TL-04 (0.10). Missing 0.50 of weight. Either rebalance existing 4 KPIs upward to sum 1.0, or 4-5 KPIs are missing | High | CHRO session |
| B2 | **Technology / Sr Product Owner & Mobile Dev sums to 1.35** — TECH-PO-01 through TECH-PO-09 over-weight by 0.35. Either rebalance downward or some KPIs should be dropped | High | CHRO session |
| B3 | Log/legacy `.txt` files reference deprecated paths (loading-tracker.xlsx, bd-targets.xlsx, BD_Commission Calculator.xlsx) — historical records, not breaking | Low | No action — historical |

Discipline gap noted: when extending a register (sop-index, KPI Master), the alignment session must diff-check the whole register against authoritative source files (SOP body docx, role taxonomy) before adding to it, not just append. This is the working pattern going forward.

---

## 9. Pending items — full register (status updated 2026-05-01)

All items from Sections 5, 6, 7 grouped by what happens next. Total: **27 items**. Session outcome: **22 applied, 1 partial, 4 deferred to other sessions**.

### A. Applied this session — 16 items ✅

1. ✅ v5 KR linkage: BD-01 / KPI-005 (Lead First-Contact Time) `KR5.3` → `KR1.4` (both v5 mirrors)
2. ✅ v5 KR linkage: KPI-015 (Merchant CPL) `KR3.3` → `KR4.4`
3. ✅ v5 KR linkage: KPI-026 (Item Onboarding Time) `KR6.1` → `KR3.5`
4. ✅ DEC-code rename in v5 KPI Master Commission Ref column (`DEC-41`/`DEC-59`/`DEC-60`/etc. → scheme labels `BD-COMM-Q-v7`/`BD-PORTFOLIO-CAP-v7`/etc.). Header also renamed.
5. ✅ DEC-code rename in v7 (both copies, 31 cells each) across Framework Overview + BD Roster + others
6. ✅ Merchant attendance floor confirmed at ≥6 (Khater locked 2026-05-01) — no file changes needed; existing values consistent
7. ✅ SOP-001 versioning: index now reads v1.1 with corrected filename pointer
8. ✅ sop-index: SOP-007 + SOP-008 added with full metadata
9. ✅ sop-index: 5 new columns added (KPI Reference, KR Reference, Process Owner, Review Cycle, Last Reviewed) and pre-populated for SOP-001 through SOP-008
10. ✅ sop-index: Category column added to filter SOP / EXT / TPL / MAP artifact types
11. ⚠ SOP-007 header normalization PARTIAL: title lines reformatted to match bilingual block; department/version line addition deferred (paragraph-insertion fragile in python-docx)
12. ✅ Ops OKRs promoted to v5: new sheet `Department OKRs - Ops` added with 4 objectives + ~17 KRs prefixed `O-KR1.1` through `O-KR4.4`
13. ✅ 4 new KPIs added (KPI Definitions + KPI Master): KPI-033 Per-VM Auction Quality, KPI-034 Loading Distribution, KPI-035 Merchant DB Activation Rate, KPI-036 Auctions per VM per Day
14. ✅ 5 empty shells deprecated: renamed to `.DEPRECATED-20260501.xlsx`, README `*-LIVES-IN.md` pointers placed alongside, originals archived to `mrkoon-okr-build/deprecated-shells/`
15. ✅ VM hiring trigger replaced: hiring-plan Inputs R23 + Sourcing Plan R7, ops-model Headcount Summary R7 — all now use "≥15 auctions/VM/day sustained over 22 days" instead of client-count milestone
16. ✅ Annual docx Performance Gates: 2 named-individual rows (Ali, Mustafa) cleared from universal template; note updated to reflect blank-template policy
17. ✅ BD Commission Calculator: canonical at `shared/hr/commission-schemes/BD-Commission-Calculator.xlsx`. Source renamed to `.RELOCATED-20260501.xlsx` with README pointer.

### B. Applied / partial — Group B/D items absorbed — 6 items

20. ✅ SOP-S01 ↔ SOP-001 mapping table created at `mrkoon-okr-build/handover/sop-candidate-to-production-map-v1-20260501.xlsx` (24 source IDs + 2 production-only entries, with status MAPPED/ABSORBED/KILLED/PRODUCTION + reason per row + summary tab)
24. ✅ DEC-code remediation strategy: chose rename-in-place (column header rename + value replacement). Implemented in items 4 + 5.
25. ✅ BD Commission rate-table indicator — verified correct, no fix
26. ✅ GP forecast in v5 Inputs!B7 — date-stamped as snapshot with quarterly refresh note (both v5 mirrors)
27. ✅ Cosmetic label cleanup in ops-model Inputs A47

23. ✅ VM hiring conflict resolved by Decision #5 (item 15 above implements it)
22. ✅ Salah salary — locked at 12K (Khater 2026-05-01), no fix

### C. Deferred to other sessions — 4 items

18. **SOP-001 through SOP-006 body text: add KPI/KR cross-references** — substantive content writing per SOP, properly belongs to SOP session. Mapping data is now in v5 KPI Definitions for SOP session to use.
19. **SOP-009 + SOP-010 build + SOP-005 refund section** — explicit SOP session work per Khater 2026-05-01
21. **KPI Source consolidation Option B** (merge v5 + appraisals + monitoring cadence into one master workbook) — large structural build, properly belongs to build session per CLAUDE.md workspace rules. Cross-workbook consolidation needs coordinated path strategy across all 4 files.

(plus partial item 11 — SOP-007 dept/version paragraph insertion, deferred to next docx touch)

---

## 10. Handover note status (Task 9)

The handover note will be produced after the items in Section 9 are batch-approved and applied. Until then, this consolidated review serves as the working baseline for build session input.
