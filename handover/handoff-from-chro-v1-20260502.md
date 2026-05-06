# Handoff from CHRO Session — 2026-05-02
Captured by build session. Original message verbatim below.

## Verbatim handoff

> BLOCKING ISSUES RESOLVED — SCORING CODE CAN NOW PROCEED
>
> **What was blocking**: Two roles had broken weight totals (Ops TL at 0.50, Tech PO at 1.35) and 4 new KPIs had no weight assignment. Any scoring algorithm assuming sum=1.00 would produce wrong results for these roles.
>
> **What changed (OKR-KPI Framework v6, 2026-05-02)**:
> - All 20 scored roles now sum to exactly 1.00 in KPI Master
> - Appraisal quarterly v3 and annual v3 match the framework weights
>
> **SCORING MODEL NOTES**:
>
> **Standard roles (18 of 20)**: straightforward weighted average.
>   Score = Σ(KPI_score × weight), where Σ(weights) = 1.00
>   Rating scale: 4.50–5.00 Exceptional, 3.50–4.49 Exceeds, 2.50–3.49 Meets, 1.50–2.49 Needs Improvement, 1.00–1.49 Unsatisfactory.
>
> **Ops TL (Hussein): DUAL MODEL — handle separately.**
>   - Weighted score from 4 personal KPIs (sum 1.00) → feeds into annual rating (70% KPI + 20% competency + 10% goals)
>   - Quality Gates: 5 binary gates with fixed EGP payouts. These are COMPENSATION not RATING. Do not mix into weighted score. Track as: gate met (Y/N) → payout amount.
>   - Max gate payout: Ops 3,000 + VM 2,500 = 5,500 EGP/month
>
> **Tech PO (El-Hussien)**: 6 scored KPIs at 1.00. 3 monitoring KPIs (TECH-PO-07/08/09) are flagged "Monitor" — DO NOT include in scoring formula. They exist in KPI Master for dashboard display only.
>
> **Annual appraisal formula**: (KPI weighted score × 0.70) + (competency avg × 0.20) + (goals score × 0.10) = final rating.
>
> **DATA SOURCES**:
> - KPI Master tab in `okr-kpi-framework-v6-20260502.xlsx`: all KPI IDs, roles, weights, targets
> - `appraisal-quarterly-v3-20260502.xlsx`: quarterly scoring forms per person (22 tabs)
> - `appraisal-annual-v3-20260502.xlsx`: annual scoring forms per person (22 tabs)
> - **Weight column = column 6 in KPI Master**. Skip rows where weight = "Monitor", "Gate", or "Dashboard".
>
> Reference: `shared/CURRENT-VERSIONS.md` for all current file versions.

## Build session interpretation

Schema v2 implications:

1. **`def.kpis.weight_type` enum** replacing `is_dashboard_only` boolean:
   - `scored` — enters Σ(KPI×weight) for the role; row has numeric weight
   - `monitor` — dashboard only, not scored; row weight = NULL or label "Monitor"
   - `gate` — binary Y/N → fixed EGP payout via gate scheme (OPS-TL-GATES-v7)
   - `dashboard` — like monitor; surfaced for visibility but not scored (e.g. OPS-NEW-01/02)

2. **`def.kpi_role_weights`** only inserts rows where `weight_type = 'scored'`. Sum check: per (functional_role_id), Σ(weight) must equal 1.00. Add a CHECK or trigger.

3. **`track.appraisals` column rename**: `manager_score` → `goals_score`. Annual formula: `(kpi_avg × 0.70) + (competency_avg × 0.20) + (goals_score × 0.10)`. Update `calc.vw_appraisal_quarterly_score` and `vw_appraisal_annual_score`.

4. **Ops TL dual model** in app:
   - 4 personal KPIs render in Hussein's quarterly/annual forms; Σ weights = 1.00
   - 5 gates render separately under "Compensation" view — Y/N captured each month → `track.commission_payouts` via `OPS-TL-GATES-v7`
   - Gates do NOT appear in his appraisal scoring section (rendered in Bonus tab only)

5. **Tech PO**: 6 scored KPIs in scoring section; TECH-PO-07/08/09 render in a "Monitoring" panel below the scored block. Same data source, different render path.

6. **VM**: 10 scored KPIs (was 8 in v5). VM-09 Auction Quality and VM-10 DB Activation added; per-role rebalance ×0.80 already applied in v6. Build session reads v6 weights as-is.

7. **Files to read** (when bash workspace returns):
   - `mrkoon-chro/performance/okr-kpi-framework-v6-20260502.xlsx` → KPI Master tab → seed `def.kpis` + `def.kpi_role_weights`
   - `mrkoon-chro/compensation/salary-bands-level-framework-v2.xlsx` → seed `config.levels`
   - `shared/hr/commission-schemes/BD-Commission-Calculator.xlsx` → seed `config.compensation_rates` for BD rate scale (60/70/80/90/110% intermediate values)

## Memory note (per CURRENT-VERSIONS.md rule)
Reference v6 / quarterly-v3 / annual-v3 by family name (`okr-kpi-framework`, `appraisal-quarterly`, `appraisal-annual`); resolve to current filename via `shared/CURRENT-VERSIONS.md` at read time. Never hardcode the version number in build artifacts after seed.
