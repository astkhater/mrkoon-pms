# User Flows — Mrkoon OKR/KPI/Appraisal Web App
Version: 1
Date: 2026-05-02

## Flow 1 — Period kickoff (OKRs)
```
HR opens period (cycle_periods) ──► employees notified ──► employee sets individual OKRs
                                                              │
                                                              ▼
                                       manager reviews ──► approve OR request changes
                                                              │
                                                              ▼
                                                      OKRs lock for period
                                                              │
                                                              ▼
                                              cascade visible in OKR tree
```

## Flow 2 — Monthly check-in
```
HR opens monthly cycle ──► employee fills check-in (text + progress) ──► submit
                                                                            │
                                                                            ▼
                                              manager reads, comments, acknowledges
                                                                            │
                                                                            ▼
                                                            cycle row closes for emp
```

## Flow 3 — Quarterly review
```
Quarter closes ──► HR opens quarterly cycle ──► employee self-rates per KPI + competencies
                                                              │
                                                              ▼
                                                       submit to manager
                                                              │
                                                              ▼
                                       manager rates, comments, submits to dept head
                                                              │
                                                              ▼
                                  dept head opens calibration view (all team ratings)
                                                              │
                                                              ▼
                            approve OR request re-rate (any rep) ──► loops back
                                                              │
                                                              ▼
                                  quarterly score locks → feeds annual aggregator
                                                              │
                                                              ▼
                              OpEx employees: quarterly bonus calc unlocked
```

## Flow 4 — Annual appraisal
```
Q4 closed (4 quarters in year) ──► system auto-aggregates Q1..Q4 → final draft
                                                              │
                                                              ▼
                                       employee adds annual reflection
                                                              │
                                                              ▼
                                      manager adds annual comment
                                                              │
                                                              ▼
                                           dept head approves
                                                              │
                                                              ▼
                                         HR final sign-off
                                                              │
                                                              ▼
                                annual rating locked → triggers:
                                  - if < 2.5 → PIP record
                                  - else → annual bonus run
```

## Flow 5 — BD commission run (per quarter)
```
Quarter closes ──► finance opens "Commission runs" ──► select BD-COMM-Q-v7
                                                              │
                                                              ▼
                          system fetches each BD rep's accounts + GP from track.events
                                                              │
                                                              ▼
                              calc.fn_run_commission produces breakdown per rep
                                                              │
                                                              ▼
                          finance reviews each rep's step-by-step breakdown
                                                              │
                                                              ▼
                                approve run → status = approved
                                                              │
                                                              ▼
                                  trigger crm-sync edge function:
                                    if dormant → no-op (banner remains)
                                    if live → push to CRM commission_events
                                                              │
                                                              ▼
                                  payouts available for export to payroll
```

## Flow 6 — Add a new KPI
```
Admin opens "KPIs" → "Add" ──► fill: id, name EN/AR, formula, freq, owner, target, thresholds
                                                              │
                                                              ▼
                              link to SOP(s), KR(s), commission scheme(s)
                                                              │
                                                              ▼
                              set role weights (role × weight matrix)
                                                              │
                                                              ▼
                                          save
                                                              │
                                                              ▼
                              KPI live: shows in dashboards per weights;
                              audit row written; visible in seed-state count
```

## Flow 7 — Activate CRM integration
```
Admin obtains CRM Supabase URL + anon key
        │
        ▼
Set CRM_SUPABASE_URL and CRM_SUPABASE_ANON_KEY in Supabase Edge Function secrets
        │
        ▼
Edge function reads env at next invocation; mode flips dormant → live
        │
        ▼
Run a test commission run; verify CRM commission_events receives event
        │
        ▼
Banner "CRM not connected" disappears in Finance dashboard
```

## Flow 8 — Language toggle
```
Any user → click EN/AR toggle in topbar
        │
        ▼
LangContext.setLang(target)
        │
        ▼
<html dir="rtl|ltr" lang="ar|en"> updates
        │
        ▼
All components re-render with t(key) from new lang file
        │
        ▼
Selection persisted in localStorage('mrkoon_lang')
```

## Flow 9 — Audit query (HR/Admin)
```
Open Audit log ──► filter (actor / table / date range / action)
                                                              │
                                                              ▼
                                        view rows; click row to expand before/after JSON
                                                              │
                                                              ▼
                                                    export CSV (optional)
```
No write path — audit is immutable.
