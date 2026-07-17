-- ===== TZ Police — Convenience Seed Script =====
-- Run via:  supabase db reset --use-seed  OR  psql -f supabase/seed/seed.sql
--
-- This file simply re-runs the seed migration (00000000000004_seed_data.sql)
-- in a single transaction. The migration is idempotent (ON CONFLICT DO
-- NOTHING) so this is safe to invoke repeatedly against a live database.

\set ON_ERROR_STOP on
BEGIN;
\i 'supabase/migrations/00000000000004_seed_data.sql'
COMMIT;

-- Final sanity counts (informational)
SELECT 'stations'   AS t, COUNT(*) FROM stations
UNION ALL SELECT 'users',        COUNT(*) FROM users
UNION ALL SELECT 'officers',     COUNT(*) FROM officers
UNION ALL SELECT 'posts',        COUNT(*) FROM posts
UNION ALL SELECT 'assignments',  COUNT(*) FROM assignments
UNION ALL SELECT 'vehicles',     COUNT(*) FROM vehicles
UNION ALL SELECT 'drivers',      COUNT(*) FROM drivers
UNION ALL SELECT 'citizens',     COUNT(*) FROM citizens
UNION ALL SELECT 'citations',    COUNT(*) FROM citations
UNION ALL SELECT 'incidents',    COUNT(*) FROM incidents
UNION ALL SELECT 'patrols',      COUNT(*) FROM patrols
UNION ALL SELECT 'alerts',       COUNT(*) FROM alerts
UNION ALL SELECT 'pf3_forms',    COUNT(*) FROM pf3_forms
UNION ALL SELECT 'inspections',  COUNT(*) FROM vehicle_inspections;
