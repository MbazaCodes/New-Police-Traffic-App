-- ===== TZ Police Digital Platform — Migration 00000000000000_initial_schema =====
-- Creates all 15 tables with proper columns, types, constraints, indexes.
-- Database: PostgreSQL 15 (Supabase)
-- Replaces the older single-file `schema.sql`.

-- ===== Extensions =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== Enums (single source of truth for status / role fields) =====
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('officer-traffic', 'officer-general', 'admin', 'commander');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'off-duty', 'on-leave', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE station_status AS ENUM ('active', 'maintenance', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('Traffic', 'Patrol');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE officer_status AS ENUM ('active', 'break', 'off-duty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('active', 'on-leave', 'ended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE citation_status AS ENUM ('paid', 'unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM ('urgent', 'active', 'resolved', 'investigating');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE patrol_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_category AS ENUM ('all', 'mine');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_priority AS ENUM ('normal', 'important', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pf3_status AS ENUM ('draft', 'submitted', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inspection_result AS ENUM ('pass', 'fail');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== 1. Users Table =====
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  short_name    VARCHAR(100),
  rank          VARCHAR(100),
  rank_short    VARCHAR(20),
  role          user_role NOT NULL DEFAULT 'officer-traffic',
  id_number     VARCHAR(50) UNIQUE NOT NULL,
  station_id    UUID REFERENCES stations(id),
  unit          VARCHAR(255),
  phone         VARCHAR(20) UNIQUE,
  email         VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  status        user_status NOT NULL DEFAULT 'active',
  avatar_url    TEXT,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 2. Stations Table =====
CREATE TABLE IF NOT EXISTS stations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  region      VARCHAR(100) NOT NULL,
  district    VARCHAR(100),
  address     TEXT,
  phone       VARCHAR(20),
  status      station_status NOT NULL DEFAULT 'active',
  established VARCHAR(10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill FK on users now that stations exists
-- (Forward reference was used because users.station_id references stations.)

-- ===== 3. Posts Table =====
CREATE TABLE IF NOT EXISTS posts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(255) NOT NULL,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  location   TEXT,
  type       post_type NOT NULL DEFAULT 'Traffic',
  status     post_status NOT NULL DEFAULT 'active',
  shift      VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 4. Officers Table =====
CREATE TABLE IF NOT EXISTS officers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  officer_number  VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  rank            VARCHAR(100),
  unit            VARCHAR(255),
  station_id      UUID REFERENCES stations(id),
  post_id         UUID REFERENCES posts(id),
  status          officer_status NOT NULL DEFAULT 'active',
  phone           VARCHAR(20),
  patrols_count   INT NOT NULL DEFAULT 0,
  citations_count INT NOT NULL DEFAULT 0,
  incidents_count INT NOT NULL DEFAULT 0,
  hours_today     DECIMAL(4,1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 5. Assignments Table =====
CREATE TABLE IF NOT EXISTS assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id   UUID NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  station_id   UUID NOT NULL REFERENCES stations(id),
  post_id      UUID REFERENCES posts(id),
  role         VARCHAR(100),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status       assignment_status NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 6. Vehicles Table =====
CREATE TABLE IF NOT EXISTS vehicles (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate              VARCHAR(20) UNIQUE NOT NULL,
  model              VARCHAR(100),
  type               VARCHAR(50),
  year               VARCHAR(10),
  color              VARCHAR(50),
  owner_name         VARCHAR(255),
  owner_nida         VARCHAR(20),
  owner_phone        VARCHAR(20),
  insurance_company  VARCHAR(255),
  insurance_policy   VARCHAR(100),
  insurance_expires  DATE,
  insurance_valid    BOOLEAN DEFAULT TRUE,
  accident_involved  BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 7. Drivers Table =====
CREATE TABLE IF NOT EXISTS drivers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  gender         VARCHAR(20),
  license_number VARCHAR(50) UNIQUE,
  license_class  VARCHAR(20),
  nida           VARCHAR(20) UNIQUE,
  mobile         VARCHAR(20),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 8. Citizens Table =====
CREATE TABLE IF NOT EXISTS citizens (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               VARCHAR(255) NOT NULL,
  nida               VARCHAR(20) UNIQUE,
  mobile             VARCHAR(20),
  gender             VARCHAR(20),
  dob                DATE,
  address            TEXT,
  occupation         VARCHAR(255),
  status             VARCHAR(50) DEFAULT 'Mtu wa Kawaida',
  has_criminal_record BOOLEAN DEFAULT FALSE,
  cases_count        INT DEFAULT 0,
  convictions_count  INT DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 9. Citations Table =====
CREATE TABLE IF NOT EXISTS citations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citation_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_id      UUID REFERENCES vehicles(id),
  plate           VARCHAR(20),
  offense         VARCHAR(255) NOT NULL,
  driver_name     VARCHAR(255),
  driver_id       UUID REFERENCES drivers(id),
  date            DATE NOT NULL,
  time            TIME,
  location        VARCHAR(255),
  amount          DECIMAL(10,2) NOT NULL,
  status          citation_status NOT NULL DEFAULT 'unpaid',
  officer_id      UUID REFERENCES officers(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 10. Incidents Table =====
CREATE TABLE IF NOT EXISTS incidents (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number    VARCHAR(50) UNIQUE NOT NULL,
  type               VARCHAR(255) NOT NULL,
  location           VARCHAR(255) NOT NULL,
  latitude           DECIMAL(10,7),
  longitude          DECIMAL(10,7),
  date               DATE NOT NULL,
  time               TIME NOT NULL,
  status             incident_status NOT NULL DEFAULT 'active',
  priority           priority_level NOT NULL DEFAULT 'medium',
  assigned_officer_id UUID REFERENCES officers(id),
  description        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 11. Patrols Table =====
CREATE TABLE IF NOT EXISTS patrols (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrol_number     VARCHAR(50) UNIQUE NOT NULL,
  officer_id        UUID NOT NULL REFERENCES officers(id),
  area              VARCHAR(255) NOT NULL,
  start_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ,
  distance_km       DECIMAL(8,2),
  status            patrol_status NOT NULL DEFAULT 'active',
  progress          INT NOT NULL DEFAULT 0,
  notes             TEXT,
  incidents_observed TEXT,
  last_latitude     DECIMAL(10,7),  -- updated by track-patrol edge function
  last_longitude    DECIMAL(10,7),
  last_updated_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 12. Alerts Table =====
CREATE TABLE IF NOT EXISTS alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(255) NOT NULL,
  message       TEXT NOT NULL,
  source        VARCHAR(255),
  category      alert_category DEFAULT 'all',
  priority      alert_priority DEFAULT 'normal',
  icon          VARCHAR(50),
  icon_color    VARCHAR(20),
  border_color  VARCHAR(20),
  is_read       BOOLEAN DEFAULT FALSE,
  sent_by       UUID REFERENCES users(id),
  audience      VARCHAR(50) DEFAULT 'all',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 13. PF3 Forms (Accident Reports) Table =====
CREATE TABLE IF NOT EXISTS pf3_forms (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  region           VARCHAR(100),
  district         VARCHAR(100),
  station_id       UUID REFERENCES stations(id),
  accident_type    VARCHAR(255),
  severity         VARCHAR(50),
  weather          VARCHAR(50),
  road_surface     VARCHAR(50),
  light_condition  VARCHAR(50),
  vehicles_json    JSONB,
  casualties_json  JSONB,
  witnesses_json   JSONB,
  sketch_url       TEXT,
  officer_id       UUID REFERENCES officers(id),
  status           pf3_status DEFAULT 'draft',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 14. Vehicle Inspections Table =====
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID REFERENCES vehicles(id),
  plate             VARCHAR(20) NOT NULL,
  officer_id        UUID REFERENCES officers(id),
  location          VARCHAR(255),
  inspection_date   TIMESTAMPTZ NOT NULL,
  documents_json    JSONB,
  mechanical_json   JSONB,
  photos_json       JSONB,
  result            inspection_result DEFAULT 'pass',
  officer_signature VARCHAR(255),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 15. Audit Logs Table =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,                  -- INSERT | UPDATE | DELETE | LOGIN | LOGOUT | ...
  resource    VARCHAR(100) NOT NULL,                 -- table name
  resource_id UUID,                                  -- row id (nullable for table-level)
  details     JSONB,                                 -- before/after diff or extra context
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Indexes (high-traffic columns) =====
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status      ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_station     ON users(station_id);

CREATE INDEX IF NOT EXISTS idx_officers_station  ON officers(station_id);
CREATE INDEX IF NOT EXISTS idx_officers_status   ON officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_user     ON officers(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_number   ON officers(officer_number);

CREATE INDEX IF NOT EXISTS idx_posts_station     ON posts(station_id);
CREATE INDEX IF NOT EXISTS idx_posts_type        ON posts(type);

CREATE INDEX IF NOT EXISTS idx_assignments_officer ON assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_station ON assignments(station_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status  ON assignments(status);

CREATE INDEX IF NOT EXISTS idx_citations_plate   ON citations(plate);
CREATE INDEX IF NOT EXISTS idx_citations_status  ON citations(status);
CREATE INDEX IF NOT EXISTS idx_citations_date    ON citations(date);
CREATE INDEX IF NOT EXISTS idx_citations_officer ON citations(officer_id);

CREATE INDEX IF NOT EXISTS idx_incidents_status  ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_date    ON incidents(date);
CREATE INDEX IF NOT EXISTS idx_incidents_officer ON incidents(assigned_officer_id);

CREATE INDEX IF NOT EXISTS idx_patrols_officer   ON patrols(officer_id);
CREATE INDEX IF NOT EXISTS idx_patrols_status    ON patrols(status);
CREATE INDEX IF NOT EXISTS idx_patrols_active    ON patrols(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_alerts_category   ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read    ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created    ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_citizens_nida     ON citizens(nida);
CREATE INDEX IF NOT EXISTS idx_citizens_mobile   ON citizens(mobile);
CREATE INDEX IF NOT EXISTS idx_citizens_name     ON citizens(name);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate    ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner    ON vehicles(owner_name);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pf3_forms_officer ON pf3_forms(officer_id);
CREATE INDEX IF NOT EXISTS idx_pf3_forms_station ON pf3_forms(station_id);
CREATE INDEX IF NOT EXISTS idx_pf3_forms_status  ON pf3_forms(status);

CREATE INDEX IF NOT EXISTS idx_inspections_plate ON vehicle_inspections(plate);
CREATE INDEX IF NOT EXISTS idx_inspections_officer ON vehicle_inspections(officer_id);

-- ===== Enable Row-Level Security (deny by default) =====
-- Policies are defined in 00000000000001_rls_policies.sql
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens            ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrols             ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf3_forms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- ===== Comments =====
COMMENT ON TABLE  users               IS 'Platform users (officers, admins, commanders)';
COMMENT ON TABLE  officers            IS 'Officer profiles (1:1 with users)';
COMMENT ON TABLE  stations            IS 'Police stations / posts';
COMMENT ON TABLE  posts               IS 'Sub-stations or patrol posts under a station';
COMMENT ON TABLE  assignments         IS 'Officer ↔ station/post assignments';
COMMENT ON TABLE  vehicles            IS 'Registered vehicles (search target)';
COMMENT ON TABLE  drivers             IS 'Registered drivers';
COMMENT ON TABLE  citizens            IS 'Citizens searched by general-duty officers';
COMMENT ON TABLE  citations           IS 'Traffic citations issued by officers';
COMMENT ON TABLE  incidents           IS 'Incidents reported / assigned';
COMMENT ON TABLE  patrols             IS 'Patrol sessions with GPS tracking';
COMMENT ON TABLE  alerts              IS 'Broadcast alerts to officers';
COMMENT ON TABLE  pf3_forms           IS 'PF3 accident report forms';
COMMENT ON TABLE  vehicle_inspections IS 'Vehicle inspection records';
COMMENT ON TABLE  audit_logs          IS 'Immutable audit trail of privileged actions';
