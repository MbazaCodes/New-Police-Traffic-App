-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — DRIVER & CITIZEN POINTS SYSTEM
-- Migration: 00000000000015_driver_points_system
-- Points start at 100 on Jan 1, deductions from citations
-- and warnings, annual reset, good conduct reports
-- ============================================================

-- ── Points Rules ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_rules (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offense        VARCHAR(255) NOT NULL UNIQUE,
  offense_sw     VARCHAR(255),                     -- Swahili name
  points_deducted DECIMAL(3,1) NOT NULL
    CHECK (points_deducted >= 0.5 AND points_deducted <= 3.0),
  applies_to     VARCHAR(20) NOT NULL DEFAULT 'driver'
    CHECK (applies_to IN ('driver','citizen','both')),
  offense_type   VARCHAR(50) NOT NULL DEFAULT 'citation'
    CHECK (offense_type IN ('citation','warning')),
  severity       VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('minor','medium','major','severe')),
  description    TEXT,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO points_rules (offense, offense_sw, points_deducted, applies_to, offense_type, severity) VALUES
  -- Traffic / Driver offenses (citation)
  ('Over Speeding',               'Kuzidi Kasi',                     3.0, 'driver', 'citation', 'major'),
  ('Driving Under Influence',     'Udereva Ulevi',                   3.0, 'driver', 'citation', 'severe'),
  ('Wrong Overtaking',            'Kupita Vibaya',                   2.0, 'driver', 'citation', 'major'),
  ('Traffic Light Violation',     'Kupuuza Taa ya Trafiki',          2.0, 'driver', 'citation', 'medium'),
  ('No Insurance / Gari bila Bima','Gari bila Bima',                 2.0, 'driver', 'citation', 'medium'),
  ('No Seatbelt',                 'Bila Mkanda wa Usalama',          0.5, 'driver', 'citation', 'minor'),
  ('Kutumia Simu wakati wa Udereva','Kutumia Simu Ukiwa Unaendesha', 1.0, 'driver', 'citation', 'medium'),
  ('Kukata kona hatari',          'Kukata Kona Hatari',              2.0, 'driver', 'citation', 'major'),
  ('Overloading',                 'Kupakia Zaidi ya Kiasi',          1.5, 'driver', 'citation', 'medium'),
  ('No Inspection Certificate',   'Bila Cheti cha Ukaguzi',          1.0, 'driver', 'citation', 'medium'),
  ('Defective Vehicle',           'Gari Lenye Kasoro',               1.0, 'driver', 'citation', 'medium'),
  ('Leseni imekwisha',            'Leseni Iliyokwisha Muda',         1.5, 'driver', 'citation', 'medium'),
  ('Kutopita kasi',               'Kutofuata Kasi Iliyopangwa',      0.5, 'driver', 'citation', 'minor'),
  ('Kutopita mstari',             'Kutokaa Kwenye Mstari',           1.0, 'driver', 'citation', 'minor'),
  ('Kuepuka kodi',                'Kukimbia Kodi',                   1.0, 'driver', 'citation', 'medium'),
  -- Citizen offenses (warning)
  ('Ugomvi na Mapigano',          'Ugomvi na Mapigano',              2.0, 'citizen', 'warning', 'medium'),
  ('Kelele za Usiku',             'Kelele za Usiku',                 0.5, 'citizen', 'warning', 'minor'),
  ('Kunywa pombe hadharani',      'Ulevi Hadharani',                 1.0, 'citizen', 'warning', 'minor'),
  ('Kutotii Amri za Polisi',      'Kutotii Amri za Polisi',         1.5, 'citizen', 'warning', 'medium'),
  ('Kuzuia Utekelezaji wa Sheria','Kuzuia Polisi',                  2.5, 'citizen', 'warning', 'major'),
  ('Uvunjaji wa Amri ya Mahakama','Kupuuza Amri ya Mahakama',        3.0, 'citizen', 'warning', 'severe'),
  ('Ulevi wa Kupindukia',         'Ulevi Kupita Kiasi',              2.0, 'citizen', 'warning', 'medium'),
  ('Uchafuzi wa Mazingira',       'Uchafuzi wa Mazingira',           0.5, 'citizen', 'warning', 'minor')
ON CONFLICT (offense) DO NOTHING;

-- ── Driver Points Registry ────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_points (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id       UUID NOT NULL REFERENCES citizens(id),
  license_id       UUID REFERENCES licenses(id),
  year             INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  points_start     INT NOT NULL DEFAULT 100,
  points_current   INT NOT NULL DEFAULT 100,
  points_deducted  DECIMAL(5,1) NOT NULL DEFAULT 0,
  violations_count INT NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'good'
    CHECK (status IN ('good','warning','critical','suspended')),
  last_violation_date DATE,
  suspension_date  DATE,
  suspension_reason TEXT,
  reinstated_date  DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (citizen_id, year)
);

CREATE INDEX IF NOT EXISTS idx_dp_citizen  ON driver_points(citizen_id);
CREATE INDEX IF NOT EXISTS idx_dp_year     ON driver_points(year);
CREATE INDEX IF NOT EXISTS idx_dp_status   ON driver_points(status);

-- ── Citizen Points Registry ───────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_conduct_points (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id       UUID NOT NULL REFERENCES citizens(id),
  year             INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  points_start     INT NOT NULL DEFAULT 100,
  points_current   INT NOT NULL DEFAULT 100,
  points_deducted  DECIMAL(5,1) NOT NULL DEFAULT 0,
  incidents_count  INT NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'good'
    CHECK (status IN ('good','warning','critical','suspended')),
  last_incident_date DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (citizen_id, year)
);

CREATE INDEX IF NOT EXISTS idx_ccp_citizen ON citizen_conduct_points(citizen_id);
CREATE INDEX IF NOT EXISTS idx_ccp_year    ON citizen_conduct_points(year);
CREATE INDEX IF NOT EXISTS idx_ccp_status  ON citizen_conduct_points(status);

-- ── Points Deductions Log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_deductions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id       UUID NOT NULL REFERENCES citizens(id),
  deduction_type   VARCHAR(20) NOT NULL DEFAULT 'driver'
    CHECK (deduction_type IN ('driver','citizen')),
  year             INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  offense          VARCHAR(255) NOT NULL,
  points_deducted  DECIMAL(3,1) NOT NULL,
  points_before    INT NOT NULL,
  points_after     INT NOT NULL,
  source_type      VARCHAR(20) NOT NULL DEFAULT 'citation'
    CHECK (source_type IN ('citation','warning')),
  citation_id      UUID REFERENCES citations(id),
  warning_id       UUID REFERENCES warnings(id),
  officer_id       UUID REFERENCES users(id),
  officer_name     VARCHAR(255),
  location         VARCHAR(255),
  deduction_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pd_citizen ON points_deductions(citizen_id, deduction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pd_year    ON points_deductions(year);
CREATE INDEX IF NOT EXISTS idx_pd_source  ON points_deductions(source_type);

-- ── Good Conduct Reports ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS conduct_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_number    VARCHAR(50) NOT NULL UNIQUE,
  citizen_id       UUID NOT NULL REFERENCES citizens(id),
  report_type      VARCHAR(20) NOT NULL DEFAULT 'driver'
    CHECK (report_type IN ('driver','citizen')),
  year             INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  points_at_issue  INT NOT NULL,
  status_at_issue  VARCHAR(20) NOT NULL,
  issued_by        UUID REFERENCES users(id),
  issued_by_name   VARCHAR(255),
  issued_by_badge  VARCHAR(50),
  issued_by_station VARCHAR(255),
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  purpose          TEXT,
  valid_until      DATE,
  is_revoked       BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_by       UUID REFERENCES users(id),
  revoked_at       TIMESTAMPTZ,
  revoked_reason   TEXT
);

CREATE SEQUENCE IF NOT EXISTS conduct_report_seq START 1001;
CREATE OR REPLACE FUNCTION auto_conduct_report_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
    NEW.report_number := CASE WHEN NEW.report_type = 'driver' THEN 'GCR' ELSE 'CCR' END
      || '-' || TO_CHAR(NOW(),'YYYY') || '-' ||
      LPAD(nextval('conduct_report_seq')::TEXT, 4, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_conduct_number ON conduct_reports;
CREATE TRIGGER tg_conduct_number BEFORE INSERT ON conduct_reports FOR EACH ROW EXECUTE FUNCTION auto_conduct_report_number();

CREATE INDEX IF NOT EXISTS idx_cr_citizen ON conduct_reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_cr_type    ON conduct_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_cr_year    ON conduct_reports(year);

-- ── Annual Reset Function ─────────────────────────────────────
-- Called on Jan 1 each year (via pg_cron or Supabase scheduled function)
CREATE OR REPLACE FUNCTION reset_annual_points()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM NOW())::INT;
BEGIN
  -- Insert fresh 100-point records for all citizens for new year
  INSERT INTO driver_points (citizen_id, year, points_start, points_current, status)
  SELECT DISTINCT c.id, v_year, 100, 100, 'good'
  FROM citizens c
  WHERE NOT EXISTS (
    SELECT 1 FROM driver_points dp WHERE dp.citizen_id = c.id AND dp.year = v_year
  )
  AND EXISTS (SELECT 1 FROM licenses l WHERE l.citizen_id = c.id AND l.status = 'valid');

  INSERT INTO citizen_conduct_points (citizen_id, year, points_start, points_current, status)
  SELECT DISTINCT c.id, v_year, 100, 100, 'good'
  FROM citizens c
  WHERE NOT EXISTS (
    SELECT 1 FROM citizen_conduct_points ccp WHERE ccp.citizen_id = c.id AND ccp.year = v_year
  );
END; $$;

-- ── Deduct Points Function ────────────────────────────────────
-- Called automatically when citation or warning is created
CREATE OR REPLACE FUNCTION deduct_points(
  p_citizen_id   UUID,
  p_offense      VARCHAR,
  p_source_type  VARCHAR,           -- 'citation' or 'warning'
  p_deduction_type VARCHAR DEFAULT 'driver',
  p_citation_id  UUID DEFAULT NULL,
  p_warning_id   UUID DEFAULT NULL,
  p_officer_id   UUID DEFAULT NULL,
  p_officer_name VARCHAR DEFAULT NULL,
  p_location     VARCHAR DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year         INT := EXTRACT(YEAR FROM NOW())::INT;
  v_rule         points_rules;
  v_points_before INT;
  v_points_after  INT;
  v_new_status   VARCHAR(20);
BEGIN
  -- Get the rule
  SELECT * INTO v_rule FROM points_rules WHERE offense = p_offense AND active = TRUE LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Offense rule not found: ' || p_offense);
  END IF;

  IF p_deduction_type = 'driver' THEN
    -- Ensure year record exists
    INSERT INTO driver_points (citizen_id, year) VALUES (p_citizen_id, v_year)
    ON CONFLICT (citizen_id, year) DO NOTHING;

    SELECT points_current INTO v_points_before FROM driver_points
    WHERE citizen_id = p_citizen_id AND year = v_year;

    v_points_after := GREATEST(0, v_points_before - ROUND(v_rule.points_deducted)::INT);
    v_new_status   := CASE WHEN v_points_after >= 80 THEN 'good'
                           WHEN v_points_after >= 60 THEN 'warning'
                           WHEN v_points_after >= 40 THEN 'critical'
                           ELSE 'suspended' END;

    UPDATE driver_points SET
      points_current   = v_points_after,
      points_deducted  = points_deducted + v_rule.points_deducted,
      violations_count = violations_count + 1,
      status           = v_new_status,
      last_violation_date = CURRENT_DATE,
      updated_at       = NOW()
    WHERE citizen_id = p_citizen_id AND year = v_year;

  ELSE -- citizen
    INSERT INTO citizen_conduct_points (citizen_id, year) VALUES (p_citizen_id, v_year)
    ON CONFLICT (citizen_id, year) DO NOTHING;

    SELECT points_current INTO v_points_before FROM citizen_conduct_points
    WHERE citizen_id = p_citizen_id AND year = v_year;

    v_points_after := GREATEST(0, v_points_before - ROUND(v_rule.points_deducted)::INT);
    v_new_status   := CASE WHEN v_points_after >= 80 THEN 'good'
                           WHEN v_points_after >= 60 THEN 'warning'
                           WHEN v_points_after >= 40 THEN 'critical'
                           ELSE 'suspended' END;

    UPDATE citizen_conduct_points SET
      points_current  = v_points_after,
      points_deducted = points_deducted + v_rule.points_deducted,
      incidents_count = incidents_count + 1,
      status          = v_new_status,
      last_incident_date = CURRENT_DATE,
      updated_at      = NOW()
    WHERE citizen_id = p_citizen_id AND year = v_year;
  END IF;

  -- Log the deduction
  INSERT INTO points_deductions (
    citizen_id, deduction_type, year, offense, points_deducted,
    points_before, points_after, source_type,
    citation_id, warning_id, officer_id, officer_name, location
  ) VALUES (
    p_citizen_id, p_deduction_type, v_year, p_offense, v_rule.points_deducted,
    v_points_before, v_points_after, p_source_type,
    p_citation_id, p_warning_id, p_officer_id, p_officer_name, p_location
  );

  RETURN jsonb_build_object(
    'ok', true,
    'points_before', v_points_before,
    'points_after',  v_points_after,
    'deducted',      v_rule.points_deducted,
    'new_status',    v_new_status
  );
END; $$;

-- ── Get Points Summary ────────────────────────────────────────
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
    'officer_name', officer_name, 'location', location
  ) ORDER BY deduction_date DESC) INTO v_deducts
  FROM points_deductions WHERE citizen_id = p_citizen_id AND year = v_year;

  RETURN jsonb_build_object(
    'citizen_id',     p_citizen_id,
    'year',           v_year,
    'driver',         to_jsonb(v_dp),
    'citizen',        to_jsonb(v_ccp),
    'deductions',     COALESCE(v_deducts, '[]'::JSONB)
  );
END; $$;

-- ── Auto-deduct on citation insert ────────────────────────────
CREATE OR REPLACE FUNCTION auto_deduct_on_citation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.citizen_id IS NOT NULL AND NEW.offense IS NOT NULL THEN
    PERFORM deduct_points(
      NEW.citizen_id, NEW.offense, 'citation', 'driver',
      NEW.id, NULL, NEW.officer_id, NULL, NEW.location
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_deduct_citation ON citations;
CREATE TRIGGER tg_auto_deduct_citation
  AFTER INSERT ON citations FOR EACH ROW EXECUTE FUNCTION auto_deduct_on_citation();

-- ── Auto-deduct on warning insert ────────────────────────────
CREATE OR REPLACE FUNCTION auto_deduct_on_warning()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.citizen_id IS NOT NULL AND NEW.reason IS NOT NULL THEN
    PERFORM deduct_points(
      NEW.citizen_id, NEW.reason, 'warning', 'citizen',
      NULL, NEW.id, NEW.officer_id, NULL, NEW.location
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_auto_deduct_warning ON warnings;
CREATE TRIGGER tg_auto_deduct_warning
  AFTER INSERT ON warnings FOR EACH ROW EXECUTE FUNCTION auto_deduct_on_warning();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE points_rules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_points          ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_conduct_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_deductions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conduct_reports        ENABLE ROW LEVEL SECURITY;

CREATE POLICY pr_select   ON points_rules           FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dp_select   ON driver_points          FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dp_write    ON driver_points          FOR ALL    TO authenticated USING (is_commander() OR is_officer()) WITH CHECK (TRUE);
CREATE POLICY ccp_select  ON citizen_conduct_points FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY ccp_write   ON citizen_conduct_points FOR ALL    TO authenticated USING (is_commander() OR is_officer()) WITH CHECK (TRUE);
CREATE POLICY pded_select ON points_deductions      FOR SELECT TO authenticated USING (is_commander() OR is_officer() OR is_investigator());
CREATE POLICY pded_insert ON points_deductions      FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY cr_select   ON conduct_reports        FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY cr_insert   ON conduct_reports        FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY cr_update   ON conduct_reports        FOR UPDATE TO authenticated USING (is_commander());

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_dp_updated_at ON driver_points;
CREATE TRIGGER update_dp_updated_at BEFORE UPDATE ON driver_points FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_ccp_updated_at ON citizen_conduct_points;
CREATE TRIGGER update_ccp_updated_at BEFORE UPDATE ON citizen_conduct_points FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed 2026 points records
SELECT reset_annual_points();
