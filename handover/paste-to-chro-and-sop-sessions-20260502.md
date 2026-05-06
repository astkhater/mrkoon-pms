# Paste-note for CHRO and SOP sessions
From: OKR alignment session (Watch Mode)
Date: 2026-05-02
Cause: CHRO v5→v6 transition + SOP Manual v1→v2

---

## TL;DR
v6 was built from clean v5 baseline — 5 alignment fixes applied to v5 on 2026-05-01 (with Khater approval) didn't carry over. Watch Mode re-applied the **load-bearing** ones to v6 (3 mirrors). **Policy/preference items below need your decision** to incorporate or skip.

The SOP Manual v2 + appraisal v3 work is excellent — "Measured By" KPI metadata blocks deliver the bidirectional SOP↔KPI link the alignment session recommended. SOP-009 + SOP-010 + FIN03 absorption clean.

---

## Re-applied to v6 (no action needed from you)

These were objective bugs and have been corrected in `okr-kpi-framework-v6-20260502.xlsx` across all 3 mirrors (`shared/hr/`, `shared/commercial/target-300/`, `mrkoon-chro/performance/`). Backups saved as `.PRE-FIX-20260502.xlsx`.

1. **KR linkage corrections in KPI Definitions:**
   - KPI-005 (Lead First-Contact Time): `KR5.3` → `KR1.4` (KR5.3 is "Critical bug resolution" — Tech, not BD)
   - KPI-015 (Merchant CPL): `KR3.3` → `KR4.4` (KR4.4 is "Merchant CPL ≤100 EGP" — Marketing)
   - KPI-026 (Item Onboarding Time): `KR6.1` → `KR3.5` (KR3.5 is "Onboarding ≤5 days" — Ops)
2. **KR linkage in KPI Master:** BD-01 row `KR5.3` → `KR1.4`
3. **KPI Definitions schema completion:** KPI Master has VM-09 and VM-10 (your additions) but KPI Definitions had no matching `KPI-XXX` rows. Added:
   - KPI-033 Per-VM Auction Quality (defines VM-09)
   - KPI-034 Merchant DB Activation Rate (defines VM-10)
   - KPI-035 Loading Distribution Concentration [DASHBOARD] (defines OPS-NEW-01)
   - KPI-036 Auctions per VM per Day [DASHBOARD] (defines OPS-NEW-02 + the new VM hire trigger)
4. **monitoring-cadence-matrix-v2 KPI Source** re-synced to v6 KPI Master (byte-aligned).

---

## Policy/preference items flagged to CHRO (your call)

These were applied to v5 with Khater's approval but not carried into v6. Each is a policy/preference, not a bug. Decide whether to incorporate into v6.1 or skip.

### CHRO-Q1. DEC-code remediation in shared files

**v5 modification 2026-05-01 (Khater approved):** all DEC-code references in v5 KPI Master + v7 commission framework were renamed to scheme codes for output-restriction compliance. Examples:
- `DEC-41` → `BD-COMM-Q-v7`
- `DEC-48` → `OPS-TL-GATES-v7`
- `DEC-59` → `BD-PORTFOLIO-CAP-v7`
- `DEC-60` → `AM-COMM-v7`
- `DEC-61` → `AM-TRANSITION-v7`
- `DEC-62` → `VM-COMM-v7`
- `DEC-63` → `OPS-BONUS-v7`
- `DEC-64` → `ONB-COMM-v7`

Reason: shared docs (anything in `shared/`) shouldn't carry internal governance codes per Khater's output-restriction policy. v6 reverted to DEC codes.

Same applies to v7 (still has DEC codes after CHRO didn't touch v7).

**Decision needed:** redo the rename in v6 + v7? Or accept DEC codes in shared/?

### CHRO-Q2. `Department OKRs - Ops` sheet

**v5 modification 2026-05-01 (Khater approved):** added a new sheet to v5 named `Department OKRs - Ops` containing 4 Ops Objectives + ~17 KRs lifted from `target-gp30m-ops-model-v1-20260424.xlsx` (sheet `Ops OKRs`). KRs prefixed `O-KR1.1` through `O-KR4.4` to avoid collision with v5 Company KRs (KR1.1-KR6.4).

Purpose: complete the OKR cascade. v5 Company OKRs (O1-O6) is the top tier; this sheet is the dept-tier underneath, so the cascade has a middle tier in the canonical framework rather than only in the ops-model file.

v6 doesn't have this sheet. Ops OKRs effectively still live only in `target-gp30m-ops-model-v1-20260424.xlsx`.

**Decision needed:** lift Ops OKRs into v6.1 as the dept tier? Or keep them only in ops-model and treat the cascade as cross-file?

### CHRO-Q3. GP forecast date-stamp

**v5 modification 2026-05-01 (Khater approved):** v5 `Inputs!A7` parameter name changed from `FY2026 GP Forecast` to `FY2026 GP Forecast (snapshot 2026-04-24, refresh quarterly)` plus a note in column 4 explaining it's a snapshot value not derived from offering analysis.

Reason: avoid silent staleness — Inputs!B7 (29.37M) is a static number that should be obviously dated.

**Decision needed:** annotate in v6.1 same way? Or accept B7 as a refreshed number going forward (CHRO's call on cadence)?

---

## SOP session items

### SOP-1. Verify SOP-009 + SOP-010 cross-references match v6 KPI IDs

The SOP Manual v2's "Measured By" metadata blocks reference KPI IDs. Verify that any KPI IDs in SOP-009 (Listing Quality) and SOP-010 (Fulfilment Closure) match v6:
- v6 KPI IDs go up to KPI-032 in original definitions
- After today's alignment: KPI Definitions also has KPI-033 to KPI-036 (Per-VM Quality, Merchant DB Activation, Loading Distribution [DASHBOARD], Auctions per VM per Day [DASHBOARD])
- KPI Master has role-prefix IDs through HR-BC-03; new VM-09 + VM-10

If SOP-009/010 use placeholder KPI IDs that don't exist, please align to the canonical list.

### SOP-2. sop-index — extend with same metadata SOP Manual v2 has

SOP Manual v2 has "Measured By" blocks per SOP. The `sop-index-v1.xlsx` register (which I extended on 2026-05-01 with KPI Reference, KR Reference, Process Owner, Review Cycle, Last Reviewed columns) now has SOP-007/008 entries but is missing SOP-009 + SOP-010. Please add them with their KPI/KR refs from the Manual v2 metadata blocks.

### SOP-3. MAP-001 update queued separately

The Master Process & Workflow Map (`mrkoon-chro/workflows/mrkoon-master-process-map-v1.html`) needs a v2 refresh with SOP-009/010 sections, ID-token annotations (KPI/KR/SOP/scheme refs as IDs not text), and removal of headcount/named-individual mentions from process flows. Per Khater's directive 2026-05-01:
- No people-count or named individuals in workflow docs (process flows are role-based and people-count agnostic)
- Annotations as ID-tokens with bidirectional sync — referential-integrity layer is build-session work

This is a build-session deliverable but flagging in case SOP session prefers to draft the v2 structure first.

### SOP-4. Pointer fix already applied this session

`sop-index-v1.xlsx` MAP-001 row had wrong filename (`sop/...` — actual is `workflows/...`). Corrected to `workflows/mrkoon-master-process-map-v1.html`.

---

## Working pattern going forward (request to CHRO)

For future framework rebuilds that supersede a previous version:
- **Diff-check the previous version's modifications before stripping them.** Today's v6 shipped clean from baseline v5 and lost 5 prior approved alignment fixes that had to be re-applied. A diff pass at version-bump time would catch this.
- The 4 backup files (`*.PRE-FIX-20260501-stage1.xlsx` etc.) carry the v5 modification deltas — they're the diff source.

Watch Mode will continue to flag and re-apply on every framework version bump, but it's cheaper if the version-bump session incorporates prior modifications directly.

---

End of paste-note. Reference:
- Full session detail: `mrkoon-okr-build/consolidated-review-v1-20260501.md` Section 8e
- Watch Mode log: `mrkoon-okr-build/review-log.txt`
