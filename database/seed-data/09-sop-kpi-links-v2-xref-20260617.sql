-- =================================================================
-- Mrkoon PMS — SOP ↔ KPI Link Population v2 (authoritative xref)
-- Date: 2026-06-17
-- Source: mrkoon-chro/sop/sop-kpi-xref-v1.xlsx (CURRENT-VERSIONS.md)
--
-- Supersedes 09-sop-kpi-links-v1-20260508.sql (coarse first pass).
-- v2 = SSOT for SOP↔KPI links. 48 SOP→KPI rows from the authoritative
-- xref (which itself is synced to okr-kpi-framework-v6).
--
-- Counts: 48 kpi_sop_links rows, 27 kr_sop_links rows
-- =================================================================

begin;

-- Wipe legacy auto-links so this xref is the single source.
-- (Manual links added via Admin → SOPs panel will be re-added after this seed.)
delete from def.kpi_sop_links;
delete from def.kr_sop_links;

-- 1. KPI ↔ SOP
insert into def.kpi_sop_links (sop_id, kpi_id) values
  ('SOP-001', 'BD-01'),
  ('SOP-001', 'BD-02'),
  ('SOP-001', 'BD-03'),
  ('SOP-001', 'BD-04'),
  ('SOP-001', 'BD-05'),
  ('SOP-001', 'BD-07'),
  ('SOP-002', 'ONB-01'),
  ('SOP-002', 'ONB-02'),
  ('SOP-002', 'ONB-03'),
  ('SOP-002', 'ONB-04'),
  ('SOP-002', 'ONB-05'),
  ('SOP-003', 'VM-01'),
  ('SOP-003', 'VM-02'),
  ('SOP-003', 'VM-03'),
  ('SOP-003', 'VM-04'),
  ('SOP-003', 'VM-05'),
  ('SOP-003', 'VM-06'),
  ('SOP-004', 'FIN-SR-01'),
  ('SOP-004', 'FIN-ACC-02'),
  ('SOP-005', 'OPS-FIELD-02'),
  ('SOP-005', 'OPS-FIELD-03'),
  ('SOP-005', 'OPS-TL-03'),
  ('SOP-005', 'FIN-ACC-02'),
  ('SOP-006', 'OPS-FIELD-01'),
  ('SOP-006', 'OPS-FIELD-05'),
  ('SOP-006', 'OPS-FIELD-03'),
  ('SOP-007', 'MKT-TL-01'),
  ('SOP-007', 'MKT-TL-02'),
  ('SOP-007', 'MKT-TL-03'),
  ('SOP-007', 'MKT-TL-07'),
  ('SOP-007', 'MKT-CC-01'),
  ('SOP-008', 'AM-01'),
  ('SOP-008', 'AM-02'),
  ('SOP-008', 'AM-03'),
  ('SOP-008', 'AM-04'),
  ('SOP-008', 'AM-05'),
  ('SOP-008', 'AM-06'),
  ('SOP-008', 'AM-07'),
  ('SOP-008', 'AM-08'),
  ('SOP-009', 'OPS-BIZ-01'),
  ('SOP-009', 'OPS-BIZ-02'),
  ('SOP-009', 'OPS-BIZ-03'),
  ('SOP-009', 'VM-05'),
  ('SOP-010', 'OPS-FIELD-01'),
  ('SOP-010', 'OPS-FIELD-02'),
  ('SOP-010', 'OPS-FIELD-03'),
  ('SOP-010', 'OPS-FIELD-05'),
  ('SOP-003', 'VM-GATE-03')
on conflict do nothing;

-- 2. KR ↔ SOP (resolved from xref's KR Ref column → def.key_results.code)
insert into def.kr_sop_links (sop_id, kr_id)
select v.sop_id, kr.id
from (values
  ('SOP-001', 'KR1.1'),
  ('SOP-001', 'KR1.3'),
  ('SOP-001', 'KR1.4'),
  ('SOP-002', 'KR3.1'),
  ('SOP-003', 'KR1.4'),
  ('SOP-003', 'KR3.2'),
  ('SOP-003', 'KR3.4'),
  ('SOP-004', 'KR4.4'),
  ('SOP-005', 'KR2.4'),
  ('SOP-005', 'KR3.4'),
  ('SOP-005', 'KR3.5'),
  ('SOP-005', 'KR4.4'),
  ('SOP-006', 'KR3.4'),
  ('SOP-006', 'KR3.5'),
  ('SOP-007', 'KR3.3'),
  ('SOP-007', 'KR5.1'),
  ('SOP-007', 'KR5.2'),
  ('SOP-007', 'KR5.4'),
  ('SOP-008', 'KR2.1'),
  ('SOP-008', 'KR2.2'),
  ('SOP-008', 'KR2.3'),
  ('SOP-008', 'KR2.4'),
  ('SOP-009', 'KR3.1'),
  ('SOP-009', 'KR3.4'),
  ('SOP-009', 'KR3.5'),
  ('SOP-010', 'KR3.4'),
  ('SOP-010', 'KR3.5')
) as v(sop_id, kr_code)
join def.key_results kr on kr.code = v.kr_code
on conflict do nothing;

notify pgrst, 'reload schema';

commit;

-- Verification:
-- select count(*) from def.kpi_sop_links;  -- should be ~48
-- select count(*) from def.kr_sop_links;   -- should be ~10–15 distinct sop/KR pairs
