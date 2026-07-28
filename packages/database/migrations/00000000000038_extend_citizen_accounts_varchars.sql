-- ═══════════════════════════════════════════════════════════════════
-- Migration 038: Extend citizen_accounts varchar columns to TEXT
-- NIDA format like 19900115-12345-67890-01 is 23 chars — exceeds VARCHAR(20)
-- ═══════════════════════════════════════════════════════════════════

-- Extend nida to TEXT (NIDA can be 23+ chars)
DO $$ BEGIN ALTER TABLE citizen_accounts ALTER COLUMN nida TYPE TEXT;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'nida already TEXT: %', SQLERRM; END $$;

-- Extend phone to TEXT (phone formats vary)
DO $$ BEGIN ALTER TABLE citizen_accounts ALTER COLUMN phone TYPE TEXT;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'phone already TEXT: %', SQLERRM; END $$;

-- Extend email to TEXT
DO $$ BEGIN ALTER TABLE citizen_accounts ALTER COLUMN email TYPE TEXT;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'email already TEXT: %', SQLERRM; END $$;

-- Extend driving_license to TEXT
DO $$ BEGIN ALTER TABLE citizen_accounts ALTER COLUMN driving_license TYPE TEXT;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'driving_license already TEXT: %', SQLERRM; END $$;

-- Extend cached_name to TEXT (some names are long)
DO $$ BEGIN ALTER TABLE citizen_accounts ALTER COLUMN cached_name TYPE TEXT;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'cached_name already TEXT or missing: %', SQLERRM; END $$;

-- Add cached_name column if it doesn't exist (some deployments may lack it)
DO $$ BEGIN ALTER TABLE citizen_accounts ADD COLUMN IF NOT EXISTS cached_name TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop old unique constraints that may block longer values
-- (They will work fine with TEXT columns since PostgreSQL TEXT supports unique indexes)

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'citizen_accounts' 
  AND column_name IN ('nida', 'phone', 'email', 'driving_license', 'cached_name')
ORDER BY column_name;
