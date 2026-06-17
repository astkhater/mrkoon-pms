# Paste-note for KPI session
From: OKR alignment session (Watch Mode)
Date: 2026-05-12
Subject: v6-20260512 review — 5 action items

---

## TL;DR
v6 framework is structurally sound (3 mirrors byte-identical, 19/20 roles at 1.00 weight, KPI Definitions complete at 36 entries). Five items need your action — three are data bugs in v6 itself, two are housekeeping. Build session is waiting on items 1-3 before final weight ingestion.

---

## Action 1 — Tech PO weight rebalance (BUG)

**Where:** v6 `KPI Master` rows for `TECH-PO-01` through `TECH-PO-06` (role: `Sr Product Owner & Mobile Dev`)

**Current state:**
| KPI | Weight |
|---|---|
| TECH-PO-01 | 0.16 |
| TECH-PO-02 | 0.15 |
| TECH-PO-03 | 0.11 |
| TECH-PO-04 | 0.11 |
| TECH-PO-05 | 0.07 |
| TECH-PO-06 | 0.15 |
| **Sum** | **0.75** ⚠ should be 1.00 |
| TECH-PO-07/08/09 | "Monitor" (correct — excluded from scoring per D-38) |

**Recommended fix:** scale all 6 scored weights by ×1.333 (= 1/0.75) to preserve relative proportions and reach sum 1.00. New weights:
| KPI | New Weight |
|---|---|
| TECH-PO-01 | 0.21 |
| TECH-PO-02 | 0.20 |
| TECH-PO-03 | 0.15 |
| TECH-PO-04 | 0.15 |
| TECH-PO-05 | 0.09 |
| TECH-PO-06 | 0.20 |
| **Sum** | **1.00** ✓ |

(Adjust last cell to absorb rounding so sum is exact 1.00.)

**Propagate to:** appraisal v3 KPI Source (annotation rows preserve fine), Tech (El-Hussien) tab in both annual + quarterly appraisals.

---

## Action 2 — Five KPIs missing KR refs (BUG)

**Where:** v6 `KPI Definitions` column J (KR Ref)

| KPI ID | Name | Current KR | Recommended KR | Rationale |
|---|---|---|---|---|
| KPI-017 | Insurance Refund Timeliness | — | — (or new) | No clean Company KR. Either accept N/A (Finance ops KPI), or add new KR under O3 (Operational excellence). KPI session call. |
| KPI-018 | Insurance Refund Processing Time | — | same as KPI-017 | Same rationale |
| KPI-021 | Sprint Velocity Delivery | — | KR5.1 | KR5.1 = "Product roadmap delivery ≥85%" — sprint velocity feeds roadmap delivery directly |
| KPI-022 | Bug Fix Resolution Time | — | KR5.3 | KR5.3 = "Critical bug resolution ≤4 hours" — exact semantic match |
| KPI-023 | Product Roadmap Delivery | — | KR5.1 | Direct match |
| KPI-024 | Fawry Payroll Accuracy | — | KR6.4 | KR6.4 = "People cost/GP ≤60%" — loose; alternatively accept N/A (HR ops compliance) |
| KPI-036 | Auctions per VM per Day [DASHBOARD] | — | — | Acceptable as N/A — dashboard-only metric, not part of Company OKR scoring |

**Recommended:** apply the 3 obvious matches (KPI-021 → KR5.1, KPI-022 → KR5.3, KPI-023 → KR5.1). For KPI-017/018/024 and KPI-036, leave as N/A and document rationale.

---

## Action 3 — KR5.4 orphan reference (BUG — 22 cells affected)

**Problem:** v6 references `KR5.4` in 22 cells across 3 sheets, but Company OKRs only has KR5.1, KR5.2, KR5.3. KR5.4 doesn't exist.

**Affected cells:**
- `Marketing KPIs` sheet: 10 cells (rows 11, 17, 18, 19, 24, 31, 32, 33, 36, 40)
- `KPI Definitions`: 2 cells (KPI-025 DM/Inquiry Response Time, KPI-032 Motion Picture Delivery)
- `KPI Master`: 10 cells in Marketing role rows (61, 64-66, 68, 72-74, 77-78)

**Two options:**

**Option A — add KR5.4 to Company OKRs.** Since most references are in Marketing KPIs + 2 in Definitions (DM response + Motion Picture), and these are content/engagement metrics, the missing KR is likely a "Content/Engagement quality" or "Brand presence" objective. Add as:
> KR5.4: Content publication + engagement ≥X targets met monthly (or similar — KPI session defines)

This becomes a new Marketing-Tech intersection KR under O5 (Build scalable platform).

**Option B — remap 22 references.** Each cell currently references KR5.4 → reassign to KR4.x (Marketing) or KR5.1/5.2/5.3 depending on the specific KPI. More work but cleaner if KR5.4 isn't a real concept.

**Recommended:** Option A is cleaner — one new KR added vs 22 cell edits, and the affected KPIs all share the same theme.

---

## Action 4 — sop-kpi-xref Source of Truth pointer stale (HOUSEKEEPING)

**Where:** `mrkoon-chro/sop/sop-kpi-xref-v1.xlsx` → `Index Config` tab → Row 3 column 2

**Current:** `okr-kpi-framework-v6-20260502.xlsx → KPI Master sheet`
**Correct:** `okr-kpi-framework-v6-20260512.xlsx → KPI Master sheet`

xref data IS correctly synced to May 12 (VM-GATE-03 row exists, Last synced field shows May 12). Just the source-of-truth pointer text is stale.

---

## Action 5 — MAP-001 versioning hygiene (HOUSEKEEPING)

**Per CURRENT-VERSIONS.md canonical:** `mrkoon-master-process-map-v2-HRSOP.html` in `mrkoon-chro/workflows/` + `shared/hr/org-structure/`

**Current file system state:**
| Path | What's there | What should be there |
|---|---|---|
| `mrkoon-chro/workflows/mrkoon-master-process-map-v2-HRSOP.html` | ✓ canonical | (correct) |
| `mrkoon-chro/workflows/mrkoon-master-process-map-v2-chro.html` | ⚠ orphan | (move to `workflows/archived/`) |
| `shared/hr/org-structure/mrkoon-master-process-map-v2-chro.html` | ⚠ wrong file | (replace with v2-HRSOP) |
| `shared/hr/org-structure/archived/mrkoon-master-process-map-v2-chro.html` | ✓ already archived | (correct) |

**Two file ops:** (1) archive `workflows/v2-chro.html`, (2) copy canonical v2-HRSOP into `shared/hr/org-structure/` and archive the v2-chro currently there.

---

## Reference

- Full review verdict: in OKR alignment session log 2026-05-12
- Watch Mode log: `mrkoon-okr-build/review-log.txt`
- Source of truth: `shared/CURRENT-VERSIONS.md`

End of paste-note. After your fixes, OKR alignment will run a verification pass and clear the build session for final ingest.
