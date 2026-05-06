# Phase 0 Confirmation — Mrkoon OKR/KPI/Appraisal Web App
Build session, 2026-05-02
Source of truth: handover-note v1 (2026-05-01)

This document is the build session's understanding of what is to be built, derived from the handover note. Every claim below is traceable to the note. Khater confirms or corrects this before Phase 1 (DB schema + RLS) begins.

---

## 1. Data model — four layers, one platform

The handover note prescribes a four-layer conceptual model. The platform implements each layer as a distinct schema namespace so that values, definitions, formulas, and actuals never blur into each other.

### Layer 1 — Configuration (Source of Truth)
Single canonical store for all configurable values. No formulas. Referenced by every calculator. Replicates the v7 `Rates & Config` pattern so that no number is hard-coded twice in the system.

Tables:
- `config.compensation_rates` — base rates, scales, caps, kicker thresholds per scheme
- `config.targets` — Target-300 anchor values (30M GP, 104 baseline, 75/quarter, 25 BD/quarter, BD count = 4)
- `config.thresholds` — operational thresholds (merchant attendance ≥6, VM trigger 15 auctions/22-day window, BD portfolio cap 20, BD GP kicker = 13 accts AND 300K GP, etc.)
- `config.salary_bands` — L1–L5 OpEx bonus % bands (5–30% by level)
- `config.rating_bands` — 1–5 appraisal scale (Unsatisfactory / Needs Improvement / Meets / Exceeds / Exceptional) with thresholds (red = 2.5 = PIP)
- `config.cycle_periods` — period definitions (monthly, quarterly, annual) + open/closed status

### Layer 2 — Definitions
Static catalogues: KPIs, OKRs, SOPs, schemes, roles. Edited by Admin/CHRO, consumed by everyone.

Tables:
- `def.kpis` — 36 KPIs (KPI-001..036). Columns: id, name_en, name_ar, formula_text, formula_engine_ref, unit, frequency, owner_role, target, threshold_amber, threshold_red, sop_ref, kr_ref, scheme_ref, weight_default, is_dashboard_only (KPI-033..036 = TRUE), created_at
- `def.objectives` — 6 Company + 4 Ops (level: company/dept/individual)
- `def.key_results` — 28 Company KRs + 17 Ops O-KRs (kr_id, parent_objective_id, target_value, unit, weight)
- `def.sops` — 10 SOPs (SOP-001..010) with bilingual title, doc URL, owner, cycle, last_reviewed, category
- `def.commission_schemes` — 8 schemes (BD-COMM-Q-v7, AM-COMM-v7, VM-COMM-v7, OPS-BONUS-v7, OPS-TL-GATES-v7, ONB-COMM-v7, OPEX-QTR-v7, ANNUAL-BONUS-v7)
- `def.roles` — Employee, Manager, Department Head, HR, Finance, C-Level/CCO, Admin (+ functional sub-roles: BD, AM, VM, Ops, OpsTL, Onboarding, Marketing, Tech, Finance, HR)
- `def.kpi_role_weights` — role × kpi × weight (replaces the 22 role tabs in appraisal-quarterly)
- `def.kpi_sop_links` — bidirectional KPI ↔ SOP link table (closes the one-way gap flagged in handover)

### Layer 3 — Calculations
Pure logic. Reads definitions + actuals + config. Produces scores and payouts. Implemented as Postgres views, RPC functions, and Edge Function calculators where complex.

- `calc.kpi_scores` — view: actual / target × weight, per employee per period
- `calc.appraisal_scores` — view: KPI 70% + Competency 20% + Manager 10% (annual); KPI sum + competency (quarterly); none (monthly check-in)
- `calc.commission_runs` — function: takes scheme_ref + period + employee → produces payout breakdown with every input visible
- `calc.bonus_runs` — function: rating × salary × band → quarterly OpEx bonus

### Layer 4 — Tracking (Actuals + Forms)
Operational data. The currently-broken layer (5 deprecated empty shells). Built as transactional tables with audit.

- `track.kpi_actuals` — period, employee, kpi_id, actual_value, evidence_ref, captured_at, captured_by
- `track.events` — transactional events feeding KPIs (auction events, loading events, commission triggers, merchant onboarding, referrals)
- `track.appraisal_cycles` — cycle id, type (monthly/quarterly/annual), period, status (open/closed)
- `track.appraisals` — cycle_id, employee_id, status (draft/submitted/under-review/approved/closed), self_score, manager_score, dept_head_score, hr_signoff, final_rating, signed_off_at
- `track.appraisal_competencies` — per-appraisal competency scores
- `track.commission_payouts` — calculated payout snapshots per scheme/period/employee with full input trace
- `audit.events` — immutable log: who changed what when on every entry across all four layers

---

## 2. OKR structure

Three-level cascade enforced at schema and UI.

- **Company OKRs (locked)**: 6 Objectives × 28 Key Results. Set by Admin / C-Level. Visible to all. Anchored to Target-300 strategic brief (30M GP, 300 clients EOY 2026, 75/quarter, 25 BD/quarter, BD = 4 reps, baseline = 104 active).
- **Department OKRs**: Operations dept already has 4 Objectives × 17 KRs (O-KR prefix). Schema supports the same for every department. Department Head sets, Admin/C-Level review.
- **Individual OKRs**: Set by employee, approved by direct manager, linked to one or more parent dept KRs. Quarterly cadence default.

OKR tree view shows cascade Company → Department → Individual with progress roll-up. Period management: open/close periods, archive completed cycles. Progress = weighted KR achievement.

---

## 3. KPI list summary

**Total: 36 KPIs.** 32 existing + 4 new from this handover (KPI-033 per-VM, KPI-034 loading distribution, KPI-035 merchant DB activation, KPI-036 auctions/VM/day = hire trigger).

**KPI-033 to KPI-036 are weight = 0** by handover decision (informational/dashboard only) until CHRO rebalances. They surface in dashboards and trigger alerts (e.g., VM hire trigger) but do not score in appraisal.

Each KPI carries: id, name_en, name_ar, formula text, formula engine reference, unit, frequency (daily / weekly / monthly / quarterly / yearly), owner role, target, amber threshold, red threshold, SOP reference, KR reference, commission scheme reference, role weights (role × weight), traffic-light rule.

**Coverage by SOP** (mapping per handover §5):
| SOP | KPIs |
|---|---|
| SOP-001 Client Onboarding | KPI-005, 006, 007 |
| SOP-002 Merchant Onboarding | KPI-019, 020, 035 |
| SOP-003 Auction Management | KPI-004, 013, 028, 029, 033 |
| SOP-004 Payment & Collection | KPI-016, 017, 018 |
| SOP-005 Dispute Resolution | (KR-only, no KPIs) |
| SOP-006 Logistics Coordination | KPI-010, 011, 012, 031, 034 |
| SOP-007 Marketing Operations | KPI-014, 015, 025, 032 |
| SOP-008 Account Management | KPI-008, 009, 030 |
| SOP-009 Listing Creation & Quality Review | TBD by SOP session |
| SOP-010 Fulfilment & Deal Closure | TBD by SOP session |

**KPI Source consolidation (Option B from handover)**: the platform IS the consolidated source. The old 4 byte-identical Excel copies retire. Appraisal forms, monitoring cadence, and KPI Master all read from `def.kpis` + `def.kpi_role_weights`.

---

## 4. Appraisal cycles

Three cycle types from handover §4 (Annual Appraisal section) + §1 file register (monitoring-cadence-matrix).

### Monthly check-in
- Lightweight. Self-assessment + manager comment.
- No formal rating. No bonus trigger.
- Required for all employees. Manager signs off.
- Status workflow: draft → submitted → manager-acknowledged → closed.

### Quarterly review
- Self-assessment per KPI in scope (role weights).
- Manager rating per KPI + per competency.
- Goal progress review (KR-level).
- Development notes.
- Calibration step: department head sees all team ratings to detect inflation/compression before submission.
- Status workflow: draft → submitted → manager-reviewed → dept-head-calibrated → closed.
- Outputs: quarterly score (KPI-driven), feeds Annual aggregator.

### Yearly appraisal
- Aggregates Q1–Q4 scores (closes the manual-transcription gap flagged in handover).
- Weights: KPI 70% + Competency 20% + Manager 10%.
- Rating bands: 4.5–5 Exceptional / 3.5–4.49 Exceeds / 2.5–3.49 Meets / 1.5–2.49 Needs Improvement / 1–1.49 Unsatisfactory.
- Red threshold 2.5 → triggers PIP workflow.
- Sign-off chain: Employee → Manager → Department Head → HR → final.
- Triggers Annual Bonus calculation (OpEx) or year-end review (COGS).
- COGS teams: drives non-target KPIs (SOP 30%, Reporting 20%) only — full quarterly bonus does not apply.
- OpEx teams: drives full quarterly OpEx bonus (L1–L5 bands).

**Performance Gates** are NOT in templates (handover §7 decision 12). They are surfaced as system-flagged outcomes in the digital platform — calculated, not typed.

---

## 5. Bonus & commission rules — locked

All values from handover §4. Each scheme is a row in `def.commission_schemes` with rate JSON; calculators are `calc.commission_runs` RPCs that read from `config.compensation_rates` keyed by scheme_ref.

### BD Acquisition — `BD-COMM-Q-v7`
- Cadence: quarterly, per-account.
- Quarterly target: 25 accounts/BD.
- Rate scale: 50% achievement → 400 EGP/account, 60% → ?, 70% → ?, 80% → ?, 90% → ?, 100% → 1,000 EGP/account, 110% → ?, 120% → 1,400 EGP/account. (Exact intermediate steps to read from BD-Commission-Calculator.xlsx during seed.)
- Cap: 30 accounts (120%).
- GP Kicker: BOTH accounts ≥ 13 AND realized quarterly GP ≥ 300,000 EGP → kicker = 5% of total realized quarterly GP.
- BD portfolio cap: 20 active accounts → handoff to AM after.
- Comp model: COGS.

### AM (Account Management) — `AM-COMM-v7` (Shams El-Din transition 2026-05-01)
- Cadence: monthly, 6-component.
- Retention: 200 EGP per active client/month, no cap.
- Reactivation: 500 EGP per event, 1,500 EGP/month cap, requires ≥2 retained months.
- Upsell: 300 EGP per new category.
- Referral: 1,000 EGP per signed referral.
- Volume Bonus: 1,500 EGP if portfolio avg ≥2 txns/client/month (derive from auction events; not Y/N input in platform).
- Portfolio Bonus: 1,000 EGP if ≥40 clients AND ≥80% transacting.
- Comp model: COGS.
- No retroactive comp on past BD work for Shams.

### VM-Sales — `VM-COMM-v7`
- Cadence: monthly, per-auction.
- Success base: 500 EGP (auction with ≥1 bidder).
- Per extra bidder: 50 EGP (above 1).
- Non-success flat: 250 EGP.
- New constraint (locked 2026-05-01): merchant attendance floor ≥6 per auction (linked SOP-003 / O-KR2.2).
- Comp model: COGS.

### Operations Bonus — `OPS-BONUS-v7`
- Cadence: monthly, individual, 4 components.
- Quality bonus: 750 EGP if ≥95% zero-issue rate.
- Volume bonus: 1,000 EGP per 10 loadings.
- Speed bonus: 200 EGP if ≥90% on-time.
- Referral: 2,000 EGP per signed client referral.

### Hussein TL Gates — `OPS-TL-GATES-v7`
- Cadence: monthly. 5 gates. Cap 5,500 EGP/month.
- Ops Gate 1 (Zero-Issue ≥95%): 1,500 EGP
- Ops Gate 2 (On-Time ≥90%): 1,000 EGP
- Ops Gate 3 (No Client Escalation): 500 EGP
- VM Gate 1 (Auction Fill ≥80%): 1,500 EGP
- VM Gate 2 (Avg Bidders ≥4): 1,000 EGP

### Onboarding Commission — `ONB-COMM-v7`
- 150 EGP per merchant.
- 5,000 EGP monthly cap.
- 30-day clawback if no first auction (clawback rate 150 EGP).

### Quarterly OpEx Bonus — `OPEX-QTR-v7`
- Score-based on quarterly appraisal.
- Bands by salary level: L1: 5–10% / L2: 8–15% / L3: 10–20% / L4: 12–25% / L5: 15–30%.
- Min appraisal score 3.0 to qualify; below = no bonus.

### Annual Bonus — `ANNUAL-BONUS-v7`
- Triggered by yearly appraisal final rating.
- COGS: drives non-target KPIs only (SOP 30%, Reporting 20%).
- OpEx: full bonus per quarterly OpEx band scaled to annual.

**Display rule**: every commission and bonus output shows a step-by-step breakdown — every input, every formula, every output. Employee sees their own; Finance sees all; CCO/C-Level read-only on totals.

---

## 6. Role and permission matrix

Derived from handover + standard org structure.

| Role | OKR access | KPI access | Appraisal access | Bonus/Commission access | Config access |
|---|---|---|---|---|---|
| **Employee** | Own (read+write own individual; read parent dept+company) | Own (read+self-input actuals) | Own (self-assessment, monthly/quarterly/annual; read final) | Own (read calc breakdown; no edit) | None |
| **Manager** (functional team lead) | Own + direct reports' (read+approve individual OKRs of reports) | Direct reports' (read; review actuals) | Direct reports' (rate quarterly/annual; comment monthly) | Direct reports' (read; no payout edit) | None |
| **Department Head** | Department (read+set dept OKRs; read all individuals in dept) | Department (read all) | Department (calibrate ratings; approve quarterly/annual) | Department (read; no payout edit) | None |
| **HR** | All (read all OKRs across company) | All (read all KPI data) | All (manage cycles, schedule, complete sign-off; read final ratings) | All (read; no payout edit; no salary edit) | Cycle periods, role assignments, rating bands |
| **Finance** | None (read summary only on dashboards) | KPIs feeding commission/bonus only (read) | None | All (read all calcs; approve payouts; export to ERP/CRM) | Compensation rates, scheme rates |
| **C-Level / CCO** | All (read all levels) | All (read) | All (read final ratings; no edit) | All totals (read) | None |
| **Admin** | All (full edit) | All (full edit) | All (full edit) | All (full edit) | All (full edit) |

**Hard rules** (RLS-enforced at DB level):
- No role sees individual salary except Admin and Finance (Finance for bonus calc only).
- No role outside Admin and HR sees employee relations notes.
- Finance never edits appraisal scores.
- HR never edits salary or bonus payout amounts.
- Investor and equity data never appears anywhere (per company-context.md confidentiality rule).

---

## 7. Integrations

### CRM Edge Function (dormant)
- Built and deployed in Phase 6.
- Activates with CRM Supabase URL + anon key (handover-docs/ explains how).
- On commission run finalization → push payout events to existing Mrkoon CRM v15 webapp (which carries BD revenue tracking).
- Until activation: function returns `{ ok: true, mode: 'dormant', synced: 0 }`. App functions fully without it.

### ERP Edge Function (dormant)
- Same dormant pattern.
- Future activation: payroll export, employee master sync, salary master sync.
- Replaces hand-typed payroll once ERP credentials provided.

### Auth approach (recommended)
- **Supabase Auth + RLS** (per build-standards default + CRM v15 reuse).
- Email-magic-link primary; password optional fallback.
- SSO designed-for-but-not-built — connects when ERP + identity provider land.
- Role detection: `def.user_roles` linking auth.user_id → role + functional sub-role + department + manager.

---

## 8. Locked decisions inherited from handover (binding)

1. Active client baseline = 104 (April 2026)
2. GP target = 30M EGP (25M is conservative scenario)
3. 300-client target by EOY 2026; 75/quarter
4. BD count = 4 (Yassin, Salah, +2 hires from May 2026)
5. BD GP Kicker threshold = 13 accounts
6. BD portfolio cap = 20 → handoff to AM
7. Merchant attendance floor ≥ 6 per auction
8. VM hire trigger = 15 auctions/VM/day sustained over rolling 22-day window
9. SOP numbering: sequential global (SOP-001..010); department is metadata column
10. SOP set: 10 production SOPs total
11. KPI Source consolidation: Option B (platform is the master, retires Excel copies)
12. Performance Gates: removed from templates; auto-flagged by platform
13. DEC codes renamed to scheme codes (BD-COMM-Q-v7, AM-COMM-v7, etc.)
14. 5 deprecated empty shells: do not rebuild as Excel; design as DB tables in platform

---

## 9. Architectural patterns (follow / avoid)

**Follow** (from handover §7):
- Single Source of Truth: every value lives once, referenced everywhere
- INDEX/MATCH on KPI ID becomes FK on `def.kpis(id)` everywhere
- Inputs hub feeding analytical tabs becomes one config schema feeding views
- Bilingual EN/AR throughout — every name/title/band has Arabic counterpart, RTL fully supported

**Avoid**:
- Empty shells (don't pre-create tables that won't carry data)
- Hard-code-by-copy of any value
- One-way SOP↔KPI linkage (must be bidirectional via link table)
- Two-format duplication (one DB record, multiple views — no parallel docx forms)
- Internal codes (DEC, internal IDs) leaking into user-visible labels

---

## 10. Open gaps to close during build

From handover §7 "Known gaps":
- Quarterly → Annual auto-aggregation (Phase 5 calc design)
- Per-VM tracking (KPI-033 — needs auction system to capture VM-id per event; instrumented at `track.events` level)
- Loading distribution tracking (KPI-034 — needs specialist-id per loading event)
- Merchant DB activation (KPI-035 — needs cross-reference between merchants table and auction events)
- Auctions per VM per day (KPI-036 — needs daily granularity for hire trigger)
- Concentration risk: dashboard alert (not OKR/KPI), surfaces independent of scoring

From handover §8 "Open items":
- BD intermediate rate steps (60–110%) — read exact values from BD-Commission-Calculator.xlsx during seed-data preparation
- Operations TL KPI weights sum 0.50 — flagged for CHRO; build seeds current values, leaves config rebalanceable
- Tech Sr PO + Mobile Dev weights sum 1.35 — same; CHRO decision
- KPI-033..036 weight = 0 by current decision; admin can rebalance later via config UI

---

## 11. Out of scope (not for this build)

- SOP-009 + SOP-010 content drafting (SOP session)
- SOP-001..006 body-text KPI/KR cross-refs (SOP session)
- Salah salary reconciliation (locked at 12K elsewhere)
- DEC code governance decisions (CHRO/CoS)
- Real-world data backfill (Operations + Finance sessions)
- Investor/equity references (per confidentiality rule, never anywhere)

---

## 12. What confirmation looks like

Khater confirms by replying "Phase 0 confirmed" or flags specific corrections. On confirmation:
- This file is locked.
- Phase 1 (DB schema + RLS + seed) begins.
- Pre-build docs (BRD/TRD/SDD/User Stories/Use Cases/Acceptance/Test Cases) are produced in parallel per build-standards.md.

End of Phase 0 confirmation v1.
