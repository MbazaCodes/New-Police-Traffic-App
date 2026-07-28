-- Fix seed 4 — exact column names from diagnostic

-- Check post_type enum values
DO $$
DECLARE v TEXT;
BEGIN
  SELECT string_agg(enumlabel,',') INTO v FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='post_type';
  RAISE NOTICE 'post_type values: %', v;
END $$;

-- Check vehicles actual columns
DO $$
DECLARE v TEXT;
BEGIN
  SELECT string_agg(column_name,',') INTO v FROM information_schema.columns WHERE table_name='vehicles';
  RAISE NOTICE 'vehicles columns: %', v;
END $$;

-- ── VEHICLES 1000 ─────────────────────────────────────────────
DO $$
DECLARE
  makes TEXT[] := ARRAY['Toyota','Nissan','Honda','Mitsubishi','Isuzu','Mercedes','Mazda','Suzuki','Hyundai','Kia','Subaru','VW'];
  models TEXT[] := ARRAY['Corolla','Hilux','Premio','Spacio','Land Cruiser','Prado','Wingroad','Note','Vitz','Ractis','Rush','Fielder','Allion','Terios','Succeed'];
  types TEXT[] := ARRAY['Saloon','SUV','Pickup','Minivan','Van','Truck','Motorcycle'];
  colors TEXT[] := ARRAY['Nyeupe','Nyeusi','Silvery','Nyekundu','Bluu','Kijani','Njano','Kahawia','Kijivu'];
  suffs TEXT[] := ARRAY['ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX','YZA','BCD','EFG','HIJ','KLM','NOP','QRS'];
  v_plate TEXT;
  i INT;
  v_cols TEXT;
BEGIN
  -- Get actual column names first
  SELECT string_agg(column_name,',') INTO v_cols FROM information_schema.columns WHERE table_name='vehicles';
  RAISE NOTICE 'vehicles cols: %', v_cols;
  
  FOR i IN 1..1000 LOOP
    v_plate := 'T ' || lpad((100+i)::text,3,'0') || ' ' || suffs[((i-1)%15)+1];
    BEGIN
      -- Use only columns we know exist: plate, make, model, type, color, year, owner_name, owner_phone, insurance_valid, outstanding_fines
      EXECUTE format(
        'INSERT INTO vehicles (plate,make,model,type,color,year,owner_name,owner_phone,insurance_valid,outstanding_fines) VALUES (%L,%L,%L,%L,%L,%L,%L,%L,%L,%L) ON CONFLICT DO NOTHING',
        v_plate, makes[((i-1)%12)+1], models[((i-1)%15)+1], types[((i-1)%7)+1],
        colors[((i-1)%9)+1], (2005+(i%20))::text,
        'Mmiliki ' || i,
        '+2556' || lpad((10000000+i*7)::text,8,'0'),
        (i%3!=0), (i%5)*50000
      );
    EXCEPTION WHEN OTHERS THEN
      IF i=1 THEN RAISE NOTICE 'Vehicle insert error: % %', SQLSTATE, SQLERRM; END IF;
    END;
  END LOOP;
  RAISE NOTICE 'Vehicles done: %', (SELECT COUNT(*) FROM vehicles);
END $$;

-- ── ARRESTS 200 ──────────────────────────────────────────────
-- Columns: id,officer_id,citizen_id,station_id,arrest_date,created_at,updated_at,offense,arrest_number,location,notes,status,suspect_name,suspect_nida
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
      INSERT INTO arrests (arrest_number,officer_id,citizen_id,suspect_name,suspect_nida,offense,location,arrest_date,status,station_id,created_at)
      VALUES (
        'ARR-2026-'||lpad(i::text,4,'0'),
        v_officer, v_cid,
        COALESCE(v_name,'Msukosuko '||i),
        lpad((1000000000000000000+i)::text,20,'0'),
        offenses[(i%10)+1], locs[(i%8)+1],
        CURRENT_DATE-floor(random()*365)::int,
        statuses[(floor(random()*6)+1)::int],
        v_station,
        NOW()-(floor(random()*365)||' days')::interval
      );
    EXCEPTION WHEN unique_violation THEN NULL;
    WHEN OTHERS THEN
      IF i=1 THEN RAISE NOTICE 'Arrest error: % %', SQLSTATE, SQLERRM; END IF;
    END;
  END LOOP;
  RAISE NOTICE 'Arrests done: %', (SELECT COUNT(*) FROM arrests);
END $$;

-- ── LICENSES ─────────────────────────────────────────────────
-- Columns: created_at,citizenid,expires_at,issued_at,id,license_no,class,status
DO $$
DECLARE
  classes TEXT[] := ARRAY['B','C','D','E','BC','BD'];
  i INT := 0;
  c_id UUID;
BEGIN
  FOR c_id IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.55 THEN
      i := i + 1;
      BEGIN
        INSERT INTO licenses (citizenid, license_no, class, issued_at, expires_at, status, created_at)
        VALUES (c_id, 'DL-TZ-'||lpad(i::text,6,'0'), classes[(floor(random()*6)+1)::int],
          CURRENT_DATE-(floor(random()*2000)+365)::int,
          CURRENT_DATE+floor(random()*1000)::int,
          CASE WHEN random()<0.05 THEN 'suspended' WHEN random()<0.02 THEN 'revoked' ELSE 'active' END,
          NOW());
      EXCEPTION WHEN unique_violation THEN NULL;
      WHEN OTHERS THEN
        IF i=1 THEN RAISE NOTICE 'License error: % %', SQLSTATE, SQLERRM; END IF;
      END;
    END IF;
  END LOOP;
  RAISE NOTICE 'Licenses done: %', i;
END $$;

-- ── POSTS — get valid post_type then insert ───────────────────
DO $$
DECLARE
  v_type TEXT;
  v_type2 TEXT;
  s RECORD;
  i INT := 0;
BEGIN
  -- Get first valid post_type value
  SELECT enumlabel INTO v_type FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='post_type' ORDER BY enumsortorder LIMIT 1;
  SELECT enumlabel INTO v_type2 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='post_type' ORDER BY enumsortorder OFFSET 1 LIMIT 1;
  RAISE NOTICE 'Using post types: %, %', v_type, v_type2;

  FOR s IN
    SELECT id, name, region FROM stations
    WHERE id NOT IN (SELECT DISTINCT station_id FROM posts WHERE station_id IS NOT NULL)
    ORDER BY id
  LOOP
    i := i+1;
    EXECUTE format('INSERT INTO posts (name,station_id,location,type,status) VALUES (%L,%L,%L,%L::post_type,%L) ON CONFLICT DO NOTHING',
      'Checkpoint A - '||s.name, s.id, s.region||' A', v_type, 'active');
    EXECUTE format('INSERT INTO posts (name,station_id,location,type,status) VALUES (%L,%L,%L,%L::post_type,%L) ON CONFLICT DO NOTHING',
      'Checkpoint B - '||s.name, s.id, s.region||' B', v_type, 'active');
    EXECUTE format('INSERT INTO posts (name,station_id,location,type,status) VALUES (%L,%L,%L,%L::post_type,%L) ON CONFLICT DO NOTHING',
      'Posti Doria - '||s.name, s.id, s.region||' Doria', COALESCE(v_type2,v_type), 'active');
  END LOOP;
  RAISE NOTICE 'Posts done: %', (SELECT COUNT(*) FROM posts);
END $$;

-- Final counts
SELECT tbl, count FROM (
  SELECT 'citizens' tbl, COUNT(*)::int count FROM citizens
  UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
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
