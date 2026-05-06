# How to activate CRM commission sync
Date: 2026-05-02

The CRM Edge Function ships dormant. Activation is credentials-only — no rebuild.

## Prerequisites
- Mrkoon CRM v15 Supabase project URL.
- CRM Supabase anon key (read/write to `commission_events` table).
- CRM has a `commission_events` table with columns: `source_payout_id (unique)`, `scheme_id`, `period_id`, `employee_id`, `amount`, `approved_at`, `source_app`.

## Steps
1. Open Supabase Dashboard → this project → Edge Functions → Secrets.
2. Add or update:
   - `CRM_SUPABASE_URL`  = https://xyz789.supabase.co
   - `CRM_SUPABASE_ANON_KEY` = eyJhbG…
3. (No redeploy needed — secrets are read on each invocation.)
4. Trigger a test commission run: log in as Finance → run BD-COMM-Q-v7 for a test period → approve.
5. Confirm: Edge Function logs show `mode: 'live'`, `synced: N`. Verify row arrives in CRM `commission_events`.
6. The "CRM not connected" banner in Finance dashboard disappears on next refresh.

## Rollback
- Remove `CRM_SUPABASE_URL` (or set both to empty) — function returns to dormant.

## Troubleshooting
- 401 from CRM → anon key wrong, or RLS policy on CRM blocks insert.
- Duplicate key error on CRM → ensure `source_payout_id` is unique on CRM side; the function uses it for idempotency.
- Function logs missing → check `Deno.env.get` returns expected values; check function deployed under `crm-sync`.
