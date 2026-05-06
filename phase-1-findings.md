# Phase 1 — Source Layer Findings
Date: 2026-05-01
Status: Closed

## Files reviewed
- mrkoon-chro/source/Mrkoon_EGY_TaskForce_v8_0.xlsx (2026-04-25)
- mrkoon-chro/source/Mrkoon_KSA_TaskForce_v3_3.xlsx (2026-04-18)
- mrkoon-chro/source/Mrkoon_SOP_KPI_Framework.xlsx (2026-04-18)
- mrkoon-chro/source/BD_Commission Calculator.xlsx (2026-04-18)

## Locked decisions
- **Commission kicker threshold = 13 accounts** (Khater, 2026-05-01). BD Calc rows 28/59/66/79 must all read 13. Propagate to v7 family in Phase 3.

## Open items carried to consolidated output
- KSA Taskforce: Egypt-shared cost cells (R44/R45/R46) hard-coded — need live link to EGY tech cost.
- BD Commission Calculator: relocate to `shared/hr/commission-schemes/`; rename to remove space (`BD-Commission-Calculator.xlsx`).
- SOP_KPI_Framework: broken formulas (D10, E13, E15); Marketing block empty; TBD targets; orphan Sheet1; missing data-source column.
- SOP-ID reconciliation: SOP-S01-style (Framework) vs SOP-001-style (chro/sop folder) — two parallel schemes.
- KPI Dashboard methodology gaps: TBD targets, no per-KPI owner, no data-source column, hard-coded status emoji.

## Files clean as-is
- EGY Taskforce v8.0 — internal model integrity solid.
- BD Commission Calculator logic — correct after threshold lock.
