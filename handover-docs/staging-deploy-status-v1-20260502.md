# Staging Deployment Status — 2026-05-02

## Project
- **Name**: `mrkoon-okr-staging`
- **Org**: Khater's (Free plan)
- **Project ref**: `ngfwrylotxnsodfyvegv`
- **API URL**: `https://ngfwrylotxnsodfyvegv.supabase.co`
- **REST endpoint**: `https://ngfwrylotxnsodfyvegv.supabase.co/rest/v1/`
- **Region**: West EU (Ireland) — eu-west-1
- **Compute**: t4g.nano

## Applied
- Schema v2 — 30 tables across 4 schemas + audit + 5 calc views + RPCs
  - audit: 1 (events)
  - config: 8 (compensation_rates, targets, thresholds, salary_bands, levels, rating_bands, cycle_periods, assumptions)
  - def: 12 (departments, roles, functional_roles, users, objectives, key_results, sops, commission_schemes, kpis, kpi_role_weights, kpi_sop_links, competencies)
  - track: 9 (kpi_actuals, events, appraisal_cycles, appraisals, appraisal_kpi_scores, appraisal_competency_scores, commission_payouts, payout_breakdown, pip_records)
- RLS v2 — helpers in `public` schema (auth schema reserved by Supabase), all 29 tables RLS-enabled with role-aware policies
- Seed v2 — verified counts:
  - roles: 7
  - departments: 10
  - levels: 10 (TL active, Manager/Sr Mgr/Head/Director dormant)
  - functional_roles: 11
  - rating_bands: 5
  - targets: 6
  - thresholds: 14 (incl. AM dormant_months=3, min_reactivations=2)
  - commission_schemes: 8
  - compensation_rates: 23 (BD rate scale placeholder, AM/VM/Ops rules)
  - assumptions: 13 (BD activity expectations + AM/VM/Ops baselines)
  - cycle_periods: 7 (Q1–Q4 2026, FY 2026, May/Apr 2026)
  - competencies: 6
  - sops: 10
  - objectives: 10 (6 company + 4 ops dept)
  - key_results: 9 (sample; rest seeded via panels)
  - kpis: 40 (placeholder names; weight_type tagged: Ops gates, Tech monitor, VM-09/10, OPS-NEW dashboards)
  - kpi_sop_links: 28
- Data API: 7 schemas exposed (audit, calc, config, def, graphql_public, public, track)

## Notable fixes during deployment
1. `auth` schema is reserved by Supabase — moved helper functions (`is_admin`, `manages`, etc.) from `auth.*` to `public.app_*`.
2. `audit.stamp_row()` originally tried to assign `created_at` even on tables that might not have it — replaced with defensive per-column exception blocks.

## What you need to do next session
1. **Copy the anon key** — Settings → API Keys → "Legacy anon, service_role API keys" tab → click `Copy` next to `anon public`. Paste into `frontend/.env`:
   ```
   VITE_SUPABASE_URL=https://ngfwrylotxnsodfyvegv.supabase.co
   VITE_SUPABASE_ANON_KEY=<paste-here>
   VITE_APP_NAME=Mrkoon Performance
   VITE_APP_ENV=staging
   VITE_DEFAULT_LANG=ar
   ```
2. **Save the DB password** — generated during project creation; it was masked. If you need to run direct DB commands later, you'll need it. If you already lost it, you can reset via Settings → Database → Reset password.
3. **Create your admin user**:
   - Auth → Users → "Add user" → invite your email → click magic link in email
   - Then in SQL Editor: `insert into def.users (id, email, full_name_en, full_name_ar, role_code) values ('<auth_uid>', 'your@email', 'Khater', 'خاطر', 'admin');`
   - Get auth_uid from Auth → Users page
4. **Phase 1 isolation test** (gate before Phase 2 per project rules) — needs you to log in as 7 test roles and verify RLS holds. I can drive this when you're ready.
5. **Fill v6 KPI Master weights** via Admin → KPI Master panel once frontend is running — or wait for bash workspace return so I can parse the xlsx.

## Production not deployed yet
Free plan limit was 2 active projects (you had borsa-kharda paused + mrkoon-bd-crm active). Staging slot is now used. For production: either (a) pause staging when production is needed, or (b) upgrade to Pro plan.
