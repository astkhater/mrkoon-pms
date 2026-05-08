-- =================================================================
-- Mrkoon PMS — Schema Addendum v1 (kr_sop_links)
-- Date: 2026-05-08
--
-- This table was missing from schema-v2; SOPIndexPage.jsx queries it.
-- Already applied to staging Supabase. This file documents the change.
-- =================================================================

create table if not exists def.kr_sop_links (
  kr_id      uuid not null references def.key_results(id) on delete cascade,
  sop_id     text not null references def.sops(id)        on delete cascade,
  created_at timestamptz, updated_at timestamptz, created_by uuid, updated_by uuid,
  primary key (kr_id, sop_id)
);
create index if not exists kr_sop_links_sop_idx on def.kr_sop_links(sop_id, kr_id);

alter table def.kr_sop_links enable row level security;
create policy "kr_sop_links read"  on def.kr_sop_links for select to authenticated using (true);
create policy "kr_sop_links write" on def.kr_sop_links for all to authenticated
  using (public.app_is_admin() or public.app_is_hr())
  with check (public.app_is_admin() or public.app_is_hr());

grant usage on schema def to anon, authenticated;
grant select, insert, update, delete on def.kr_sop_links to authenticated;
