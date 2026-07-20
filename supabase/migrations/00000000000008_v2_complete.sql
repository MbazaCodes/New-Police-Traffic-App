-- NOTE: Tables already defined in 0005_complete_schema.sql are NOT redefined here.
-- This file only extends columns and adds new tables.

-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — v2 COMPLETE MIGRATION
-- Migration: 00000000000008_v2_complete
-- Builds on 0000–0007 (initial schema, RLS, RBAC functions,
-- triggers, seed data, complete schema, db functions, role users).
-- This migration:
--   1. Extends enums for all 20 auth roles
--   2. Adds missing tables (otp_codes, patrol_track_points,
--      missing_records, arrests, warnings, devices, licenses,
--      criminal_records, wanted)
--   3. Adds missing columns to existing tables
--   4. Extends RLS to cover new roles
--   5. Adds pg_trgm indexes for fast text search
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Extend user_role enum to cover all 20 roles ───────────────
-- Must use ALTER TYPE … ADD VALUE (idempotent via DO block)
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'national-commissioner';   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'regional-commissioner';   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'district-commissioner';   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'station-commissioner';    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'post-officer';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cid-officer';             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'investigation-supervisor';EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cyber-crime';             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'immigration-liaison';     EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'prison-liaison';          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'emergency-dispatcher';    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'evidence-officer';        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'audit-officer';           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'investigator';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';                  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dig';                     EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── New enums ────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE device_status  AS ENUM ('clean','stolen','found');               EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE missing_type   AS ENUM ('person','car','device');                EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE missing_status AS ENUM ('active','found','closed');              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE patrol_mode    AS ENUM ('gari','miguu','baiskeli');              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE license_status AS ENUM ('valid','expired','suspended','revoked');EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE arrest_status  AS ENUM ('held','released','charged','bailed');   EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════
-- TABLE EXTENSIONS (add columns that the app uses but are missing)
-- ═══════════════════════════════════════════════════════════════

-- users: add auth_user_id (Supabase Auth link), region, badge_no, username
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username     VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_no     VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS region       VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url    TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile       VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_at    DATE;

-- stations: extend for commissioner linkage and metrics
ALTER TABLE stations ADD COLUMN IF NOT EXISTS station_code        VARCHAR(20);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS region_id           UUID;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS commissioner_name   VARCHAR(255);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS commissioner_user_id UUID REFERENCES users(id);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS officers_count      INT NOT NULL DEFAULT 0;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS posts_count         INT NOT NULL DEFAULT 0;

-- officers: extend
ALTER TABLE officers ADD COLUMN IF NOT EXISTS photo_url  TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS badge_no   VARCHAR(50);
ALTER TABLE officers ADD COLUMN IF NOT EXISTS joined_at  DATE;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS region     VARCHAR(100);

-- citizens: extend for full search + risk profile
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS first_name    VARCHAR(100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS middle_name   VARCHAR(100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS last_name     VARCHAR(100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS age           INT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS risk_score    INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS license_no    VARCHAR(50);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS photo_url     TEXT;

-- vehicles: extend for full mock DB shape
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make                 VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number       VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_number        VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_citizen_id     UUID REFERENCES citizens(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_expires    DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS inspection_expires   DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_expires DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS outstanding_fines    BIGINT DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS accident_count       INT DEFAULT 0;

-- patrols: extend
ALTER TABLE patrols ADD COLUMN IF NOT EXISTS patrol_type  patrol_mode DEFAULT 'gari';
ALTER TABLE patrols ADD COLUMN IF NOT EXISTS photos_count INT DEFAULT 0;
ALTER TABLE patrols ADD COLUMN IF NOT EXISTS events       TEXT;
ALTER TABLE patrols ADD COLUMN IF NOT EXISTS officer_name VARCHAR(255);

-- citations: extend
ALTER TABLE citations ADD COLUMN IF NOT EXISTS citation_type  VARCHAR(20) DEFAULT 'traffic'
  CHECK (citation_type IN ('traffic','general'));
ALTER TABLE citations ADD COLUMN IF NOT EXISTS points_deducted INT DEFAULT 0;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS citizen_id      UUID REFERENCES citizens(id);
ALTER TABLE citations ADD COLUMN IF NOT EXISTS station_id      UUID REFERENCES stations(id);

-- ═══════════════════════════════════════════════════════════════
-- NEW TABLES
-- ═══════════════════════════════════════════════════════════════

-- ── OTP Codes ─────────────────────────────────────────────────
-- Persists OTP codes across Vercel serverless instances
-- (solves the in-memory Map() issue)
-- (Defined in 0005_complete_schema.sql: otp_codes)

-- (Index defined in 0005: idx_otp_identifier)
-- (Index defined in 0005: idx_otp_expires)

-- Auto-clean expired codes (called by cleanup function below)
-- (RLS already enabled in 0005: otp_codes)
-- OTP table is only accessible via service role (edge functions)
-- No anon/authenticated policies — edge functions use service_role key

-- ── Licenses ──────────────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: licenses)

CREATE INDEX IF NOT EXISTS idx_licenses_no        ON licenses(license_no);
CREATE INDEX IF NOT EXISTS idx_licenses_citizen   ON licenses(citizen_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status    ON licenses(status);

-- (RLS already enabled in 0005: licenses)

-- ── Devices ───────────────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: devices)

-- (Index defined in 0005: idx_devices_serial)
-- (Index defined in 0005: idx_devices_imei)
-- (Index defined in 0005: idx_devices_status)

-- (RLS already enabled in 0005: devices)

-- ── Arrests ───────────────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: arrests)

CREATE INDEX IF NOT EXISTS idx_arrests_officer   ON arrests(officer_id);
CREATE INDEX IF NOT EXISTS idx_arrests_station   ON arrests(station_id);
CREATE INDEX IF NOT EXISTS idx_arrests_status    ON arrests(status);
CREATE INDEX IF NOT EXISTS idx_arrests_date      ON arrests(arrest_date);
CREATE INDEX IF NOT EXISTS idx_arrests_nida      ON arrests(suspect_nida);

-- (RLS already enabled in 0005: arrests)

-- ── Warnings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warnings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_number VARCHAR(50) UNIQUE NOT NULL,
  officer_id     UUID REFERENCES officers(id),
  citizen_id     UUID REFERENCES citizens(id),
  citizen_name   VARCHAR(255) NOT NULL,
  citizen_nida   VARCHAR(20),
  citizen_phone  VARCHAR(20),
  reason         TEXT NOT NULL,
  location       VARCHAR(255),
  warning_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  warning_time   TIME NOT NULL DEFAULT CURRENT_TIME,
  station_id     UUID REFERENCES stations(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_officer ON warnings(officer_id);
CREATE INDEX IF NOT EXISTS idx_warnings_date    ON warnings(warning_date);
CREATE INDEX IF NOT EXISTS idx_warnings_nida    ON warnings(citizen_nida);

ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;

-- ── Criminal Records ──────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: criminal_records)

CREATE INDEX IF NOT EXISTS idx_criminal_citizen ON criminal_records(citizen_id);
CREATE INDEX IF NOT EXISTS idx_criminal_date    ON criminal_records(date);

-- (RLS already enabled in 0005: criminal_records)

-- ── Wanted Persons ────────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: wanted)

CREATE INDEX IF NOT EXISTS idx_wanted_active   ON wanted(active);
CREATE INDEX IF NOT EXISTS idx_wanted_citizen  ON wanted(citizen_id);
CREATE INDEX IF NOT EXISTS idx_wanted_nida     ON wanted(suspect_nida);

-- (RLS already enabled in 0005: wanted)

-- ── Missing Records ───────────────────────────────────────────
-- (Defined in 0005_complete_schema.sql: missing_records)

-- (Index defined in 0005: idx_missing_status)
-- (Index defined in 0005: idx_missing_type)
-- (Index defined in 0005: idx_missing_caseno)

-- (RLS already enabled in 0005: missing_records)

-- ── Patrol Track Points ───────────────────────────────────────
-- GPS breadcrumb trail for each patrol — used by track-patrol edge function
-- and commander live map
CREATE TABLE IF NOT EXISTS patrol_track_points (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrol_id   UUID NOT NULL REFERENCES patrols(id) ON DELETE CASCADE,
  latitude    NUMERIC(10,7) NOT NULL,
  longitude   NUMERIC(10,7) NOT NULL,
  speed_kmh   NUMERIC(5,1),
  accuracy_m  NUMERIC(6,1),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_track_patrol  ON patrol_track_points(patrol_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_track_time    ON patrol_track_points(recorded_at DESC);

ALTER TABLE patrol_track_points ENABLE ROW LEVEL SECURITY;

-- ── Dashboard Stats Cache ─────────────────────────────────────
-- Materialized cache — refreshed by scheduled DB function
-- Prevents expensive aggregation on every dashboard load
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope        VARCHAR(20) NOT NULL,  -- 'national' | 'regional' | 'district' | 'station'
  scope_value  VARCHAR(100),          -- region name, station id, etc.
  stats        JSONB NOT NULL DEFAULT '{}',
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cache_scope ON dashboard_cache(scope, scope_value);

-- ── Alert Reads ───────────────────────────────────────────────
-- Tracks which officers have read which alerts (replaces is_read boolean)
CREATE TABLE IF NOT EXISTS alert_reads (
  alert_id   UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (alert_id, user_id)
);

ALTER TABLE alert_reads ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════
-- OFFICER REQUESTS TABLE
-- ═══════════════════════════════════════════════════════════════
DO $$ BEGIN CREATE TYPE request_status AS ENUM ('pending','approved','rejected','reallocated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE request_priority AS ENUM ('high','medium','low'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS officer_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          VARCHAR(50) NOT NULL,         -- Uhamisho|Zana|Likizo|Matibabu|Mafunzo|Nyingine
  officer_id    UUID REFERENCES users(id),
  officer_name  VARCHAR(255) NOT NULL,
  officer_badge VARCHAR(50),
  station       VARCHAR(255),
  region        VARCHAR(100),
  details       TEXT NOT NULL,
  priority      request_priority NOT NULL DEFAULT 'medium',
  status        request_status NOT NULL DEFAULT 'pending',
  response      TEXT,
  new_station   VARCHAR(255),
  responded_by  VARCHAR(255),
  responded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_req_officer  ON officer_requests(officer_id);
CREATE INDEX IF NOT EXISTS idx_req_status   ON officer_requests(status);
CREATE INDEX IF NOT EXISTS idx_req_type     ON officer_requests(type);
CREATE INDEX IF NOT EXISTS idx_req_created  ON officer_requests(created_at DESC);

ALTER TABLE officer_requests ENABLE ROW LEVEL SECURITY;

-- Officers see own requests; commanders see all in their scope
DROP POLICY IF EXISTS req_select ON officer_requests;
CREATE POLICY req_select ON officer_requests FOR SELECT TO authenticated USING (
  officer_id = auth.uid() OR is_commander() OR current_user_role() = 'admin'
);
DROP POLICY IF EXISTS req_insert ON officer_requests;
CREATE POLICY req_insert ON officer_requests FOR INSERT TO authenticated WITH CHECK (TRUE);
DROP POLICY IF EXISTS req_update ON officer_requests;
CREATE POLICY req_update ON officer_requests FOR UPDATE TO authenticated
  USING (is_commander() OR current_user_role() = 'admin');
