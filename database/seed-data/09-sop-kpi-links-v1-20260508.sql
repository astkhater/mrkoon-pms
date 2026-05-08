-- =================================================================
-- Mrkoon PMS — SOP ↔ KPI / KR Link Population v1
-- Date: 2026-05-08
-- Source: pattern match between SOP categories and KPI prefixes
--
-- Links each SOP to the KPIs and KRs it governs. This is a coarse
-- first pass — refine via Admin → SOPs panel as actual SOP content lands.
-- =================================================================

-- Wipe prior auto-links (preserve manual ones if any are added later)
delete from def.kpi_sop_links;
delete from def.kr_sop_links;

-- SOP-001 Client Onboarding → BD KPIs + CO1 KRs
insert into def.kpi_sop_links (sop_id, kpi_id) values
  ('SOP-001','BD-01'), ('SOP-001','BD-02'), ('SOP-001','BD-03'),
  ('SOP-001','BD-04'), ('SOP-001','BD-05'), ('SOP-001','BD-06'), ('SOP-001','BD-07')
on conflict do nothing;
insert into def.kr_sop_links (sop_id, kr_id)
select 'SOP-001', kr.id from def.key_results kr where kr.code in ('CO1.KR3','CO1.KR4','CO1.KR5')
on conflict do nothing;

-- SOP-002 Merchant Onboarding → ONB KPIs
insert into def.kpi_sop_links (sop_id, kpi_id) values
  ('SOP-002','ONB-01'), ('SOP-002','ONB-02'), ('SOP-002','ONB-03'), ('SOP-002','ONB-04'), ('SOP-002','ONB-05')
on conflict do nothing;
insert into def.kr_sop_links (sop_id, kr_id)
select 'SOP-002', kr.id from def.key_results kr where kr.code in ('CO3.KR2','CO4.KR3')
on conflict do nothing;

-- SOP-003 Auction Management → OPS-TL + OPS-GATE + VM
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-003', id from def.kpis where id like 'OPS-TL-%' or id like 'OPS-GATE-%' or id like 'VM-%'
on conflict do nothing;
insert into def.kr_sop_links (sop_id, kr_id)
select 'SOP-003', kr.id from def.key_results kr where kr.code in ('CO3.KR1','CO3.KR2','CO3.KR3')
on conflict do nothing;

-- SOP-004 Payment & Collection → FIN-SR / FIN-ACC KPIs
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-004', id from def.kpis where id like 'FIN-%'
on conflict do nothing;

-- SOP-005 Dispute Resolution → AM-06 + FIN-ACC-05
insert into def.kpi_sop_links (sop_id, kpi_id) values
  ('SOP-005','AM-06'), ('SOP-005','FIN-ACC-05')
on conflict do nothing;

-- SOP-006 Logistics → OPS-FIELD + OPS-TL
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-006', id from def.kpis where id like 'OPS-FIELD-%' or id like 'OPS-TL-%'
on conflict do nothing;

-- SOP-007 Marketing Operations → all MKT-*
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-007', id from def.kpis where id like 'MKT-%'
on conflict do nothing;
insert into def.kr_sop_links (sop_id, kr_id)
select 'SOP-007', kr.id from def.key_results kr where kr.code like 'CO4.KR%'
on conflict do nothing;

-- SOP-008 Account Management → AM-* KPIs + CO2 KRs
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-008', id from def.kpis where id like 'AM-%'
on conflict do nothing;
insert into def.kr_sop_links (sop_id, kr_id)
select 'SOP-008', kr.id from def.key_results kr where kr.code like 'CO2.KR%'
on conflict do nothing;

-- SOP-009 Listing Creation & Quality Review → OPS-BIZ + OPS-FIELD-02
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-009', id from def.kpis where id like 'OPS-BIZ-%'
on conflict do nothing;
insert into def.kpi_sop_links (sop_id, kpi_id) values ('SOP-009','OPS-FIELD-02')
on conflict do nothing;

-- SOP-010 Fulfilment & Deal Closure → OPS-FIELD + AM-08
insert into def.kpi_sop_links (sop_id, kpi_id)
select 'SOP-010', id from def.kpis where id like 'OPS-FIELD-%'
on conflict do nothing;
insert into def.kpi_sop_links (sop_id, kpi_id) values ('SOP-010','AM-08')
on conflict do nothing;

-- Verification:
-- select sop_id, count(*) from def.kpi_sop_links group by sop_id order by sop_id;
-- select sop_id, count(*) from def.kr_sop_links group by sop_id order by sop_id;
