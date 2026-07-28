-- Migration 34: Government ID Types, Citizen Government IDs, and Service Prices
-- Features:
--   1) citizen_government_ids — stores Passport, ENEC, NSSF/PPF, NHIF, Driving License, Voter ID, etc.
--   2) government_id_types — catalog of all recognized government ID types
--   3) service_prices — admin-editable pricing for services (fines, applications, etc.)

-- ═══════════════════════════════════════════════════════════════
-- 1. Government ID Types (catalog)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS government_id_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,          -- e.g. 'passport', 'enec', 'nssf', 'nhif', 'ppf', 'voter_id', 'driving_license', 'tin'
  name_en     TEXT NOT NULL,                 -- e.g. 'Passport', 'National Electorate Card (ENEC)', etc.
  name_sw     TEXT NOT NULL,                 -- Swahili name e.g. 'Pasapoti', 'Kadi ya Uchaguzi (ENEC)', etc.
  description TEXT,
  pattern     TEXT,                          -- regex pattern for validation (optional)
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed default government ID types
INSERT INTO government_id_types (code, name_en, name_sw, description, pattern) VALUES
  ('nida',           'National ID (NIDA)',             'Kitambulisho cha Taifa (NIDA)',     'Tanzania National Identification Card', '^\\d{20}$'),
  ('passport',       'Passport',                        'Pasapoti',                          'Tanzania Passport Number',             '^P\\d{7}$|^A\\d{7}$|^TZ\\d+$'),
  ('enec',           'Voter ID (ENEC)',                 'Kadi ya Uchaguzi (ENEC)',           'Electoral Commission Voter Card',      '^\\d{8,12}$'),
  ('nssf',           'NSSF Number',                     'Namba ya NSSF',                     'National Social Security Fund',        '^NSSF-\\d+$|^\\d{6,10}$'),
  ('ppf',            'PPF Number',                      'Namba ya PPF',                      'Parastatal Pensions Fund',             '^PPF-\\d+$|^\\d{6,10}$'),
  ('nhif',           'NHIF Number',                     'Namba ya NHIF',                     'National Health Insurance Fund',       '^\\d{6,10}$'),
  ('driving_license','Driving License',                 'Leseni ya Udereva',                 'Tanzania Driving License',             '^DL\\d+$|^\\d{6,8}$'),
  ('tin',            'TIN (Tax ID)',                    'Namba ya TIN',                      'Taxpayer Identification Number',      '^\\d{9,10}$'),
  ('voter_id',       'Voter Registration Card',        'Kadi ya Usajili wa Uchaguzi',       'Voter registration document',          '^\\d{8,12}$'),
  ('birth_cert',     'Birth Certificate',              'Cheti cha Kuzaliwa',                'Official birth certificate number',    '^BC\\d+$|^\\d{6,10}$')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. Citizen Government IDs (per-citizen linked government IDs)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS citizen_government_ids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id      UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  id_type_code    TEXT NOT NULL REFERENCES government_id_types(code),
  id_number       TEXT NOT NULL,              -- the actual ID number (e.g. passport number, NSSF number)
  id_number_norm  TEXT,                        -- normalized for search (digits only, uppercase, stripped spaces)
  issuing_country TEXT DEFAULT 'Tanzania',
  issue_date      DATE,
  expiry_date     DATE,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','expired','suspended','revoked','pending')),
  verified        BOOLEAN DEFAULT false,
  document_url    TEXT,                        -- photo/scan of the ID document
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  -- One citizen can only have one active record per ID type
  UNIQUE (citizen_id, id_type_code, id_number)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_gov_ids_citizen     ON citizen_government_ids (citizen_id);
CREATE INDEX IF NOT EXISTS idx_gov_ids_type        ON citizen_government_ids (id_type_code);
CREATE INDEX IF NOT EXISTS idx_gov_ids_number      ON citizen_government_ids (id_number);
CREATE INDEX IF NOT EXISTS idx_gov_ids_number_norm  ON citizen_government_ids (id_number_norm);
CREATE INDEX IF NOT EXISTS idx_gov_ids_status      ON citizen_government_ids (status);

-- Auto-normalize id_number into id_number_norm on insert/update
CREATE OR REPLACE FUNCTION normalize_government_id() RETURNS trigger AS $$
BEGIN
  NEW.id_number_norm := upper(regexp_replace(NEW.id_number, '[^A-Z0-9]', '', 'i'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_gov_id
  BEFORE INSERT OR UPDATE ON citizen_government_ids
  FOR EACH ROW EXECUTE FUNCTION normalize_government_id();

-- ═══════════════════════════════════════════════════════════════
-- 3. Service Prices (admin-editable pricing for services)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS service_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,           -- e.g. 'traffic_fine_base', 'overdue_penalty_rate', 'bail_processing', 'good_conduct_certificate', 'lost_item_report'
  name_en     TEXT NOT NULL,                  -- English name
  name_sw     TEXT NOT NULL,                  -- Swahili name
  category    TEXT NOT NULL DEFAULT 'fine',   -- fine, application, service, penalty
  amount      DECIMAL(12,2) NOT NULL DEFAULT 0,   -- price in TZS (or percentage for rates)
  is_rate     BOOLEAN DEFAULT false,          -- true = this is a percentage rate (e.g. 5% penalty), false = flat TZS amount
  unit        TEXT DEFAULT 'TZS',             -- TZS, %, points
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID REFERENCES users(id)
);

-- Seed default service prices (editable by admin)
INSERT INTO service_prices (code, name_en, name_sw, category, amount, is_rate, unit, description) VALUES
  ('traffic_fine_base',       'Base Traffic Fine',              'Faini ya Trafiki (Msingi)',         'fine',       30000,   false, 'TZS',  'Default base amount for traffic offenses'),
  ('overdue_penalty_rate',    'Overdue Penalty Rate (weekly)',  'Malipo ya Kuchelewa (Kila Wiki)',  'penalty',    5,      true,  '%',    'Weekly penalty percentage added to overdue fines'),
  ('bail_processing_fee',    'Bail Processing Fee',            'Malipo ya Kuachilia',              'service',    5000,   false, 'TZS',  'Administrative fee for bail processing'),
  ('good_conduct_certificate','Good Conduct Certificate',      'Cheti cha Tabia Njema',            'application', 10000,  false, 'TZS',  'Fee for issuing good conduct certificate'),
  ('lost_item_report',       'Lost Item Report Fee',           'Malipo ya Ripoti ya Potevu',       'service',    5000,   false, 'TZS',  'Fee for filing a lost item report'),
  ('vehicle_inspection',     'Vehicle Inspection Fee',         'Malipo ya Ukaguzi wa Gari',        'service',    15000,  false, 'TZS',  'Fee for official vehicle inspection'),
  ('drivers_license_renewal','License Renewal Fee',            'Malipo ya Kuendeleza Leseni',      'application', 20000,  false, 'TZS',  'Fee for driving license renewal'),
  ('character_reference',    'Character Reference Letter',     'Barua ya Marejeo ya Tabia',        'application', 5000,   false, 'TZS',  'Fee for character reference letter'),
  ('case_report_copy',       'Case Report Copy Fee',           'Malipo ya Nakala ya Ripoti',       'service',    3000,   false, 'TZS',  'Fee for copying a case report'),
  ('emergency_response',     'Emergency Response Fee',         'Malipo ya Msaada wa Dharura',      'service',    0,      false, 'TZS',  'No charge for emergency response (currently free)')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 4. RLS Policies
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE government_id_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_government_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

-- Service_role and postgres have full access
CREATE POLICY "service_role_full_gov_id_types" ON government_id_types FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "postgres_full_gov_id_types" ON government_id_types FOR ALL TO postgres USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_citizen_gov_ids" ON citizen_government_ids FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "postgres_full_citizen_gov_ids" ON citizen_government_ids FOR ALL TO postgres USING (true) WITH CHECK (true);

CREATE POLICY "service_role_full_service_prices" ON service_prices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "postgres_full_service_prices" ON service_prices FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Authenticated users can read government ID types
CREATE POLICY "auth_read_gov_id_types" ON government_id_types FOR SELECT TO authenticated USING (is_active = true);

-- Authenticated users can read their own citizen government IDs
CREATE POLICY "auth_read_own_gov_ids" ON citizen_government_ids FOR SELECT TO authenticated
  USING (citizen_id IN (SELECT citizen_id FROM citizen_accounts WHERE id = auth_uid()));

-- Authenticated users can read service prices
CREATE POLICY "auth_read_service_prices" ON service_prices FOR SELECT TO authenticated USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════
-- 5. Update citizen photo_url and verified columns
-- ═══════════════════════════════════════════════════════════════
-- photo_url already exists (added in migration 023)
-- verified already exists (added in migration 028)

-- ═══════════════════════════════════════════════════════════════
-- 6. Comments
-- ═══════════════════════════════════════════════════════════════
COMMENT ON TABLE government_id_types IS 'Catalog of all recognized government ID types (NIDA, Passport, ENEC, NSSF, PPF, NHIF, etc.)';
COMMENT ON TABLE citizen_government_ids IS 'Per-citizen government ID records linking citizens to their various government identification documents';
COMMENT ON TABLE service_prices IS 'Admin-editable service pricing — all monetary amounts and rates configurable through admin settings';
