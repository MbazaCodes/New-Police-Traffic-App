-- Migration 027: Disable RLS on citizen tables + grant service_role access
-- Run this in Supabase SQL Editor if citizen registration is failing

ALTER TABLE citizen_accounts     DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_properties   DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_devices      DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_complaints   DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_payments     DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs        DISABLE ROW LEVEL SECURITY;

GRANT ALL ON citizen_accounts     TO service_role, postgres;
GRANT ALL ON citizen_properties   TO service_role, postgres;
GRANT ALL ON citizen_devices      TO service_role, postgres;
GRANT ALL ON citizen_complaints   TO service_role, postgres;
GRANT ALL ON citizen_applications TO service_role, postgres;
GRANT ALL ON citizen_payments     TO service_role, postgres;
GRANT ALL ON activity_logs        TO service_role, postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;

-- Also make sure citizens table is accessible
GRANT ALL ON citizens TO service_role, postgres;

-- Add cached_name to citizen_accounts so login can show real name
-- even if citizens join fails (citizen_id not set yet)
ALTER TABLE citizen_accounts ADD COLUMN IF NOT EXISTS cached_name VARCHAR(255);
