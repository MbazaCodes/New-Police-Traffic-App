-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — FORMS ENHANCEMENT MIGRATION
-- Migration: 00000000000006_forms_enhancement
-- Adds missing columns for Forms 1 (Citizens) & 2 (Vehicles)
-- Run AFTER existing migrations 0000-0005
-- ============================================================

-- ── CITIZENS TABLE — Add name split columns ─────────────────
ALTER TABLE citizens
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add index for first_name search
CREATE INDEX IF NOT EXISTS idx_citizens_first_name ON citizens(first_name);

COMMENT ON COLUMN citizens.first_name IS 'Auto-split from name field for search optimization';
COMMENT ON COLUMN citizens.last_name IS 'Auto-split from name field for search optimization';

-- ── VEHICLES TABLE — Add owner TIN and extended fields ───────
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS owner_tin VARCHAR(20),
  ADD COLUMN IF NOT EXISTS owner_license VARCHAR(50),
  ADD COLUMN IF NOT EXISTS inspection_expires DATE,
  ADD COLUMN IF NOT EXISTS registration_expires DATE,
  ADD COLUMN IF NOT EXISTS outstanding_fines DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_tin ON vehicles(owner_tin);
CREATE INDEX IF NOT EXISTS idx_vehicles_inspection_expires ON vehicles(inspection_expires);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expires ON vehicles(registration_expires);

-- Comments for documentation
COMMENT ON COLUMN vehicles.owner_tin IS 'Tanzania TRA Tax Identification Number (XXX-XXX-XXX format)';
COMMENT ON COLUMN vehicles.owner_license IS 'Owner driving license number';
COMMENT ON COLUMN vehicles.inspection_expires IS 'Vehicle inspection certificate expiry date';
COMMENT ON COLUMN vehicles.registration_expires IS 'Vehicle registration expiry date';
COMMENT ON COLUMN vehicles.outstanding_fines IS 'Total unpaid citation amount';
COMMENT ON COLUMN vehicles.notes IS 'Additional notes about the vehicle';

-- ── BACKFILL existing data (optional) ────────────────────────
-- Update first_name/last_name from existing name field if NULL
UPDATE citizens 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
      WHEN array_length(string_to_array(name, ' '), 1) > 1 
      THEN array_to_string(string_to_array(name, ' ')[2:], ' ')
      ELSE NULL 
    END
WHERE first_name IS NULL AND name IS NOT NULL;
