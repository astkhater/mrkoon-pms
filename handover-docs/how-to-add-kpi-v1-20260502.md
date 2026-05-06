# How to add a new KPI
Date: 2026-05-02

## Via Admin UI (recommended)
1. Sign in as Admin.
2. Sidebar → Admin → Configuration → KPIs.
3. Click "Add KPI".
4. Fill:
   - **ID**: `KPI-NNN` (next sequential, e.g., KPI-037).
   - **Name (EN)** and **Name (AR)** — required.
   - **Frequency** — daily / weekly / monthly / quarterly / annual.
   - **Owner role** — primary role; functional sub-role optional.
   - **Target value** + **unit**.
   - **Threshold amber** and **threshold red** for traffic light.
   - **Formula text** (human-readable) and **formula engine ref** (JSON).
   - **SOP ref** — pick one or more.
   - **KR ref** — pick parent key result.
   - **Commission scheme ref** — if KPI feeds a scheme.
   - **Dashboard-only** flag — if KPI shows in dashboards but does not score (weight 0).
5. Save.
6. In role weights tab: assign weight per functional role (must sum to 1.0 per role).
7. Audit row written automatically.

## Direct SQL (admin emergency only)
```sql
insert into def.kpis (id, name_en, name_ar, frequency, owner_role_code, target_value, weight_default, sop_ref)
values ('KPI-037','New KPI','مؤشر جديد','monthly','employee', 100, 0.0, 'SOP-003');

insert into def.kpi_role_weights (kpi_id, functional_role_id, weight)
values ('KPI-037', '<uuid>', 0.10);

insert into def.kpi_sop_links (kpi_id, sop_id) values ('KPI-037','SOP-003');
```

## Validation
- Check the Admin → KPIs grid: new row visible with name and SOP link.
- Click into the KPI: SOP appears under "Linked SOPs".
- Open the linked SOP: KPI appears under "Linked KPIs".
- Login as the assigned role: KPI shows in dashboard if weight > 0; or in dashboard-only section if dashboard_only = true.
