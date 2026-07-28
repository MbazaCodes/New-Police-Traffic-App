-- ===== TZ Police Digital Platform — Supabase Database Schema =====
-- Shared by: PWA (Next.js), Web (Next.js), Flutter (Dart)
-- Database: PostgreSQL (Supabase)

-- ===== Extensions =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== Users Table =====
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  rank VARCHAR(100),
  rank_short VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'officer-traffic'
    CHECK (role IN ('officer-traffic', 'officer-general', 'admin', 'commander')),
  id_number VARCHAR(50) UNIQUE NOT NULL,
  station_id UUID REFERENCES stations(id),
  unit VARCHAR(255),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'off-duty', 'on-leave', 'suspended')),
  avatar_url TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Stations Table =====
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'inactive')),
  established VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Posts Table =====
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  location TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'Traffic'
    CHECK (type IN ('Traffic', 'Patrol')),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  shift VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Officers Table =====
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  officer_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  rank VARCHAR(100),
  unit VARCHAR(255),
  station_id UUID REFERENCES stations(id),
  post_id UUID REFERENCES posts(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'break', 'off-duty')),
  phone VARCHAR(20),
  patrols_count INT DEFAULT 0,
  citations_count INT DEFAULT 0,
  incidents_count INT DEFAULT 0,
  hours_today DECIMAL(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Assignments Table =====
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id UUID NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id),
  post_id UUID REFERENCES posts(id),
  role VARCHAR(100),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'on-leave', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Vehicles Table =====
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100),
  type VARCHAR(50),
  year VARCHAR(10),
  color VARCHAR(50),
  owner_name VARCHAR(255),
  owner_nida VARCHAR(20),
  owner_phone VARCHAR(20),
  insurance_company VARCHAR(255),
  insurance_policy VARCHAR(100),
  insurance_expires DATE,
  insurance_valid BOOLEAN DEFAULT true,
  accident_involved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Drivers Table =====
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  license_number VARCHAR(50) UNIQUE,
  license_class VARCHAR(20),
  nida VARCHAR(20) UNIQUE,
  mobile VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Citizens Table =====
CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  nida VARCHAR(20) UNIQUE,
  mobile VARCHAR(20),
  gender VARCHAR(20),
  dob DATE,
  address TEXT,
  occupation VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Mtu wa Kawaida',
  has_criminal_record BOOLEAN DEFAULT false,
  cases_count INT DEFAULT 0,
  convictions_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Citations Table =====
CREATE TABLE IF NOT EXISTS citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citation_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  plate VARCHAR(20),
  offense VARCHAR(255) NOT NULL,
  driver_name VARCHAR(255),
  driver_id UUID REFERENCES drivers(id),
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('paid', 'unpaid')),
  officer_id UUID REFERENCES officers(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Incidents Table =====
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('urgent', 'active', 'resolved', 'investigating')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  assigned_officer_id UUID REFERENCES officers(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Patrols Table =====
CREATE TABLE IF NOT EXISTS patrols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patrol_number VARCHAR(50) UNIQUE NOT NULL,
  officer_id UUID NOT NULL REFERENCES officers(id),
  area VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  distance_km DECIMAL(8,2),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  progress INT DEFAULT 0,
  notes TEXT,
  incidents_observed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Alerts Table =====
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(255),
  category VARCHAR(20) DEFAULT 'all'
    CHECK (category IN ('all', 'mine')),
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('normal', 'important', 'urgent')),
  icon VARCHAR(50),
  icon_color VARCHAR(20),
  border_color VARCHAR(20),
  is_read BOOLEAN DEFAULT false,
  sent_by UUID REFERENCES users(id),
  audience VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== PF3 Forms (Accident Reports) Table =====
CREATE TABLE IF NOT EXISTS pf3_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  region VARCHAR(100),
  district VARCHAR(100),
  station_id UUID REFERENCES stations(id),
  accident_type VARCHAR(255),
  severity VARCHAR(50),
  weather VARCHAR(50),
  road_surface VARCHAR(50),
  light_condition VARCHAR(50),
  vehicles_json JSONB,
  casualties_json JSONB,
  witnesses_json JSONB,
  sketch_url TEXT,
  officer_id UUID REFERENCES officers(id),
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Vehicle Inspections Table =====
CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  plate VARCHAR(20) NOT NULL,
  officer_id UUID REFERENCES officers(id),
  location VARCHAR(255),
  inspection_date TIMESTAMPTZ NOT NULL,
  documents_json JSONB,
  mechanical_json JSONB,
  photos_json JSONB,
  result VARCHAR(20) DEFAULT 'pass'
    CHECK (result IN ('pass', 'fail')),
  officer_signature VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_officers_station ON officers(station_id);
CREATE INDEX IF NOT EXISTS idx_officers_status ON officers(status);
CREATE INDEX IF NOT EXISTS idx_posts_station ON posts(station_id);
CREATE INDEX IF NOT EXISTS idx_assignments_officer ON assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_station ON assignments(station_id);
CREATE INDEX IF NOT EXISTS idx_citations_plate ON citations(plate);
CREATE INDEX IF NOT EXISTS idx_citations_status ON citations(status);
CREATE INDEX IF NOT EXISTS idx_citations_date ON citations(date);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(date);
CREATE INDEX IF NOT EXISTS idx_patrols_officer ON patrols(officer_id);
CREATE INDEX IF NOT EXISTS idx_patrols_status ON patrols(status);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_citizens_nida ON citizens(nida);
CREATE INDEX IF NOT EXISTS idx_citizens_mobile ON citizens(mobile);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);

-- ===== Row Level Security (RLS) =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pf3_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- ===== Updated_at Trigger =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_officers_updated_at BEFORE UPDATE ON officers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_citations_updated_at BEFORE UPDATE ON citations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_patrols_updated_at BEFORE UPDATE ON patrols FOR EACH ROW EXECUTE FUNCTION update_updated_at();
