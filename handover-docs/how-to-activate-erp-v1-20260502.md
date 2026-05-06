# How to activate ERP integration
Date: 2026-05-02

The ERP Edge Function ships dormant.

## Prerequisites
- ERP base URL (e.g., `https://erp.mrkoon.com/api`)
- ERP API key with permissions for `GET /employees` and `POST /payroll/batch`
- (Optional, future) SSO/OIDC config for cross-app authentication

## Steps
1. Supabase → Edge Functions → Secrets:
   - `ERP_API_URL` = https://erp.mrkoon.com/api
   - `ERP_API_KEY` = …
2. Pull employees: invoke erp-sync with `{ "op": "pull_employees" }` → expect `mode: live`, `changed: N`.
3. Push payroll: after Finance approves a payout run, invoke erp-sync with `{ "op": "push_payroll", "payout_ids": [...] }`.
4. The "ERP not connected" banner disappears.

## Endpoint contracts assumed (adjust per real ERP)
- `GET /employees` → `[{ id, email, full_name_en, full_name_ar?, role_code?, department_code? }, ...]`
- `POST /payroll/batch` body `{ items: [{ id, employee_id, total_amount, period_id }, ...] }`

If your ERP differs, update `backend/edge-functions/erp-sync/index.ts` accordingly and redeploy.

## SSO
Phase 9 deploys ERP as dormant. SSO is designed-for-but-not-built: when ready, swap Supabase Auth provider to OIDC pointed at ERP identity provider; role claims map via custom JWT hook.
