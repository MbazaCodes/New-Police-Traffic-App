-- ============================================================
-- OWNERSHIP HISTORY — Vehicles, Properties, Devices
-- Tracks full chain of ownership with status at each transfer
-- ============================================================

-- ── ENUMS ───────────────────────────────────────────────────

CREATE TYPE ownership_status AS ENUM (
  'active',           -- Currently owned / in use
  'transferred',      -- Transferred to new owner
  'lost',             -- Owner reported lost
  'stolen',           -- Reported stolen
  'damaged',          -- Reported damaged/written off
  'in_investigation', -- Under police investigation
  'recovered',        -- Was lost/stolen, now recovered
  'scrapped',         -- Disposed/scrapped
  'repossessed'       -- Repossessed (e.g. bank/court)
);

CREATE TYPE transfer_reason AS ENUM (
  'sale',             -- Sold to new owner
  'inheritance',      -- Inherited
  'gift',             -- Given as gift
  'court_order',      -- Court-ordered transfer
  'repossession',     -- Bank/lender repossession
  'government',       -- Government acquisition
  'donation',         -- Donated
  'stolen',           -- Stolen (involuntary)
  'lost',             -- Lost
  'other'
);

-- ── VEHICLE OWNERSHIP HISTORY ────────────────────────────────

CREATE TABLE vehicle_ownership (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id          UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Owner details (snapshot at time of ownership)
  owner_citizen_id    UUID REFERENCES citizens(id) ON DELETE SET NULL,
  owner_name          VARCHAR(255) NOT NULL,
  owner_nida          VARCHAR(50),
  owner_phone         VARCHAR(30),
  owner_address       TEXT,

  -- Ownership period
  owned_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  owned_until         DATE,  -- NULL = current owner

  -- Status during this ownership
  status              ownership_status NOT NULL DEFAULT 'active',
  transfer_reason     transfer_reason,
  notes               TEXT,

  -- Who recorded this (officer/admin)
  recorded_by_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_by_name    VARCHAR(255),
  recorded_by_role    VARCHAR(100),

  -- Evidence/docs
  attachments         JSONB DEFAULT '[]',

  is_current_owner    BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── DEVICE OWNERSHIP HISTORY ─────────────────────────────────

CREATE TABLE device_ownership (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id           UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,

  owner_citizen_id    UUID REFERENCES citizens(id) ON DELETE SET NULL,
  owner_name          VARCHAR(255) NOT NULL,
  owner_nida          VARCHAR(50),
  owner_phone         VARCHAR(30),

  owned_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  owned_until         DATE,

  status              ownership_status NOT NULL DEFAULT 'active',
  transfer_reason     transfer_reason,
  notes               TEXT,

  recorded_by_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_by_name    VARCHAR(255),
  recorded_by_role    VARCHAR(100),

  attachments         JSONB DEFAULT '[]',
  is_current_owner    BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PROPERTY OWNERSHIP HISTORY ───────────────────────────────

CREATE TABLE property_ownership_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id         UUID REFERENCES properties(id) ON DELETE CASCADE,

  owner_citizen_id    UUID REFERENCES citizens(id) ON DELETE SET NULL,
  owner_name          VARCHAR(255) NOT NULL,
  owner_nida          VARCHAR(50),
  owner_phone         VARCHAR(30),
  owner_address       TEXT,

  owned_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  owned_until         DATE,

  status              ownership_status NOT NULL DEFAULT 'active',
  transfer_reason     transfer_reason,
  ownership_type      VARCHAR(50) DEFAULT 'full', -- full, partial, leased, mortgaged
  share_percentage    NUMERIC(5,2),
  notes               TEXT,

  recorded_by_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_by_name    VARCHAR(255),
  recorded_by_role    VARCHAR(100),

  attachments         JSONB DEFAULT '[]',
  is_current_owner    BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────

CREATE INDEX idx_veh_own_vehicle    ON vehicle_ownership(vehicle_id);
CREATE INDEX idx_veh_own_citizen    ON vehicle_ownership(owner_citizen_id);
CREATE INDEX idx_veh_own_current    ON vehicle_ownership(vehicle_id) WHERE is_current_owner = TRUE;
CREATE INDEX idx_veh_own_status     ON vehicle_ownership(status);

CREATE INDEX idx_dev_own_device     ON device_ownership(device_id);
CREATE INDEX idx_dev_own_citizen    ON device_ownership(owner_citizen_id);
CREATE INDEX idx_dev_own_current    ON device_ownership(device_id) WHERE is_current_owner = TRUE;
CREATE INDEX idx_dev_own_status     ON device_ownership(status);

CREATE INDEX idx_prop_own_property  ON property_ownership_log(property_id);
CREATE INDEX idx_prop_own_citizen   ON property_ownership_log(owner_citizen_id);
CREATE INDEX idx_prop_own_current   ON property_ownership_log(property_id) WHERE is_current_owner = TRUE;

-- ── AUTO-UPDATE updated_at ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_ownership_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_veh_own_updated
  BEFORE UPDATE ON vehicle_ownership
  FOR EACH ROW EXECUTE FUNCTION update_ownership_timestamp();

CREATE TRIGGER trg_dev_own_updated
  BEFORE UPDATE ON device_ownership
  FOR EACH ROW EXECUTE FUNCTION update_ownership_timestamp();

CREATE TRIGGER trg_prop_own_updated
  BEFORE UPDATE ON property_ownership_log
  FOR EACH ROW EXECUTE FUNCTION update_ownership_timestamp();

-- ── TRANSFER FUNCTION ────────────────────────────────────────
-- Closes previous owner record, opens new one atomically

CREATE OR REPLACE FUNCTION transfer_vehicle_ownership(
  p_vehicle_id        UUID,
  p_new_owner_name    VARCHAR,
  p_new_owner_nida    VARCHAR,
  p_new_owner_phone   VARCHAR,
  p_new_citizen_id    UUID,
  p_transfer_reason   transfer_reason,
  p_status            ownership_status,
  p_notes             TEXT,
  p_recorded_by_id    UUID,
  p_recorded_by_name  VARCHAR,
  p_recorded_by_role  VARCHAR
) RETURNS UUID AS $$
DECLARE v_new_id UUID;
BEGIN
  -- Close all current owner records
  UPDATE vehicle_ownership
    SET is_current_owner = FALSE,
        owned_until = CURRENT_DATE,
        status = CASE WHEN p_status = 'active' THEN 'transferred' ELSE p_status END,
        transfer_reason = p_transfer_reason,
        updated_at = NOW()
  WHERE vehicle_id = p_vehicle_id AND is_current_owner = TRUE;

  -- Insert new owner
  INSERT INTO vehicle_ownership (
    vehicle_id, owner_citizen_id, owner_name, owner_nida, owner_phone,
    status, transfer_reason, notes,
    recorded_by_id, recorded_by_name, recorded_by_role,
    is_current_owner
  ) VALUES (
    p_vehicle_id, p_new_citizen_id, p_new_owner_name, p_new_owner_nida, p_new_owner_phone,
    p_status, p_transfer_reason, p_notes,
    p_recorded_by_id, p_recorded_by_name, p_recorded_by_role,
    TRUE
  ) RETURNING id INTO v_new_id;

  -- Update vehicles table current owner
  UPDATE vehicles SET
    owner_name = p_new_owner_name,
    owner_nida = p_new_owner_nida,
    owner_phone = p_new_owner_phone,
    owner_citizen_id = p_new_citizen_id,
    updated_at = NOW()
  WHERE id = p_vehicle_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transfer_device_ownership(
  p_device_id         UUID,
  p_new_owner_name    VARCHAR,
  p_new_owner_nida    VARCHAR,
  p_new_owner_phone   VARCHAR,
  p_new_citizen_id    UUID,
  p_transfer_reason   transfer_reason,
  p_status            ownership_status,
  p_notes             TEXT,
  p_recorded_by_id    UUID,
  p_recorded_by_name  VARCHAR,
  p_recorded_by_role  VARCHAR
) RETURNS UUID AS $$
DECLARE v_new_id UUID;
BEGIN
  UPDATE device_ownership
    SET is_current_owner = FALSE,
        owned_until = CURRENT_DATE,
        status = CASE WHEN p_status = 'active' THEN 'transferred' ELSE p_status END,
        transfer_reason = p_transfer_reason,
        updated_at = NOW()
  WHERE device_id = p_device_id AND is_current_owner = TRUE;

  INSERT INTO device_ownership (
    device_id, owner_citizen_id, owner_name, owner_nida, owner_phone,
    status, transfer_reason, notes,
    recorded_by_id, recorded_by_name, recorded_by_role,
    is_current_owner
  ) VALUES (
    p_device_id, p_new_citizen_id, p_new_owner_name, p_new_owner_nida, p_new_owner_phone,
    p_status, p_transfer_reason, p_notes,
    p_recorded_by_id, p_recorded_by_name, p_recorded_by_role,
    TRUE
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;
