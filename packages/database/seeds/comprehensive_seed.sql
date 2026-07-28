-- ============================================================
-- COMPREHENSIVE SEED — Correct schema, all scenarios
-- ============================================================

SET session_replication_role = replica;

-- ── CITIZENS 1000 ────────────────────────────────────────────
INSERT INTO citizens (name, first_name, last_name, gender, mobile, nida, dob, address, region, district, status, has_criminal_record, created_at)
SELECT
  n || ' ' || ln,
  n, ln,
  CASE WHEN i%2=0 THEN 'Me' ELSE 'Ke' END,
  '+2556' || lpad((10000000 + floor(random()*89999999))::text,8,'0'),
  CASE WHEN random()>0.3 THEN lpad((floor(random()*9e19+1e19)::bigint)::text,20,'0') ELSE NULL END,
  (CURRENT_DATE - (floor(random()*18000)+6000)::int),
  reg || ', Tanzania',
  reg, dist,
  (ARRAY['Mtu wa Kawaida','Mtu wa Kawaida','Mtu wa Kawaida','Mtu wa Kawaida','Mtu wa Kawaida',
         'Mtu wa Kawaida','Mtu wa Kawaida','Mtu wa Kawaida','Anahisiwa na Uhalifu','Anatafutwa'])[floor(random()*10)+1],
  random() < 0.15,
  NOW() - (floor(random()*900)::int || ' days')::interval
FROM generate_series(1,1000) i,
LATERAL (VALUES
  ('Juma'),('Amina'),('Hassan'),('Fatuma'),('Daniel'),('Grace'),('Omar'),('Joyce'),
  ('Ally'),('Neema'),('Said'),('Maria'),('John'),('Rose'),('Samuel'),('Mercy'),
  ('Peter'),('Zawadi'),('David'),('Lilian'),('Abel'),('Faith'),('Emmanuel'),('Rehema'),
  ('Wycliffe'),('Gladness'),('Benjamin'),('Anastazia'),('Calvin'),('Josephine'),
  ('Rashid'),('Mariam'),('Patrick'),('Zuhura'),('Leonard'),('Amani'),('Baraka'),
  ('Asha'),('Raymond'),('Veronica')
) AS ns(n)
LATERAL (VALUES
  ('Ramadhani'),('Asha'),('Mwangi'),('Ali'),('Msema'),('Mwenda'),('Salim'),('Moshi'),
  ('Kibona'),('Simba'),('Baraka'),('Lukwago'),('Minja'),('Makala'),('Ngowi'),('Kimaro'),
  ('Mwita'),('Njau'),('Shirima'),('Mwakabungu'),('Msigwa'),('Mwangi'),('Lyimo'),('Mhina'),
  ('Massawe'),('Swai'),('Mlay'),('Mwanga'),('Kibanda'),('Meela'),
  ('Kombo'),('Kawemba'),('Mbise'),('Ndunguru'),('Merinyo'),('Mapunda'),('Otieno'),
  ('Mkandawire'),('Mwakasege'),('Luambano')
) AS lns(ln)
LATERAL (VALUES
  ('Dar es Salaam'),('Mwanza'),('Arusha'),('Dodoma'),('Mbeya'),('Morogoro'),
  ('Tanga'),('Kagera'),('Kilimanjaro'),('Shinyanga'),('Tabora'),('Kigoma'),
  ('Iringa'),('Mtwara'),('Lindi'),('Ruvuma'),('Singida'),('Mara'),('Pwani'),('Geita')
) AS regs(reg)
LATERAL (VALUES
  ('Ilala'),('Kinondoni'),('Temeke'),('Ubungo'),('Nyamagana'),('Ilemela'),
  ('Arusha City'),('Arumeru'),('Dodoma City'),('Chamwino'),('Mbeya City'),('Rungwe'),
  ('Morogoro Urban'),('Kilosa'),('Tanga City'),('Muheza'),('Bukoba Urban'),('Moshi Urban'),
  ('Shinyanga Urban'),('Kahama')
) AS dists(dist)
WHERE (i%40) = (ascii(n)-65)%40 AND (i%40) = (ascii(ln)-65)%40
LIMIT 1000
ON CONFLICT DO NOTHING;

-- Simpler fallback if above fails:
INSERT INTO citizens (name, first_name, last_name, gender, mobile, status, has_criminal_record, region, district, created_at)
SELECT
  'Raia ' || i,
  'Raia', i::text,
  CASE WHEN i%2=0 THEN 'Me' ELSE 'Ke' END,
  '+2556' || lpad((10000000+i)::text,8,'0'),
  CASE WHEN i%10=0 THEN 'Anatafutwa' WHEN i%15=0 THEN 'Anahisiwa na Uhalifu' ELSE 'Mtu wa Kawaida' END,
  i%7=0,
  (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro','Tanga','Kagera','Kilimanjaro','Pwani'])[i%10+1],
  (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana','Arusha City','Dodoma City','Mbeya City','Morogoro Urban','Tanga City'])[i%10+1],
  NOW() - (i || ' days')::interval
FROM generate_series(1,1000) i
WHERE NOT EXISTS (SELECT 1 FROM citizens WHERE name='Raia 1')
ON CONFLICT DO NOTHING;

-- ── 1000 VEHICLES ────────────────────────────────────────────
INSERT INTO vehicles (plate, make, model, type, color, year, owner_name, owner_nida, owner_phone, insurance_valid, outstanding_fines, status, created_at)
SELECT
  'T ' || lpad((100+i)::text,3,'0') || ' ' ||
    (ARRAY['ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX','YZA','BCD','EFG','HIJ'])[i%12+1],
  (ARRAY['Toyota','Nissan','Honda','Mitsubishi','Isuzu','Mercedes','BMW','Ford','Mazda','Suzuki','Hyundai','Kia','Subaru','VW'])[i%14+1],
  (ARRAY['Corolla','Hilux','Premio','Spacio','Land Cruiser','Prado','Wingroad','Note','March','Vitz','Ractis','Rush','Terios','Fielder','Allion'])[i%15+1],
  (ARRAY['Saloon','SUV','Pickup','Minivan','Bus','Truck','Motorcycle','Van'])[i%8+1],
  (ARRAY['Nyeupe','Nyeusi','Silvery','Nyekundu','Bluu','Kijani','Njano','Kahawia','Kijivu'])[i%9+1],
  (2005 + i%20)::text,
  'Mmiliki ' || i,
  CASE WHEN i%5=0 THEN NULL ELSE lpad((1000000000000000000+i)::text,20,'0') END,
  '+2556' || lpad((10000000+i*7)::text,8,'0'),
  i%3 != 0,
  (i%5)*50000,
  CASE WHEN i%20=0 THEN 'stolen' WHEN i%30=0 THEN 'impounded' ELSE 'registered' END,
  NOW() - (floor(random()*1000)::int || ' days')::interval
FROM generate_series(1,1000) i
ON CONFLICT DO NOTHING;

-- ── LINK SOME VEHICLES TO CITIZENS ───────────────────────────
UPDATE vehicles v SET
  owner_name = c.name,
  owner_nida = c.nida,
  owner_phone = c.mobile
FROM (
  SELECT c.id, c.name, c.nida, c.mobile,
         ROW_NUMBER() OVER (ORDER BY random()) as rn
  FROM citizens c
) c
WHERE REPLACE(v.plate,' ','')::text IS NOT NULL
  AND c.rn <= 800
  AND v.owner_name LIKE 'Mmiliki%';

-- ── VEHICLE OWNERSHIP RECORDS ─────────────────────────────────
INSERT INTO vehicle_ownership (vehicle_id, owner_citizen_id, owner_name, owner_nida, owner_phone, status, is_current_owner, created_at)
SELECT
  v.id,
  c.id,
  c.name,
  c.nida,
  c.mobile,
  CASE WHEN v.status='stolen' THEN 'stolen' WHEN v.status='impounded' THEN 'in_investigation' ELSE 'active' END,
  TRUE,
  NOW()
FROM vehicles v
JOIN citizens c ON c.mobile = v.owner_phone
WHERE v.owner_phone IS NOT NULL
ON CONFLICT DO NOTHING;

-- Some vehicles with 2 previous owners (transfer history)
INSERT INTO vehicle_ownership (vehicle_id, owner_citizen_id, owner_name, status, is_current_owner, owned_until, created_at)
SELECT
  v.id,
  c.id,
  c.name,
  'transferred',
  FALSE,
  CURRENT_DATE - 180,
  NOW() - '200 days'::interval
FROM vehicles v
JOIN citizens c ON c.id != (SELECT owner_citizen_id FROM vehicle_ownership WHERE vehicle_id=v.id AND is_current_owner=TRUE LIMIT 1)
WHERE random() < 0.15
LIMIT 150
ON CONFLICT DO NOTHING;

-- ── 2000 PROPERTIES — already seeded, now link owners ─────────
INSERT INTO property_owners (property_id, citizen_id, owner_name, ownership_type, owned_from, is_current, created_at)
SELECT
  p.id,
  c.id,
  c.name,
  (ARRAY['full','partial','leased','mortgaged'])[floor(random()*4+1)::int],
  CURRENT_DATE - (floor(random()*3000))::int,
  TRUE,
  NOW()
FROM properties p
CROSS JOIN LATERAL (
  SELECT id, name FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1
) c
WHERE NOT EXISTS (SELECT 1 FROM property_owners po WHERE po.property_id=p.id AND po.is_current=TRUE)
LIMIT 2000
ON CONFLICT DO NOTHING;

-- Some properties with multiple owners (partial ownership)
INSERT INTO property_owners (property_id, citizen_id, owner_name, ownership_type, owned_from, is_current, created_at)
SELECT
  p.id,
  c.id,
  c.name,
  'partial',
  CURRENT_DATE - floor(random()*1000)::int,
  TRUE,
  NOW()
FROM properties p
CROSS JOIN LATERAL (
  SELECT id, name FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1
) c
WHERE random() < 0.1
LIMIT 200
ON CONFLICT DO NOTHING;

-- ── DRIVING LICENSES ─────────────────────────────────────────
INSERT INTO licenses (citizen_id, license_number, license_type, issued_date, expiry_date, status, created_at)
SELECT
  c.id,
  'DL-TZ-' || lpad(ROW_NUMBER() OVER (ORDER BY c.id)::text,6,'0'),
  (ARRAY['B','C','D','E','BC','BD'])[floor(random()*6+1)::int],
  CURRENT_DATE - floor(random()*2000+365)::int,
  CURRENT_DATE + floor(random()*1000)::int,
  CASE WHEN random()<0.05 THEN 'suspended' WHEN random()<0.02 THEN 'revoked' ELSE 'active' END,
  NOW()
FROM citizens c
WHERE random() < 0.6
ON CONFLICT DO NOTHING;

-- ── CITATIONS (police-issued) ─────────────────────────────────
INSERT INTO citations (citation_number, plate, offense, driver_name, date, time, location, amount, status, officer_id, created_at)
SELECT
  'CT-2026-' || lpad(i::text,4,'0'),
  (SELECT plate FROM vehicles OFFSET floor(random()*(SELECT COUNT(*) FROM vehicles))::int LIMIT 1),
  (ARRAY['Over Speeding','No Seatbelt','Running Red Light','Drunk Driving','No License',
         'Wrong Parking','Mobile Phone While Driving','Overloading','No Insurance','Unroadworthy'])[i%10+1],
  (SELECT name FROM citizens OFFSET floor(random()*(SELECT COUNT(*) FROM citizens))::int LIMIT 1),
  CURRENT_DATE - floor(random()*180)::int,
  ('06:00:00'::time + (floor(random()*1080)::int || ' minutes')::interval),
  (ARRAY['Ubungo DSM','Kariakoo DSM','Kinondoni','Temeke','Mwanza Mjini','Arusha CBD',
         'Dodoma Centre','Mbeya Town','Morogoro','Tanga Port'])[i%10+1],
  (ARRAY[30000,50000,100000,150000,200000])[i%5+1],
  CASE WHEN i%3=0 THEN 'paid' ELSE 'unpaid' END,
  (SELECT o.id FROM officers o ORDER BY random() LIMIT 1),
  NOW() - (floor(random()*180)::int || ' days')::interval
FROM generate_series(1,500) i
ON CONFLICT DO NOTHING;

-- ── CITIZEN FINES ─────────────────────────────────────────────
INSERT INTO citizen_fines (driver_name, driver_phone, driver_nida, plate, offense, base_amount, total_amount, weeks_overdue, due_date, status, officer_name, region, created_at)
SELECT
  c.name,
  c.mobile,
  c.nida,
  COALESCE((SELECT v.plate FROM vehicles v WHERE v.owner_phone=c.mobile LIMIT 1), 'T 000 ZZZ'),
  (ARRAY['Over Speeding','No Seatbelt','Running Red Light','Wrong Parking','No Insurance',
         'Mobile Phone','Drunk Driving','Overloading','No License'])[floor(random()*9+1)::int],
  (ARRAY[30000,50000,100000,150000,200000])[floor(random()*5+1)::int],
  (ARRAY[30000,50000,100000,150000,200000])[floor(random()*5+1)::int],
  floor(random()*12)::int,
  NOW() + (floor(random()*30-15)::int || ' days')::interval,
  CASE WHEN random()<0.55 THEN 'unpaid' WHEN random()<0.35 THEN 'paid' ELSE 'disputed' END,
  'Afisa wa Polisi',
  c.region,
  NOW() - (floor(random()*365)::int || ' days')::interval
FROM citizens c
WHERE random() < 0.35
LIMIT 400;

-- ── INCIDENTS ────────────────────────────────────────────────
INSERT INTO incidents (incident_number, type, location, date, time, status, priority, assigned_officer_id, description, created_at)
SELECT
  'INC-2026-' || lpad(i::text,4,'0'),
  (ARRAY['Ajali ya Barabarani','Wizi','Mapigano','Moto','Mtu Kutoweka',
         'Uhalifu wa Mtandao','Udanganyifu','Uvunjaji wa Amani','Dawa za Kulevya','Silaha Haramu'])[i%10+1],
  (ARRAY['Ubungo DSM','Kariakoo DSM','Kinondoni','Temeke','Mwanza Mjini',
         'Arusha CBD','Dodoma Centre','Mbeya Town','Morogoro','Tanga'])[i%10+1],
  CURRENT_DATE - floor(random()*365)::int,
  ('06:00:00'::time + (floor(random()*1080)::int || ' minutes')::interval),
  (ARRAY['urgent','active','active','investigating','investigating','resolved'])[floor(random()*6+1)::int],
  (ARRAY['high','medium','medium','low'])[floor(random()*4+1)::int],
  (SELECT o.id FROM officers o ORDER BY random() LIMIT 1),
  'Tukio liliripotiwa ' || i,
  NOW() - (floor(random()*365)::int || ' days')::interval
FROM generate_series(1,300) i
ON CONFLICT DO NOTHING;

-- ── ARRESTS ──────────────────────────────────────────────────
INSERT INTO arrests (arrest_number, officer_id, citizen_id, suspect_name, suspect_nida, suspect_phone, offense, location, arrest_date, arrest_time, status, station_id, created_at)
SELECT
  'ARR-2026-' || lpad(i::text,4,'0'),
  (SELECT id FROM users WHERE role IN ('officer-general','officer-traffic') ORDER BY random() LIMIT 1),
  (SELECT id FROM citizens ORDER BY random() LIMIT 1),
  (SELECT name FROM citizens ORDER BY random() LIMIT 1),
  lpad((1000000000000000000+i)::text,20,'0'),
  '+2556' || lpad((10000000+i*3)::text,8,'0'),
  (ARRAY['Wizi','Uvunjaji wa Amani','Madawa ya Kulevya','Silaha Haramu','Udanganyifu','Ulevi Hadharani',
         'Ulaghai','Unyakuzi','Ufisadi','Uhalifu wa Mtandao'])[i%10+1],
  (ARRAY['Ubungo','Kariakoo','Kinondoni','Temeke','Mwanza','Arusha'])[i%6+1],
  CURRENT_DATE - floor(random()*365)::int,
  ('06:00:00'::time + (floor(random()*1080)::int || ' minutes')::interval),
  (ARRAY['held','held','released','bailed','charged','transferred'])[floor(random()*6+1)::int],
  (SELECT id FROM stations ORDER BY random() LIMIT 1),
  NOW() - (floor(random()*365)::int || ' days')::interval
FROM generate_series(1,200) i
ON CONFLICT DO NOTHING;

-- ── PATROLS ──────────────────────────────────────────────────
INSERT INTO patrols (patrol_number, officer_id, area, start_time, end_time, status, notes, created_at)
SELECT
  'PAT-2026-' || lpad(i::text,4,'0'),
  (SELECT o.id FROM officers o ORDER BY random() LIMIT 1),
  (ARRAY['Ubungo-Kimara','Kariakoo-Msimbazi','Kinondoni-Sinza','Temeke-Mbagala',
         'Mwanza Mjini','Arusha CBD','Dodoma','Mbeya'])[i%8+1],
  NOW() - (floor(random()*30)::int || ' days')::interval,
  CASE WHEN i%3=0 THEN NULL ELSE NOW() - (floor(random()*30)::int || ' days')::interval + '8 hours'::interval END,
  (ARRAY['active','completed','completed','completed','cancelled'])[floor(random()*5+1)::int],
  'Doria ya kawaida eneo ' || i,
  NOW() - (floor(random()*30)::int || ' days')::interval
FROM generate_series(1,400) i
ON CONFLICT DO NOTHING;

-- ── MISSING RECORDS ──────────────────────────────────────────
INSERT INTO missing_records (case_no, type, title, identifier, details, last_seen_location, reported_by, reported_date, status, station_id, created_at)
SELECT
  'MSN-2026-' || lpad(i::text,4,'0'),
  (ARRAY['person','person','person','car','device'])[floor(random()*5+1)::int],
  'Anatafutwa/Amepotea ' || i,
  (SELECT name FROM citizens ORDER BY random() LIMIT 1),
  'Imetolewa taarifa na familia/marafiki',
  (ARRAY['Ubungo DSM','Kariakoo','Mwanza Mjini','Arusha','Dodoma','Mbeya','Morogoro'])[i%7+1],
  'Familia',
  CURRENT_DATE - floor(random()*90)::int,
  (ARRAY['active','active','found','closed'])[floor(random()*4+1)::int],
  (SELECT id FROM stations ORDER BY random() LIMIT 1),
  NOW() - (floor(random()*90)::int || ' days')::interval
FROM generate_series(1,100) i
ON CONFLICT DO NOTHING;

-- ── ALERTS ───────────────────────────────────────────────────
INSERT INTO alerts (title, message, source, category, priority, sent_by, audience, created_at)
SELECT
  (ARRAY['Taarifa ya Usalama','Onyo la Dharura','Habari za Kituo','Amri ya Kamanda','Taarifa ya Doria'])[i%5+1],
  'Taarifa namba ' || i || ' - Habari muhimu za mfumo',
  'Mfumo wa Polisi',
  (ARRAY['all','traffic','cid','admin'])[floor(random()*4+1)::int],
  (ARRAY['normal','high','urgent'])[floor(random()*3+1)::int],
  (SELECT id FROM users ORDER BY random() LIMIT 1),
  'all',
  NOW() - (floor(random()*30)::int || ' days')::interval
FROM generate_series(1,50) i
ON CONFLICT DO NOTHING;

SET session_replication_role = DEFAULT;

-- Final count
SELECT 'citizens' as tbl, COUNT(*) FROM citizens
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'properties', COUNT(*) FROM properties
UNION ALL SELECT 'property_owners', COUNT(*) FROM property_owners
UNION ALL SELECT 'vehicle_ownership', COUNT(*) FROM vehicle_ownership
UNION ALL SELECT 'licenses', COUNT(*) FROM licenses
UNION ALL SELECT 'citations', COUNT(*) FROM citations
UNION ALL SELECT 'citizen_fines', COUNT(*) FROM citizen_fines
UNION ALL SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL SELECT 'arrests', COUNT(*) FROM arrests
UNION ALL SELECT 'patrols', COUNT(*) FROM patrols
UNION ALL SELECT 'missing_records', COUNT(*) FROM missing_records
UNION ALL SELECT 'stations', COUNT(*) FROM stations
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'users', COUNT(*) FROM users;
