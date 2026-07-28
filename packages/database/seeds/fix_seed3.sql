-- Debug and fix remaining tables

-- Check vehicles unique constraint
DO $$
DECLARE v TEXT;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v
  FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
  WHERE t.relname='vehicles' AND c.contype='u' LIMIT 1;
  RAISE NOTICE 'vehicles unique: %', v;
END $$;

-- Check arrests constraint  
DO $$
DECLARE v TEXT;
BEGIN
  SELECT string_agg(column_name,',') INTO v
  FROM information_schema.columns WHERE table_name='arrests';
  RAISE NOTICE 'arrests columns: %', v;
END $$;

-- Check posts constraint
DO $$
DECLARE v TEXT;
BEGIN
  SELECT string_agg(column_name,',') INTO v
  FROM information_schema.columns WHERE table_name='posts';
  RAISE NOTICE 'posts columns: %', v;
END $$;

-- Check licenses columns
DO $$
DECLARE v TEXT;
BEGIN
  SELECT string_agg(column_name,',') INTO v
  FROM information_schema.columns WHERE table_name='licenses';
  RAISE NOTICE 'licenses columns: %', v;
END $$;

-- Check citizens table actual count and a sample
SELECT COUNT(*) as citizen_count FROM citizens;
SELECT id, name, mobile FROM citizens LIMIT 3;

-- Check vehicles existing
SELECT COUNT(*) as vehicle_count, MAX(plate) FROM vehicles;

-- Try single vehicle insert to see exact error
DO $$
BEGIN
  INSERT INTO vehicles (plate, make, model, type, color, year, owner_name, owner_phone, insurance_valid, outstanding_fines, status)
  VALUES ('T 999 TST','Toyota','Corolla','Saloon','Nyeupe','2020','Test Owner','+255712345678',true,0,'registered');
  RAISE NOTICE 'Vehicle insert OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vehicle error: % %', SQLSTATE, SQLERRM;
END $$;

-- Try single arrest insert
DO $$
DECLARE v_officer UUID; v_station UUID;
BEGIN
  SELECT id INTO v_officer FROM users LIMIT 1;
  SELECT id INTO v_station FROM stations LIMIT 1;
  INSERT INTO arrests (arrest_number,officer_id,suspect_name,offense,location,arrest_date,arrest_time,status,station_id)
  VALUES ('ARR-TST-001',v_officer,'Test Suspect','Wizi','Dar es Salaam',CURRENT_DATE,'08:00','held',v_station);
  RAISE NOTICE 'Arrest insert OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Arrest error: % %', SQLSTATE, SQLERRM;
END $$;

-- Try single license insert
DO $$
DECLARE v_cid UUID;
BEGIN
  SELECT id INTO v_cid FROM citizens LIMIT 1;
  INSERT INTO licenses (citizen_id, license_number, license_type, issued_date, expiry_date, status)
  VALUES (v_cid,'DL-TZ-TST001','B',CURRENT_DATE-365,CURRENT_DATE+1000,'active');
  RAISE NOTICE 'License insert OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'License error: % %', SQLSTATE, SQLERRM;
END $$;

-- Try single post insert
DO $$
DECLARE v_station UUID;
BEGIN
  SELECT id INTO v_station FROM stations LIMIT 1;
  INSERT INTO posts (name,station_id,location,type,status)
  VALUES ('Test Post',v_station,'Test Location','checkpoint','active');
  RAISE NOTICE 'Post insert OK';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Post error: % %', SQLSTATE, SQLERRM;
END $$;
