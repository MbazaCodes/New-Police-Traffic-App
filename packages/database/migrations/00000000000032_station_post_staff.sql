-- ============================================================
-- STATION & POST STAFF ASSIGNMENTS
-- Rank-enforced staffing for vituo na posti
-- ============================================================

-- TPF rank hierarchy (for reference)
-- IGP → DIG → Commissioner → OCD → OCS → OCPD → Officers

CREATE TYPE tpf_rank AS ENUM (
  'IGP',          -- Inspector General of Police
  'DIG',          -- Deputy Inspector General
  'COMMISSIONER', -- Regional/National Commissioner
  'ACP',          -- Assistant Commissioner of Police
  'SP',           -- Superintendent of Police
  'ASP',          -- Assistant Superintendent
  'IP',           -- Inspector of Police
  'SGT',          -- Sergeant
  'CPL',          -- Corporal
  'PC',           -- Police Constable
  'CADET'         -- Cadet
);

-- Station staff assignments
CREATE TABLE station_staff (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id      UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Role at this station
  station_role    VARCHAR(50) NOT NULL, -- OCD, OCS, OCPD, officer, clerk, etc.
  rank            VARCHAR(30),          -- SP, ASP, IP, SGT, CPL, PC
  is_commanding   BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = OCD or OCS

  -- Assignment period
  assigned_from   DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_until  DATE,   -- NULL = currently assigned

  status          VARCHAR(20) NOT NULL DEFAULT 'active', -- active, transferred, ended
  notes           TEXT,

  -- Who assigned
  assigned_by_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by_name VARCHAR(255),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(station_id, user_id, assigned_from) -- prevent duplicate active assignments
);

-- Post (checkpoint) staff assignments
CREATE TABLE post_staff (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  station_role    VARCHAR(50) NOT NULL DEFAULT 'officer',
  rank            VARCHAR(30),
  is_commanding   BOOLEAN NOT NULL DEFAULT FALSE,

  assigned_from   DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_until  DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  shift           VARCHAR(20), -- morning, afternoon, night, all
  notes           TEXT,

  assigned_by_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by_name VARCHAR(255),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(post_id, user_id, assigned_from)
);

-- Indexes
CREATE INDEX idx_station_staff_station ON station_staff(station_id);
CREATE INDEX idx_station_staff_user    ON station_staff(user_id);
CREATE INDEX idx_station_staff_active  ON station_staff(station_id, status);
CREATE INDEX idx_post_staff_post       ON post_staff(post_id);
CREATE INDEX idx_post_staff_user       ON post_staff(user_id);
CREATE INDEX idx_post_staff_active     ON post_staff(post_id, status);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_staff_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_station_staff_updated
  BEFORE UPDATE ON station_staff FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

CREATE TRIGGER trg_post_staff_updated
  BEFORE UPDATE ON post_staff FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

-- ── RANK ENFORCEMENT FUNCTION ────────────────────────────────
-- Returns error if rank constraint violated
-- OCD: max 1 active per station
-- OCS: max 2 active per station (can have OC and deputy)
-- Commanding officers: cannot be in 2 stations simultaneously

CREATE OR REPLACE FUNCTION check_station_rank_constraint(
  p_station_id  UUID,
  p_user_id     UUID,
  p_role        VARCHAR,
  p_exclude_id  UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_ocd_count   INT;
  v_active_count INT;
BEGIN
  -- Check OCD uniqueness: only 1 OCD per station
  IF LOWER(p_role) = 'ocd' THEN
    SELECT COUNT(*) INTO v_ocd_count
    FROM station_staff
    WHERE station_id = p_station_id
      AND LOWER(station_role) = 'ocd'
      AND status = 'active'
      AND (p_exclude_id IS NULL OR id != p_exclude_id);

    IF v_ocd_count >= 1 THEN
      RETURN 'Kituo hiki tayari kina OCD. Hakuna OCD zaidi ya mmoja kwa kituo kimoja.';
    END IF;
  END IF;

  -- Check OCS: max 2 per station
  IF LOWER(p_role) IN ('ocs', 'ocpd') THEN
    SELECT COUNT(*) INTO v_ocd_count
    FROM station_staff
    WHERE station_id = p_station_id
      AND LOWER(station_role) IN ('ocs', 'ocpd')
      AND status = 'active'
      AND (p_exclude_id IS NULL OR id != p_exclude_id);

    IF v_ocd_count >= 2 THEN
      RETURN 'Kituo hiki tayari kina OCS/OCPD 2. Hii ndiyo kikomo cha juu.';
    END IF;
  END IF;

  -- Check if user already has active commanding role elsewhere
  IF LOWER(p_role) IN ('ocd', 'ocs', 'ocpd') THEN
    SELECT COUNT(*) INTO v_active_count
    FROM station_staff
    WHERE user_id = p_user_id
      AND status = 'active'
      AND LOWER(station_role) IN ('ocd', 'ocs', 'ocpd')
      AND station_id != p_station_id
      AND (p_exclude_id IS NULL OR id != p_exclude_id);

    IF v_active_count > 0 THEN
      RETURN 'Afisa huyu tayari ana wadhifu wa uongozi katika kituo kingine.';
    END IF;
  END IF;

  RETURN NULL; -- NULL = no constraint violation
END;
$$ LANGUAGE plpgsql;

-- Same for posts: max 2 OCS per post
CREATE OR REPLACE FUNCTION check_post_rank_constraint(
  p_post_id    UUID,
  p_user_id    UUID,
  p_role       VARCHAR,
  p_exclude_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_count INT;
BEGIN
  IF LOWER(p_role) IN ('ocs', 'oic', 'commanding') THEN
    SELECT COUNT(*) INTO v_count
    FROM post_staff
    WHERE post_id = p_post_id
      AND LOWER(station_role) IN ('ocs', 'oic', 'commanding')
      AND status = 'active'
      AND (p_exclude_id IS NULL OR id != p_exclude_id);

    IF v_count >= 2 THEN
      RETURN 'Posti hii tayari ina wasimamizi 2. Hii ndiyo kikomo.';
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
