SET session_replication_role = replica;

-- ── VEHICLES 1000 ─────────────────────────────────────────────
DO $$
DECLARE
  makes TEXT[] := ARRAY['Toyota','Nissan','Honda','Mitsubishi','Isuzu','Mercedes','BMW','Mazda','Suzuki','Hyundai','Kia','Subaru'];
  models TEXT[] := ARRAY['Corolla','Hilux','Premio','Spacio','Land Cruiser','Prado','Wingroad','Note','Vitz','Ractis','Rush','Fielder','Allion','Terios','Succeed'];
  types TEXT[] := ARRAY['Saloon','SUV','Pickup','Minivan','Van','Truck','Motorcycle'];
  colors TEXT[] := ARRAY['Nyeupe','Nyeusi','Silvery','Nyekundu','Bluu','Kijani','Njano','Kahawia','Kijivu'];
  regions TEXT[] := ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro','Tanga','Kagera','Kilimanjaro','Pwani'];
  suffixes TEXT[] := ARRAY['ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX','YZA','BCD','EFG','HIJ','KLM','NOP','QRS'];
  v_status TEXT;
  v_plate TEXT;
  i INT;
BEGIN
  FOR i IN 1..1000 LOOP
    v_status := CASE WHEN i%20=0 THEN 'stolen' WHEN i%30=0 THEN 'impounded' ELSE 'registered' END;
    v_plate := 'T ' || lpad((100+i)::text,3,'0') || ' ' || suffixes[((i-1)%15)+1];
    
    INSERT INTO vehicles (plate, make, model, type, color, year, owner_name, owner_phone, insurance_valid, outstanding_fines, status, created_at)
    VALUES (
      v_plate,
      makes[((i-1)%12)+1],
      models[((i-1)%15)+1],
      types[((i-1)%7)+1],
      colors[((i-1)%9)+1],
      (2005 + (i%20))::text,
      'Mmiliki Gari ' || i,
      '+2556' || lpad((10000000+i*7)::text,8,'0'),
      (i%3 != 0),
      (i%5)*50000,
      v_status,
      NOW() - ((i%365) || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Vehicles inserted';
END $$;

-- Update vehicles with real citizen names/phones where possible
UPDATE vehicles v
SET owner_name = c.name, owner_phone = c.mobile, owner_nida = c.nida
FROM (
  SELECT name, mobile, nida, ROW_NUMBER() OVER (ORDER BY id) as rn FROM citizens WHERE mobile IS NOT NULL
) c
WHERE v.owner_name LIKE 'Mmiliki Gari%'
  AND (regexp_replace(v.plate, '[^0-9]','','g')::int % (SELECT COUNT(*) FROM citizens WHERE mobile IS NOT NULL)::int) = (c.rn-1) % (SELECT COUNT(*) FROM citizens WHERE mobile IS NOT NULL)::int;

-- ── VEHICLE OWNERSHIP RECORDS ─────────────────────────────────
INSERT INTO vehicle_ownership (vehicle_id, owner_citizen_id, owner_name, owner_nida, owner_phone, status, is_current_owner, created_at)
SELECT v.id, c.id, c.name, c.nida, c.mobile,
  CASE WHEN v.status='stolen' THEN 'stolen' WHEN v.status='impounded' THEN 'in_investigation' ELSE 'active' END,
  TRUE, NOW()
FROM vehicles v
JOIN citizens c ON c.mobile = v.owner_phone
WHERE v.owner_phone IS NOT NULL
ON CONFLICT DO NOTHING;

-- Vehicles without citizen link — add generic ownership
INSERT INTO vehicle_ownership (vehicle_id, owner_name, owner_phone, status, is_current_owner, created_at)
SELECT v.id, v.owner_name, v.owner_phone, 'active', TRUE, NOW()
FROM vehicles v
WHERE NOT EXISTS (SELECT 1 FROM vehicle_ownership vo WHERE vo.vehicle_id = v.id)
ON CONFLICT DO NOTHING;

-- ── DRIVING LICENSES ──────────────────────────────────────────
DO $$
DECLARE
  c RECORD;
  lic_types TEXT[] := ARRAY['B','C','D','E','BC','BD'];
  i INT := 0;
BEGIN
  FOR c IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.55 THEN
      i := i + 1;
      INSERT INTO licenses (citizen_id, license_number, license_type, issued_date, expiry_date, status, created_at)
      VALUES (
        c.id,
        'DL-TZ-' || lpad(i::text,6,'0'),
        lic_types[(floor(random()*6)+1)::int],
        CURRENT_DATE - (floor(random()*2000)+365)::int,
        CURRENT_DATE + floor(random()*1000)::int,
        CASE WHEN random()<0.05 THEN 'suspended' WHEN random()<0.02 THEN 'revoked' ELSE 'active' END,
        NOW()
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RAISE NOTICE 'Licenses: %', i;
END $$;

-- ── CITATIONS 500 ─────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Over Speeding','No Seatbelt','Running Red Light','Drunk Driving',
    'No License','Wrong Parking','Mobile Phone While Driving','Overloading','No Insurance','Unroadworthy'];
  locations TEXT[] := ARRAY['Ubungo DSM','Kariakoo DSM','Kinondoni','Temeke','Mwanza Mjini',
    'Arusha CBD','Dodoma Centre','Mbeya Town','Morogoro','Tanga Port'];
  amounts INT[] := ARRAY[30000,50000,100000,150000,200000];
  v_plate TEXT;
  v_officer UUID;
  v_citizen TEXT;
  i INT;
BEGIN
  SELECT id INTO v_officer FROM officers LIMIT 1;
  FOR i IN 1..500 LOOP
    SELECT plate INTO v_plate FROM vehicles OFFSET floor(random()*(SELECT COUNT(*) FROM vehicles))::int LIMIT 1;
    SELECT name INTO v_citizen FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1;
    INSERT INTO citations (citation_number, plate, offense, driver_name, date, time, location, amount, status, officer_id, created_at)
    VALUES (
      'CT-2026-' || lpad(i::text,4,'0'),
      COALESCE(v_plate,'T 999 ZZZ'),
      offenses[(i%10)+1],
      COALESCE(v_citizen,'Dereva ' || i),
      CURRENT_DATE - floor(random()*180)::int,
      ('06:00'::time + ((floor(random()*1080))::text || ' minutes')::interval),
      locations[(i%10)+1],
      amounts[(i%5)+1],
      CASE WHEN i%3=0 THEN 'paid' ELSE 'unpaid' END,
      v_officer,
      NOW() - (floor(random()*180)::int || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Citations done';
END $$;

-- ── CITIZEN FINES 400 ────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Over Speeding','No Seatbelt','Running Red Light','Wrong Parking',
    'No Insurance','Mobile Phone','Drunk Driving','Overloading','No License'];
  amounts INT[] := ARRAY[30000,50000,100000,150000,200000];
  c RECORD;
  v_plate TEXT;
  i INT := 0;
BEGIN
  FOR c IN SELECT id, name, mobile, nida, region FROM citizens WHERE random()<0.4 LIMIT 400 LOOP
    i := i + 1;
    SELECT plate INTO v_plate FROM vehicles WHERE owner_phone=c.mobile LIMIT 1;
    INSERT INTO citizen_fines (driver_name, driver_phone, driver_nida, plate, offense, base_amount, total_amount, weeks_overdue, status, officer_name, region, created_at)
    VALUES (
      c.name, c.mobile, c.nida,
      COALESCE(v_plate, 'T ' || lpad((100+i)::text,3,'0') || ' ZZZ'),
      offenses[(i%9)+1],
      amounts[(i%5)+1], amounts[(i%5)+1],
      floor(random()*12)::int,
      CASE WHEN i%2=0 THEN 'unpaid' WHEN i%5=0 THEN 'disputed' ELSE 'paid' END,
      'Afisa Polisi',
      COALESCE(c.region,'Dar es Salaam'),
      NOW() - (floor(random()*365)::int || ' days')::interval
    );
  END LOOP;
  RAISE NOTICE 'Citizen fines: %', i;
END $$;

-- ── INCIDENTS 300 ────────────────────────────────────────────
DO $$
DECLARE
  types TEXT[] := ARRAY['Ajali ya Barabarani','Wizi','Mapigano','Moto','Mtu Kutoweka',
    'Uhalifu wa Mtandao','Udanganyifu','Uvunjaji wa Amani','Dawa za Kulevya','Silaha Haramu'];
  locs TEXT[] := ARRAY['Ubungo DSM','Kariakoo DSM','Kinondoni','Temeke','Mwanza Mjini',
    'Arusha CBD','Dodoma Centre','Mbeya Town','Morogoro','Tanga'];
  priorities incident_status[] := ARRAY['urgent','active','active','investigating','investigating','resolved']::incident_status[];
  plevels priority_level[] := ARRAY['high','medium','medium','low']::priority_level[];
  v_officer UUID;
  i INT;
BEGIN
  SELECT o.id INTO v_officer FROM officers o LIMIT 1;
  FOR i IN 1..300 LOOP
    INSERT INTO incidents (incident_number, type, location, date, time, status, priority, assigned_officer_id, description, created_at)
    VALUES (
      'INC-2026-' || lpad(i::text,4,'0'),
      types[(i%10)+1],
      locs[(i%10)+1],
      CURRENT_DATE - floor(random()*365)::int,
      ('06:00'::time + ((floor(random()*1080))::text || ' minutes')::interval),
      priorities[(floor(random()*6)+1)::int],
      plevels[(floor(random()*4)+1)::int],
      v_officer,
      'Tukio ' || i || ': ' || types[(i%10)+1] || ' - ' || locs[(i%10)+1],
      NOW() - (floor(random()*365)::int || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Incidents done';
END $$;

-- ── ARRESTS 200 ──────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Wizi','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu',
    'Udanganyifu','Ulevi Hadharani','Ulaghai','Unyakuzi','Ufisadi','Uhalifu wa Mtandao'];
  locs TEXT[] := ARRAY['Ubungo','Kariakoo','Kinondoni','Temeke','Mwanza','Arusha','Dodoma','Mbeya'];
  statuses TEXT[] := ARRAY['held','held','released','bailed','charged','transferred'];
  v_officer UUID;
  v_station UUID;
  v_citizen UUID;
  v_name TEXT;
  i INT;
BEGIN
  SELECT id INTO v_officer FROM users WHERE role IN ('officer-general','officer-traffic') LIMIT 1;
  SELECT id INTO v_station FROM stations LIMIT 1;
  FOR i IN 1..200 LOOP
    SELECT id, name INTO v_citizen, v_name FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1;
    INSERT INTO arrests (arrest_number, officer_id, citizen_id, suspect_name, suspect_nida, suspect_phone, offense, location, arrest_date, arrest_time, status, station_id, created_at)
    VALUES (
      'ARR-2026-' || lpad(i::text,4,'0'),
      v_officer, v_citizen,
      v_name,
      lpad((1000000000000000000+i)::text,20,'0'),
      '+2556' || lpad((10000000+i*3)::text,8,'0'),
      offenses[(i%10)+1],
      locs[(i%8)+1],
      CURRENT_DATE - floor(random()*365)::int,
      ('06:00'::time + ((floor(random()*1080))::text || ' minutes')::interval),
      statuses[(floor(random()*6)+1)::int],
      v_station,
      NOW() - (floor(random()*365)::int || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Arrests done';
END $$;

-- ── PATROLS 400 ──────────────────────────────────────────────
DO $$
DECLARE
  areas TEXT[] := ARRAY['Ubungo-Kimara','Kariakoo-Msimbazi','Kinondoni-Sinza','Temeke-Mbagala',
    'Mwanza Mjini','Arusha CBD','Dodoma Centre','Mbeya Town'];
  statuses patrol_status[] := ARRAY['active','completed','completed','completed','cancelled']::patrol_status[];
  v_officer UUID;
  i INT;
BEGIN
  FOR i IN 1..400 LOOP
    SELECT o.id INTO v_officer FROM officers o OFFSET floor(random()*(SELECT COUNT(*) FROM officers))::int LIMIT 1;
    INSERT INTO patrols (patrol_number, officer_id, area, start_time, end_time, status, notes, created_at)
    VALUES (
      'PAT-2026-' || lpad(i::text,4,'0'),
      v_officer,
      areas[(i%8)+1],
      NOW() - (floor(random()*30)::int || ' days')::interval,
      CASE WHEN i%3=0 THEN NULL ELSE NOW() - (floor(random()*30)::int || ' days')::interval + '8 hours'::interval END,
      statuses[(floor(random()*5)+1)::int],
      'Doria ' || i,
      NOW() - (floor(random()*30)::int || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Patrols done';
END $$;

-- ── MISSING RECORDS 100 ──────────────────────────────────────
DO $$
DECLARE
  mtypes missing_type[] := ARRAY['person','person','person','car','device']::missing_type[];
  mstatuses missing_status[] := ARRAY['active','active','found','closed']::missing_status[];
  locs TEXT[] := ARRAY['Ubungo DSM','Kariakoo','Mwanza Mjini','Arusha','Dodoma','Mbeya','Morogoro'];
  v_station UUID;
  v_name TEXT;
  i INT;
BEGIN
  SELECT id INTO v_station FROM stations LIMIT 1;
  FOR i IN 1..100 LOOP
    SELECT name INTO v_name FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1;
    INSERT INTO missing_records (case_no, type, title, identifier, details, last_seen_location, reported_by, reported_date, status, station_id, created_at)
    VALUES (
      'MSN-2026-' || lpad(i::text,4,'0'),
      mtypes[(floor(random()*5)+1)::int],
      CASE WHEN mtypes[(floor(random()*5)+1)::int]='person' THEN 'Mtu Amepotea' WHEN mtypes[(floor(random()*5)+1)::int]='car' THEN 'Gari Limeibwa' ELSE 'Kifaa Kimepotea' END,
      COALESCE(v_name, 'Mtu ' || i),
      'Imetolewa taarifa na familia',
      locs[(i%7)+1],
      'Familia',
      CURRENT_DATE - floor(random()*90)::int,
      mstatuses[(floor(random()*4)+1)::int],
      v_station,
      NOW() - (floor(random()*90)::int || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Missing records done';
END $$;

-- ── POSTS — 3 per region ─────────────────────────────────────
DO $$
DECLARE
  s RECORD;
  i INT := 35; -- continue from existing 34
BEGIN
  FOR s IN SELECT id, name, region FROM stations WHERE id NOT IN (SELECT DISTINCT station_id FROM posts WHERE station_id IS NOT NULL) LOOP
    i := i + 1;
    INSERT INTO posts (name, station_id, location, type, status, officers_count)
    VALUES ('Checkpoint A - ' || s.region, s.id, s.region || ' Junction A', 'checkpoint', 'active', 2)
    ON CONFLICT DO NOTHING;
    i := i + 1;
    INSERT INTO posts (name, station_id, location, type, status, officers_count)
    VALUES ('Checkpoint B - ' || s.region, s.id, s.region || ' Junction B', 'checkpoint', 'active', 2)
    ON CONFLICT DO NOTHING;
    i := i + 1;
    INSERT INTO posts (name, station_id, location, type, status, officers_count)
    VALUES ('Posti Doria - ' || s.region, s.id, s.region || ' Patrol Zone', 'patrol', 'active', 3)
    ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Posts added for remaining stations';
END $$;

SET session_replication_role = DEFAULT;

-- Final counts
SELECT tbl, count FROM (
  SELECT 'citizens' as tbl, COUNT(*)::int as count FROM citizens
  UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
  UNION ALL SELECT 'vehicle_ownership', COUNT(*) FROM vehicle_ownership
  UNION ALL SELECT 'licenses', COUNT(*) FROM licenses
  UNION ALL SELECT 'citations', COUNT(*) FROM citations
  UNION ALL SELECT 'citizen_fines', COUNT(*) FROM citizen_fines
  UNION ALL SELECT 'incidents', COUNT(*) FROM incidents
  UNION ALL SELECT 'arrests', COUNT(*) FROM arrests
  UNION ALL SELECT 'patrols', COUNT(*) FROM patrols
  UNION ALL SELECT 'missing_records', COUNT(*) FROM missing_records
  UNION ALL SELECT 'posts', COUNT(*) FROM posts
  UNION ALL SELECT 'stations', COUNT(*) FROM stations
  UNION ALL SELECT 'users', COUNT(*) FROM users
) x ORDER BY tbl;
