-- Fix arrests status constraint and licenses column name

-- Check exact arrests status constraint
DO $$
DECLARE v TEXT;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='arrests' AND c.conname LIKE '%status%';
  RAISE NOTICE 'arrests status constraint: %', v;
  SELECT string_agg(column_name,',') INTO v FROM information_schema.columns WHERE table_name='licenses';
  RAISE NOTICE 'licenses cols: %', v;
END $$;

-- ── ARRESTS 200 ──────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Wizi','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu',
    'Udanganyifu','Ulevi Hadharani','Ulaghai','Unyakuzi','Ufisadi','Uhalifu wa Mtandao'];
  locs TEXT[] := ARRAY['Ubungo','Kariakoo','Kinondoni','Temeke','Mwanza','Arusha','Dodoma','Mbeya'];
  v_officer UUID; v_station UUID; v_cid UUID; v_name TEXT;
  v_constraint TEXT; i INT;
BEGIN
  -- Get valid status values from constraint
  SELECT pg_get_constraintdef(c.oid) INTO v_constraint FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='arrests' AND c.conname LIKE '%status%';
  RAISE NOTICE 'Status constraint: %', v_constraint;

  SELECT id INTO v_officer FROM users WHERE role IN ('officer-general','officer-traffic') LIMIT 1;
  IF v_officer IS NULL THEN SELECT id INTO v_officer FROM users LIMIT 1; END IF;
  SELECT id INTO v_station FROM stations LIMIT 1;

  FOR i IN 1..200 LOOP
    BEGIN
      SELECT id, name INTO v_cid, v_name FROM citizens
        OFFSET (floor(random()*(SELECT COUNT(*) FROM citizens)))::int LIMIT 1;
      INSERT INTO arrests (arrest_number, officer_id, citizen_id, suspect_name, suspect_nida,
        offense, location, arrest_date, status, station_id, created_at)
      VALUES (
        'ARR-2026-'||lpad(i::text,4,'0'),
        v_officer, v_cid,
        COALESCE(v_name, 'Msukosuko '||i),
        lpad((1000000000000000000+i)::text, 20, '0'),
        offenses[(i%10)+1], locs[(i%8)+1],
        CURRENT_DATE - floor(random()*365)::int,
        'held',  -- use only 'held' which is the default
        v_station,
        NOW() - (floor(random()*365)||' days')::interval
      );
    EXCEPTION WHEN unique_violation THEN NULL;
    WHEN OTHERS THEN
      IF i <= 3 THEN RAISE NOTICE 'Arrest % error: % %', i, SQLSTATE, SQLERRM; END IF;
    END;
  END LOOP;
  RAISE NOTICE 'Arrests done: %', (SELECT COUNT(*) FROM arrests);
END $$;

-- Update some arrests to released/charged using valid values from constraint
DO $$
DECLARE v_constraint TEXT; valid_vals TEXT[];
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v_constraint FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='arrests' AND c.conname LIKE '%status%';
  -- Try updating with 'released'
  BEGIN
    UPDATE arrests SET status='released' WHERE ctid IN (SELECT ctid FROM arrests ORDER BY random() LIMIT 40);
    RAISE NOTICE 'Updated to released OK';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'released not valid, trying charged';
    BEGIN
      UPDATE arrests SET status='charged' WHERE ctid IN (SELECT ctid FROM arrests ORDER BY random() LIMIT 40);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END;
END $$;

-- ── LICENSES — find correct column name ───────────────────────
DO $$
DECLARE
  classes TEXT[] := ARRAY['B','C','D','E','BC','BD'];
  col_citizen TEXT; col_license TEXT; col_class TEXT;
  col_issued TEXT; col_expires TEXT;
  i INT := 0; c_id UUID;
  sql TEXT;
BEGIN
  -- Detect column names
  SELECT column_name INTO col_citizen FROM information_schema.columns
    WHERE table_name='licenses' AND column_name IN ('citizen_id','citizenid','citizen') LIMIT 1;
  SELECT column_name INTO col_license FROM information_schema.columns
    WHERE table_name='licenses' AND column_name IN ('license_number','license_no','number','licno') LIMIT 1;
  SELECT column_name INTO col_class FROM information_schema.columns
    WHERE table_name='licenses' AND column_name IN ('license_type','class','type','category') LIMIT 1;
  SELECT column_name INTO col_issued FROM information_schema.columns
    WHERE table_name='licenses' AND column_name IN ('issued_date','issued_at','issue_date','start_date') LIMIT 1;
  SELECT column_name INTO col_expires FROM information_schema.columns
    WHERE table_name='licenses' AND column_name IN ('expiry_date','expires_at','expiry','expiration_date') LIMIT 1;

  RAISE NOTICE 'License cols: citizen=%, license=%, class=%, issued=%, expires=%',
    col_citizen, col_license, col_class, col_issued, col_expires;

  IF col_citizen IS NULL OR col_license IS NULL THEN
    RAISE NOTICE 'Cannot determine license columns, skipping';
    RETURN;
  END IF;

  FOR c_id IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.55 THEN
      i := i + 1;
      BEGIN
        sql := format(
          'INSERT INTO licenses (%I,%I,%I,%I,%I,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',
          col_citizen, col_license, col_class, col_issued, col_expires
        );
        EXECUTE sql USING
          c_id, 'DL-TZ-'||lpad(i::text,6,'0'), classes[(floor(random()*6)+1)::int],
          CURRENT_DATE-(floor(random()*2000)+365)::int,
          CURRENT_DATE+floor(random()*1000)::int,
          CASE WHEN random()<0.05 THEN 'suspended' ELSE 'active' END,
          NOW();
      EXCEPTION WHEN OTHERS THEN
        IF i <= 3 THEN RAISE NOTICE 'License % error: % %', i, SQLSTATE, SQLERRM; END IF;
      END;
    END IF;
  END LOOP;
  RAISE NOTICE 'Licenses done: %', (SELECT COUNT(*) FROM licenses);
END $$;

-- ── CITIZEN FINES — fix the 4 existing and add more ──────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Over Speeding','No Seatbelt','Running Red Light','Wrong Parking',
    'No Insurance','Mobile Phone','Drunk Driving','Overloading','No License'];
  amounts INT[] := ARRAY[30000,50000,100000,150000,200000];
  c RECORD; v_plate TEXT; i INT := 0;
BEGIN
  FOR c IN SELECT id,name,mobile,nida,region FROM citizens
    WHERE id NOT IN (SELECT DISTINCT driver_nida::uuid FROM citizen_fines WHERE driver_nida IS NOT NULL)
    LIMIT 400
  LOOP
    i := i+1;
    BEGIN
      SELECT plate INTO v_plate FROM vehicles WHERE owner_phone=c.mobile LIMIT 1;
      INSERT INTO citizen_fines (driver_name,driver_phone,driver_nida,plate,offense,
        base_amount,total_amount,weeks_overdue,status,officer_name,region,created_at)
      VALUES (
        c.name, c.mobile, c.nida,
        COALESCE(v_plate,'T '||lpad((100+i)::text,3,'0')||' ZZZ'),
        offenses[(i%9)+1], amounts[(i%5)+1], amounts[(i%5)+1],
        floor(random()*12)::int,
        CASE WHEN i%2=0 THEN 'unpaid' WHEN i%5=0 THEN 'disputed' ELSE 'paid' END,
        'Afisa Polisi', COALESCE(c.region,'Dar es Salaam'),
        NOW()-(floor(random()*365)||' days')::interval
      );
    EXCEPTION WHEN OTHERS THEN
      IF i<=3 THEN RAISE NOTICE 'Fine error: % %', SQLSTATE, SQLERRM; END IF;
    END;
  END LOOP;
  RAISE NOTICE 'Citizen fines total: %', (SELECT COUNT(*) FROM citizen_fines);
END $$;

-- Final counts
SELECT tbl, count FROM (
  SELECT 'citizens' tbl, COUNT(*)::int count FROM citizens
  UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
  UNION ALL SELECT 'licenses', COUNT(*) FROM licenses
  UNION ALL SELECT 'citations', COUNT(*) FROM citations
  UNION ALL SELECT 'citizen_fines', COUNT(*) FROM citizen_fines
  UNION ALL SELECT 'arrests', COUNT(*) FROM arrests
  UNION ALL SELECT 'posts', COUNT(*) FROM posts
) x ORDER BY tbl;
