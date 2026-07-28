-- Fix seed 2 — targeted fixes for failing tables

-- ── VEHICLES 1000 ────────────────────────────────────────────
DO $$
DECLARE
  makes TEXT[] := ARRAY['Toyota','Nissan','Honda','Mitsubishi','Isuzu','Mercedes','Mazda','Suzuki','Hyundai','Kia','Subaru','VW'];
  models TEXT[] := ARRAY['Corolla','Hilux','Premio','Spacio','Land Cruiser','Prado','Wingroad','Note','Vitz','Ractis','Rush','Fielder','Allion','Terios','Succeed'];
  types TEXT[] := ARRAY['Saloon','SUV','Pickup','Minivan','Van','Truck','Motorcycle'];
  colors TEXT[] := ARRAY['Nyeupe','Nyeusi','Silvery','Nyekundu','Bluu','Kijani','Njano','Kahawia','Kijivu'];
  suffs TEXT[] := ARRAY['ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX','YZA','BCD','EFG','HIJ','KLM','NOP','QRS'];
  v_plate TEXT;
  v_status TEXT;
  i INT;
BEGIN
  FOR i IN 1..1000 LOOP
    v_plate := 'T ' || lpad((100+i)::text,3,'0') || ' ' || suffs[((i-1)%15)+1];
    v_status := CASE WHEN i%20=0 THEN 'stolen' WHEN i%30=0 THEN 'impounded' ELSE 'registered' END;
    INSERT INTO vehicles (plate, make, model, type, color, year, owner_name, owner_phone, insurance_valid, outstanding_fines, status, created_at)
    VALUES (
      v_plate, makes[((i-1)%12)+1], models[((i-1)%15)+1], types[((i-1)%7)+1],
      colors[((i-1)%9)+1], (2005+(i%20))::text,
      'Mmiliki ' || i,
      '+2556' || lpad((10000000+i*7)::text,8,'0'),
      (i%3!=0), (i%5)*50000, v_status,
      NOW() - ((i%365)||' days')::interval
    ) ON CONFLICT (plate) DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Vehicles done: %', (SELECT COUNT(*) FROM vehicles);
END $$;

-- Link vehicles to citizens
UPDATE vehicles v SET owner_name=c.name, owner_phone=c.mobile, owner_nida=c.nida
FROM (SELECT name, mobile, nida, ROW_NUMBER() OVER (ORDER BY id) rn FROM citizens LIMIT 900) c
WHERE v.owner_name LIKE 'Mmiliki%' AND v.id IS NOT NULL
  AND MOD(CAST(REPLACE(REPLACE(v.plate,'T ',''),' ','') AS BIGINT), 900)+1 = c.rn;

-- Vehicle ownership
INSERT INTO vehicle_ownership (vehicle_id, owner_name, owner_phone, status, is_current_owner, created_at)
SELECT id, owner_name, owner_phone, 'active', TRUE, NOW() FROM vehicles
WHERE NOT EXISTS (SELECT 1 FROM vehicle_ownership vo WHERE vo.vehicle_id=vehicles.id)
ON CONFLICT DO NOTHING;

-- ── LICENSES ────────────────────────────────────────────────
DO $$
DECLARE
  lic_types TEXT[] := ARRAY['B','C','D','E','BC','BD'];
  i INT := 0;
  c_id UUID;
BEGIN
  FOR c_id IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.55 THEN
      i := i + 1;
      BEGIN
        INSERT INTO licenses (citizen_id, license_number, license_type, issued_date, expiry_date, status, created_at)
        VALUES (c_id, 'DL-TZ-'||lpad(i::text,6,'0'), lic_types[(floor(random()*6)+1)::int],
          CURRENT_DATE-(floor(random()*2000)+365)::int, CURRENT_DATE+floor(random()*1000)::int,
          CASE WHEN random()<0.05 THEN 'suspended' WHEN random()<0.02 THEN 'revoked' ELSE 'active' END, NOW());
      EXCEPTION WHEN unique_violation THEN NULL;
      END;
    END IF;
  END LOOP;
  RAISE NOTICE 'Licenses: %', i;
END $$;

-- ── CITATIONS 500 ───────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Over Speeding','No Seatbelt','Running Red Light','Drunk Driving',
    'No License','Wrong Parking','Mobile Phone While Driving','Overloading','No Insurance','Unroadworthy'];
  locs TEXT[] := ARRAY['Ubungo DSM','Kariakoo DSM','Kinondoni','Temeke','Mwanza Mjini',
    'Arusha CBD','Dodoma Centre','Mbeya Town','Morogoro','Tanga Port'];
  amounts INT[] := ARRAY[30000,50000,100000,150000,200000];
  cit_statuses citation_status[] := ARRAY['paid','unpaid','unpaid']::citation_status[];
  v_plate TEXT; v_officer UUID; v_name TEXT; i INT;
BEGIN
  SELECT o.id INTO v_officer FROM officers o LIMIT 1;
  FOR i IN 1..500 LOOP
    BEGIN
      SELECT plate INTO v_plate FROM vehicles OFFSET (floor(random()*1000))::int LIMIT 1;
      SELECT name INTO v_name FROM citizens OFFSET (floor(random()*1000))::int LIMIT 1;
      INSERT INTO citations (citation_number, plate, offense, driver_name, date, time, location, amount, status, officer_id, created_at)
      VALUES ('CT-2026-'||lpad(i::text,4,'0'), COALESCE(v_plate,'T 999 ZZZ'), offenses[(i%10)+1],
        COALESCE(v_name,'Dereva '||i), CURRENT_DATE-floor(random()*180)::int,
        ('06:00'::time+(floor(random()*1080)||' minutes')::interval),
        locs[(i%10)+1], amounts[(i%5)+1],
        cit_statuses[(i%3)+1], v_officer,
        NOW()-(floor(random()*180)||' days')::interval);
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
  RAISE NOTICE 'Citations done: %', (SELECT COUNT(*) FROM citations);
END $$;

-- ── CITIZEN FINES 400 ───────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Over Speeding','No Seatbelt','Running Red Light','Wrong Parking',
    'No Insurance','Mobile Phone','Drunk Driving','Overloading','No License'];
  amounts INT[] := ARRAY[30000,50000,100000,150000,200000];
  c RECORD; v_plate TEXT; i INT := 0;
BEGIN
  FOR c IN SELECT id,name,mobile,nida,region FROM citizens WHERE random()<0.45 LIMIT 400 LOOP
    i := i+1;
    SELECT plate INTO v_plate FROM vehicles WHERE owner_phone=c.mobile LIMIT 1;
    INSERT INTO citizen_fines (driver_name,driver_phone,driver_nida,plate,offense,base_amount,total_amount,weeks_overdue,status,officer_name,region,created_at)
    VALUES (c.name,c.mobile,c.nida,
      COALESCE(v_plate,'T '||lpad((100+i)::text,3,'0')||' ZZZ'),
      offenses[(i%9)+1], amounts[(i%5)+1], amounts[(i%5)+1],
      floor(random()*12)::int,
      CASE WHEN i%2=0 THEN 'unpaid' WHEN i%5=0 THEN 'disputed' ELSE 'paid' END,
      'Afisa Polisi', COALESCE(c.region,'Dar es Salaam'),
      NOW()-(floor(random()*365)||' days')::interval);
  END LOOP;
  RAISE NOTICE 'Citizen fines: %', i;
END $$;

-- ── ARRESTS 200 ────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Wizi','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu',
    'Udanganyifu','Ulevi Hadharani','Ulaghai','Unyakuzi','Ufisadi','Uhalifu wa Mtandao'];
  locs TEXT[] := ARRAY['Ubungo','Kariakoo','Kinondoni','Temeke','Mwanza','Arusha','Dodoma','Mbeya'];
  statuses TEXT[] := ARRAY['held','held','released','bailed','charged','transferred'];
  v_officer UUID; v_station UUID; v_cid UUID; v_name TEXT; i INT;
BEGIN
  SELECT id INTO v_officer FROM users WHERE role IN ('officer-general','officer-traffic') LIMIT 1;
  SELECT id INTO v_station FROM stations LIMIT 1;
  FOR i IN 1..200 LOOP
    BEGIN
      SELECT id,name INTO v_cid,v_name FROM citizens OFFSET (floor(random()*(SELECT COUNT(*) FROM citizens)))::int LIMIT 1;
      INSERT INTO arrests (arrest_number,officer_id,citizen_id,suspect_name,suspect_nida,suspect_phone,offense,location,arrest_date,arrest_time,status,station_id,created_at)
      VALUES ('ARR-2026-'||lpad(i::text,4,'0'), v_officer, v_cid,
        COALESCE(v_name,'Msukosuko '||i),
        lpad((1000000000000000000+i)::text,20,'0'),
        '+2556'||lpad((10000000+i*3)::text,8,'0'),
        offenses[(i%10)+1], locs[(i%8)+1],
        CURRENT_DATE-floor(random()*365)::int,
        ('06:00'::time+(floor(random()*1080)||' minutes')::interval),
        statuses[(floor(random()*6)+1)::int], v_station,
        NOW()-(floor(random()*365)||' days')::interval);
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
  RAISE NOTICE 'Arrests done: %', (SELECT COUNT(*) FROM arrests);
END $$;

-- ── POSTS for stations without posts ───────────────────────
DO $$
DECLARE
  s RECORD; i INT := 100;
BEGIN
  FOR s IN
    SELECT id, name, region FROM stations
    WHERE id NOT IN (SELECT DISTINCT station_id FROM posts WHERE station_id IS NOT NULL)
    ORDER BY id
  LOOP
    i := i+1;
    INSERT INTO posts (name,station_id,location,type,status,officers_count)
    VALUES ('Checkpoint A - '||s.name, s.id, s.region||' A', 'checkpoint','active',2) ON CONFLICT DO NOTHING;
    i := i+1;
    INSERT INTO posts (name,station_id,location,type,status,officers_count)
    VALUES ('Checkpoint B - '||s.name, s.id, s.region||' B', 'checkpoint','active',2) ON CONFLICT DO NOTHING;
    i := i+1;
    INSERT INTO posts (name,station_id,location,type,status,officers_count)
    VALUES ('Posti Doria - '||s.name, s.id, s.region||' Doria', 'patrol','active',3) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Posts done: %', (SELECT COUNT(*) FROM posts);
END $$;

-- Final counts
SELECT tbl, count FROM (
  SELECT 'citizens' tbl, COUNT(*)::int count FROM citizens
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
) x ORDER BY tbl;
