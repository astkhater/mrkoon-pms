# Design Decisions — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02

Each decision: choice, rationale, alternative considered, irreversible? (yes/no), source.

| # | Decision | Rationale | Alternative | Irreversible | Source |
|---|---|---|---|---|---|
| D-01 | Stack: React + Vite + Tailwind / Supabase / Netlify | Mrkoon default; CRM v15 reuse; fast dev iteration | Next.js + Vercel; Django + Postgres | No (high-cost) | build-standards.md |
| D-02 | Auth: Supabase Auth + RLS (magic link primary) | Default; CRM v15 reuses; SSO-ready | Auth0; Clerk | No | TRD §2 |
| D-03 | Schema split: 5 schemas (config, def, calc, track, audit) | Mirrors handover four-layer model + audit isolation; clear boundaries | Single public schema | Yes (migrating later = pain) | handover §1 |
| D-04 | Single Source of Truth: all values in `config.*`; calculators reference, never duplicate | Handover anti-pattern: hard-code-by-copy in 6+ files | Per-module rates | Yes | handover §7 |
| D-05 | Bidirectional SOP ↔ KPI link table | Handover gap: one-way linkage | Embedded array | No | handover §5 |
| D-06 | Auto-aggregate Q1–Q4 → annual via VIEW | Handover known gap (manual transcription) | Stored procedure on close | No | handover §7 |
| D-07 | Bilingual columns at DB level (`name_en`, `name_ar`) | Bilingual is structural, not localization-only | Translation table | No (but more refactor later) | ux-standards |
| D-08 | RTL via `<html dir>` + Tailwind `rtl:` variants | CRM v15 reuse; standard React pattern | RTL-only fork | No | TRD §6 |
| D-09 | Dormant Edge Function for CRM and ERP | Build-standards mandate; CRM v15 pattern | Hardcoded "no integration" | No | build-standards |
| D-10 | Audit at trigger level (not app level) | Cannot be bypassed by direct SQL | App-level | No | TRD §6 |
| D-11 | RLS default-deny | Standard Supabase practice; isolation guarantee | Default-allow + denylist | Yes (security posture) | TRD §4 |
| D-12 | Phase 1 isolation test gates Phase 2 | Handover note treats RLS as Phase 1, not 7 — non-negotiable | Defer to Phase 8 QA | Yes (per project rules) | handover-driven |
| D-13 | KPI-033..036 weight = 0 in seeds | Handover decision; CHRO rebalances later | Distribute weights now | No | handover §8 item 10 |
| D-14 | Performance Gates removed from appraisal forms | Handover decision 12 — auto-flagged from platform | Keep template column | Yes | handover §7 |
| D-15 | DEC codes never appear user-visible | Handover anti-pattern; renamed to scheme codes | Show DEC in admin | Yes | handover §7 |
| D-16 | Charts: Chart.js | CRM v15 uses it; consistent | Recharts; Plotly | No | build-pattern |
| D-17 | Server data: TanStack Query | Standard React choice for cache + invalidation | SWR; redux | No | TRD §1 |
| D-18 | Forms: react-hook-form + zod | Best-in-class validation; type-safe | Formik | No | TRD §1 |
| D-19 | Rating scale: label-anchored (Exceptional / Exceeds / Meets / Needs Imp / Unsat) | Handover §4 + UX rule "every field labeled clearly" | Numeric only | Yes | ux + handover |
| D-20 | Below-Meets requires comment | Quality of feedback; matches paper form | Optional comment | No | ux-standards |
| D-21 | Calibration view at Dept Head step | Handover §4 (calibration) | At HR step | No | handover §4 |
| D-22 | Annual sign-off chain Employee→Manager→Dept Head→HR | Handover §4 + paper form | Manager→HR | Yes | handover §4 |
| D-23 | PIP triggered automatically at < 2.5 | Handover §4 red threshold rule | Manual trigger | No | handover §4 |
| D-24 | Bonus breakdown shows every input/formula/output line | Handover principle: employee understands exactly | Total only | Yes (transparency) | handover §4 |
| D-25 | Mobile responsive only for appraisal forms, KPI entry, dashboards | Mgmt tool primarily desktop; mobile for field input | Full mobile | No | ux-standards |
| D-26 | Currency: EGP throughout (no multi-currency in v1) | Egypt entity primarily; KSA SaaS is separate product | SAR support | No | scope |
| D-27 | Period type: monthly / quarterly / annual only | Handover §4 cycle types | Custom periods | No | handover §4 |
| D-28 | Empty shells from Excel: NOT recreated as DB tables | Handover anti-pattern explicit | Recreate for parity | Yes | handover §7 |
| D-29 | Concentration risk: dashboard alert only, not KPI | Handover §7 explicit | Make KPI | Yes | handover §7 |
| D-30 | Functional sub-roles (BD, AM, VM, etc.) separate from primary roles (Employee, Manager, etc.) | Handover §1 file register implies this; primary role gates access, functional gates KPI/scheme assignment | Single role enum | No | derived |
| D-31 | Salah salary locked at 12K — not reconciled by this build | Handover §7 out of scope | Build salary master | Yes | handover §7 |
| D-32 | No investor/equity references anywhere | Company confidentiality rule | — | Yes | company-context.md |

## Open decisions (pending Khater)

- **OD-01**: BD intermediate rate steps (60/70/80/90/110%) — Khater confirms calculator file has specific values; awaiting paste-in. v1 seed uses linear interpolation; will replace.
- **OD-02**: Whether to surface DEC codes in Admin-only audit screens (vs. fully hidden). Current decision: fully hidden per handover; reversible.

## Resolved decisions (Khater 2026-05-02)

- **OD-03 → resolved**: PIP scope v1 = flag-only. When annual rating < 2.5, system creates `pip_records` row with status=open. HR handles the plan offline. Full PIP workflow (development plans, milestones, check-ins, exit decision) deferred to v2.
- **OD-04 → resolved**: AM Reactivation bonus condition. **Definition**: a "reactivation" event is a previously-dormant client (no transaction in trailing 3 months) who re-engages with ≥1 selling action this month. **Qualifying rule**: ≥2 such reactivations in the month qualifies for the bonus. **Per-event payout**: 500 EGP. **Monthly cap**: 1,500 EGP. The earlier "≥2 retained months" wording from the handover note is superseded by this clarification.
- **OD-05 → resolved**: AM Volume bonus ("portfolio avg ≥2 txns/client/month") = **snapshot at month close**. Computed once when the monthly cycle closes; stored on the payout record; not re-derived live. Rationale: payroll figures must not drift after approval.

## Architectural additions (Khater 2026-05-02)

- **D-33 (NEW)** — Levels/grades as a config table, decoupled from access roles. 10 levels seeded from `mrkoon-chro/compensation/salary-bands-level-framework-v2.xlsx`. Active vs dormant is a flag, not a missing row — dormant levels live in DB; UI lets Admin activate/deactivate without code change. Functional roles attach to a level. Access roles (employee/supervisor/HR/finance/c-level/admin) attach to the user, separate from level. Today: TL is the active first-line supervisor; everyone else reports to C-level.
- **D-34 (NEW)** — Inputs panel architecture. Admin → Compensation has two tabbed sections, both audited:
  - **Inputs** (= existing `config.compensation_rates`): direct comp parameters from the calculator file. Tabs by department × functional role.
  - **Assumptions** (= NEW `config.assumptions` table): operational expectations from the task-force sheet (e.g., BD ≥13/qtr → ≥8/month → ~16–20 meetings → ~40–50 qualifying calls). Drive activity dashboards and "expected volume" displays, not payouts directly. Tabs by department × functional role × period.

## CHRO handoff corrections (2026-05-02)

Triggered by `handover/handoff-from-chro-v1-20260502.md` after framework v5→v6.

- **D-35 (NEW)** — Annual formula uses **goals** at 10%, not "manager". Schema column `track.appraisals.manager_score` is renamed to `goals_score`. Calc views updated: `(KPI weighted × 0.70) + (competency avg × 0.20) + (goals × 0.10)`. The original handover note's phrasing "Manager 10%" was a typo for "goals" per CHRO. Locked.
- **D-36 (NEW)** — KPI weight types as enum: `scored / monitor / gate / dashboard`. Replaces v1's `is_dashboard_only` boolean. Only `scored` rows enter the weighted average; `monitor` and `dashboard` are display-only; `gate` rows feed binary→payout via `OPS-TL-GATES-v7`. Per-role sum check: Σ(weight where weight_type='scored') = 1.00 enforced at config save.
- **D-37 (NEW)** — Ops TL (Hussein) dual rendering. The appraisal scoring view shows only the 4 scored KPIs (sum 1.00). The 5 quality gates render in a separate "Compensation gates" panel under Bonus → monthly. Gates never enter the rating; rating never enters the gates.
- **D-38 (NEW)** — Tech PO (El-Hussien) split rendering. The 6 scored KPIs render in scoring section; TECH-PO-07/08/09 render in a "Monitoring" panel below the scored block. Both come from `def.kpis` filtered by weight_type.
- **D-39 (NEW)** — VM has 10 scored KPIs in v6 (VM-09 Auction Quality, VM-10 DB Activation added; per-role weights rebalanced ×0.80 in v6). Build seeds from v6 directly.
- **D-40 (NEW)** — Version reference protocol for build artifacts: refer to file family name (`okr-kpi-framework`, `appraisal-quarterly`, `appraisal-annual`); resolve to current filename via `shared/CURRENT-VERSIONS.md`. Hardcode the v6 number only in seed migration files where it's a snapshot date stamp; never in code paths or briefs.
