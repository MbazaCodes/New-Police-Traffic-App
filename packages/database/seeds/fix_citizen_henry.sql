-- Check which column has varchar(20) constraint
SELECT column_name, character_maximum_length 
FROM information_schema.columns 
WHERE table_name='citizens' AND character_maximum_length IS NOT NULL
ORDER BY character_maximum_length;

-- Extend short varchar columns
DO $$
BEGIN
  -- Extend nida if it's varchar(20)
  ALTER TABLE citizens ALTER COLUMN nida TYPE TEXT;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'nida already TEXT or error: %', SQLERRM;
END $$;

DO $$
BEGIN ALTER TABLE citizens ALTER COLUMN gender TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$
BEGIN ALTER TABLE citizens ALTER COLUMN region TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$
BEGIN ALTER TABLE citizens ALTER COLUMN district TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Now seed Henry Joseph
UPDATE citizens SET
  nida            = '19900115-12345-67890-01',
  dob             = '1990-01-15',
  gender          = 'Me',
  tribe           = 'Chagga',
  region          = 'Dar es Salaam',
  district        = 'Kinondoni',
  ward            = 'Mikocheni',
  address         = 'Mtaa wa Mikocheni, Kinondoni',
  occupation      = 'Mhandisi',
  blood_group     = 'O+',
  religion        = 'Ukristo',
  marital_status  = 'Mseja',
  nationality     = 'Tanzania'
WHERE id = 'f4af17b7-5315-4f94-944c-75e9fe5283b7';

SELECT name, nida, dob, gender, region, tribe, blood_group FROM citizens 
WHERE id = 'f4af17b7-5315-4f94-944c-75e9fe5283b7';
