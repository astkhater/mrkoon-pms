# Mrkoon PMS — Session 2026-05-08 batch summary

## What was built (autonomous batch while you were away)

### Brand alignment — task #35 ✓
- Found brand guidelines at `shared/creative/brand-assets/mrkoon-brand-guidelines-v1-20260418.md`
- Updated `tailwind.config.js` to Mrkoon Navy (#1A2B3D primary), Mrkoon Green (#42B564 accent), full secondary palette
- Updated `index.css` to load Montserrat + Almarai from Google Fonts
- Copied 6 logo PNG variants to `frontend/public/brand/` (H/V × EN/AR × color/white)
- Login page now shows the localized horizontal color logo on a Mrkoon Navy backdrop
- Sidebar now renders the white horizontal logo with "Performance" subtitle
- Favicon set to logo mark
- Topbar gained user avatar + role/permission badge

### Phase 3 finish — task #19 ✓
OKR write/approve flow:
- "Add objective" button on `/okrs` (admin / c_level / dept_head) — opens form for code/level/period/dept/titles
- Inline edit objective title (admin / c_level / dept_head, or manager if owner)
- Add/edit/delete KRs with target/unit/weight
- Approve/lock KR (admin / c_level / dept_head / hr) — sets status='locked' + approver + timestamp
- Status badge on each KR (open/locked/closed/archived)

### Phase 3a — task #28 ✓
KPI actuals entry at `/kpis/entry`:
- Period selector (filters monthly cycle by default)
- Per-KPI rows: target, actual input, traffic light preview, comment
- Out-of-range (>50% or <50% of target) requires comment
- Saves to `track.kpi_actuals` (upsert by kpi_id × employee_id × period_id)
- Library/Mine toggle on `/kpis` page
- "Enter actuals →" button on KPI dashboard

### Phase 4 — task #29 ✓
Calc/cascade engine foundation:
- Populated `config.assumptions` with 42 single-source-of-truth values (GP_TARGET 30M, BLENDED_GP_MARGIN 0.049, weekly GMV target, retention rate, etc.)
- Updated `AssumptionsPanel` with COMPANY tab for company-wide assumptions
- `useCompanyAssumptions()` hook + SSOT card on CLevelDash
- ConfigEditor null-filter fix (uses `.is(col, null)` for null filters)

Phase 4b (true cascade — KR target derived from assumptions) deferred to task #34.

### Phase 5 — task #30 ✓
Appraisal flow at `/appraisals` and `/appraisals/:id`:
- HR can create cycles (monthly / quarterly / annual)
- Per-employee appraisal detail page with full workflow:
  - Self-assessment (self_score, self_reflection, KPI self ratings, competency self ratings)
  - Manager review (manager_score, manager_comment, manager ratings, goals_score)
  - Dept head review (dept_head_score, dept_head_comment)
  - HR sign-off (final_rating, signed_off_at)
- Status workflow visible: draft → submitted → manager_reviewed → calibrated → hr_signoff → closed
- Stage gating per role/permissions

Note: Bulk appraisal generation (HR clicks "Generate appraisals for all employees in cycle X") is not yet wired — appraisal records currently need to be created via SQL or per-employee. Add this in next iteration.

### Phase 6 — task #31 ✓
Bonus engine UI at `/bonus`:
- Shows active commission schemes (COGS vs OpEx tagged)
- Three views: My payouts / Pending (finance only) / Approved (finance only)
- Approve / Hold / Reject actions for finance + admin
- Status badges (draft, pending_approval, approved, rejected, exported)

The actual `calc.fn_run_bd_commission` etc. are server-side functions that compute payouts — they need a "Run for period X" trigger UI which is the next iteration. The view is ready when payouts get generated.

### Phase 7 — task #32 ✓
SOP integration at `/sops`:
- Lists 10 seeded SOPs with dept, cycle, last reviewed
- Click a SOP → side panel shows linked KPIs and linked KRs
- Created `def.kr_sop_links` table (was missing from schema-v2, documented in `database/schema/01b-kr-sop-links-v1-20260508.sql`)
- Populated SOP→KPI links and SOP→KR links via pattern match (BD-* → SOP-001 Client Onboarding, etc.)

Cross-domain notifications NOT built yet — that's a separate Phase 7b. Audit log already captures all changes; what's missing is the inbox UI + accept/reject flow.

### Cadence dashboards — task #33 ✓
New page at `/cadence` (sidebar nav added):
- Tabs: Daily / Weekly / Monthly / Quarterly / Annual
- Per-tab: KPIs at that frequency + recent actuals + traffic light summary (green/amber/red counts)
- Visible to manager / dept_head / hr / finance / c_level / admin (employees see their own KPI dashboard instead)

### Other improvements (not separate tasks)
- New `/admin/users` page — full roster with edit role/permissions/active inline. Filters by dept/role. Search by name/email.
- Audit log page now wired with filters (schema, table, action) + expandable before/after JSON
- Topbar avatar + role display
- Push helper script `push.ps1` in repo root — run `.\push.ps1 "message"` to commit + push in one command. Auto-clears stale `.git/*.lock` files.

## Database changes applied to Supabase
1. `config.assumptions` — 42 rows seeded (FY2026 + monthly GP forecasts)
2. `def.kr_sop_links` — new table created with RLS + grants
3. `def.kpi_sop_links` — populated with ~80 SOP→KPI links
4. `def.kr_sop_links` — populated with ~25 SOP→KR links

## Files changed (this batch)

```
NEW:
  database/schema/01b-kr-sop-links-v1-20260508.sql
  database/seed-data/08-assumptions-v1-20260506.sql
  database/seed-data/09-sop-kpi-links-v1-20260508.sql
  frontend/public/brand/* (6 logo PNGs)
  frontend/src/hooks/useDashboardStats.js (assumptions hook added)
  frontend/src/pages/cadence/CadencePage.jsx
  frontend/src/pages/admin/UsersPanel.jsx
  push.ps1
  handover/session-2026-05-08-batch.md (this file)

MODIFIED:
  frontend/tailwind.config.js
  frontend/src/index.css
  frontend/index.html
  frontend/src/App.jsx (cadence + users routes)
  frontend/src/pages/Login.jsx (logo + brand colors)
  frontend/src/components/layout/Sidebar.jsx (logo + cadence nav)
  frontend/src/components/layout/Topbar.jsx (avatar + role display)
  frontend/src/components/admin/ConfigEditor.jsx (null filter fix)
  frontend/src/pages/admin/AssumptionsPanel.jsx (COMPANY tab)
  frontend/src/pages/admin/AuditLogPage.jsx (real audit table)
  frontend/src/pages/dashboards/AdminDash.jsx (Users quick link)
  frontend/src/pages/dashboards/CLevelDash.jsx (SSOT card)
  frontend/src/pages/okr/OKRListPage.jsx (Add objective)
  frontend/src/components/okr/ObjectiveCard.jsx (edit/add KR)
  frontend/src/components/okr/KRRow.jsx (edit + approve/lock)
  frontend/src/pages/kpi/KPIEntryPage.jsx (full entry form)
  frontend/src/pages/kpi/KPIDashboardPage.jsx (mine/library toggle)
  frontend/src/pages/appraisal/CycleListPage.jsx (cycle list + creator)
  frontend/src/pages/appraisal/AppraisalDetailPage.jsx (full workflow)
  frontend/src/pages/bonus/BonusViewPage.jsx (schemes + payouts)
  frontend/src/pages/sop/SOPIndexPage.jsx (SOP list + linked items)
  frontend/src/lang/en.js, ar.js (cadence nav key)
```

## To deploy: one command
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "batch: brand + phase3finish + phase3a + phase4 + phase5 + phase6 + phase7 + cadence + users + audit"
```

After ~30s Netlify rebuild, the entire app should be live with brand styling and all phases active.

## Open / deferred
- **2 remaining placeholder emails** — Mahasen Ahmed Mohamed and Shahd Ehab Amin (HR Office Support, BC level) — not in team-directory-verified-20260418.xlsx. Get from HR.

## Third batch (additional autonomous work)

### Commission run trigger ✓ (task #39)
- New SQL function `calc.fn_run_commission_bulk(p_period_id, p_scheme_filter)`:
  - Loops eligible employees per scheme (BD acquisition, AM retention, VM-Sales, OPS field, OPS-TL gates, ONB, OpEx)
  - Calls scheme-specific `calc.fn_run_*` per employee
  - Returns rows of `(scheme, payouts_created)`
- BonusViewPage now has "Run commissions for a period" card (finance/admin only) — period dropdown + scheme filter + Run button
- Confirmation prompt before running

### Phase 7b — Notifications inbox ✓ (task #40)
- New table `track.notifications` (recipient_id, kind, ref_*, title/body bilingual, link_url, read_at, dismissed_at)
- RLS policies + insert helper `track.fn_notify(...)`
- Three triggers wired:
  - **Appraisal status change** → notifies next reviewer (employee submits → manager; manager submits → dept head; dept head/calibrated → all HR)
  - **KR locked** → notifies objective owner
  - **Payout pending_approval** → notifies all finance users
- Bell icon added to Topbar with unread count badge + dropdown (last 8) + "mark all read" + link to full inbox
- `/notifications` route with full inbox: filter read/unread, per-row mark-read/dismiss/open
- Live polling every 30s

### Reporting hierarchy correction ✓
Per your verbal correction:
- Mohamed Waheed (BizOps) → reports to CCO directly
- Khaled Ahmed Metwally → reports to CCO directly
- VM-Sales (Samah, Wegdan, Mai Tarek, Samar) → report to Mohamed Hussein
- Ziad confirmed kept under Hussein

Final structure verified live in DB: Khater (CCO) has 7 directs; Hussein has 8 directs (4 OPS field + 4 VM-Sales).

### Files added in third batch
```
NEW:
  database/schema/01e-commission-bulk-runner-v1-20260508.sql
  database/schema/01f-notifications-v1-20260508.sql
  frontend/src/hooks/useNotifications.js
  frontend/src/components/layout/NotificationBell.jsx
  frontend/src/pages/NotificationsPage.jsx

MODIFIED:
  frontend/src/components/layout/Topbar.jsx (bell)
  frontend/src/pages/bonus/BonusViewPage.jsx (Run for period card)
  frontend/src/App.jsx (notifications route)
```

### Final deploy command
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "everything: brand + all phases + cascade + bulk gen + commission runner + notifications + hierarchy fix"
```

### What's truly left
1. **2 BC-tier placeholder emails** — Mahasen + Shahd; HR enters their KPIs on their behalf via the new proxy entry feature.
2. That's it — every architectural piece is now in place.

## Fourth batch (additional autonomous work)

### RLS email-lookup fix + HR proxy access ✓
- Created `public.app_user_id()` resolver — looks up def.users.id via current session email (was broken because auth.uid() != def.users.id when users are imported via roster)
- Updated `app_user_dept`, `app_user_functional_role`, `app_manages` to use it
- Fixed self-lookup policies on track.kpi_actuals, track.appraisals, track.appraisal_kpi_scores, track.appraisal_competency_scores
- Added HR write access to track.kpi_actuals (so HR can enter on behalf)
- Added Manager write access to track.kpi_actuals (so manager can correct entries for direct reports)

### HR proxy KPI entry ✓ (task #41)
KPIEntryPage now has a "Enter on behalf of" picker visible to HR/admin/manager/dept_head:
- HR/admin → see all active employees in dropdown
- Manager → see direct reports only
- Dept head → see dept members
- Self default + "Proxy mode" badge when not self
- All target-employee KPIs/actuals/save logic switches based on selection

This addresses Mahasen + Shahd: HR opens the page, picks them, enters their KPIs.

### Needs your attention widget ✓ (task #42)
New AttentionCard at top of every dashboard. Pulls live counts of:
- Self-assessment due (employee)
- Appraisals awaiting your manager review (manager)
- KRs awaiting approval (manager/dept head/admin/c_level)
- Payouts pending (finance/admin)
- Unread notifications (everyone)

Each item links directly to the relevant page.

### Files added in fourth batch
```
NEW:
  database/rls-policies/03-rls-email-lookup-fix-v1-20260508.sql
  frontend/src/hooks/usePending.js
  frontend/src/components/AttentionCard.jsx

MODIFIED:
  frontend/src/pages/kpi/KPIEntryPage.jsx (proxy picker)
  frontend/src/pages/dashboards/AdminDash.jsx       (AttentionCard)
  frontend/src/pages/dashboards/CLevelDash.jsx      (AttentionCard)
  frontend/src/pages/dashboards/EmployeeDash.jsx    (AttentionCard)
  frontend/src/pages/dashboards/ManagerDash.jsx     (AttentionCard)
  frontend/src/pages/dashboards/HRDash.jsx          (AttentionCard)
  frontend/src/pages/dashboards/FinanceDash.jsx     (AttentionCard)
  frontend/src/pages/dashboards/DeptHeadDash.jsx    (AttentionCard)
```

### To apply (two parts):

**1. Run the RLS fix in Supabase SQL Editor** (Chrome dropped during my run, so this is pending):
   `database/rls-policies/03-rls-email-lookup-fix-v1-20260508.sql`

**2. Push frontend:**
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "HR proxy entry + attention widget + RLS email-lookup fix"
```

## Fifth batch (after your push of fourth batch)

### Cycle periods admin UI ✓ (task #43)
- `/admin/cycle-periods` — full CRUD over `config.cycle_periods`
- Smart "add new" defaults to current quarter (label, start/end dates auto-computed)
- ConfigPage now links to it
- HR no longer needs SQL to add Q1 2027 (or any future period)

### Calibration view ✓ (task #44)
- `/appraisals/calibration` — pick cycle, see rating distribution histogram
- Dept head scope (own dept only); HR/admin see all
- Top-heavy warning when >30% of ratings are Exceeds/Exceptional
- Full appraisal table per cycle with self/mgr/dept/final scores + open links
- Link added to CycleListPage header

### CSV export ✓ (task #45)
- `utils/csv.js` — UTF-8 BOM (Excel-friendly with Arabic), proper quoting
- Export buttons on:
  - `/admin/users` (filtered roster)
  - `/okrs` (all visible objectives + KRs with effective targets + formula_ref)
  - `/kpis` (current view: My KPIs or Library)
  - `/bonus` (current view: pending/approved/mine)
  - `/appraisals/calibration` (cycle appraisals)

### Files added (fifth batch)
```
NEW:
  frontend/src/pages/admin/CyclePeriodsPanel.jsx
  frontend/src/pages/appraisal/CalibrationPage.jsx
  frontend/src/utils/csv.js

MODIFIED:
  frontend/src/App.jsx (routes for cycle-periods + calibration)
  frontend/src/pages/admin/ConfigPage.jsx (links to Users + Cycle Periods)
  frontend/src/pages/admin/UsersPanel.jsx (CSV)
  frontend/src/components/okr/OKRTree.jsx (CSV)
  frontend/src/pages/kpi/KPIDashboardPage.jsx (CSV)
  frontend/src/pages/bonus/BonusViewPage.jsx (CSV)
  frontend/src/pages/appraisal/CycleListPage.jsx (Calibration link)
```

### Deploy:
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "cycle periods admin + calibration view + CSV export everywhere"
```

## Sixth batch (most recent autonomous work)

### Bulk CSV import for KPI actuals ✓ (task #46)
- `/kpis/import` (HR/admin/manager/dept_head only)
- Inline minimal CSV parser (UTF-8 BOM aware, proper quoting)
- Required headers: `employee_email,kpi_id,period_label,actual_value` + optional `comment`
- Preview first 10 rows before run
- Upsert behavior (updates if row exists, else inserts)
- Reports ok/skipped/errors with detailed error list
- Import button on `/kpis` page header (Export and Import buttons side by side — full data loop)

### KPI trend chart ✓ (task #47)
- `/kpis/:kpiId/trend` — click any KPI ID in the dashboard to open
- Inline SVG bar chart of actuals over time (no chart library — zero deps)
- Bars colored by ratio: green ≥1.0, amber ≥0.7, rose below
- Dashed green target reference line (uses effective_target from calc.vw_kpi_target — picks up cascade from assumptions)
- Employee scope picker for HR/manager
- Full values table below chart

### PIP (Performance Improvement Plan) workflow ✓ (task #48)
- New table `track.pips` with RLS (employee/manager/HR/admin scope)
- Auto-trigger on appraisal close: when final_rating falls in a `triggers_pip=true` band, opens a 90-day PIP and notifies employee + manager + HR
- `/pips` page (manager/dept_head/HR/admin sidebar entry):
  - Filter: Active / Closed / All
  - Inline edit of plan_text, target_close_date
  - Close as success / fail (records outcome + closed_by + timestamp)
  - Status badges
- Sidebar nav item

### Manager team rollup ✓ (task #49)
- `/team` page (manager/dept_head/HR/admin/c_level)
- Sidebar entry "My Team"
- Scope: manager → direct reports; dept_head → dept; HR/admin/c_level → all
- Per-row stats: KPIs assigned, actuals submitted, RAG counts (green/amber/red), days since last entry (rose if >14 days), last appraisal status + final rating
- Quick "enter →" link that opens KPI entry pre-selected for that employee (?employee=id query string)
- Summary tiles at top: total actuals, RAG totals

### Files added (sixth batch)
```
NEW:
  database/schema/01g-pip-workflow-v1-20260508.sql
  frontend/src/pages/kpi/KPIBulkImportPage.jsx
  frontend/src/pages/kpi/KPITrendPage.jsx
  frontend/src/pages/PIPsPage.jsx
  frontend/src/pages/TeamPage.jsx

MODIFIED:
  frontend/src/App.jsx (3 new routes)
  frontend/src/components/layout/Sidebar.jsx (PIPs + Team)
  frontend/src/pages/kpi/KPIDashboardPage.jsx (Import button, KPI ID → trend link)
  frontend/src/pages/kpi/KPIEntryPage.jsx (reads ?employee=id query param for pre-fill)
  frontend/src/lang/en.js / ar.js (team, pips nav keys)
```

### Pending SQL to apply in Supabase:
1. `database/rls-policies/03-rls-email-lookup-fix-v1-20260508.sql`
2. `database/schema/01g-pip-workflow-v1-20260508.sql`

### Final deploy:
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "bulk import + trend chart + PIP + team rollup"
```

## Seventh batch — BCF v8 migration + UX polish

### BCF v8 (Hussein TL Gates 5→6) ✓ (task #52)
Per Khater handoff 2026-05-12:
- Added VM Gate 3: "Avg Active Bidders ≥4" — 1,000 EGP, linked to CO3.KR3
- Hussein TL monthly cap 5,500 → 6,500
- Bumped scheme refs: VM-COMM-v7 → v8, OPS-TL-GATES-v7 → v8
- Gate 3 already renamed to "Report Compliance" during v6 KPI import (no-op now)
- VM Gate 2 already named "Auction Price Quality" during v6 KPI import (no-op now)
- Frontend CompensationInputsPanel updated to show v8 labels + new cap

### Cmd+K command palette ✓ (task #50)
- Press `Ctrl+K` / `⌘K` anywhere → instant search palette
- Searches users (name/email), KPIs (id/name), OKRs (code/title), navigation shortcuts
- Fuzzy-match scoring, arrow keys + Enter to navigate
- Subtle "🔍 Ctrl+K" hint in Topbar

### Help / quick-reference ✓ (task #51)
- `/help` route — role-keyed reference card with deep links
- Bilingual (EN/AR)
- Linked from Topbar (small `?` icon)

## Pending Supabase application
1. `database/rls-policies/03-rls-email-lookup-fix-v1-20260508.sql`
2. `database/schema/01g-pip-workflow-v1-20260508.sql`
3. `database/seed-data/11-bcf-v8-r2-migration-20260512.sql`  ← time-versioned, future r3/r4/v9 safe

### Files added (seventh batch)
```
NEW:
  database/seed-data/11-bcf-v8-migration-20260512.sql
  frontend/src/components/CommandPalette.jsx
  frontend/src/pages/HelpPage.jsx

MODIFIED:
  frontend/src/components/layout/AppShell.jsx (mount palette)
  frontend/src/components/layout/Topbar.jsx (Ctrl+K hint + Help link)
  frontend/src/pages/admin/CompensationInputsPanel.jsx (v8 labels)
  frontend/src/App.jsx (/help route)
```

### Final deploy:
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "bcf v8 + Cmd+K palette + Help page"
```

## At this point — system is operationally complete

Every workflow has end-to-end UX. Recap of capabilities for any user:
- **Employee**: login → see "Needs attention" → enter KPI actuals → see trend → submit self-assessment → see appraisal progress + final rating
- **Manager**: see team rollup with RAG / latest entries → enter on behalf of any direct report → approve OKRs → review appraisals → see PIPs
- **Dept Head**: dept-wide team rollup → calibration view with distribution histogram → dept OKR approval
- **HR**: open new cycle periods → open appraisal cycles → bulk-generate appraisals → CSV import for monthly close → sign off appraisals → manage users + permissions → see PIPs
- **Finance**: see commission schemes → run commission for period → approve/hold/reject payouts → export CSV
- **C-Level**: company-wide assumptions (SSOT) → company OKR overview → headcount by dept → cycle status
- **Admin (you)**: everything above + audit log with diff view + notifications inbox


---

## Second batch (after first push) — additional autonomous work

### Phase 4b — true cascade ✓ (task #34)
- Added `formula_ref` column to `def.key_results` and `def.kpis`
- Mapped 23 KRs and 11 KPIs to their assumption keys
- New views `calc.vw_kr_target` and `calc.vw_kpi_target` surface effective target (assumption value if formula_ref set, else stored static)
- KR rows in OKR tree now display effective target with `↻ formula_ref` annotation when derived
- **Change GP_TARGET in Admin → Assumptions and CO1.KR1 instantly reflects it.** True cascade is live.

### Bulk appraisal generation ✓ (task #36)
- New SQL function `track.fn_generate_appraisals_for_cycle(p_cycle_id uuid)`:
  - Iterates active employees, skips those who already have an appraisal in this cycle
  - Creates `track.appraisals` row (status='draft')
  - Pre-populates `appraisal_kpi_scores` for all KPIs assigned to employee's functional_role (with the proper weight + weight_type)
  - Pre-populates `appraisal_competency_scores` for all six competencies
  - Returns count generated
- "generate" button on each open cycle row in CycleListPage calls the function
- Confirmation prompt before running

### OKR progress display ✓ (task #37)
- `useOKRProgress()` hook returns `{ rows, byObj }` for direct lookup
- `useKRTargets()` hook reads `calc.vw_kr_target`
- ObjectiveCard now shows progress bar + percentage in header (when calc data exists)
- KRRow shows the effective target (highlighted in accent color when derived from assumption, with formula_ref label)

### Files added in second batch
```
NEW:
  database/schema/01c-formula-ref-cascade-v1-20260508.sql
  database/schema/01d-bulk-appraisal-gen-v1-20260508.sql

MODIFIED:
  frontend/src/hooks/useOKRs.js (useOKRProgress + useKRTargets)
  frontend/src/components/okr/OKRTree.jsx (pass progress + krTargets)
  frontend/src/components/okr/ObjectiveCard.jsx (progress bar + krTargets prop)
  frontend/src/components/okr/KRRow.jsx (effective target display)
  frontend/src/pages/appraisal/CycleListPage.jsx (generate button)
```

### Database changes (second batch)
1. `def.key_results.formula_ref` and `def.kpis.formula_ref` columns added
2. `calc.vw_kr_target` and `calc.vw_kpi_target` views created
3. `track.fn_generate_appraisals_for_cycle(uuid)` function created

### Updated deploy command
```powershell
cd D:\Mrkoon\MrkoonCCoWPr\mrkoon-okr-build
.\push.ps1 "phase 4b cascade + bulk appraisal gen + OKR progress display"
```

### Reporting structure correction (2026-05-08)
Per Khater clarification:
- **Mohamed Waheed (BizOps)** reports directly to CCO (Khater), not to Hussein
- **Khaled Ahmed Metwally (OPS specialist)** reports directly to CCO, not to Hussein
- **VM-Sales (Samah, Wegdan, Mai Tarek, Samar)** now report to Hussein (was Khater)
- **Ziad Moataz** confirmed kept under Hussein

Final structure:
- Khater (CCO) → 7 direct: Mohamed Hussein, Amany Shams, Yassin Hesham, Ali Hassan, Ismael Zakaria, Khaled Metwally, Mohamed Waheed
- Mohamed Hussein (OPS TL) → 8 direct: Sayed, Ziad, Mohamed Mousa, Youssef (4 OPS field) + Samah, Wegdan, Mai Tarek, Samar (4 VM-Sales)

### What changes when you change an assumption now
1. Open `/admin/assumptions` → COMPANY tab
2. Edit `gp_target_annual` from 30000000 → 35000000, save
3. Refresh `/okrs`: CO1.KR1 instantly shows 35M (highlighted accent, with `↻ gp_target_annual`)
4. Same for retention, GMV, all 23 mapped KRs
5. KPIs that share the same assumption (e.g. retention) also update on `/kpis`

That is the true cascade you asked about.

## Known caveats
- Your account (c_level + admin) has no `functional_role_id` — so KPI Entry shows "no functional role assigned" (correct behavior; admins don't enter KPIs themselves)
- Appraisal records are not yet auto-generated — need bulk gen or per-employee creation
- Brand: hex codes are from the v1 guidelines (marked "pending Khater confirmation"). If your design source has different exact values, update `tailwind.config.js`.
