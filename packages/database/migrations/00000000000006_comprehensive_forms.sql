-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — COMPREHENSIVE FORMS MIGRATION
-- Migration: 00000000000006_comprehensive_forms
-- Adds ALL missing columns for Forms 1-12
-- Run AFTER existing migrations 0000-0005
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FORM 1: CITIZENS TABLE (add-citizen-screen.tsx)
-- ============================================================
ALTER TABLE citizens
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS region VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ward VARCHAR(100),
  ADD COLUMN IF NOT EXISTS street VARCHAR(100);

-- Indexes for citizens
CREATE INDEX IF NOT EXISTS idx_citizens_first_name ON citizens(first_name);
CREATE INDEX IF NOT EXISTS idx_citizens_region ON citizens(region);
CREATE INDEX IF NOT EXISTS idx_citizens_district ON citizens(district);

-- Comments
COMMENT ON COLUMN citizens.first_name IS 'Auto-split from name for search';
COMMENT ON COLUMN citizens.last_name IS 'Auto-split from name for search';
COMMENT ON COLUMN citizens.region IS 'Tanzania region (Mkoa)';
COMMENT ON COLUMN citizens.district IS 'Tanzania district (Wilaya)';
COMMENT ON COLUMN citizens.ward IS 'Tanzania ward (Kata)';
COMMENT ON COLUMN citizens.street IS 'Street address (Mtaa)';

-- Backfill first_name/last_name from existing data
UPDATE citizens 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
      WHEN array_length(string_to_array(name, ' '), 1) > 1 
      THEN array_to_string(string_to_array(name, ' ')[2:], ' ')
      ELSE NULL 
    END
WHERE first_name IS NULL AND name IS NOT NULL;

-- ============================================================
-- FORM 2: VEHICLES TABLE (add-vehicle-screen.tsx)
-- ============================================================
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS owner_tin VARCHAR(20),
  ADD COLUMN IF NOT EXISTS owner_license VARCHAR(50),
  ADD COLUMN IF NOT EXISTS inspection_expires DATE,
  ADD COLUMN IF NOT EXISTS registration_expires DATE,
  ADD COLUMN IF NOT EXISTS outstanding_fines DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Indexes for vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_tin ON vehicles(owner_tin);
CREATE INDEX IF NOT EXISTS idx_vehicles_inspection_expires ON vehicles(inspection_expires);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expires ON vehicles(registration_expires);

-- Comments
COMMENT ON COLUMN vehicles.owner_tin IS 'Tanzania TRA Tax ID (XXX-XXX-XXX)';
COMMENT ON COLUMN vehicles.owner_license IS 'Owner driving license number';
COMMENT ON COLUMN vehicles.inspection_expires IS 'Inspection certificate expiry';
COMMENT ON COLUMN vehicles.registration_expires IS 'Registration expiry date';
COMMENT ON COLUMN vehicles.outstanding_fines IS 'Total unpaid citations amount';
COMMENT ON COLUMN vehicles.notes IS 'Additional vehicle notes';

-- ============================================================
-- FORM 3: CITATIONS TABLE (citation-screen.tsx)
-- ============================================================
-- Check if citations table needs updates
DO $$ BEGIN
  -- Add citation_number if not exists (should exist from initial schema)
  ALTER TABLE citations ADD COLUMN IF NOT EXISTS citation_number VARCHAR(50);
  
  -- Add fields from citation form
  ALTER TABLE citations
    ADD COLUMN IF NOT EXISTS driver_nida VARCHAR(20),
    ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS citation_date DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS citation_time TIME DEFAULT CURRENT_TIME,
    ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
    
  -- Create unique index for citation_number if not exists
  BEGIN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_citations_number ON citations(citation_number)';
  EXCEPTION WHEN duplicate_table THEN NULL;
  END;
END $$;

-- Indexes for citations
CREATE INDEX IF NOT EXISTS idx_citations_driver_nida ON citations(driver_nida);
CREATE INDEX IF NOT EXISTS idx_citations_location ON citations(location);
CREATE INDEX IF NOT EXISTS idx_citations_date ON citations(citation_date);
CREATE INDEX IF NOT EXISTS idx_citations_synced ON citations(synced_at) WHERE synced_at IS NULL;

-- Comments for citations
COMMENT ON COLUMN citations.driver_nida IS 'Driver NIDA number';
COMMENT ON COLUMN citations.driver_phone IS 'Driver phone number';
COMMENT ON COLUMN citations.location IS 'Citation location/address';
COMMENT ON COLUMN citations.citation_date IS 'Date citation was issued';
COMMENT ON COLUMN citations.citation_time IS 'Time citation was issued';
COMMENT ON COLUMN citations.vehicle_type IS 'Type of vehicle (Saloon, SUV, etc.)';
COMMENT ON COLUMN citations.is_offline IS 'True if created while offline';
COMMENT ON COLUMN citations.synced_at IS 'When record was synced to server';

-- ============================================================
-- FORM 4: VEHICLE INSPECTIONS TABLE (vehicle-inspection-screen.tsx)
-- ============================================================
DO $$ BEGIN
  -- Ensure vehicle_inspections has all required fields
  ALTER TABLE vehicle_inspections
    ADD COLUMN IF NOT EXISTS inspection_result VARCHAR(10) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS documents_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS mechanical_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS overloaded BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS signature VARCHAR(255),
    ADD COLUMN IF NOT EXISTS officer_signature VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
END $$;

-- Indexes for vehicle_inspections
CREATE INDEX IF NOT EXISTS idx_inspections_result ON vehicle_inspections(inspection_result);
CREATE INDEX IF NOT EXISTS idx_inspections_location ON vehicle_inspections(location);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON vehicle_inspections(inspection_date);

-- Comments
COMMENT ON COLUMN vehicle_inspections.inspection_result IS 'pass/fail/pending';
COMMENT ON COLUMN vehicle_inspections.location IS 'Where inspection took place';
COMMENT ON COLUMN vehicle_inspections.documents_json IS 'Document checklist results';
COMMENT ON COLUMN vehicle_inspections.mechanical_json IS 'Mechanical checklist results';
COMMENT ON COLUMN vehicle_inspections.overloaded IS 'Vehicle overloaded flag';
COMMENT ON COLUMN vehicle_inspections.signature IS 'Digital/text signature';

-- ============================================================
-- FORM 5: PF3 REPORTS TABLE (pf3-screen.tsx)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE pf3_forms
    ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accident_date DATE,
    ADD COLUMN IF NOT EXISTS accident_time TIME,
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS weather VARCHAR(50),
    ADD COLUMN IF NOT EXISTS road_surface VARCHAR(50),
    ADD COLUMN IF NOT EXISTS light_condition VARCHAR(50),
    ADD COLUMN IF NOT EXISTS severity VARCHAR(50),
    ADD COLUMN IF NOT EXISTS casualties_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS witnesses_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sketch_url TEXT,
    ADD COLUMN IF NOT EXISTS officer_notes TEXT,
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
END $$;

-- Create unique index for reference_number
BEGIN
  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_pf3_reference ON pf3_forms(reference_number)';
EXCEPTION WHEN duplicate_table THEN NULL;
END;

-- Indexes for pf3_forms
CREATE INDEX IF NOT EXISTS idx_pf3_accident_date ON pf3_forms(accident_date);
CREATE INDEX IF NOT EXISTS idx_pf3_severity ON pf3_forms(severity);
CREATE INDEX IF NOT EXISTS idx_pf3_status ON pf3_forms(status);

-- Comments
COMMENT ON COLUMN pf3_forms.reference_number IS 'PF3 form unique identifier (PF3-YYYY-XXXXX)';
COMMENT ON COLUMN pf3_forms.weather IS 'Weather conditions (Sunshine, Rain, Cloudy)';
COMMENT ON COLUMN pf3_forms.road_surface IS 'Road surface condition (Dry, Wet, Gravel)';
COMMENT ON COLUMN pf3_forms.light_condition IS 'Lighting (Daylight, Night, Street lights)';
COMMENT ON COLUMN pf3_forms.severity IS 'Accident severity (Minor, Moderate, Severe, Fatal)';

-- ============================================================
-- FORM 6: ARRESTS TABLE (arrest-form-screen.tsx)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE arrests
    ADD COLUMN IF NOT EXISTS arrest_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS suspect_dob DATE,
    ADD COLUMN IF NOT EXISTS suspect_gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS suspect_address TEXT,
    ADD COLUMN IF NOT EXISTS suspect_occupation VARCHAR(100),
    ADD COLUMN IF NOT EXISTS offense_category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS offense_details TEXT,
    ADD COLUMN IF NOT EXISTS arrest_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cell_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS court_date DATE,
    ADD COLUMN IF NOT EXISTS next_of_kin VARCHAR(255),
    ADD COLUMN IF NOT EXISTS next_of_kin_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS medical_status VARCHAR(50) DEFAULT 'Nzuri',
    ADD COLUMN IF NOT EXISTS photos_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS photos_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
END $$;

-- Indexes for arrests
CREATE INDEX IF NOT EXISTS idx_arrests_arrest_number ON arrests(arrest_number);
CREATE INDEX IF NOT EXISTS idx_arrests_suspect_nida ON arrests(suspect_nida);
CREATE INDEX IF NOT EXISTS idx_arrests_offense_category ON arrests(offense_category);
CREATE INDEX IF NOT EXISTS idx_arrests_date ON arrests(arrest_date);
CREATE INDEX IF NOT EXISTS idx_arrests_status ON arrests(status);

-- Comments
COMMENT ON COLUMN arrests.arrest_number IS 'Unique arrest report number (AR-YYYY-XXXX)';
COMMENT ON COLUMN arrests.medical_status IS 'Suspect medical condition (Nzuri, Mabovu, Critical)';
COMMENT ON COLUMN arrests.cell_number IS 'Cell/block where suspect is held';
COMMENT ON COLUMN arrests.court_date IS 'Scheduled court appearance date';
COMMENT ON COLUMN arrests.next_of_kin IS 'Emergency contact person name';

-- ============================================================
-- FORM 7: WARNINGS TABLE (warning-form-screen.tsx)
-- ============================================================
-- Create warnings table if not exists
CREATE TABLE IF NOT EXISTS warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_number VARCHAR(30) UNIQUE NOT NULL,
  citizen_id UUID REFERENCES citizens(id),
  citizen_name VARCHAR(255) NOT NULL,
  citizen_nida VARCHAR(20),
  citizen_phone VARCHAR(20),
  offense VARCHAR(255) NOT NULL,
  offense_details TEXT,
  warning_date DATE NOT NULL DEFAULT CURRENT_DATE,
  warning_time TIME DEFAULT CURRENT_TIME,
  location VARCHAR(255),
  officer_id UUID REFERENCES users(id),
  officer_name VARCHAR(255),
  station_id UUID REFERENCES stations(id),
  station_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued','acknowledged','expired')),
  valid_until DATE,
  notes TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on warnings
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;

-- Indexes for warnings
CREATE INDEX IF NOT EXISTS idx_warnings_warning_number ON warnings(warning_number);
CREATE INDEX IF NOT EXISTS idx_warnings_citizen_nida ON warnings(citizen_nida);
CREATE INDEX IF NOT EXISTS idx_warnings_date ON warnings(warning_date);
CREATE INDEX IF NOT EXISTS idx_warnings_status ON warnings(status);

-- Comments
COMMENT ON TABLE warnings IS 'Traffic warning notices issued to drivers/citizens';
COMMENT ON COLUMN warnings.warning_number IS 'Warning number (WN-YYYY-XXXX)';
COMMENT ON COLUMN warnings.valid_until IS 'Warning validity expiry date';
COMMENT ON COLUMN warnings.status IS 'Warning status tracking';

-- ============================================================
-- FORM 8: INCIDENTS TABLE enhancements (accident-report-screen.tsx)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS incident_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS weather VARCHAR(50),
    ADD COLUMN IF NOT EXISTS road_condition VARCHAR(50),
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(50),
    ADD COLUMN IF NOT EXISTS action_taken TEXT,
    ADD COLUMN IF NOT EXISTS casualties_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS damages_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
END $$;

-- Indexes for incidents
CREATE INDEX IF NOT EXISTS idx_incidents_incident_number ON incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_incidents_weather ON incidents(weather);

-- ============================================================
-- FORM 9: BAIL TABLE (bail-out-screen.tsx)
-- ============================================================
-- Create bail table if not exists
CREATE TABLE IF NOT EXISTS bail_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bail_number VARCHAR(30) UNIQUE NOT NULL,
  arrest_id UUID REFERENCES arrests(id),
  suspect_id UUID REFERENCES citizens(id),
  suspect_name VARCHAR(255) NOT NULL,
  suspect_nida VARCHAR(20),
  offense VARCHAR(255),
  bail_amount DECIMAL(10,2) NOT NULL,
  bail_currency VARCHAR(10) DEFAULT 'TZS',
  bail_type VARCHAR(50) DEFAULT 'cash' CHECK (bail_type IN ('cash','property','surety')),
  surety_name VARCHAR(255),
  surety_phone VARCHAR(20),
  surety_address TEXT,
  surety_nida VARCHAR(20),
  bail_conditions TEXT,
  court_date DATE,
  granted_by UUID REFERENCES users(id),
  station_id UUID REFERENCES stations(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','revoked','forfeited')),
  paid_date DATE,
  release_date DATE,
  notes TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bail_records
ALTER TABLE bail_records ENABLE ROW LEVEL SECURITY;

-- Indexes for bail_records
CREATE INDEX IF NOT EXISTS idx_bail_bail_number ON bail_records(bail_number);
CREATE INDEX IF NOT EXISTS idx_bail_suspect_nida ON bail_records(suspect_nida);
CREATE INDEX IF NOT EXISTS idx_bail_status ON bail_records(status);
CREATE INDEX IF NOT EXISTS idx_bail_arrest_id ON bail_records(arrest_id);

-- Comments
COMMENT ON TABLE bail_records IS 'Bail/bond records for arrested suspects';
COMMENT ON COLUMN bail_records.bail_number IS 'Bail number (BL-YYYY-XXXX)';
COMMENT ON COLUMN bail_records.bail_type IS 'Type of bail: cash, property, or surety';
COMMENT ON COLUMN bail_records.surety_name IS 'Person guaranteeing bail (dhamana)';

-- ============================================================
-- FORM 10: FINES TABLE enhancements (fine-payment-screen.tsx)
-- ============================================================
-- Note: Fines are typically linked to citations
-- Adding payment tracking to existing fines or creating fine_payments

CREATE TABLE IF NOT EXISTS fine_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number VARCHAR(30) UNIQUE NOT NULL,
  citation_id UUID REFERENCES citations(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TZS',
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash','mobile_money','bank_transfer','card')),
  payment_reference VARCHAR(100),
  payer_name VARCHAR(255),
  payer_phone VARCHAR(20),
  payer_nida VARCHAR(20),
  collected_by UUID REFERENCES users(id),
  station_id UUID REFERENCES stations(id),
  receipt_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  is_offline BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on fine_payments
ALTER TABLE fine_payments ENABLE ROW LEVEL SECURITY;

-- Indexes for fine_payments
CREATE INDEX IF NOT EXISTS idx_fine_payments_payment_number ON fine_payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_fine_payments_citation_id ON fine_payments(citation_id);
CREATE INDEX IF NOT EXISTS idx_fine_payments_status ON fine_payments(status);
CREATE INDEX IF NOT EXISTS idx_fine_payments_paid_at ON fine_payments(paid_at);

-- Comments
COMMENT ON TABLE fine_payments IS 'Fine payment transaction records';
COMMENT ON COLUMN fine_payments.payment_number IS 'Payment receipt number (PAY-YYYY-XXXXX)';
COMMENT ON COLUMN fine_payments.payment_method IS 'Cash, mobile money (M-Pesa/TigoPesa), bank transfer';

-- ============================================================
-- FORM 11: LOST PROPERTY / MISSING RECORDS (lost-property-screen.tsx)
-- ============================================================
-- Enhance existing missing_records table
DO $$ BEGIN
  ALTER TABLE missing_records
    ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reporter_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS reporter_nida VARCHAR(20),
    ADD COLUMN IF NOT EXISTS item_description TEXT,
    ADD COLUMN IF NOT EXISTS item_value DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS item_color VARCHAR(50),
    ADD COLUMN IF NOT EXISTS item_brand VARCHAR(100),
    ADD COLUMN IF NOT EXISTS item_serial VARCHAR(100),
    ADD COLUMN IF NOT EXISTS where_found VARCHAR(255),
    ADD COLUMN IF NOT EXISTS when_found DATE,
    ADD COLUMN IF NOT EXISTS photos_json JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS holding_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS release_conditions TEXT,
    ADD COLUMN IF NOT EXISTS released_to VARCHAR(255),
    ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
END $$;

-- Indexes for missing_records
CREATE INDEX IF NOT EXISTS idx_missing_reporter_nida ON missing_records(reporter_nida);
CREATE INDEX IF NOT EXISTS idx_missing_item_description ON missing_records(item_description);
CREATE INDEX IF NOT EXISTS idx_missing_where_found ON missing_records(where_found);

-- Comments
COMMENT ON COLUMN missing_records.reporter_name IS 'Person who found/reported the item';
COMMENT ON COLUMN missing_records.item_value IS 'Estimated value of lost item';
COMMENT ON COLUMN missing_records.holding_location IS 'Where item is being held';
COMMENT ON COLUMN missing_records.release_conditions IS 'Conditions for releasing item';

-- ============================================================
-- FORM 12: OFFICER REQUESTS (officer-request-screen.tsx)
-- ============================================================
-- Enhance existing requests table or add columns
DO $$ BEGIN
  -- Check if requests table has needed columns
  ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS request_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS request_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS request_details JSONB,
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS approval_notes TEXT,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolution TEXT,
    ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist, create it
  CREATE TABLE IF NOT EXISTS officer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(30) UNIQUE NOT NULL,
    officer_id UUID NOT NULL REFERENCES users(id),
    station_id UUID REFERENCES stations(id),
    request_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','in_progress','completed','cancelled')),
    request_details JSONB,
    assigned_to UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_notes TEXT,
    due_date DATE,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    is_offline BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  
  ALTER TABLE officer_requests ENABLE ROW LEVEL SECURITY;
END $$;

-- Indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_request_number ON requests(request_number);
CREATE INDEX IF NOT EXISTS idx_requests_request_type ON requests(request_type);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_officer_id ON requests(officer_id);

-- Comments
COMMENT ON COLUMN requests.request_number IS 'Request tracking number (REQ-YYYY-XXXX)';
COMMENT ON COLUMN requests.request_type IS 'Type: equipment, leave, transfer, supplies, etc.';
COMMENT ON COLUMN requests.priority IS 'Urgency level: low, medium, high, urgent';

-- ============================================================
-- FINAL: VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: All offline pending records
CREATE OR REPLACE VIEW v_pending_sync AS
SELECT 'citizens' as table_name, id, created_at FROM citizens WHERE synced_at IS NULL
UNION ALL
SELECT 'vehicles', id, created_at FROM vehicles WHERE synced_at IS NULL
UNION ALL
SELECT 'citations', id, created_at FROM citations WHERE synced_at IS NULL
UNION ALL
SELECT 'vehicle_inspections', id, created_at FROM vehicle_inspections WHERE synced_at IS NULL
UNION ALL
SELECT 'pf3_forms', id, created_at FROM pf3_forms WHERE synced_at IS NULL
UNION ALL
SELECT 'arrests', id, created_at FROM arrests WHERE synced_at IS NULL
UNION ALL
SELECT 'warnings', id, created_at FROM warnings WHERE synced_at IS NULL
UNION ALL
SELECT 'incidents', id, created_at FROM incidents WHERE synced_at IS NULL
UNION ALL
SELECT 'bail_records', id, created_at FROM bail_records WHERE synced_at IS NULL
UNION ALL
SELECT 'fine_payments', id, created_at FROM fine_payments WHERE synced_at IS NULL
UNION ALL
SELECT 'missing_records', id, created_at FROM missing_records WHERE synced_at IS NULL
UNION ALL
SELECT 'requests', id, created_at FROM requests WHERE synced_at IS NULL;

-- View: Today's activity summary
CREATE OR REPLACE VIEW v_today_activity AS
SELECT 
  (SELECT COUNT(*) FROM citizens WHERE DATE(created_at) = CURRENT_DATE) as new_citizens,
  (SELECT COUNT(*) FROM vehicles WHERE DATE(created_at) = CURRENT_DATE) as new_vehicles,
  (SELECT COUNT(*) FROM citations WHERE DATE(created_at) = CURRENT_DATE) as new_citations,
  (SELECT COUNT(*) FROM arrests WHERE DATE(arrest_date) = CURRENT_DATE) as new_arrests,
  (SELECT COUNT(*) FROM pf3_forms WHERE DATE(accident_date) = CURRENT_DATE) as new_pf3_reports,
  (SELECT COUNT(*) FROM warnings WHERE DATE(warning_date) = CURRENT_DATE) as new_warnings;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- This migration adds all necessary columns for Forms 1-12
-- Run this in Supabase SQL Editor to update your database
-- After running, all forms will work with full offline sync support
