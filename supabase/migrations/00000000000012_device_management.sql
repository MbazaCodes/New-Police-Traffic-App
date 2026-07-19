-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — DEVICE MANAGEMENT
-- Migration: 00000000000012_device_management
-- Full device lifecycle: manufacturers, models, ownership
-- history, officer assignments, maintenance, theft reports,
-- serial/IMEI registry, blacklist, anti-theft verification
-- ============================================================

-- ── Device Manufacturers ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_manufacturers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  country    VARCHAR(100),
  website    VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Device Categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Device Models ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_models (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID REFERENCES device_manufacturers(id),
  category_id     UUID REFERENCES device_categories(id),
  name            VARCHAR(100) NOT NULL,
  model_number    VARCHAR(50),
  description     TEXT,
  specifications  JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Device Ownership History ──────────────────────────────────
CREATE TABLE IF NOT EXISTS device_ownership (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id           UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  previous_owner_id   UUID REFERENCES citizens(id),
  new_owner_id        UUID REFERENCES citizens(id),
  transfer_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  transfer_reason     TEXT,
  purchase_price      DECIMAL(12,2),
  verified_by         UUID REFERENCES users(id),
  proof_document_url  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_own_device ON device_ownership(device_id);
CREATE INDEX IF NOT EXISTS idx_device_own_new    ON device_ownership(new_owner_id);

-- ── Device Assignments to Officers ───────────────────────────
-- Tracks police-issued devices (radios, laptops, body cams)
CREATE TABLE IF NOT EXISTS device_assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id         UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  officer_id        UUID NOT NULL REFERENCES users(id),
  assigned_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  returned_date     DATE,
  assignment_reason TEXT,
  condition_out     VARCHAR(100) DEFAULT 'Nzuri',
  condition_in      VARCHAR(100),
  assigned_by       UUID REFERENCES users(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','returned','lost','damaged')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_assign_device  ON device_assignments(device_id);
CREATE INDEX IF NOT EXISTS idx_dev_assign_officer ON device_assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_dev_assign_status  ON device_assignments(status);

-- ── Device Maintenance ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_maintenance (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id             UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  maintenance_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  maintenance_type      VARCHAR(50) NOT NULL
    CHECK (maintenance_type IN ('repair','inspection','upgrade','cleaning')),
  description           TEXT NOT NULL,
  cost                  DECIMAL(10,2) DEFAULT 0,
  performed_by          VARCHAR(255),
  next_maintenance_date DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_maint_device ON device_maintenance(device_id);
CREATE INDEX IF NOT EXISTS idx_dev_maint_date   ON device_maintenance(maintenance_date);

-- ── Device Location History ───────────────────────────────────
CREATE TABLE IF NOT EXISTS device_locations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  latitude      DECIMAL(10,7),
  longitude     DECIMAL(10,7),
  location_name VARCHAR(255),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by   UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_dev_loc_device ON device_locations(device_id, recorded_at DESC);

-- ── Theft Reports ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_theft_reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_number     VARCHAR(50) NOT NULL UNIQUE,
  device_id         UUID NOT NULL REFERENCES devices(id),
  reported_by       UUID REFERENCES users(id),
  citizen_id        UUID REFERENCES citizens(id),
  theft_date        DATE,
  theft_location    VARCHAR(255),
  circumstances     TEXT,
  station_id        UUID REFERENCES stations(id),
  status            VARCHAR(50) NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported','investigating','recovered','closed')),
  recovered_date    DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theft_device ON device_theft_reports(device_id);
CREATE INDEX IF NOT EXISTS idx_theft_status ON device_theft_reports(status);

-- ── Serial Number Registry ────────────────────────────────────
-- Extended registry beyond basic devices table
CREATE TABLE IF NOT EXISTS serial_number_registry (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number    VARCHAR(100) NOT NULL UNIQUE,
  imei             VARCHAR(20),
  imei2            VARCHAR(20),                          -- dual-SIM devices
  manufacturer_id  UUID REFERENCES device_manufacturers(id),
  model_id         UUID REFERENCES device_models(id),
  category_id      UUID REFERENCES device_categories(id),
  production_date  DATE,
  batch_number     VARCHAR(50),
  color            VARCHAR(50),
  storage_capacity VARCHAR(20),
  status           VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','stolen','blacklisted','decommissioned','unknown')),
  registered_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  registered_by    UUID REFERENCES users(id),
  is_blacklisted   BOOLEAN NOT NULL DEFAULT FALSE,
  blacklist_reason TEXT,
  blacklisted_at   TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snr_serial      ON serial_number_registry(serial_number);
CREATE INDEX IF NOT EXISTS idx_snr_imei        ON serial_number_registry(imei);
CREATE INDEX IF NOT EXISTS idx_snr_status      ON serial_number_registry(status);
CREATE INDEX IF NOT EXISTS idx_snr_blacklisted ON serial_number_registry(is_blacklisted);

-- ── Serial Number Ownership ───────────────────────────────────
CREATE TABLE IF NOT EXISTS serial_number_ownership (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number_id      UUID NOT NULL REFERENCES serial_number_registry(id),
  citizen_id            UUID NOT NULL REFERENCES citizens(id),
  acquisition_date      DATE,
  acquisition_method    VARCHAR(50)
    CHECK (acquisition_method IN ('purchase','gift','transfer','inheritance','found')),
  proof_document_url    TEXT,
  purchase_price        DECIMAL(12,2),
  verified_by           UUID REFERENCES users(id),
  verified_at           TIMESTAMPTZ,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snown_serial  ON serial_number_ownership(serial_number_id);
CREATE INDEX IF NOT EXISTS idx_snown_citizen ON serial_number_ownership(citizen_id);
CREATE INDEX IF NOT EXISTS idx_snown_active  ON serial_number_ownership(active);

-- ── Serial Number Lookup History (audit trail) ────────────────
CREATE TABLE IF NOT EXISTS serial_number_lookups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number VARCHAR(100),
  imei          VARCHAR(20),
  looked_up_by  UUID REFERENCES users(id),
  looked_up_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lookup_type   VARCHAR(50) DEFAULT 'search'
    CHECK (lookup_type IN ('search','verification','check','court_request')),
  ip_address    INET,
  result        JSONB
);

CREATE INDEX IF NOT EXISTS idx_snl_serial ON serial_number_lookups(serial_number);
CREATE INDEX IF NOT EXISTS idx_snl_imei   ON serial_number_lookups(imei);
CREATE INDEX IF NOT EXISTS idx_snl_by     ON serial_number_lookups(looked_up_by);
CREATE INDEX IF NOT EXISTS idx_snl_at     ON serial_number_lookups(looked_up_at DESC);

-- ── Device Blacklist ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_blacklist (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number    VARCHAR(100),
  imei             VARCHAR(20),
  blacklist_reason VARCHAR(50) NOT NULL
    CHECK (blacklist_reason IN ('stolen','lost','fraud','suspicious','court_order')),
  description      TEXT,
  reported_by      UUID REFERENCES users(id),
  reported_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  station_id       UUID REFERENCES stations(id),
  status           VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','removed','expired')),
  removed_by       UUID REFERENCES users(id),
  removed_at       TIMESTAMPTZ,
  removal_reason   TEXT
);

CREATE INDEX IF NOT EXISTS idx_bl_serial ON device_blacklist(serial_number);
CREATE INDEX IF NOT EXISTS idx_bl_imei   ON device_blacklist(imei);
CREATE INDEX IF NOT EXISTS idx_bl_status ON device_blacklist(status);

-- ── IMEI Ranges (manufacturer allocation) ────────────────────
CREATE TABLE IF NOT EXISTS imei_ranges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID REFERENCES device_manufacturers(id),
  model_id        UUID REFERENCES device_models(id),
  start_imei      VARCHAR(20) NOT NULL,
  end_imei        VARCHAR(20) NOT NULL,
  allocated_date  DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Anti-Theft Verification ───────────────────────────────────
CREATE TABLE IF NOT EXISTS anti_theft_verification (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id         UUID REFERENCES devices(id),
  serial_number     VARCHAR(100),
  imei              VARCHAR(20),
  verification_type VARCHAR(50) NOT NULL DEFAULT 'police_check'
    CHECK (verification_type IN ('police_check','insurance_check','court_request','customs')),
  verification_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_by       UUID REFERENCES users(id),
  result            VARCHAR(50) NOT NULL
    CHECK (result IN ('clean','stolen','suspicious','unknown')),
  confidence_level  VARCHAR(20) DEFAULT 'high'
    CHECK (confidence_level IN ('high','medium','low')),
  notes             TEXT
);

CREATE INDEX IF NOT EXISTS idx_atv_device ON anti_theft_verification(device_id);
CREATE INDEX IF NOT EXISTS idx_atv_serial ON anti_theft_verification(serial_number);
CREATE INDEX IF NOT EXISTS idx_atv_result ON anti_theft_verification(result);

-- ── Extend devices table ──────────────────────────────────────
ALTER TABLE devices ADD COLUMN IF NOT EXISTS manufacturer_id  UUID REFERENCES device_manufacturers(id);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS model_id         UUID REFERENCES device_models(id);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS color            VARCHAR(50);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(20);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS purchase_date    DATE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS purchase_price   DECIMAL(12,2);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS warranty_expiry  DATE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS insurance_policy VARCHAR(100);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS blacklisted      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS notes            TEXT;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS snr_id           UUID REFERENCES serial_number_registry(id);

-- RLS
ALTER TABLE device_manufacturers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_models           ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_ownership        ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_assignments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_maintenance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_theft_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_number_registry  ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_number_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_number_lookups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_blacklist        ENABLE ROW LEVEL SECURITY;
ALTER TABLE imei_ranges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_theft_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY dev_mgmt_select ON device_manufacturers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dev_cat_select  ON device_categories    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dev_mod_select  ON device_models        FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dev_own_select  ON device_ownership     FOR SELECT TO authenticated USING (is_commander() OR is_officer() OR is_investigator());
CREATE POLICY dev_own_write   ON device_ownership     FOR ALL    TO authenticated USING (is_commander() OR is_investigator()) WITH CHECK (is_commander() OR is_investigator());
CREATE POLICY dev_asgn_select ON device_assignments   FOR SELECT TO authenticated USING (officer_id = auth.uid() OR is_commander());
CREATE POLICY dev_asgn_write  ON device_assignments   FOR ALL    TO authenticated USING (is_commander()) WITH CHECK (is_commander());
CREATE POLICY dev_maint_sel   ON device_maintenance   FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY dev_maint_write ON device_maintenance   FOR ALL    TO authenticated USING (is_commander()) WITH CHECK (is_commander());
CREATE POLICY dev_loc_sel     ON device_locations     FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY dev_theft_sel   ON device_theft_reports FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY dev_theft_write ON device_theft_reports FOR ALL    TO authenticated USING (is_officer() OR is_commander()) WITH CHECK (TRUE);
CREATE POLICY snr_select      ON serial_number_registry  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY snr_write       ON serial_number_registry  FOR ALL    TO authenticated USING (is_commander() OR is_investigator()) WITH CHECK (TRUE);
CREATE POLICY snown_select    ON serial_number_ownership FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY snl_select      ON serial_number_lookups   FOR SELECT TO authenticated USING (looked_up_by = auth.uid() OR is_commander());
CREATE POLICY snl_insert      ON serial_number_lookups   FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY bl_select       ON device_blacklist         FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY bl_write        ON device_blacklist         FOR ALL    TO authenticated USING (is_commander() OR is_investigator()) WITH CHECK (TRUE);
CREATE POLICY atv_select      ON anti_theft_verification  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY atv_write       ON anti_theft_verification  FOR ALL    TO authenticated USING (is_officer() OR is_commander()) WITH CHECK (TRUE);

-- Seed manufacturers
INSERT INTO device_manufacturers (name, country, website) VALUES
  ('Samsung',       'South Korea', 'samsung.com'),
  ('Apple',         'USA',         'apple.com'),
  ('Tecno',         'China/Africa','tecno-mobile.com'),
  ('Infinix',       'China/Africa','infinixmobility.com'),
  ('Nokia',         'Finland',     'nokia.com'),
  ('Xiaomi',        'China',       'xiaomi.com'),
  ('Oppo',          'China',       'oppo.com'),
  ('Vivo',          'China',       'vivo.com'),
  ('HP',            'USA',         'hp.com'),
  ('Dell',          'USA',         'dell.com'),
  ('Lenovo',        'China',       'lenovo.com'),
  ('ASUS',          'Taiwan',      'asus.com')
ON CONFLICT (name) DO NOTHING;

-- Seed categories
INSERT INTO device_categories (name, description, icon) VALUES
  ('Simu ya Mkononi',  'Mobile/Smartphone devices',  'smartphone'),
  ('Kompyuta Ndogo',   'Laptops and notebooks',       'laptop'),
  ('Kompyuta Kibao',   'Tablet devices',              'tablet'),
  ('Redio ya Polisi',  'Police radio communications', 'radio'),
  ('Kamera ya Mwili',  'Body camera / dashcam',       'camera'),
  ('GPS Tracker',      'Vehicle/asset trackers',      'map-pin'),
  ('Kompyuta ya Mezani','Desktop computers',           'monitor')
ON CONFLICT (name) DO NOTHING;
