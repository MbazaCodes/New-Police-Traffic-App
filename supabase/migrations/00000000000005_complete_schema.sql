-- NOTE: Tables already defined in 0000_initial_schema.sql are NOT redefined here.
-- This file only adds new tables and extends existing ones.
-- Duplicate CREATE TABLE / INDEX statements have been removed to prevent conflicts.

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
-- (Defined in 0000_initial_schema.sql: stations)

-- ── USERS (extended — supports all 13 roles) ─────────────────
-- (Defined in 0000_initial_schema.sql: users)

-- Add FK for station commissioner after users table exists
ALTER TABLE stations
  ADD COLUMN IF NOT EXISTS commissioner_user_id UUID REFERENCES users(id);

-- ── POSTS ────────────────────────────────────────────────────
-- (Defined in 0000_initial_schema.sql: posts)

-- ── CITIZENS ─────────────────────────────────────────────────
-- (Defined in 0000_initial_schema.sql: citizens)

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
-- (Defined in 0000_initial_schema.sql: vehicles)

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
-- (Defined in 0000_initial_schema.sql: citations)

-- ── INCIDENTS ─────────────────────────────────────────────────
-- (Defined in 0000_initial_schema.sql: incidents)

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
-- (Defined in 0000_initial_schema.sql: patrols)

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
-- (Defined in 0000_initial_schema.sql: vehicle_inspections)

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
-- (Defined in 0000_initial_schema.sql: alerts)

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
-- (Index defined in 0000_initial_schema.sql: idx_citizens_nida)
-- (Index defined in 0000_initial_schema.sql: idx_citizens_mobile)
CREATE INDEX IF NOT EXISTS idx_citizens_name_trgm ON citizens USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);
-- (Index defined in 0000_initial_schema.sql: idx_vehicles_plate)
CREATE INDEX IF NOT EXISTS idx_devices_serial     ON devices(serial_no);
CREATE INDEX IF NOT EXISTS idx_devices_imei       ON devices(imei);
-- (Index defined in 0000_initial_schema.sql: idx_citations_plate)
-- (Index defined in 0000_initial_schema.sql: idx_citations_status)
CREATE INDEX IF NOT EXISTS idx_citations_type     ON citations(type);
-- (Index defined in 0000_initial_schema.sql: idx_incidents_status)
-- (Index defined in 0000_initial_schema.sql: idx_incidents_date)
-- (Index defined in 0000_initial_schema.sql: idx_patrols_officer)
CREATE INDEX IF NOT EXISTS idx_users_username     ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_mobile       ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_badge        ON users(badge_no);
CREATE INDEX IF NOT EXISTS idx_otp_identifier     ON otp_codes(identifier, used);
CREATE INDEX IF NOT EXISTS idx_missing_status     ON missing_records(status);
CREATE INDEX IF NOT EXISTS idx_missing_type       ON missing_records(type);

-- ── RLS ──────────────────────────────────────────────────────
-- (RLS already enabled in 0000: citations)
-- (RLS already enabled in 0000: incidents)
ALTER TABLE arrests         ENABLE ROW LEVEL SECURITY;
-- (RLS already enabled in 0000: patrols)
ALTER TABLE missing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf3_reports     ENABLE ROW LEVEL SECURITY;
-- (RLS already enabled in 0000: vehicle_inspections)
-- (RLS already enabled in 0000: alerts)

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
