-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — COMPLETE SCHEMA v2
-- Migration: 00000000000005_complete_schema
-- Covers ALL entities from Mock Database + RLS + Indexes
-- Run AFTER existing migrations 0000-0004
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ── Enums (extended from migration 0) ────────────────────────
DO $$ BEGIN CREATE TYPE officer_unit AS ENUM ('traffic','general','post','investigator','clerk'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE missing_type AS ENUM ('person','car','device'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE missing_status AS ENUM ('active','found','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE patrol_type AS ENUM ('gari','miguu','baiskeli'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE device_status AS ENUM ('clean','stolen','found'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── REGIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(10) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── STATIONS (extended) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stations (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(255) NOT NULL,
  station_code         VARCHAR(20) NOT NULL UNIQUE,
  region               VARCHAR(100) NOT NULL,
  region_id            UUID REFERENCES regions(id),
  district             VARCHAR(100),
  address              VARCHAR(255),
  phone                VARCHAR(20),
  commissioner_name    VARCHAR(255),
  commissioner_user_id UUID, -- FK to users added after
  officers_count       INT NOT NULL DEFAULT 0,
  posts_count          INT NOT NULL DEFAULT 0,
  status               VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','inactive')),
  established          VARCHAR(10),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── USERS (extended — supports all 13 roles) ─────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  short_name    VARCHAR(100),
  rank          VARCHAR(150),
  rank_short    VARCHAR(20),
  role          VARCHAR(50) NOT NULL DEFAULT 'officer-traffic'
                CHECK (role IN (
                  'officer-traffic','officer-general','admin','commander',
                  'national-commissioner','regional-commissioner',
                  'district-commissioner','station-commissioner','post-officer',
                  'investigator','clerk','viewer'
                )),
  badge_no      VARCHAR(50) NOT NULL UNIQUE,
  username      VARCHAR(100) NOT NULL UNIQUE,
  mobile        VARCHAR(20) NOT NULL,
  email         VARCHAR(255),
  station_id    UUID REFERENCES stations(id),
  region        VARCHAR(100),
  unit          VARCHAR(255),
  photo_url     TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','break','off-duty','patrol')),
  auth_user_id  UUID UNIQUE, -- links to Supabase Auth
  joined_at     DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK for station commissioner after users table exists
ALTER TABLE stations
  ADD COLUMN IF NOT EXISTS commissioner_user_id UUID REFERENCES users(id);

-- ── POSTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  station_id        UUID NOT NULL REFERENCES stations(id),
  location          VARCHAR(255),
  type              VARCHAR(20) CHECK (type IN ('Traffic','Patrol','General')),
  officers_count    INT NOT NULL DEFAULT 0,
  status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  shift             VARCHAR(50),
  officer_in_charge VARCHAR(255),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CITIZENS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizens (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nida              VARCHAR(20) NOT NULL UNIQUE,
  first_name        VARCHAR(100) NOT NULL,
  middle_name       VARCHAR(100),
  last_name         VARCHAR(100) NOT NULL,
  date_of_birth     DATE,
  gender            CHAR(1) CHECK (gender IN ('M','F')),
  mobile            VARCHAR(20),
  email             VARCHAR(255),
  address           TEXT,
  region_code       VARCHAR(10) REFERENCES regions(code),
  occupation        VARCHAR(100),
  photo_url         TEXT,
  risk_score        INT NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  has_criminal_record BOOLEAN NOT NULL DEFAULT FALSE,
  criminal_cases    INT NOT NULL DEFAULT 0,
  criminal_convictions INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── LICENSES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id  UUID NOT NULL REFERENCES citizens(id),
  license_no  VARCHAR(50) NOT NULL UNIQUE,
  class       VARCHAR(5),
  expires_at  DATE,
  issued_at   DATE,
  status      VARCHAR(20) NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','expired','suspended','revoked')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VEHICLES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_number         VARCHAR(20) NOT NULL UNIQUE,
  make                 VARCHAR(50),
  model                VARCHAR(50) NOT NULL,
  type                 VARCHAR(50),
  color                VARCHAR(50),
  manufacture_year     INT,
  chassis_number       VARCHAR(50),
  engine_number        VARCHAR(50),
  owner_citizen_id     UUID REFERENCES citizens(id),
  owner_name           VARCHAR(255),
  owner_nida           VARCHAR(20),
  owner_phone          VARCHAR(20),
  insurance_company    VARCHAR(100),
  insurance_policy     VARCHAR(100),
  insurance_expires    DATE,
  inspection_expires   DATE,
  registration_expires DATE,
  accident_involved    BOOLEAN NOT NULL DEFAULT FALSE,
  outstanding_fines    BIGINT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── DEVICES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_no        VARCHAR(100) NOT NULL UNIQUE,
  imei             VARCHAR(20),
  description      TEXT NOT NULL,
  category         VARCHAR(50),
  owner_citizen_id UUID REFERENCES citizens(id),
  owner_name       VARCHAR(255),
  owner_phone      VARCHAR(20),
  status           device_status NOT NULL DEFAULT 'clean',
  report_date      DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CITATIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citation_number  VARCHAR(30) NOT NULL UNIQUE,
  officer_id       UUID NOT NULL REFERENCES users(id),
  citizen_id       UUID REFERENCES citizens(id),
  vehicle_id       UUID REFERENCES vehicles(id),
  plate            VARCHAR(20) NOT NULL,
  offense          VARCHAR(255) NOT NULL,
  fine_amount      BIGINT NOT NULL,
  location         VARCHAR(255),
  date             DATE NOT NULL,
  time             TIME NOT NULL,
  status           VARCHAR(10) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid')),
  type             VARCHAR(10) NOT NULL DEFAULT 'traffic' CHECK (type IN ('traffic','general')),
  points_deducted  INT NOT NULL DEFAULT 0,
  station_id       UUID REFERENCES stations(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INCIDENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number  VARCHAR(30) NOT NULL UNIQUE,
  officer_id       UUID NOT NULL REFERENCES users(id),
  type             VARCHAR(100) NOT NULL,
  severity         VARCHAR(20) NOT NULL DEFAULT 'medium',
  location         VARCHAR(255) NOT NULL,
  description      TEXT,
  casualties       INT NOT NULL DEFAULT 0,
  date             DATE NOT NULL,
  time             TIME NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('urgent','active','resolved','investigating')),
  priority         VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  station_id       UUID REFERENCES stations(id),
  citizen_id       UUID REFERENCES citizens(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ARRESTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arrests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arrest_number  VARCHAR(30) NOT NULL UNIQUE,
  officer_id     UUID NOT NULL REFERENCES users(id),
  citizen_id     UUID REFERENCES citizens(id),
  suspect_name   VARCHAR(255) NOT NULL,
  suspect_nida   VARCHAR(20),
  suspect_phone  VARCHAR(20),
  offense        VARCHAR(255) NOT NULL,
  location       VARCHAR(255),
  arrest_date    DATE NOT NULL,
  arrest_time    TIME NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'held' CHECK (status IN ('held','released','charged')),
  station_id     UUID REFERENCES stations(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PATROLS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patrols (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrol_number VARCHAR(30) NOT NULL UNIQUE,
  officer_id    UUID NOT NULL REFERENCES users(id),
  area          VARCHAR(255) NOT NULL,
  patrol_type   patrol_type NOT NULL DEFAULT 'gari',
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ,
  duration_secs INT NOT NULL DEFAULT 0,
  events        TEXT,
  photos_count  INT NOT NULL DEFAULT 0,
  status        VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  station_id    UUID REFERENCES stations(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MISSING RECORDS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS missing_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_no             VARCHAR(30) NOT NULL UNIQUE,
  type                missing_type NOT NULL,
  title               VARCHAR(255) NOT NULL,
  identifier          VARCHAR(255) NOT NULL,
  details             TEXT,
  photo_url           TEXT,
  last_seen           VARCHAR(100),
  last_seen_location  VARCHAR(255),
  reported_by         VARCHAR(255),
  reported_date       DATE,
  station_id          UUID REFERENCES stations(id),
  status              missing_status NOT NULL DEFAULT 'active',
  reward_amount       VARCHAR(50),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PF3 REPORTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pf3_reports (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pf3_number         VARCHAR(30) NOT NULL UNIQUE,
  officer_id         UUID NOT NULL REFERENCES users(id),
  accident_date      DATE NOT NULL,
  accident_time      TIME NOT NULL,
  location           VARCHAR(255) NOT NULL,
  vehicles_involved  TEXT[] NOT NULL DEFAULT '{}',
  casualties         INT NOT NULL DEFAULT 0,
  description        TEXT,
  status             VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved')),
  station_id         UUID REFERENCES stations(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VEHICLE INSPECTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_number VARCHAR(30) NOT NULL UNIQUE,
  officer_id        UUID NOT NULL REFERENCES users(id),
  vehicle_id        UUID REFERENCES vehicles(id),
  plate             VARCHAR(20) NOT NULL,
  inspection_date   DATE NOT NULL,
  result            VARCHAR(10) NOT NULL DEFAULT 'pass' CHECK (result IN ('pass','fail')),
  notes             TEXT,
  items_checked     JSONB NOT NULL DEFAULT '{}',
  station_id        UUID REFERENCES stations(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── OTP CODES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier  VARCHAR(255) NOT NULL,
  code        VARCHAR(6) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ALERTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  priority          VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','important','urgent')),
  category          VARCHAR(50) NOT NULL DEFAULT 'general',
  target_role       VARCHAR(50),
  target_station_id UUID REFERENCES stations(id),
  target_region     VARCHAR(100),
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CRIMINAL RECORDS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS criminal_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id  UUID NOT NULL REFERENCES citizens(id),
  case_no     VARCHAR(50) NOT NULL,
  type        VARCHAR(100) NOT NULL,
  date        DATE NOT NULL,
  station     VARCHAR(255),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WANTED ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wanted (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id  UUID REFERENCES citizens(id),
  reason      TEXT NOT NULL,
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  issued_by   UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_citizens_nida      ON citizens(nida);
CREATE INDEX IF NOT EXISTS idx_citizens_mobile    ON citizens(mobile);
CREATE INDEX IF NOT EXISTS idx_citizens_name_trgm ON citizens USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate     ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_devices_serial     ON devices(serial_no);
CREATE INDEX IF NOT EXISTS idx_devices_imei       ON devices(imei);
CREATE INDEX IF NOT EXISTS idx_citations_plate    ON citations(plate);
CREATE INDEX IF NOT EXISTS idx_citations_status   ON citations(status);
CREATE INDEX IF NOT EXISTS idx_citations_type     ON citations(type);
CREATE INDEX IF NOT EXISTS idx_incidents_status   ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_date     ON incidents(date);
CREATE INDEX IF NOT EXISTS idx_patrols_officer    ON patrols(officer_id);
CREATE INDEX IF NOT EXISTS idx_users_username     ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_mobile       ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_badge        ON users(badge_no);
CREATE INDEX IF NOT EXISTS idx_otp_identifier     ON otp_codes(identifier, used);
CREATE INDEX IF NOT EXISTS idx_missing_status     ON missing_records(status);
CREATE INDEX IF NOT EXISTS idx_missing_type       ON missing_records(type);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE citations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrols         ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf3_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts          ENABLE ROW LEVEL SECURITY;

-- Officers see own records; admins/commanders see all
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_station() RETURNS UUID AS $$
  SELECT station_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_commander() RETURNS BOOLEAN AS $$
  SELECT auth_user_role() IN ('admin','commander','national-commissioner','regional-commissioner','district-commissioner','station-commissioner','super_admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Citations RLS
DROP POLICY IF EXISTS citations_all_for_admin ON citations;
CREATE POLICY citations_all_for_admin ON citations FOR ALL TO authenticated
  USING (is_admin_or_commander() OR officer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Incidents RLS
DROP POLICY IF EXISTS incidents_all_for_admin ON incidents;
CREATE POLICY incidents_all_for_admin ON incidents FOR ALL TO authenticated
  USING (is_admin_or_commander() OR officer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Patrols RLS
DROP POLICY IF EXISTS patrols_all_for_admin ON patrols;
CREATE POLICY patrols_all_for_admin ON patrols FOR ALL TO authenticated
  USING (is_admin_or_commander() OR officer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Missing records — any authenticated can view; only admins can create/update
DROP POLICY IF EXISTS missing_records_select ON missing_records;
CREATE POLICY missing_records_select ON missing_records FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS missing_records_write ON missing_records;
CREATE POLICY missing_records_write ON missing_records FOR INSERT TO authenticated WITH CHECK (is_admin_or_commander());
