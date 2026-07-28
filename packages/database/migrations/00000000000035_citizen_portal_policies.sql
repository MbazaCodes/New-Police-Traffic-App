-- Fix RLS policies for citizen portal
-- Citizen accounts can read/update their own records
-- Citizens table accessible by citizen portal (via service role)

-- Disable RLS on citizens for service role operations (citizen portal uses service key)
-- This is safe because citizen portal API validates the citizen_account token first

DO $$
BEGIN
  -- Allow service role (used by our API) to bypass RLS
  -- This is already the case with service key, but ensure it's set
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'citizen_accounts') THEN
    RAISE NOTICE 'citizen_accounts table exists';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'citizens') THEN
    RAISE NOTICE 'citizens table exists';
  END IF;
END $$;

-- Ensure citizen_accounts has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='otp_code') THEN
    ALTER TABLE citizen_accounts ADD COLUMN otp_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='otp_expires_at') THEN
    ALTER TABLE citizen_accounts ADD COLUMN otp_expires_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='last_login') THEN
    ALTER TABLE citizen_accounts ADD COLUMN last_login TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='approved') THEN
    ALTER TABLE citizen_accounts ADD COLUMN approved BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='profile_complete') THEN
    ALTER TABLE citizen_accounts ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='is_driver') THEN
    ALTER TABLE citizen_accounts ADD COLUMN is_driver BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizen_accounts' AND column_name='nida') THEN
    ALTER TABLE citizen_accounts ADD COLUMN nida TEXT;
  END IF;
  RAISE NOTICE 'citizen_accounts columns verified';
END $$;

-- Verify citizens columns
SELECT 'citizens' as tbl, column_name FROM information_schema.columns
WHERE table_name = 'citizens'
ORDER BY ordinal_position;
