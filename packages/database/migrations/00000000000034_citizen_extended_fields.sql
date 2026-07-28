-- Add extended citizen fields NOT already in citizens table
-- Existing: id,name,first_name,last_name,nida,mobile,gender,dob,address,
--           region,district,ward,street,occupation,status,tribe,photo_url,
--           license_no,middle_name,age,risk_score,documents,
--           has_criminal_record,cases_count,convictions_count

DO $$
BEGIN
  -- Extended address fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='home_address') THEN
    ALTER TABLE citizens ADD COLUMN home_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='home_region') THEN
    ALTER TABLE citizens ADD COLUMN home_region TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='home_district') THEN
    ALTER TABLE citizens ADD COLUMN home_district TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='home_ward') THEN
    ALTER TABLE citizens ADD COLUMN home_ward TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='work_address') THEN
    ALTER TABLE citizens ADD COLUMN work_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='work_employer') THEN
    ALTER TABLE citizens ADD COLUMN work_employer TEXT;
  END IF;
  -- Medical
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='medical_conditions') THEN
    ALTER TABLE citizens ADD COLUMN medical_conditions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='allergies') THEN
    ALTER TABLE citizens ADD COLUMN allergies TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='disability') THEN
    ALTER TABLE citizens ADD COLUMN disability TEXT;
  END IF;
  -- Blood group & additional profile
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='blood_group') THEN
    ALTER TABLE citizens ADD COLUMN blood_group TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='religion') THEN
    ALTER TABLE citizens ADD COLUMN religion TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='marital_status') THEN
    ALTER TABLE citizens ADD COLUMN marital_status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='nationality') THEN
    ALTER TABLE citizens ADD COLUMN nationality TEXT DEFAULT 'Tanzania';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='email') THEN
    ALTER TABLE citizens ADD COLUMN email TEXT;
  END IF;
  -- Next of kin
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='kin_name') THEN
    ALTER TABLE citizens ADD COLUMN kin_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='kin_phone') THEN
    ALTER TABLE citizens ADD COLUMN kin_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='kin_relationship') THEN
    ALTER TABLE citizens ADD COLUMN kin_relationship TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='kin_address') THEN
    ALTER TABLE citizens ADD COLUMN kin_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='emergency2_name') THEN
    ALTER TABLE citizens ADD COLUMN emergency2_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='emergency2_phone') THEN
    ALTER TABLE citizens ADD COLUMN emergency2_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citizens' AND column_name='emergency2_relationship') THEN
    ALTER TABLE citizens ADD COLUMN emergency2_relationship TEXT;
  END IF;

  RAISE NOTICE 'Citizens extended fields migration complete';
END $$;

SELECT column_name FROM information_schema.columns
WHERE table_name='citizens' ORDER BY ordinal_position;
