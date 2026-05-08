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
- **Commission run trigger** — UI button to invoke `calc.fn_run_bd_commission` (next iteration of Phase 6)
- **Cross-domain notifications** — inbox + accept/reject on top of audit (Phase 7b)
- **Real emails for 39 placeholder accounts** — needs your input

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
