-- Fix varchar length constraints on citizens table
-- Real TZ formats:
-- NIDA: YYYYMMDD-XXXXX-XXXXX-XX = 22 chars
-- Mobile: +255XXXXXXXXX = 13 chars  
-- TIN: 9 digits = 9 chars
-- License: 10 digits (TRA format)
-- Plate: T NNN XXX = 9 chars

DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN 
    SELECT column_name, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'citizens' AND character_maximum_length IS NOT NULL
  LOOP
    RAISE NOTICE 'Column: % | Max length: %', col.column_name, col.character_maximum_length;
    BEGIN
      EXECUTE format('ALTER TABLE citizens ALTER COLUMN %I TYPE TEXT', col.column_name);
      RAISE NOTICE 'Extended % to TEXT', col.column_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not extend %: %', col.column_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Also fix vehicles table short varchars
DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN 
    SELECT column_name, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'vehicles' AND character_maximum_length IS NOT NULL
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE vehicles ALTER COLUMN %I TYPE TEXT', col.column_name);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
  RAISE NOTICE 'Vehicles varchar fixed';
END $$;

-- Fix licenses table
DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN 
    SELECT column_name, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'licenses' AND character_maximum_length IS NOT NULL
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE licenses ALTER COLUMN %I TYPE TEXT', col.column_name);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
  RAISE NOTICE 'Licenses varchar fixed';
END $$;

-- Fix citizen_accounts short varchars
DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN 
    SELECT column_name, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'citizen_accounts' AND character_maximum_length IS NOT NULL
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE citizen_accounts ALTER COLUMN %I TYPE TEXT', col.column_name);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
  RAISE NOTICE 'citizen_accounts varchar fixed';
END $$;

-- Now seed Henry Joseph with correct data
UPDATE citizens SET
  nida           = '19900115-12345-67890-01',
  dob            = '1990-01-15',
  gender         = 'Me',
  tribe          = 'Chagga',
  region         = 'Dar es Salaam',
  district       = 'Kinondoni',
  ward           = 'Mikocheni',
  address        = 'Mtaa wa Mikocheni, Kinondoni',
  occupation     = 'Mhandisi',
  blood_group    = 'O+',
  religion       = 'Ukristo',
  marital_status = 'Mseja',
  nationality    = 'Tanzania'
WHERE id = 'f4af17b7-5315-4f94-944c-75e9fe5283b7';

-- Verify
SELECT name, nida, dob, gender, region, tribe, blood_group, marital_status 
FROM citizens WHERE id = 'f4af17b7-5315-4f94-944c-75e9fe5283b7';
