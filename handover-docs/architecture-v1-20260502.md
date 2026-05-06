# Architecture — Mrkoon OKR Webapp
Date: 2026-05-02

## High-level diagram
```
Browser (React + Vite + Tailwind, EN/AR + RTL)
    │  HTTPS, supabase-js
    ▼
Supabase  ┌── Auth (magic link)
          ├── PostgreSQL (5 schemas: config, def, track, calc, audit)
          ├── RLS policies (per-role default-deny + grants)
          └── Edge Functions (Deno):
                ├── crm-sync   (dormant until CRM creds)
                └── erp-sync   (dormant until ERP creds)
                     │ (live mode)
                     ▼
            Mrkoon CRM v15  /  Future ERP
```

## Schema summary
- `config.*` — values (rates, targets, thresholds, salary bands, rating bands, periods)
- `def.*` — definitions (KPIs, OKRs, SOPs, schemes, roles, users, departments, link tables)
- `track.*` — operational data (actuals, events, appraisals, payouts, breakdowns, PIP)
- `calc.*` — views and RPC calculators
- `audit.events` — immutable log

## Patterns followed
- **Single Source of Truth**: `config.*` referenced by every calculator; never duplicated
- **Bidirectional KPI ↔ SOP**: link table indexed both ways
- **Auto-aggregation Q1–Q4 → Annual**: `calc.vw_appraisal_annual_score` view
- **Dormant Edge Functions**: deployed once, activated by env vars only
- **Audit at trigger level**: bypassable only by service-role key

## Anti-patterns avoided
- No empty shells (deprecated Excel shells not recreated as DB tables)
- No hard-code-by-copy (every value lives once)
- No DEC codes user-visible
- No two-format duplication (forms generated from one model)

## Phase rollout plan
1. Schema + RLS + seed (apply via Supabase SQL Editor)
2. Auth + role routing
3. OKR module
4. KPI module
5. Appraisal module
6. Bonus/commission engine + dormant Edge Functions
7. Dashboards
8. QA (gate before deploy)
9. Netlify deploy (production)
10. Tech handover docs

## Known limitations and recommended next improvements
- **Per-VM tracking** (KPI-033, 036): needs auction-system instrumentation per VM. Build accommodates `track.events.payload->>'vm_id'`.
- **Loading distribution** (KPI-034): needs specialist_id per loading event. Build accommodates `track.events.payload->>'specialist_id'`.
- **Merchant DB activation rate** (KPI-035): cross-reference between CRM merchants and auction events. Implementable via Edge Function once CRM live.
- **KPI-033..036 weight = 0** (informational only) until CHRO rebalances.
- **Operations TL KPI weights sum 0.50** and **Tech Sr PO + Mobile Dev sum 1.35** flagged in handover §8 — admin can rebalance via config UI.
- **PIP module**: this build creates PIP records only; full PIP workflow (development plans, milestones) is a v2 feature.
- **SSO**: design hooks present in custom JWT claims; activate when ERP identity provider lands.
- **Salary master**: out of scope; lives in ERP.
- **SOP-009 + SOP-010 content**: out of scope; SOP session.
- **Multi-currency**: EGP only in v1; KSA SaaS pricing handled in separate KSA product.
- **Real-world data backfill**: Operations + Finance sessions; this app starts with empty `track.*` tables.
