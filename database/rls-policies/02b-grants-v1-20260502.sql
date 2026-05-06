-- =================================================================
-- Mrkoon OKR Webapp — Required GRANTs for the Data API roles
-- Date: 2026-05-02
-- Run AFTER 01-schema-v2 + 02-rls-policies-v3.
--
-- Why: Even with RLS enabled, the `authenticated` and `anon` roles
-- need explicit USAGE on each schema and table privileges; otherwise
-- queries fail with "permission denied for schema X" before RLS
-- ever evaluates.
--
-- This file was retro-added after Phase 1 isolation test surfaced
-- the gap. RLS still controls row visibility — these grants only
-- open the door to the schema.
-- =================================================================

grant usage on schema config to authenticated, anon;
grant usage on schema def    to authenticated, anon;
grant usage on schema track  to authenticated, anon;
grant usage on schema calc   to authenticated, anon;
grant usage on schema audit  to authenticated, anon;

grant select, insert, update, delete on all tables in schema config to authenticated;
grant select, insert, update, delete on all tables in schema def    to authenticated;
grant select, insert, update, delete on all tables in schema track  to authenticated;
grant select on all tables in schema calc  to authenticated;
grant select on all tables in schema audit to authenticated;

grant select on all tables in schema config to anon;
grant select on all tables in schema def    to anon;

-- Future tables: same grants applied automatically
alter default privileges in schema config grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema def    grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema track  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema calc   grant select on tables to authenticated;
alter default privileges in schema audit  grant select on tables to authenticated;

-- Functions: RLS helper functions in public + calculators in calc
grant execute on all functions in schema public to authenticated, anon;
grant execute on all functions in schema calc   to authenticated;
alter default privileges in schema public grant execute on functions to authenticated, anon;
alter default privileges in schema calc   grant execute on functions to authenticated;
