-- Migration 35: Points & Fines Enhancements
-- 1) citizen_id column on citizen_fines (for non-traffic fines by officer/post)
-- 2) Enhanced points deduction for arrests, incidents, misconducts
-- 3) Auto-create points records for new citizens
-- 4) citizen_fines linked to officer, station, citation_type
-- 5) RLS policies for citizen_fines citizen read access

-- ═══════════════════════════════════════════════════════════════
-- 1. Add citizen_id to citizen_fines (for officer/post citing any citizen)
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'citizen_fines' AND column_name = 'citizen_id') THEN
    ALTER TABLE citizen_fines ADD COLUMN citizen_id UUID REFERENCES citizens(id);
  END IF;
END $$;

-- Add fine_type column to distinguish traffic vs citizen fines
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'citizen_fines' AND column_name = 'fine_type') THEN
    ALTER TABLE citizen_fines ADD COLUMN fine_type TEXT DEFAULT 'traffic'
      CHECK (fine_type IN ('traffic','citizen','penalty','bail','service'));
  END IF;
END $$;

-- Add citation_type: who issued it (officer-traffic, officer-post, officer-general)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'citizen_fines' AND column_name = 'citation_type') THEN
    ALTER TABLE citizen_fines ADD COLUMN citation_type TEXT DEFAULT 'traffic'
      CHECK (citation_type IN ('traffic','post','general','cid','command'));
  END IF;
END $$;

-- Indexes for faster citizen fine lookup
CREATE INDEX IF NOT EXISTS idx_citizen_fines_cid ON citizen_fines(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_type ON citizen_fines(fine_type);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_status ON citizen_fines(status);

-- ═══════════════════════════════════════════════════════════════
-- 2. Enhanced Points Rules — Add arrest, incident, misconduct rules
-- ═══════════════════════════════════════════════════════════════
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
-- 3. Auto-deduct on arrest insert (new trigger)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_deduct_on_arrest()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_offense VARCHAR;
BEGIN
  -- Determine offense severity for points deduction
  v_offense := CASE
    WHEN NEW.severity = 'severe' OR NEW.crime_type ILIKE '%violence%' OR NEW.crime_type ILIKE '%murder%'
      THEN 'Arrest - Violent Crime'
    WHEN NEW.severity = 'major' OR NEW.crime_type ILIKE '%theft%' OR NEW.crime_type ILIKE '%robbery%'
      THEN 'Arrest - Serious Offense'
    ELSE 'Arrest - Minor Offense'
  END;

  -- Deduct from citizen points
  IF NEW.citizen_id IS NOT NULL THEN
    PERFORM deduct_points(
      NEW.citizen_id, v_offense, 'citation', 'citizen',
      NULL, NULL, NEW.officer_id, NEW.officer_name, NEW.location
    );
    -- Also deduct from driver points if the citizen is a driver
    PERFORM deduct_points(
      NEW.citizen_id, v_offense, 'citation', 'driver',
      NULL, NULL, NEW.officer_id, NEW.officer_name, NEW.location
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_deduct_arrest ON arrests;
CREATE TRIGGER tg_auto_deduct_arrest
  AFTER INSERT ON arrests FOR EACH ROW EXECUTE FUNCTION auto_deduct_on_arrest();

-- ═══════════════════════════════════════════════════════════════
-- 4. Auto-deduct on incident insert (when citizen is involved)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_deduct_on_incident()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.citizen_id IS NOT NULL AND NEW.incident_type IS NOT NULL THEN
    PERFORM deduct_points(
      NEW.citizen_id, 'Involved in Incident', 'warning', 'both',
      NULL, NULL, NEW.officer_id, NEW.officer_name, NEW.location
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_deduct_incident ON incidents;
CREATE TRIGGER tg_auto_deduct_incident
  AFTER INSERT ON incidents FOR EACH ROW EXECUTE FUNCTION auto_deduct_on_incident();

-- ═══════════════════════════════════════════════════════════════
-- 5. Auto-create points record for new citizens
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_create_citizen_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM NOW())::INT;
BEGIN
  -- Create citizen conduct points
  INSERT INTO citizen_conduct_points (citizen_id, year, points_start, points_current, status)
  VALUES (NEW.id, v_year, 100, 100, 'good')
  ON CONFLICT (citizen_id, year) DO NOTHING;

  -- Create driver points if the citizen has a license
  IF NEW.license_no IS NOT NULL AND NEW.license_no != '' THEN
    INSERT INTO driver_points (citizen_id, year, points_start, points_current, status)
    VALUES (NEW.id, v_year, 100, 100, 'good')
    ON CONFLICT (citizen_id, year) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_create_points ON citizens;
CREATE TRIGGER tg_auto_create_points
  AFTER INSERT ON citizens FOR EACH ROW EXECUTE FUNCTION auto_create_citizen_points();

-- ═══════════════════════════════════════════════════════════════
-- 6. Auto-deduct when a fine is created (for non-traffic fines)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION auto_deduct_on_fine()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.citizen_id IS NOT NULL AND NEW.offense IS NOT NULL THEN
    -- For citizen-type fines, deduct from citizen points
    IF NEW.fine_type = 'citizen' OR NEW.fine_type = 'penalty' THEN
      PERFORM deduct_points(
        NEW.citizen_id, NEW.offense, 'citation', 'citizen',
        NULL, NULL, NEW.officer_id::UUID, NEW.officer_name, NEW.plate
      );
    END IF;
    -- For traffic-type fines, deduct from driver points
    IF NEW.fine_type = 'traffic' AND NEW.driver_nida IS NOT NULL THEN
      -- Find citizen by NIDA
      PERFORM deduct_points(
        NEW.citizen_id, NEW.offense, 'citation', 'driver',
        NULL, NULL, NEW.officer_id::UUID, NEW.officer_name, NEW.plate
      );
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_deduct_fine ON citizen_fines;
CREATE TRIGGER tg_auto_deduct_fine
  AFTER INSERT ON citizen_fines FOR EACH ROW EXECUTE FUNCTION auto_deduct_on_fine();

-- ═══════════════════════════════════════════════════════════════
-- 7. Enhanced get_points_summary — also return percentage and status label
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_points_summary(p_citizen_id UUID, p_year INT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_year    INT := COALESCE(p_year, EXTRACT(YEAR FROM NOW())::INT);
  v_dp      driver_points;
  v_ccp     citizen_conduct_points;
  v_deducts JSONB;
BEGIN
  SELECT * INTO v_dp  FROM driver_points          WHERE citizen_id = p_citizen_id AND year = v_year;
  SELECT * INTO v_ccp FROM citizen_conduct_points WHERE citizen_id = p_citizen_id AND year = v_year;

  SELECT jsonb_agg(jsonb_build_object(
    'date', deduction_date, 'offense', offense,
    'points_deducted', points_deducted, 'source_type', source_type,
    'deduction_type', deduction_type,
    'officer_name', officer_name, 'location', location
  ) ORDER BY deduction_date DESC) INTO v_deducts
  FROM points_deductions WHERE citizen_id = p_citizen_id AND year = v_year;

  RETURN jsonb_build_object(
    'citizen_id',     p_citizen_id,
    'year',           v_year,
    'citizen_points', COALESCE(
      jsonb_build_object(
        'current', v_ccp.points_current,
        'start', v_ccp.points_start,
        'deducted', v_ccp.points_deducted,
        'incidents', v_ccp.incidents_count,
        'status', v_ccp.status,
        'last_incident', v_ccp.last_incident_date,
        'percentage', ROUND(v_ccp.points_current * 100.0 / v_ccp.points_start)
      ), '{"current":100,"start":100,"deducted":0,"incidents":0,"status":"good","percentage":100}'::JSONB
    ),
    'driver_points',  CASE WHEN v_dp IS NOT NULL THEN
      jsonb_build_object(
        'current', v_dp.points_current,
        'start', v_dp.points_start,
        'deducted', v_dp.points_deducted,
        'violations', v_dp.violations_count,
        'status', v_dp.status,
        'last_violation', v_dp.last_violation_date,
        'percentage', ROUND(v_dp.points_current * 100.0 / v_dp.points_start)
      ) ELSE NULL END,
    'deductions',     COALESCE(v_deducts, '[]'::JSONB)
  );
END; $$;

-- ═══════════════════════════════════════════════════════════════
-- 8. Citizen can read own fines
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN
  CREATE POLICY "citizen_read_own_fines" ON citizen_fines FOR SELECT TO authenticated
    USING (
      citizen_id IN (SELECT citizen_id FROM citizen_accounts WHERE id = auth_uid())
      OR driver_nida IN (SELECT nida FROM citizen_accounts WHERE id = auth_uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Citizen can read own points
DO $$ BEGIN
  CREATE POLICY "citizen_read_own_points" ON citizen_conduct_points FOR SELECT TO authenticated
    USING (
      citizen_id IN (SELECT citizen_id FROM citizen_accounts WHERE id = auth_uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "citizen_read_own_driver_points" ON driver_points FOR SELECT TO authenticated
    USING (
      citizen_id IN (SELECT citizen_id FROM citizen_accounts WHERE id = auth_uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 9. Comments
-- ═══════════════════════════════════════════════════════════════
COMMENT ON COLUMN citizen_fines.citizen_id IS 'Direct link to citizen record for non-traffic fines issued by officer/post';
COMMENT ON COLUMN citizen_fines.fine_type IS 'Type of fine: traffic (by traffic officer), citizen (by post/general officer), penalty, bail, service';
COMMENT ON COLUMN citizen_fines.citation_type IS 'Who issued the fine: traffic officer, post officer, general officer, CID, command';
