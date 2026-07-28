-- Fix seed 7 — arrests FK to officers, licenses status = valid/expired/suspended/revoked

-- ── ARRESTS 200 ──────────────────────────────────────────────
DO $$
DECLARE
  offenses TEXT[] := ARRAY['Wizi wa Simu','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu',
    'Udanganyifu wa Fedha','Ulevi Hadharani','Ulaghai','Unyakuzi','Uhalifu wa Mtandao','Ubakaji'];
  locs TEXT[] := ARRAY['Ubungo, DSM','Kariakoo, DSM','Kinondoni, DSM','Temeke, DSM',
    'Mwanza Mjini','Arusha CBD','Dodoma Centre','Mbeya Town'];
  statuses TEXT[] := ARRAY['detained','detained','released','bailed','charged','acquitted'];
  v_officer UUID; v_station UUID; v_cid UUID; v_name TEXT; i INT;
BEGIN
  -- Use officers table (not users)
  SELECT id INTO v_officer FROM officers LIMIT 1;
  IF v_officer IS NULL THEN
    RAISE NOTICE 'No officers found — inserting dummy officer first';
    INSERT INTO officers (id, user_id, name, officer_number, status, created_at)
    SELECT gen_random_uuid(), u.id, u.name, u.badge_no, 'active', NOW()
    FROM users u WHERE u.role IN ('officer-general','officer-traffic') LIMIT 1
    RETURNING id INTO v_officer;
  END IF;
  SELECT id INTO v_station FROM stations LIMIT 1;
  RAISE NOTICE 'Using officer: %, station: %', v_officer, v_station;

  FOR i IN 1..200 LOOP
    BEGIN
      SELECT id,name INTO v_cid,v_name FROM citizens
        OFFSET (floor(random()*(SELECT COUNT(*) FROM citizens)))::int LIMIT 1;
      INSERT INTO arrests (arrest_number,officer_id,citizen_id,suspect_name,suspect_nida,
        offense,location,arrest_date,status,station_id,created_at)
      VALUES (
        'ARR-2026-'||lpad(i::text,4,'0'), v_officer, v_cid,
        COALESCE(v_name,'Mshukiwa '||i),
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

-- ── LICENSES 600 — valid statuses: valid, expired, suspended, revoked ──
DO $$
DECLARE
  classes TEXT[] := ARRAY['B','C1','C2','C3','D','E','BC','C1C2C3DE'];
  statuses TEXT[] := ARRAY['valid','valid','valid','valid','valid','expired','suspended','revoked'];
  i INT := 0; c_id UUID;
BEGIN
  FOR c_id IN SELECT id FROM citizens ORDER BY id LOOP
    IF random() < 0.60 THEN
      i := i+1;
      BEGIN
        INSERT INTO licenses (citizen_id, license_no, class, issued_at, expires_at, status, created_at)
        VALUES (
          c_id,
          '4'||lpad((floor(random()*999999999)+100000000)::bigint::text,9,'0'),
          classes[(floor(random()*8)+1)::int],
          CURRENT_DATE-(floor(random()*3000)+365)::int,
          CURRENT_DATE+floor(random()*1460-730)::int,
          statuses[(floor(random()*8)+1)::int],
          NOW()-(floor(random()*1000)||' days')::interval
        );
      EXCEPTION WHEN unique_violation THEN NULL;
      WHEN OTHERS THEN
        IF i<=2 THEN RAISE NOTICE 'License error: % %', SQLSTATE, SQLERRM; END IF;
      END;
    END IF;
  END LOOP;
  RAISE NOTICE 'Licenses done: %', (SELECT COUNT(*) FROM licenses);
END $$;

-- ── UPDATE citizens NIDA to real TZ format ───────────────────
UPDATE citizens SET nida =
  to_char(COALESCE(dob, CURRENT_DATE-floor(random()*18000+6000)::int),'YYYYMMDD')||'-'||
  lpad(floor(random()*99999)::text,5,'0')||'-'||
  lpad(floor(random()*99999)::text,5,'0')||'-'||
  lpad(floor(random()*99)::text,2,'0')
WHERE nida IS NULL OR LENGTH(nida) < 20 OR nida NOT LIKE '%-%-%-__';

-- Final counts
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
) x ORDER BY tbl;
