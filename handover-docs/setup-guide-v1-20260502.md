# Setup Guide — Mrkoon OKR Webapp
Date: 2026-05-02

## 1. Create Supabase staging project
1. supabase.com → New project → name `mrkoon-okr-staging`, region EU/ME-South.
2. Save URL and anon key.
3. SQL Editor → run in order:
   - `database/schema/01-schema-v1-20260502.sql`
   - `database/rls-policies/02-rls-policies-v1-20260502.sql`
   - `database/seed-data/03-seed-v1-20260502.sql`
4. Verify: Tables listed under all 5 schemas; rating_bands has 5 rows; commission_schemes has 8.

## 2. Create production Supabase project
- Same steps, name `mrkoon-okr-production`. Run same migrations in same order.

## 3. Deploy Edge Functions
```
supabase login
supabase link --project-ref <ref>
supabase functions deploy crm-sync --no-verify-jwt
supabase functions deploy erp-sync --no-verify-jwt
```
Test invocation:
```
curl -X POST <url>/functions/v1/crm-sync -H "apikey: <anon>" -H "Authorization: Bearer <anon>" -d '{"payout_ids":[]}'
# → { "ok": true, "mode": "dormant", "synced": 0, "errors": [] }
```

## 4. Frontend
```
cd frontend
cp .env.example .env
# fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```
Visit http://localhost:5173.

## 5. Netlify
- Connect Git repo.
- Build command: `npm run build`
- Publish directory: `dist`
- Branch deploy: `main` → production, `staging` → staging.
- Set env vars (per env-vars-v1).
- Restrict access (Netlify Identity gating or basic auth) — internal only.

## 6. First admin user
1. Supabase Auth → Users → invite Khater's email.
2. Receive magic link, sign in → auth.users.id created.
3. SQL Editor: insert into def.users with role_code='admin' and the auth uid.
4. Sign back in → land on AdminDash.

## 7. Phase 1 isolation test (gate)
Before any Phase 2 work: create 7 test users, one per primary role; run TC-B01..B10 (test plan §3.1). All must PASS.
