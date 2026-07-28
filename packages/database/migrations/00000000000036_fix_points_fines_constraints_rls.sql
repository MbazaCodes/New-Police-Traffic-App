-- ============================================================
-- Migration 36: Fix Points & Fines constraint + RLS errors
-- Fixes 3 errors from migration 35 on plain PostgreSQL (VPS):
--
-- ERROR 1: points_rules check constraint limits points_deducted to 3.0 max
--          but migration 35 inserts values up to 15.0 (arrests etc.)
--          Fix: ALTER constraint to allow up to 20.0
--
-- ERROR 2: points_deductions table also has DECIMAL(3,1) + same constraint
--          Fix: widen column + constraint
--
-- ERROR 3: auth_uid() is PostgreSQL (VPS)-only, does not exist on plain PostgreSQL
--          The RLS policies referencing auth_uid() failed to create.
--          Fix: Drop broken policies (if any partial), DISABLE RLS on
--          citizen_fines, citizen_conduct_points, driver_points (matching
--          pattern from migration 27), and GRANT to service_role + postgres.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. Fix points_rules check constraint
-- ═══════════════════════════════════════════════════════════════
-- Drop old constraint that limits to 3.0, replace with wider range
ALTER TABLE points_rules DROP CONSTRAINT IF EXISTS points_rules_points_deducted_check;
ALTER TABLE points_rules ADD CONSTRAINT points_rules_points_deducted_check
  CHECK (points_deducted >= 0.5 AND points_deducted <= 20.0);

-- ═══════════════════════════════════════════════════════════════
-- 2. Re-insert the enhanced points rules that failed in migration 35
-- ═══════════════════════════════════════════════════════════════
-- (The constraint was too narrow before, so these rows were rejected)
INSERT INTO points_rules (offense, offense_sw, points_deducted, applies_to, offense_type, severity) VALUES
  -- Arrest / Kukamatwa
  ('Arrest - Minor Offense',        'Kukamatwa - Kosa Dogo',             5.0,  'both', 'citation', 'major'),
  ('Arrest - Serious Offense',      'Kukamatwa - Kosa Kubwa',            10.0, 'both', 'citation', 'severe'),
  ('Arrest - Violent Crime',        'Kukamatwa - Jinai la Udhalimu',     15.0, 'both', 'citation', 'severe'),
  -- Misconduct / Tabia Mbaya
  ('Misconduct - Disorderly',       'Tabia Mbaya - Kusababisha Fujo',    3.0,  'both', 'warning',  'medium'),
  ('Misconduct - Harassment',       'Tabia Mbaya - Kudhulumu',           5.0,  'both', 'warning',  'major'),
  ('Misconduct - Threatening',      'Tabia Mbaya - Kuogopesha',          4.0,  'both', 'warning',  'major'),
  -- Involved in bad situation
  ('Involved in Incident',          'Mwingiliano wa Tukio Mbaya',        2.0,  'both', 'warning',  'minor'),
  ('Involved in Accident',          'Mwingiliano wa Ajali',              3.0,  'driver','citation', 'medium'),
  -- Failure to comply
  ('Failure to Appear in Court',    'Kutotokea Mahakamani',              5.0,  'both', 'citation', 'major'),
  ('Bail Violation',               'Kuvunja Masharti ya Kuachilia',     8.0,  'both', 'citation', 'severe'),
  -- Citizen-specific
  ('Public Nuisance',              'Fujo ya Umma',                      2.0,  'citizen','warning', 'minor'),
  ('Trespassing',                  'Kuingia Bila Ruhusa',               3.0,  'citizen','warning', 'medium')
ON CONFLICT (offense) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 3. Fix points_deductions column width + constraint
-- ═══════════════════════════════════════════════════════════════
-- The column was DECIMAL(3,1) which can only hold up to 9.9
-- Change to DECIMAL(5,1) to hold values up to 999.9
ALTER TABLE points_deductions ALTER COLUMN points_deducted TYPE DECIMAL(5,1);
-- Drop old constraint (if any) and add new one matching the wider range
ALTER TABLE points_deductions DROP CONSTRAINT IF EXISTS points_deductions_points_deducted_check;
ALTER TABLE points_deductions ADD CONSTRAINT points_deductions_points_deducted_check
  CHECK (points_deducted >= 0.5 AND points_deducted <= 20.0);

-- ═══════════════════════════════════════════════════════════════
-- 4. Fix RLS — Drop broken auth_uid() policies, disable RLS, grant access
-- ═══════════════════════════════════════════════════════════════
-- Migration 35 tried to create RLS policies using auth_uid(), a
-- PostgreSQL (VPS)-only function. On plain PostgreSQL (VPS deployment),
-- auth_uid() does not exist, so these policies failed.
--
-- Following the established pattern from migration 27 (citizen_rls_fix),
-- we DISABLE RLS on these tables and grant full access to service_role
-- and postgres, since the application handles authorization in the
-- Next.js API layer (requirePermission, getServerSession, etc.).

-- Drop any partially-created or existing auth_uid() policies
DROP POLICY IF EXISTS citizen_read_own_fines ON citizen_fines;
DROP POLICY IF EXISTS citizen_read_own_points ON citizen_conduct_points;
DROP POLICY IF EXISTS citizen_read_own_driver_points ON driver_points;

-- Disable RLS on citizen-facing tables (app handles auth in API layer)
ALTER TABLE citizen_fines          DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_conduct_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE driver_points          DISABLE ROW LEVEL SECURITY;
ALTER TABLE points_deductions      DISABLE ROW LEVEL SECURITY;
ALTER TABLE points_rules           DISABLE ROW LEVEL SECURITY;
ALTER TABLE conduct_reports        DISABLE ROW LEVEL SECURITY;

-- Grant full access to service_role and postgres (same pattern as migration 27)
GRANT ALL ON citizen_fines          TO service_role, postgres;
GRANT ALL ON citizen_conduct_points TO service_role, postgres;
GRANT ALL ON driver_points          TO service_role, postgres;
GRANT ALL ON points_deductions      TO service_role, postgres;
GRANT ALL ON points_rules           TO service_role, postgres;
GRANT ALL ON conduct_reports        TO service_role, postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;

-- ═══════════════════════════════════════════════════════════════
-- 5. Verify: Re-run annual points seed (for 2026 if not yet populated)
-- ═══════════════════════════════════════════════════════════════
-- This ensures existing citizens get points records for current year
SELECT reset_annual_points();

-- ═══════════════════════════════════════════════════════════════
-- 6. Comments
-- ═══════════════════════════════════════════════════════════════
COMMENT ON TABLE citizen_fines IS 'Fines/citations issued by officers — traffic, citizen, penalty, bail, service types';
COMMENT ON TABLE citizen_conduct_points IS 'Citizen good-conduct demerit points: 100% start, reduce on arrest/warning/misconduct';
COMMENT ON TABLE driver_points IS 'Driver demerit points: 100% start, reduce on citation/warning/arrest/misconduct';
