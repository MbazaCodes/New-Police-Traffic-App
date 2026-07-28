-- Migration 028: Fix citizen portal schema errors

-- 1. Add missing columns to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make        VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_no  VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_id    UUID REFERENCES citizens(id) ON DELETE SET NULL;

-- 2. Fix citizen_devices — citizen_id should be nullable
ALTER TABLE citizen_devices ALTER COLUMN citizen_id DROP NOT NULL;

-- 3. Fix citizen_properties — citizen_id should be nullable  
ALTER TABLE citizen_properties ALTER COLUMN citizen_id DROP NOT NULL;

-- 4. Grant access
GRANT ALL ON vehicles TO service_role, postgres;

-- Add approval columns to citizen_accounts
ALTER TABLE citizen_accounts ADD COLUMN IF NOT EXISTS approved    BOOLEAN DEFAULT FALSE;
ALTER TABLE citizen_accounts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE citizen_accounts ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);

-- Add verified to citizens (may already exist)
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
