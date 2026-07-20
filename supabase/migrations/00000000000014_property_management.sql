-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — PROPERTY MANAGEMENT
-- Migration: 00000000000014_property_management
-- Full property lifecycle: registry, ownership, valuation,
-- transactions, documents, tax records, disputes
-- ============================================================

-- ── Property Categories & Types ───────────────────────────────
CREATE TABLE IF NOT EXISTS property_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_types (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES property_categories(id),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Property Registry ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_number  VARCHAR(50) NOT NULL UNIQUE,
  title_deed       VARCHAR(50),
  survey_number    VARCHAR(50),
  block_number     VARCHAR(50),
  plot_number      VARCHAR(50),
  type_id          UUID REFERENCES property_types(id),
  category_id      UUID REFERENCES property_categories(id),
  description      TEXT,
  address          TEXT NOT NULL,
  region           VARCHAR(100),
  district         VARCHAR(100),
  ward             VARCHAR(100),
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  area_sqm         DECIMAL(12,2),
  land_use         VARCHAR(50) CHECK (land_use IN ('residential','commercial','industrial','agricultural','mixed','institutional')),
  status           VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','sold','disputed','transferred','deceased','government')),
  registered_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  registered_by    UUID REFERENCES users(id),
  station_id       UUID REFERENCES stations(id),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS property_seq START 10001;
CREATE OR REPLACE FUNCTION auto_property_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.property_number IS NULL OR NEW.property_number = '' THEN
    NEW.property_number := 'PR-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                           LPAD(nextval('property_seq')::TEXT, 5, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_property_number ON properties;
CREATE TRIGGER tg_property_number BEFORE INSERT ON properties FOR EACH ROW EXECUTE FUNCTION auto_property_number();

CREATE INDEX IF NOT EXISTS idx_prop_status  ON properties(status);
CREATE INDEX IF NOT EXISTS idx_prop_region  ON properties(region);
CREATE INDEX IF NOT EXISTS idx_prop_title   ON properties(title_deed);
CREATE INDEX IF NOT EXISTS idx_prop_survey  ON properties(survey_number);

-- ── Property Owners ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_owners (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id          UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  citizen_id           UUID NOT NULL REFERENCES citizens(id),
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00
    CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  ownership_type       VARCHAR(50) DEFAULT 'sole'
    CHECK (ownership_type IN ('sole','joint','company','trust','government')),
  acquisition_date     DATE,
  acquisition_method   VARCHAR(100)
    CHECK (acquisition_method IN ('purchase','inheritance','gift','court_order','government_allocation')),
  acquisition_value    DECIMAL(15,2),
  is_primary_owner     BOOLEAN DEFAULT TRUE,
  registered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes                TEXT
);

CREATE INDEX IF NOT EXISTS idx_po_property ON property_owners(property_id);
CREATE INDEX IF NOT EXISTS idx_po_citizen  ON property_owners(citizen_id);

-- ── Property Ownership History ────────────────────────────────
CREATE TABLE IF NOT EXISTS property_ownership_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id       UUID NOT NULL REFERENCES properties(id),
  previous_owner_id UUID REFERENCES citizens(id),
  new_owner_id      UUID REFERENCES citizens(id),
  transfer_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  transfer_type     VARCHAR(50)
    CHECK (transfer_type IN ('sale','gift','inheritance','court_order','government')),
  transfer_value    DECIMAL(15,2),
  documented_by     UUID REFERENCES users(id),
  documents         JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poh_property ON property_ownership_history(property_id);

-- ── Property Valuations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_valuations (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id          UUID NOT NULL REFERENCES properties(id),
  valuation_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  land_value           DECIMAL(15,2),
  building_value       DECIMAL(15,2),
  total_value          DECIMAL(15,2) NOT NULL,
  valuation_method     VARCHAR(100),
  valuer_name          VARCHAR(255),
  valuer_license       VARCHAR(50),
  valuation_report_url TEXT,
  verified_by          UUID REFERENCES users(id),
  verified_at          TIMESTAMPTZ,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_property ON property_valuations(property_id, valuation_date DESC);

-- ── Property Documents ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type   VARCHAR(50) NOT NULL
    CHECK (document_type IN ('title_deed','survey_plan','valuation','lease','mortgage','court_order','other')),
  document_number VARCHAR(50),
  document_name   VARCHAR(255) NOT NULL,
  issue_date      DATE,
  expiry_date     DATE,
  file_url        TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES users(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdoc_property ON property_documents(property_id);

-- ── Property Transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number  VARCHAR(50) NOT NULL UNIQUE,
  property_id         UUID NOT NULL REFERENCES properties(id),
  transaction_type    VARCHAR(50) NOT NULL
    CHECK (transaction_type IN ('sale','lease','mortgage','transfer','government_acquisition')),
  transaction_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_value   DECIMAL(15,2),
  buyer_id            UUID REFERENCES citizens(id),
  seller_id           UUID REFERENCES citizens(id),
  agent_name          VARCHAR(255),
  agent_license       VARCHAR(50),
  status              VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','cancelled','disputed')),
  documents           JSONB,
  recorded_by         UUID REFERENCES users(id),
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes               TEXT
);

CREATE SEQUENCE IF NOT EXISTS prop_tx_seq START 10001;
CREATE OR REPLACE FUNCTION auto_property_transaction() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
    NEW.transaction_number := 'PT-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                              LPAD(nextval('prop_tx_seq')::TEXT, 5, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_prop_tx ON property_transactions;
CREATE TRIGGER tg_prop_tx BEFORE INSERT ON property_transactions FOR EACH ROW EXECUTE FUNCTION auto_property_transaction();

CREATE INDEX IF NOT EXISTS idx_ptx_property ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_ptx_status   ON property_transactions(status);

-- ── Property Tax Records ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_tax_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID NOT NULL REFERENCES properties(id),
  tax_year       INT NOT NULL,
  tax_amount     DECIMAL(15,2) NOT NULL,
  paid_amount    DECIMAL(15,2) DEFAULT 0,
  payment_date   DATE,
  payment_method VARCHAR(50),
  status         VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('paid','pending','overdue','waived')),
  receipt_number VARCHAR(50),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ptax_property ON property_tax_records(property_id, tax_year DESC);

-- ── Property Disputes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_disputes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id      UUID NOT NULL REFERENCES properties(id),
  case_id          UUID REFERENCES cases(id),
  dispute_type     VARCHAR(100) NOT NULL,
  description      TEXT NOT NULL,
  parties_involved TEXT,
  status           VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','resolved','in_court','withdrawn')),
  resolution_date  DATE,
  resolution_notes TEXT,
  recorded_by      UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdis_property ON property_disputes(property_id);
CREATE INDEX IF NOT EXISTS idx_pdis_status   ON property_disputes(status);

-- ── Property Lookup History ───────────────────────────────────
CREATE TABLE IF NOT EXISTS property_lookups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_number VARCHAR(50),
  title_deed      VARCHAR(50),
  looked_up_by    UUID REFERENCES users(id),
  looked_up_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lookup_type     VARCHAR(50) DEFAULT 'search',
  ip_address      INET,
  result          JSONB
);

CREATE INDEX IF NOT EXISTS idx_plook_by   ON property_lookups(looked_up_by);
CREATE INDEX IF NOT EXISTS idx_plook_at   ON property_lookups(looked_up_at DESC);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE properties               ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_valuations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tax_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_disputes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_lookups         ENABLE ROW LEVEL SECURITY;

CREATE POLICY prop_select  ON properties            FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY prop_write   ON properties            FOR ALL    TO authenticated USING (is_commander() OR is_investigator() OR is_officer()) WITH CHECK (TRUE);
CREATE POLICY pcat_select  ON property_categories   FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY ptyp_select  ON property_types        FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY pown_select  ON property_owners       FOR SELECT TO authenticated USING (is_commander() OR is_investigator() OR is_officer());
CREATE POLICY pown_write   ON property_owners       FOR ALL    TO authenticated USING (is_commander() OR is_investigator()) WITH CHECK (TRUE);
CREATE POLICY pvl_select   ON property_valuations   FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY pdoc_select  ON property_documents    FOR SELECT TO authenticated USING (is_commander() OR is_investigator() OR is_officer());
CREATE POLICY ptx_select   ON property_transactions FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY pdis_select  ON property_disputes     FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY plook_select ON property_lookups      FOR SELECT TO authenticated USING (looked_up_by = auth.uid() OR is_commander());
CREATE POLICY plook_insert ON property_lookups      FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Triggers
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed categories
INSERT INTO property_categories (name, description, icon) VALUES
  ('Ardhi',            'Land and plots',              'map'),
  ('Nyumba ya Kuishi', 'Residential buildings',       'home'),
  ('Biashara',         'Commercial properties',       'building'),
  ('Kilimo',           'Agricultural land',           'leaf'),
  ('Viwanda',          'Industrial properties',       'factory'),
  ('Msitu',            'Forest land',                 'tree')
ON CONFLICT (name) DO NOTHING;
