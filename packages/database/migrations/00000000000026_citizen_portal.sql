-- ═══════════════════════════════════════════════════════════════════
-- Migration 026: Citizen Portal + Enhanced Logging
-- ═══════════════════════════════════════════════════════════════════

-- ── Citizen Portal Users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id        UUID REFERENCES citizens(id) ON DELETE SET NULL,
  phone             VARCHAR(20) UNIQUE,
  email             VARCHAR(255) UNIQUE,
  nida              VARCHAR(20) UNIQUE,
  password_hash     TEXT,
  otp_code          VARCHAR(6),
  otp_expires_at    TIMESTAMPTZ,
  is_verified       BOOLEAN DEFAULT FALSE,
  is_driver         BOOLEAN DEFAULT FALSE,
  driving_license   VARCHAR(50),
  good_conduct_points INTEGER DEFAULT 100,
  driver_points     INTEGER DEFAULT 12,
  profile_complete  BOOLEAN DEFAULT FALSE,
  status            VARCHAR(20) DEFAULT 'active',
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Citizen Properties ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id      UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  account_id      UUID REFERENCES citizen_accounts(id) ON DELETE SET NULL,
  property_type   VARCHAR(50) NOT NULL DEFAULT 'land',
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  location        TEXT,
  region          VARCHAR(100),
  district        VARCHAR(100),
  ward            VARCHAR(150),
  plot_no         VARCHAR(100),
  title_deed_no   VARCHAR(100),
  estimated_value VARCHAR(100),
  acquisition_date DATE,
  documents       JSONB DEFAULT '[]',
  status          VARCHAR(20) DEFAULT 'active',
  verified        BOOLEAN DEFAULT FALSE,
  officer_id      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Citizen Devices ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_devices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id      UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  account_id      UUID REFERENCES citizen_accounts(id) ON DELETE SET NULL,
  device_type     VARCHAR(50) NOT NULL DEFAULT 'phone',
  brand           VARCHAR(100),
  model           VARCHAR(100),
  serial_no       VARCHAR(100) UNIQUE,
  imei            VARCHAR(20),
  color           VARCHAR(50),
  purchase_date   DATE,
  purchase_price  VARCHAR(50),
  registered_at   TIMESTAMPTZ DEFAULT NOW(),
  status          VARCHAR(20) DEFAULT 'active',
  is_stolen       BOOLEAN DEFAULT FALSE,
  officer_id      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Citizen Complaints ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_complaints (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id      UUID NOT NULL REFERENCES citizen_accounts(id),
  citizen_id      UUID REFERENCES citizens(id),
  complaint_type  VARCHAR(50) NOT NULL DEFAULT 'general',
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  location        TEXT,
  incident_date   DATE,
  suspects        TEXT,
  witnesses       TEXT,
  evidence_desc   TEXT,
  status          VARCHAR(30) DEFAULT 'submitted',
  priority        VARCHAR(20) DEFAULT 'normal',
  assigned_to     UUID REFERENCES users(id),
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  reference_no    VARCHAR(30) UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Citizen Applications (PF3, Good Conduct, Ownership cert) ─────
CREATE TABLE IF NOT EXISTS citizen_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id      UUID NOT NULL REFERENCES citizen_accounts(id),
  citizen_id      UUID REFERENCES citizens(id),
  app_type        VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  data            JSONB DEFAULT '{}',
  status          VARCHAR(30) DEFAULT 'pending',
  fee_amount      DECIMAL(10,2) DEFAULT 0,
  fee_paid        BOOLEAN DEFAULT FALSE,
  payment_ref     VARCHAR(100),
  issued_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  certificate_no  VARCHAR(50),
  officer_id      UUID REFERENCES users(id),
  reference_no    VARCHAR(30) UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Citizen Payments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id      UUID NOT NULL REFERENCES citizen_accounts(id),
  citation_id     UUID REFERENCES citations(id),
  application_id  UUID REFERENCES citizen_applications(id),
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(5) DEFAULT 'TZS',
  payment_method  VARCHAR(30) DEFAULT 'mobile_money',
  payment_ref     VARCHAR(100),
  control_number  VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enhanced Activity Logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID,
  user_type       VARCHAR(20) DEFAULT 'officer',  -- officer | citizen | admin
  user_name       VARCHAR(255),
  user_role       VARCHAR(100),
  action          VARCHAR(100) NOT NULL,
  resource        VARCHAR(100),
  resource_id     VARCHAR(255),
  description     TEXT,
  changes         JSONB,
  ip_address      VARCHAR(50),
  user_agent      TEXT,
  session_id      VARCHAR(100),
  success         BOOLEAN DEFAULT TRUE,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_citizen_accounts_phone  ON citizen_accounts(phone);
CREATE INDEX IF NOT EXISTS idx_citizen_accounts_nida   ON citizen_accounts(nida);
CREATE INDEX IF NOT EXISTS idx_citizen_complaints_acct ON citizen_complaints(account_id);
CREATE INDEX IF NOT EXISTS idx_citizen_apps_acct       ON citizen_applications(account_id);
CREATE INDEX IF NOT EXISTS idx_citizen_payments_acct   ON citizen_payments(account_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user      ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action    ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_citizen_props_citizen   ON citizen_properties(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizen_devices_citizen ON citizen_devices(citizen_id);

-- ── Auto reference numbers ────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS complaint_seq  START 1001;
CREATE SEQUENCE IF NOT EXISTS app_seq        START 2001;

CREATE OR REPLACE FUNCTION auto_complaint_ref() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference_no IS NULL OR NEW.reference_no = '' THEN
    NEW.reference_no := 'CMP-' || TO_CHAR(NOW(),'YYYY') || '-' || LPAD(nextval('complaint_seq')::TEXT,4,'0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_complaint_ref ON citizen_complaints;
CREATE TRIGGER tg_complaint_ref BEFORE INSERT ON citizen_complaints FOR EACH ROW EXECUTE FUNCTION auto_complaint_ref();

CREATE OR REPLACE FUNCTION auto_app_ref() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference_no IS NULL OR NEW.reference_no = '' THEN
    NEW.reference_no := 'APP-' || TO_CHAR(NOW(),'YYYY') || '-' || LPAD(nextval('app_seq')::TEXT,4,'0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_app_ref ON citizen_applications;
CREATE TRIGGER tg_app_ref BEFORE INSERT ON citizen_applications FOR EACH ROW EXECUTE FUNCTION auto_app_ref();

-- ── RLS: Disable for now so API (service role) can insert freely ──
ALTER TABLE citizen_accounts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_properties  DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_devices     DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_complaints  DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_payments    DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs       DISABLE ROW LEVEL SECURITY;

-- Grant full access to service role
GRANT ALL ON citizen_accounts     TO service_role;
GRANT ALL ON citizen_properties   TO service_role;
GRANT ALL ON citizen_devices      TO service_role;
GRANT ALL ON citizen_complaints   TO service_role;
GRANT ALL ON citizen_applications TO service_role;
GRANT ALL ON citizen_payments     TO service_role;
GRANT ALL ON activity_logs        TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
