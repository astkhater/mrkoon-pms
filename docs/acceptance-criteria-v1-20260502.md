# Acceptance Criteria — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02

One row per story/feature. Status updated to PASS/FAIL in Phase 8 QA.

| ID | Feature / Story | Acceptance criterion | Status |
|---|---|---|---|
| AC-001 | Magic link login | User receives email; clicking link logs into role-specific dashboard within 30s. | TBD |
| AC-002 | Language toggle | EN/AR toggle switches direction (LTR/RTL) and translates all visible strings instantly without page reload; selection persists across sessions. | TBD |
| AC-003 | Role routing | Employee routes to EmployeeDash; Manager to ManagerDash; Dept Head to DeptHeadDash; HR to HRDash; Finance to FinanceDash; C-Level to CLevelDash; Admin to AdminDash. | TBD |
| AC-004 | Role isolation (RLS) | Logged in as each role, querying tables outside permission returns 0 rows; no error leak indicating row count. | TBD |
| AC-005 | Salary visibility | Salary visible only to Admin and Finance; HR/Manager/Dept Head/Employee/C-Level cannot see any salary. | TBD |
| AC-100 | Employee KPI view | Employee sees only own KPIs; traffic light reflects actual/target ratio per KPI rule. | TBD |
| AC-101 | KPI actual entry | Employee can save actual; period must be open; out-of-range values warn but allow override with comment. | TBD |
| AC-102 | OKR cascade | Individual OKRs must link to a parent dept KR; save blocked otherwise. | TBD |
| AC-103 | Manager OKR approval | OKRs cannot lock until manager approves. | TBD |
| AC-104 | Monthly check-in | Employee submits comment; manager acknowledges; both timestamps recorded. | TBD |
| AC-105 | Quarterly self-rating | Employee can self-rate per KPI; below "Meets" requires comment. | TBD |
| AC-106 | Manager quarterly rating | Manager rates each KPI and competency; both EN and AR labels render correctly. | TBD |
| AC-107 | Calibration view | Dept Head sees all team ratings in single view; can compare distributions. | TBD |
| AC-108 | Annual aggregation | Annual score = (KPI avg × 0.7) + (Competency avg × 0.2) + (Manager avg × 0.1); verified to 2 decimals against handover example. | TBD |
| AC-109 | Annual missing quarter | If any quarter missing, annual flagged `incomplete` with banner; cannot lock. | TBD |
| AC-110 | Below 2.5 → PIP | Annual final rating < 2.5 creates `pip_records` entry on lock. | TBD |
| AC-111 | Bonus breakdown | Step-by-step line breakdown shows every input, formula, intermediate, and final number for every commission/bonus run. | TBD |
| AC-200 | BD commission scale | Test rep at 50% achievement → 400 EGP/account; at 100% → 1,000 EGP/account; at 120% → 1,400 EGP/account. | TBD |
| AC-201 | BD cap | Rep with 32 accounts gets payout for 30 only. | TBD |
| AC-202 | BD GP Kicker | Rep with 13 accts AND 300,000 GP → 5% kicker; rep with 12 accts AND 1M GP → no kicker; rep with 14 accts AND 250K GP → no kicker. | TBD |
| AC-203 | AM 6-component | All 6 components compute independently; component conditions verified per handover §4. | TBD |
| AC-204 | VM attendance floor | Auction with 1 bidder but attendance 5 → non-success 250; with attendance 6 → success 500. | TBD |
| AC-205 | VM extra bidders | Auction with 4 bidders, attendance 6 → 500 + 50×3 = 650. | TBD |
| AC-206 | Hussein TL cap | All 5 gates pass → sum 5,500 (cap); cap not exceeded. | TBD |
| AC-207 | Onb clawback | Merchant onboarded in M, no auction in 30d → −150 in M+1. | TBD |
| AC-208 | OpEx min score | Quarterly score 2.99 → no OpEx bonus; 3.00 → bonus floor of band. | TBD |
| AC-209 | OpEx band scaling | L3 employee, score 3.5 → mid of L3 band (10–20%) = 15% of salary, ±tolerance. | TBD |
| AC-300 | SOP→KPI lookup | SOP-001 detail page lists KPI-005, 006, 007. | TBD |
| AC-301 | KPI→SOP lookup | KPI-005 detail page lists SOP-001. | TBD |
| AC-400 | Audit insert | Any insert in `def` or `track` writes one row in `audit.events` with before=null, after=row. | TBD |
| AC-401 | Audit update | Update writes one row with before=old, after=new. | TBD |
| AC-402 | Audit immutability | DELETE on `audit.events` rejected for all roles. | TBD |
| AC-500 | CRM dormant | With `CRM_SUPABASE_URL` unset, crm-sync returns `{ ok: true, mode: 'dormant', synced: 0 }` without error; banner shows "CRM not connected". | TBD |
| AC-501 | ERP dormant | Same as AC-500 for erp-sync. | TBD |
| AC-600 | Bilingual coverage | Lighthouse-style scan: 0 hardcoded UI strings outside lang files. | TBD |
| AC-601 | RTL integrity | Switch to AR; all icons mirror correctly; text alignment reverses; no overflow. | TBD |
| AC-602 | Mobile appraisal | Quarterly form usable end-to-end on 375×667 viewport; all fields reachable, no horizontal scroll. | TBD |
| AC-700 | Performance: 50 employees × 3 years | KPI dashboard query under 1s; full annual aggregation under 5s. | TBD |
| AC-800 | Empty state copy | Every empty list shows reason (e.g., "No KPIs assigned for this period yet — wait for HR to open the cycle"). | TBD |
| AC-801 | Destructive confirm | Every delete or close action prompts "Are you sure? [confirm phrase]" and offers undo where reversible. | TBD |
