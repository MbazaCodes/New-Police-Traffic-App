-- ============================================================
-- Migration 020: PRODUCTION CLEAN SLATE
-- TZ Police Digital Platform
-- Truncates ALL seeded / mock data.
-- After this, admins create everything fresh via the UI.
-- ============================================================

-- Disable triggers temporarily so truncate cascades cleanly
SET session_replication_role = 'replica';

-- ── Clear in correct FK order ─────────────────────────────────
TRUNCATE TABLE
  fine_penalty_log,
  citizen_fines,
  bail_requests,
  audit_logs,
  vehicle_inspections,
  pf3_forms,
  patrols,
  alerts,
  citations,
  incidents,
  arrests,
  warnings,
  missing_records,
  devices,
  licenses,
  drivers,
  citizens,
  vehicles,
  assignments,
  officers,
  posts,
  stations,
  regions,
  otp_codes,
  users
CASCADE;

-- Re-enable triggers
SET session_replication_role = 'DEFAULT';

-- Reset sequences used for human-readable IDs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'citizen_fine_seq') THEN
    ALTER SEQUENCE citizen_fine_seq RESTART WITH 1001;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'bail_seq') THEN
    ALTER SEQUENCE bail_seq RESTART WITH 1001;
  END IF;
END $$;

-- ── Confirm ────────────────────────────────────────────────────
DO $$
DECLARE
  tbl TEXT;
  cnt BIGINT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','stations','posts','officers','assignments',
    'vehicles','citizens','citations','incidents',
    'patrols','alerts','arrests','warnings'
  ]
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
    RAISE NOTICE 'Table % — % rows (should be 0)', tbl, cnt;
  END LOOP;
END $$;
