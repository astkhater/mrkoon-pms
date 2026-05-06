# Edge Functions API Spec
Version: 1
Date: 2026-05-02

## crm-sync

### Endpoint
`POST /functions/v1/crm-sync`

### Headers
- `Authorization: Bearer <user-or-service-jwt>`
- `apikey: <supabase-anon-key>`
- `Content-Type: application/json`

### Request body
```json
{ "payout_ids": ["<uuid>", "<uuid>"] }
```

### Response (dormant)
```json
{ "ok": true, "mode": "dormant", "synced": 0, "errors": [] }
```

### Response (live, all good)
```json
{ "ok": true, "mode": "live", "synced": 2, "errors": [] }
```

### Response (live, partial errors)
```json
{
  "ok": false, "mode": "live", "synced": 1,
  "errors": [{ "payout_id": "<uuid>", "reason": "payout not approved" }]
}
```

### Notes
- Dormant when CRM_SUPABASE_URL or CRM_SUPABASE_ANON_KEY unset.
- Idempotent on `source_payout_id` in CRM `commission_events`.
- Sets local payout status to `exported` on success.

---

## erp-sync

### Endpoint
`POST /functions/v1/erp-sync`

### Request body — pull employees
```json
{ "op": "pull_employees" }
```

### Request body — push payroll
```json
{ "op": "push_payroll", "payout_ids": ["<uuid>", "<uuid>"] }
```

### Response (dormant)
```json
{ "ok": true, "mode": "dormant", "op": "pull_employees", "changed": 0, "errors": [] }
```

### Response (live)
```json
{ "ok": true, "mode": "live", "op": "pull_employees", "changed": 47, "errors": [] }
```

### Notes
- Dormant when ERP_API_URL or ERP_API_KEY unset.
- ERP endpoints assumed: `GET /employees`, `POST /payroll/batch`. Replace per actual ERP.
- Pull employees upserts into `def.users` by id; sets role to `employee` if not provided.
- Push payroll only sends `approved` payouts; updates them to `exported`.
