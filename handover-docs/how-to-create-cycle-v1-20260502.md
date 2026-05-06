# How to create / close an appraisal cycle
Date: 2026-05-02

## Create
1. Sign in as HR (or Admin).
2. Sidebar → HR → Cycles → "Open new cycle".
3. Fill:
   - **Type**: monthly / quarterly / annual.
   - **Period**: select existing `cycle_periods` row or create new.
   - **Deadline**: date.
4. Save → cycle status = `open`. Employees notified (logged in audit).

## Close
1. Sidebar → HR → Cycles → select cycle.
2. Verify completion rate.
3. Click "Close cycle".
4. Confirm with phrase (per ux-standards destructive confirmation).
5. Cycle status = `closed`.
6. **Quarterly close** → feeds `calc.vw_appraisal_annual_score` aggregator.
7. **Annual close** → triggers PIP records for ratings < 2.5 and unlocks ANNUAL-BONUS-v7 calc.

## Reopen
- Admin only. Set status back to `open` via SQL or Admin UI. Audit row written.

## Direct SQL fallback
```sql
insert into config.cycle_periods (type, label, start_date, end_date, status)
values ('monthly', 'Jun 2026', '2026-06-01', '2026-06-30', 'open');

insert into track.appraisal_cycles (type, period_id, status, deadline)
values ('monthly', '<period_uuid>', 'open', '2026-07-05');
```
