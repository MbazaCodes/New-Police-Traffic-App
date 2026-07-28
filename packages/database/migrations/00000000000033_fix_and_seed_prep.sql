-- Fix device_status enum to include 'active'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='active' AND enumtypid=(SELECT oid FROM pg_type WHERE typname='device_status')) THEN
    ALTER TYPE device_status ADD VALUE 'active';
  END IF;
END $$;

-- Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255),
  property_type   VARCHAR(50) DEFAULT 'land',
  address         VARCHAR(500),
  region          VARCHAR(100),
  district        VARCHAR(100),
  ward            VARCHAR(100),
  title_deed_no   VARCHAR(100),
  value           NUMERIC(15,2),
  area_sqm        NUMERIC(10,2),
  status          VARCHAR(30) DEFAULT 'registered',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_owners if not exists
CREATE TABLE IF NOT EXISTS property_owners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID REFERENCES properties(id) ON DELETE CASCADE,
  citizen_id      UUID REFERENCES citizens(id) ON DELETE SET NULL,
  owner_name      VARCHAR(255),
  owner_nida      VARCHAR(50),
  ownership_type  VARCHAR(30) DEFAULT 'full',
  owned_from      DATE DEFAULT CURRENT_DATE,
  is_current      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Create licenses table if not exists
CREATE TABLE IF NOT EXISTS licenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id      UUID REFERENCES citizens(id) ON DELETE SET NULL,
  license_number  VARCHAR(50) UNIQUE,
  license_type    VARCHAR(30) DEFAULT 'B',
  issued_date     DATE,
  expiry_date     DATE,
  status          VARCHAR(20) DEFAULT 'active',
  restrictions    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_prop_owners_citizen ON property_owners(citizen_id);
CREATE INDEX IF NOT EXISTS idx_licenses_citizen ON licenses(citizen_id);
CREATE INDEX IF NOT EXISTS idx_licenses_number ON licenses(license_number);
