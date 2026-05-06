# Test Cases — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02

Manual + automated. Automated tests with Vitest (unit) + Playwright (e2e) added in project v2 per build-standards. v1 manual.

## A. Auth & navigation

| TC | Steps | Expected |
|---|---|---|
| TC-A01 | Open login, enter email, request magic link | Email arrives; link opens dashboard for that role |
| TC-A02 | Click logout | Session cleared; redirect to /login |
| TC-A03 | Toggle EN→AR | dir=rtl, all strings translated, layout mirrors |
| TC-A04 | Toggle AR→EN | dir=ltr, restored |
| TC-A05 | Refresh page | Language preference persists |

## B. Role isolation (CRITICAL — Phase 1 gate)

| TC | Login as | Action | Expected |
|---|---|---|---|
| TC-B01 | Employee A | Query other employees' KPIs | 0 rows |
| TC-B02 | Manager M | Query report's KPIs | only direct reports' rows |
| TC-B03 | Manager M | Query non-report's KPIs | 0 rows |
| TC-B04 | Dept Head Ops | Query Marketing dept KPIs | 0 rows |
| TC-B05 | HR | Query salary fields | 0 rows or error (depends on policy choice — error preferred) |
| TC-B06 | Finance | Update appraisal score | Rejected |
| TC-B07 | C-Level | Update any data | Rejected |
| TC-B08 | Employee | Read audit log | Rejected |
| TC-B09 | Admin | Any operation | Allowed |
| TC-B10 | Anon | Any operation | Rejected (default deny) |

## C. OKR module

| TC | Steps | Expected |
|---|---|---|
| TC-C01 | Employee sets individual OKR with no parent KR link | Save blocked, error message |
| TC-C02 | Employee sets, links, submits; manager approves | OKR locked for period |
| TC-C03 | OKR cascade tree visible at company / dept / individual levels | All levels render with progress |
| TC-C04 | Close period | Period archived; cannot edit |
| TC-C05 | Reopen period (admin) | Edits allowed again, audit logged |

## D. KPI module

| TC | Steps | Expected |
|---|---|---|
| TC-D01 | Employee enters KPI actual within range | Saved, score computed, traffic light updated |
| TC-D02 | Employee enters out-of-range | Warning, override comment required |
| TC-D03 | Period closed | Entry blocked |
| TC-D04 | KPI dashboard loads with 50 employees × 12 months | Under 1s |
| TC-D05 | KPI-033 (per-VM) shows in dashboard but not in scoring | Visible, weight=0 confirmed |
| TC-D06 | KPI traffic light: green if ratio≥1, amber if ratio≥0.7, red if <0.7 (or per KPI rule) | Correct |

## E. Appraisal module

| TC | Steps | Expected |
|---|---|---|
| TC-E01 | Monthly: employee submits + manager acknowledges | Both timestamps recorded |
| TC-E02 | Quarterly: self-rate "Below Meets" without comment | Submit blocked |
| TC-E03 | Quarterly: manager rates all KPIs + competencies | Save succeeds |
| TC-E04 | Calibration view: 5 reports' ratings all 5.0 | Banner suggests review |
| TC-E05 | Annual: 4 quarters present | Auto-aggregate to final rating |
| TC-E06 | Annual: 1 quarter missing | Banner "incomplete", cannot lock |
| TC-E07 | Annual lock with rating 2.4 | PIP record created |
| TC-E08 | Performance Gates removed from form | Confirmed not present |
| TC-E09 | History view: prior years' appraisals visible to employee | All approved appraisals listed |

## F. Bonus & commission engine

### BD (BD-COMM-Q-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F01 | rep accounts=12, GP=1,000,000 | base per scale, no kicker (accts<13) |
| TC-F02 | rep accounts=13, GP=300,000 | base + kicker = 5% × 300,000 = 15,000 |
| TC-F03 | rep accounts=13, GP=299,999 | base + no kicker |
| TC-F04 | rep accounts=32, GP=2,000,000 | base computed for 30 (cap), kicker = 5% × 2M = 100,000 |
| TC-F05 | rep accounts=12 (50% of 25), rate scale lookup | 400 EGP/account → 4,800 base |
| TC-F06 | rep accounts=25 (100%) | 1,000 EGP/account → 25,000 base |
| TC-F07 | rep accounts=30 (120%) | 1,400 EGP/account → 42,000 base |

### AM (AM-COMM-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F10 | 40 active clients | retention 8,000 |
| TC-F11 | 4 reactivations all qualified | 2,000 (capped 1,500) |
| TC-F12 | 3 reactivations, 2 retained months not met | 0 |
| TC-F13 | 5 upsells | 1,500 |
| TC-F14 | 2 referrals | 2,000 |
| TC-F15 | portfolio avg 2.5 txns/client/month | volume 1,500 |
| TC-F16 | 40 clients + 80% transacting | portfolio 1,000 |
| TC-F17 | 39 clients + 80% transacting | portfolio 0 |

### VM (VM-COMM-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F20 | auction 4 bidders, attendance 6 | 500 + 50×3 = 650 |
| TC-F21 | auction 1 bidder, attendance 6 | 500 |
| TC-F22 | auction 4 bidders, attendance 5 | 250 (floor not met) |
| TC-F23 | auction 0 bidders | 250 |

### Operations (OPS-BONUS-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F30 | zero-issue 95%, on-time 90%, 25 loadings, 1 referral | 750+200+2,000+ floor(25/10)*1,000 = 4,950 |
| TC-F31 | zero-issue 94% | 0 quality |

### Hussein TL (OPS-TL-GATES-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F40 | All 5 gates pass | 5,500 (cap) |
| TC-F41 | 3 of 5 pass: Ops1+Ops2+VM1 | 4,000 |
| TC-F42 | 0 of 5 | 0 |

### Onboarding (ONB-COMM-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F50 | 30 merchants in month | 30×150=4,500 |
| TC-F51 | 40 merchants in month | 5,000 (cap) |
| TC-F52 | clawback eligible | −150 |

### Quarterly OpEx (OPEX-QTR-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F60 | L3, score 2.99 | 0 |
| TC-F61 | L3, score 3.0 | floor of band 10% × salary |
| TC-F62 | L3, score 5.0 | top of band 20% × salary |
| TC-F63 | L1, score 4.0 | mid scaled within 5–10% |

### Annual (ANNUAL-BONUS-v7)
| TC | Inputs | Expected |
|---|---|---|
| TC-F70 | OpEx, annual rating 4.0 | full band scaled |
| TC-F71 | COGS, annual rating 4.0 | only non-target portion (SOP 30%, Reporting 20%) |

## G. SOP↔KPI

| TC | Steps | Expected |
|---|---|---|
| TC-G01 | Open SOP-001 page | Lists KPI-005, 006, 007 |
| TC-G02 | Open KPI-005 page | Lists SOP-001 |
| TC-G03 | Add new KPI linked to SOP-003 | Both pages reflect |

## H. Audit

| TC | Steps | Expected |
|---|---|---|
| TC-H01 | Insert KPI actual | One audit row |
| TC-H02 | Update KPI actual | One audit row with before/after |
| TC-H03 | Attempt DELETE on audit.events | Rejected for all roles |
| TC-H04 | Audit log filter by employee | Filtered correctly |

## I. Integrations

| TC | Steps | Expected |
|---|---|---|
| TC-I01 | Run BD commission with CRM env unset | Edge Function returns `{ mode: 'dormant', synced: 0 }`; banner visible |
| TC-I02 | Set CRM env, redeploy, run | mode=`live`, synced=N |
| TC-I03 | ERP env unset | dormant |

## J. Bilingual + RTL + mobile

| TC | Steps | Expected |
|---|---|---|
| TC-J01 | Switch to AR | All text Arabic, dir=rtl |
| TC-J02 | Switch to EN | All text English, dir=ltr |
| TC-J03 | Mobile 375px appraisal | Usable, no horizontal scroll |
| TC-J04 | Tablet 768px dashboard | Usable, charts responsive |

## K. Performance

| TC | Steps | Expected |
|---|---|---|
| TC-K01 | 50 emp × 36 KPI × 36 months seed | Dashboard < 1s |
| TC-K02 | Annual aggregation for full company | < 5s |
| TC-K03 | Audit log 100k rows | Search < 2s with filter |
