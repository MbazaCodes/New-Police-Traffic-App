-- Fix seed 6 — correct status values, real TZ formats

-- Valid statuses from constraints:
-- arrests: detained, released, bailed, charged, acquitted
-- licenses: check what valid values are

DO $$
DECLARE v TEXT;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='licenses' AND c.conname LIKE '%status%';
  RAISE NOTICE 'license status constraint: %', v;
END $$;

-- ── ARRESTS 200 ──────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Wizi wa Simu','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu',
    'Udanganyifu wa Fedha','Ulevi Hadharani','Ulaghai wa Biashara','Unyakuzi',
    'Uhalifu wa Mtandao','Ubakaji wa Watoto'];
  locs TEXT[] := ARRAY['Ubungo, Dar es Salaam','Kariakoo, Dar es Salaam','Kinondoni, DSM',
    'Temeke, DSM','Mwanza Mjini','Arusha CBD','Dodoma Centre','Mbeya Town'];
  statuses TEXT[] := ARRAY['detained','detained','released','bailed','charged','acquitted'];
  v_officer UUID; v_station UUID; v_cid UUID; v_name TEXT; i INT;
BEGIN
  SELECT id INTO v_officer FROM users WHERE role IN ('officer-general','officer-traffic') LIMIT 1;
  IF v_officer IS NULL THEN SELECT id INTO v_officer FROM users LIMIT 1; END IF;
  SELECT id INTO v_station FROM stations LIMIT 1;
  FOR i IN 1..200 LOOP
    BEGIN
      SELECT id,name INTO v_cid,v_name FROM citizens
        OFFSET (floor(random()*(SELECT COUNT(*) FROM citizens)))::int LIMIT 1;
      INSERT INTO arrests (arrest_number,officer_id,citizen_id,suspect_name,suspect_nida,
        offense,location,arrest_date,status,station_id,created_at)
      VALUES (
        'ARR-2026-'||lpad(i::text,4,'0'), v_officer, v_cid,
        COALESCE(v_name,'Mshukiwa '||i),
        -- Real TZ NIDA format: YYYYMMDD-XXXXX-XXXXX-XX
        to_char(CURRENT_DATE-(floor(random()*25000)+6000)::int,'YYYYMMDD')||'-'||
          lpad(floor(random()*99999)::text,5,'0')||'-'||
          lpad(floor(random()*99999)::text,5,'0')||'-'||
          lpad(floor(random()*99)::text,2,'0'),
        offenses[(i%10)+1], locs[(i%8)+1],
        CURRENT_DATE-floor(random()*365)::int,
        statuses[(floor(random()*6)+1)::int],
        v_station,
        NOW()-(floor(random()*365)||' days')::interval
      );
    EXCEPTION WHEN unique_violation THEN NULL;
    WHEN OTHERS THEN
      IF i<=2 THEN RAISE NOTICE 'Arrest error: % %', SQLSTATE, SQLERRM; END IF;
    END;
  END LOOP;
  RAISE NOTICE 'Arrests done: %', (SELECT COUNT(*) FROM arrests);
END $$;

-- ── LICENSES 600 — real TZ DL format ────────────────────────
-- TZ license number format: 4000099896 (10 digits, TRA issued)
-- Classes: C1 C2 C3 D E (from the sample)
DO $$
DECLARE
  v_status_constraint TEXT;
  valid_statuses TEXT[] := ARRAY['active','active','active','suspended','revoked'];
  classes TEXT[] := ARRAY['B','C1','C2','C3','D','E','BC','C1C2C3'];
  i INT := 0; c_id UUID;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v_status_constraint FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='licenses' AND c.conname LIKE '%status%';
  RAISE NOTICE 'license constraint: %', v_status_constraint;

  FOR c_id IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.60 THEN
      i := i+1;
      BEGIN
        INSERT INTO licenses (citizen_id, license_no, class, issued_at, expires_at, status, created_at)
        VALUES (
          c_id,
          -- Real TZ license format: 10-digit number starting with 4
          '4'||lpad((floor(random()*999999999)+100000000)::bigint::text,9,'0'),
          classes[(floor(random()*8)+1)::int],
          CURRENT_DATE-(floor(random()*3000)+365)::int,
          CURRENT_DATE+floor(random()*1460)::int,
          'active',  -- use only active to avoid constraint issues
          NOW()-(floor(random()*1000)||' days')::interval
        );
      EXCEPTION WHEN unique_violation THEN NULL;
      WHEN OTHERS THEN
        IF i<=2 THEN RAISE NOTICE 'License error: % %', SQLSTATE, SQLERRM; END IF;
      END;
    END IF;
  END LOOP;
  -- Update some to suspended/expired
  UPDATE licenses SET status='suspended' WHERE ctid IN (SELECT ctid FROM licenses ORDER BY random() LIMIT 30);
  RAISE NOTICE 'Licenses done: %', (SELECT COUNT(*) FROM licenses);
END $$;

-- ── UPDATE CITIZENS with real NIDA format ────────────────────
-- Real TZ NIDA: YYYYMMDD-XXXXX-XXXXX-XX (e.g. 19501007-11101-00001-26)
UPDATE citizens SET nida =
  to_char(dob,'YYYYMMDD')||'-'||
  lpad(floor(random()*99999)::text,5,'0')||'-'||
  lpad(floor(random()*99999)::text,5,'0')||'-'||
  lpad(floor(random()*99)::text,2,'0')
WHERE nida IS NULL OR LENGTH(nida) != 20;

-- ── UPDATE VEHICLES with real TZ plate format ────────────────
-- TZ plates: T 772 BBE (T + 3 digits + 3 letters) or T 772BBE
-- Also government: SM 001 (SM + 3 digits)
-- Update existing vehicles to correct format
DO $$
DECLARE
  letters TEXT[] := ARRAY['ABC','BBE','CCF','DDG','EEH','FFI','GGJ','HHK','IIL','JJM',
    'KKN','LLO','MMP','NNQ','OOR','PPS','QQT','RRU','SSV','TTW','UUX','VVY','WWZ'];
  i INT := 0;
  v RECORD;
BEGIN
  FOR v IN SELECT id FROM vehicles ORDER BY id LOOP
    i := i+1;
    UPDATE vehicles SET
      plate = 'T ' || lpad((100+i)::text,3,'0') || ' ' || letters[((i-1)%23)+1],
      -- Real TZ chassis format
      chassis_no = 'JT' || chr(65+((i-1)%26)) || 'K' || lpad(i::text,9,'0')
    WHERE id = v.id;
  END LOOP;
  RAISE NOTICE 'Plates updated: %', i;
END $$;

-- ── UPDATE USERS with real TZ id_number format ───────────────
-- Officers use service numbers, not NIDA
-- Format: Force number like TP-DSM-001 or badge numbers
UPDATE users SET id_number = badge_no WHERE id_number IS NULL OR id_number = badge_no;

-- Fix existing citations with real format
UPDATE citations SET
  citation_number = 'CT-TZ-' || to_char(created_at,'YYYY') || '-' || 
    lpad(ROW_NUMBER() OVER (ORDER BY created_at)::text,5,'0')
WHERE citation_number LIKE 'CT-2026-%';

-- Final summary
SELECT tbl, count FROM (
  SELECT 'citizens' tbl, COUNT(*)::int count FROM citizens
  UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
  UNION ALL SELECT 'licenses', COUNT(*) FROM licenses
  UNION ALL SELECT 'citations', COUNT(*) FROM citations
  UNION ALL SELECT 'citizen_fines', COUNT(*) FROM citizen_fines
  UNION ALL SELECT 'arrests', COUNT(*) FROM arrests
  UNION ALL SELECT 'patrols', COUNT(*) FROM patrols
  UNION ALL SELECT 'missing_records', COUNT(*) FROM missing_records
  UNION ALL SELECT 'posts', COUNT(*) FROM posts
  UNION ALL SELECT 'stations', COUNT(*) FROM stations
  UNION ALL SELECT 'users', COUNT(*) FROM users
  UNION ALL SELECT 'vehicle_ownership', COUNT(*) FROM vehicle_ownership
  UNION ALL SELECT 'property_owners', COUNT(*) FROM property_owners
) x ORDER BY tbl;
