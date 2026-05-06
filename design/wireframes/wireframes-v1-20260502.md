# Wireframes — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02
Style: text-based ASCII for layout intent. Final visual treatment per Mrkoon brand assets.

---

## Common shell (all authenticated pages, desktop ≥1280px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Mrkoon logo]              [breadcrumb: Home / Module / Page]   [👤] │
│                                                                  EN│AR│
├────────┬─────────────────────────────────────────────────────────────┤
│        │                                                              │
│ NAV    │   PAGE CONTENT                                              │
│ Dash   │                                                              │
│ OKRs   │                                                              │
│ KPIs   │                                                              │
│ Apprl  │                                                              │
│ Bonus  │                                                              │
│ SOPs   │                                                              │
│ Admin* │                                                              │
│ Audit  │                                                              │
│        │                                                              │
└────────┴─────────────────────────────────────────────────────────────┘
        * = role-conditional sidebar items
```

In RTL: Sidebar flips to right; breadcrumb arrows reverse; logo/profile mirror.

Mobile (<768): sidebar collapses to top hamburger; nav items appear in drawer.

---

## 1. Login

```
┌────────────────────────────────────────────────┐
│                                                │
│                  [Mrkoon Logo]                 │
│                                                │
│            Sign in to Mrkoon Performance       │
│                                                │
│        ┌──────────────────────────────────┐    │
│        │ Email                            │    │
│        │ ┌──────────────────────────────┐ │    │
│        │ │ name@mrkoon.com              │ │    │
│        │ └──────────────────────────────┘ │    │
│        │                                  │    │
│        │ [  Send magic link  ]            │    │
│        │                                  │    │
│        │ Need help? Contact admin         │    │
│        └──────────────────────────────────┘    │
│                                                │
│              EN | AR                           │
└────────────────────────────────────────────────┘
```

---

## 2. Employee Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│ Welcome back, Yassin                                                 │
│ Period: Q2 2026 (open)                                               │
├──────────────────────────────────────────────────────────────────────┤
│  My OKRs progress             │  My KPIs (this period)              │
│  ┌─ Obj 1: Acquire ────┐      │  KPI-001  Target  Actual  Status    │
│  │ KR1.1 ████░ 80%     │      │  KPI-005    25      18    🟡        │
│  │ KR1.2 ███░░ 60%     │      │  KPI-008    95%     93%   🟡        │
│  └─────────────────────┘      │  KPI-013   ≥80%     85%   🟢        │
│                               │  ...                                 │
│  [ Set / edit OKRs ]          │  [ Enter actuals ]                  │
├──────────────────────────────────────────────────────────────────────┤
│  Appraisal status                Bonus estimate                      │
│  ▢ Monthly check-in due Jun 5   This quarter (estimate, not final): │
│  ▢ Quarterly review Q2         12,400 EGP — see breakdown ▸         │
│  ▢ Annual cycle 2026 (open)                                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. OKR Tree (cascade view)

```
Company OKRs — Q2 2026
├─ Obj 1: Acquire 75 clients ───────────────────── 60%
│  ├─ KR1.1: 25 BD acquisitions ────────────────── 80%
│  │   ├─ Yassin (BD) ─ 20/25 ──────────────────── 80%
│  │   ├─ Salah (BD) ─ 18/25 ───────────────────── 72%
│  │   └─ ...
│  ├─ KR1.2: 50 marketing-sourced ───────────────── 40%
│  └─ KR1.3: ...
├─ Obj 2: Retain 95% active clients ────────────── 92%
│  └─ ...
└─ Department: Operations (Ops O-KRs) ─────────── 70%
   ├─ O-Obj1: Auction efficiency ─────────────── 75%
   │  ├─ O-KR1.1: avg bidders ≥4 ────────────── 80%
   │  └─ ...
   └─ ...
```

Each row is collapsible; weight badge on each KR; click → drill to detail.

---

## 4. KPI entry (employee, monthly/quarterly)

```
┌─────────────────────────────────────────────────────────────┐
│ Enter KPI actuals — Period: May 2026                        │
├─────────────────────────────────────────────────────────────┤
│ KPI-005  New clients onboarded this month                   │
│ Target: 5  Frequency: Monthly  Owner: BD                    │
│ Formula: count(distinct client_id) per BD per month         │
│ SOP: SOP-001 Client Onboarding ▸                            │
│                                                             │
│ Actual:  [  4  ]  Evidence: [paste link or note]            │
│ Score auto: 0.80  Traffic light: 🟡 (amber threshold 0.70)  │
│                                                             │
│ [ Save ]   [ Save & next ]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Quarterly appraisal form (employee self-rate)

```
┌─────────────────────────────────────────────────────────────┐
│ Quarterly self-assessment — Q1 2026 — Yassin (BD)           │
├─────────────────────────────────────────────────────────────┤
│ Section 1: KPI ratings (self)                               │
│                                                             │
│ KPI-005  Onboardings (target 25, actual 22)                 │
│   ⚪ Unsatisfactory  ⚪ Needs Improvement                    │
│   🔘 Meets           ⚪ Exceeds  ⚪ Exceptional              │
│   Comment: [optional unless < Meets]                        │
│                                                             │
│ KPI-008  Retention (target 95%, actual 96%)                 │
│   ⚪ Unsatisfactory  ⚪ Needs Improvement                    │
│   ⚪ Meets           🔘 Exceeds  ⚪ Exceptional              │
│   Comment: ...                                              │
│ ...                                                         │
├─────────────────────────────────────────────────────────────┤
│ Section 2: Competencies (self)                              │
│ Ownership      ⚪ ⚪ 🔘 ⚪ ⚪                                │
│ Collaboration  ⚪ ⚪ 🔘 ⚪ ⚪                                │
│ Quality        ⚪ ⚪ 🔘 ⚪ ⚪                                │
│ ...                                                         │
├─────────────────────────────────────────────────────────────┤
│ Section 3: Self reflection (free text)                      │
│ [textarea]                                                  │
├─────────────────────────────────────────────────────────────┤
│ [ Save draft ]   [ Submit to manager ]                      │
└─────────────────────────────────────────────────────────────┘
```

Note: rating scale shows label, not just dots/numbers. Below "Meets" → comment required.

---

## 6. Manager calibration view

```
┌──────────────────────────────────────────────────────────────────┐
│ Calibration — BD team — Q1 2026                                  │
├──────────────────────────────────────────────────────────────────┤
│ Distribution                                                     │
│ Exceptional ▌▌▌▌                                                 │
│ Exceeds     ▌▌▌▌▌▌▌                                              │
│ Meets       ▌▌▌▌▌▌▌▌▌▌                                            │
│ Needs Imp.  ▌                                                    │
│ Unsat.                                                           │
├──────────────────────────────────────────────────────────────────┤
│ Per employee                                                     │
│ Yassin    KPI 4.2   Comp 4.0   Mgr 4.1   Final 4.15  Exceeds    │
│ Salah     KPI 3.8   Comp 3.5   Mgr 4.0   Final 3.74  Exceeds    │
│ Shams     KPI 3.0   Comp 3.2   Mgr 3.0   Final 3.04  Meets      │
│ ...                                                              │
│                                                                  │
│ ⚠️  Distribution skews high — review before approving           │
│                                                                  │
│ [ Request re-rate ]   [ Approve all ]   [ Export ]              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Bonus calculator breakdown (Finance / Employee read)

```
┌────────────────────────────────────────────────────────────────┐
│ BD-COMM-Q-v7 — Q1 2026 — Yassin                                │
│ Status: Pending finance approval                               │
├────────────────────────────────────────────────────────────────┤
│ Inputs                                                         │
│   Accounts closed:      18                                     │
│   Quarterly target:     25                                     │
│   Achievement:          72%                                    │
│   Realized GP:          420,000 EGP                            │
│                                                                │
│ Step 1 — Rate lookup                                           │
│   72% achievement → 700 EGP/account (from rate scale)          │
│                                                                │
│ Step 2 — Base commission                                       │
│   18 × 700 = 12,600 EGP  (cap not exceeded; cap = 30 accts)    │
│                                                                │
│ Step 3 — GP Kicker eligibility                                 │
│   Accounts ≥ 13?  YES (18)                                     │
│   GP ≥ 300,000?   YES (420,000)                                │
│   Kicker = 5% × 420,000 = 21,000 EGP                           │
│                                                                │
│ TOTAL: 12,600 + 21,000 = 33,600 EGP                            │
├────────────────────────────────────────────────────────────────┤
│ [ Approve ]  [ Hold ]   (Finance only)                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. HR Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Cycles                                                           │
│  Q1 2026 quarterly   ████████████░ 92% complete    [Open]       │
│  May 2026 monthly    █████████░░░░ 70% complete    [Open]       │
│  Annual 2026         ░░░░░░░░░░░░░  0% (Q4 awaited)             │
│                                                                  │
│ Overdue                                                          │
│  Salah — Q1 quarterly self-assessment (due May 5)               │
│  ...                                                             │
│                                                                  │
│ [ Open new cycle ]   [ Cycle settings ]                         │
├──────────────────────────────────────────────────────────────────┤
│ Audit log (recent)                                               │
│  ...                                                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Finance Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Pending payouts                                                  │
│  BD-COMM-Q-v7 — Q1 2026   4 reps  total 145,200 EGP   [Review] │
│  AM-COMM-v7 — Apr 2026    1 rep   total 14,500 EGP    [Review] │
│  VM-COMM-v7 — Apr 2026    2 reps  total 11,650 EGP    [Review] │
│  OPS-BONUS-v7 — Apr 2026  3 reps  total 18,900 EGP    [Review] │
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│ Approved (last 30d)                                              │
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│ Integrations                                                     │
│  CRM: 🔴 Not connected   ERP: 🔴 Not connected                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. C-Level Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Company OKR progress                                             │
│  Obj 1 Acquire        ████████░░ 60%                            │
│  Obj 2 Retain         █████████▌ 92%                            │
│  Obj 3 Auction eff    ███████░░░ 70%                            │
│  Obj 4 Pay/Coll       █████░░░░░ 48%                            │
│  Obj 5 Marketing      ███████░░░ 70%                            │
│  Obj 6 GP target      ██████░░░░ 60%  (18M of 30M YTD)          │
├──────────────────────────────────────────────────────────────────┤
│ KPI health                                                       │
│  Green 22 | Amber 9 | Red 5  (of 36)                             │
├──────────────────────────────────────────────────────────────────┤
│ Cycle completion                Bonus YTD                        │
│  Q1 closed 100%                  Total: 1.4M EGP                 │
│  Q2 monthly 70%                  By dept chart                   │
├──────────────────────────────────────────────────────────────────┤
│ Concentration risk alert (informational, not OKR)               │
│  Top 3 clients = 47% of revenue ▸                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Admin — Config (KPI library, schemes, users)

```
┌──────────────────────────────────────────────────────────────────┐
│ Config                                                           │
│  ▸ KPIs (36)                                                     │
│  ▸ Objectives & Key Results                                      │
│  ▸ SOPs (10)                                                     │
│  ▸ Commission schemes (8)                                        │
│  ▸ Compensation rates                                            │
│  ▸ Targets (Target-300 anchors)                                  │
│  ▸ Thresholds                                                    │
│  ▸ Salary bands                                                  │
│  ▸ Rating bands                                                  │
│  ▸ Cycle periods                                                 │
│  ▸ Roles & departments                                           │
│  ▸ Users                                                         │
└──────────────────────────────────────────────────────────────────┘
```

Click any → CRUD table with audit trail per row.

---

## 12. SOP detail

```
┌──────────────────────────────────────────────────────────────────┐
│ SOP-001 Client Onboarding                                        │
│ Owner: BD Lead   Cycle: Quarterly  Last reviewed: 2026-04-15     │
├──────────────────────────────────────────────────────────────────┤
│ Linked KPIs                                                      │
│  KPI-005  New clients onboarded                                  │
│  KPI-006  Onboarding cycle time                                  │
│  KPI-007  Onboarding quality score                               │
│                                                                  │
│ Linked KRs                                                       │
│  KR1.4 — Onboarding throughput                                  │
│  KR2.1 — Activation                                             │
├──────────────────────────────────────────────────────────────────┤
│ Document: open in viewer ▸                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Design notes

- Empty states: every list shows a one-line reason + next-step CTA per ux-standards.
- Skeletons not spinners on load.
- All destructive actions: confirm modal + undo where reversible (ux-standards rule).
- Traffic lights use color + icon + text label (not color alone — accessibility).
- Charts via Chart.js; one library across app.
- No DEC codes anywhere user-visible (per handover).
- Performance Gates not present in any appraisal form (handover decision 12).
