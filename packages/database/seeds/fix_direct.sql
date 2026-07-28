-- DIRECT FIXES — no DO blocks, simple SQL that cannot silently fail

-- ── 1. UPDATE ALL CITIZENS with real names using cross-join trick ──
CREATE TEMP TABLE tmp_names AS
SELECT
  ROW_NUMBER() OVER () as rn,
  fn || ' ' || ln as full_name,
  fn as first_nm,
  ln as last_nm
FROM
  (VALUES ('Juma'),('Amina'),('Hassan'),('Fatuma'),('Daniel'),('Grace'),('Omar'),
   ('Joyce'),('Ally'),('Neema'),('Said'),('Maria'),('John'),('Rose'),('Samuel'),
   ('Mercy'),('Peter'),('Zawadi'),('David'),('Lilian'),('Abel'),('Faith'),
   ('Emmanuel'),('Rehema'),('Wycliffe'),('Gladness'),('Benjamin'),('Anastazia'),
   ('Calvin'),('Josephine'),('Rashid'),('Mariam'),('Patrick'),('Zuhura'),
   ('Leonard'),('Amani'),('Baraka'),('Asha'),('Raymond'),('Veronica'),
   ('Salome'),('Ibrahim'),('Beatrice'),('Yusuf'),('Constance'),('Abdallah'),
   ('Esther'),('Mohammed'),('Paulina'),('Hamisi')) AS f(fn)
CROSS JOIN
  (VALUES ('Ramadhani'),('Asha'),('Mwangi'),('Ali'),('Msema'),('Mwenda'),
   ('Salim'),('Moshi'),('Kibona'),('Simba'),('Baraka'),('Lukwago'),('Minja'),
   ('Makala'),('Ngowi'),('Kimaro'),('Mwita'),('Njau'),('Shirima'),('Mwakabungu'),
   ('Msigwa'),('Lyimo'),('Mhina'),('Massawe'),('Swai'),('Mlay'),('Mwanga'),
   ('Kibanda'),('Meela'),('Kombo'),('Kawemba'),('Mbise'),('Ndunguru'),
   ('Merinyo'),('Mapunda'),('Otieno'),('Mkandawire'),('Mwakasege'),
   ('Luambano'),('Kimbi'),('Nyerere'),('Msikula'),('Mjema'),('Mkubwa'),
   ('Mwacha'),('Luhende'),('Mbwilo'),('Kapinga'),('Mhagama'),('Semvua')) AS l(ln)
LIMIT 2000;

CREATE TEMP TABLE tmp_citizens AS
SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn FROM citizens;

UPDATE citizens c SET
  name       = n.full_name,
  first_name = n.first_nm,
  last_name  = n.last_nm,
  gender     = CASE WHEN tc.rn%2=0 THEN 'Me' ELSE 'Ke' END,
  nida       = to_char(
    COALESCE(c.dob, CURRENT_DATE - (tc.rn*20 + 6000)),
    'YYYYMMDD'
  ) || '-' ||
  lpad((tc.rn * 7 % 99999)::text, 5, '0') || '-' ||
  lpad((tc.rn * 13 % 99999)::text, 5, '0') || '-' ||
  lpad((tc.rn % 99)::text, 2, '0'),
  region     = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya',
    'Morogoro','Tanga','Kagera','Kilimanjaro','Shinyanga','Tabora','Kigoma',
    'Iringa','Mtwara','Pwani','Geita','Mara','Singida','Ruvuma','Njombe']
  )[(tc.rn % 20) + 1],
  district   = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana',
    'Ilemela','Arusha City','Arumeru','Dodoma City','Chamwino','Mbeya City',
    'Rungwe','Morogoro Urban','Kilosa','Tanga City','Muheza','Bukoba Urban',
    'Moshi Urban','Shinyanga Urban','Kahama']
  )[(tc.rn % 20) + 1],
  occupation = (ARRAY['Mwalimu','Mfanyabiashara','Dereva','Daktari','Mkulima',
    'Mhandisi','Mwanasheria','Muuguzi','Askari','Mpishi','Mjenzi','Fundi']
  )[(tc.rn % 12) + 1]
FROM tmp_citizens tc
JOIN tmp_names n ON ((tc.rn - 1) % 2000) + 1 = n.rn
WHERE c.id = tc.id;

SELECT 'citizens updated' as step, COUNT(*) FROM citizens WHERE name NOT LIKE 'Raia%';

-- ── 2. UPDATE VEHICLES owner names from citizens ──────────────
UPDATE vehicles v SET
  owner_name = c.name,
  owner_nida = c.nida,
  owner_phone = COALESCE(c.mobile, v.owner_phone),
  owner_citizen_id = c.id
FROM (
  SELECT c.id, c.name, c.nida, c.mobile,
         ROW_NUMBER() OVER (ORDER BY c.id) as rn
  FROM citizens c
) c
JOIN (
  SELECT v2.id, ROW_NUMBER() OVER (ORDER BY v2.id) as rn
  FROM vehicles v2
) vn ON vn.id = v.id
WHERE ((vn.rn - 1) % (SELECT COUNT(*) FROM citizens)) + 1 = c.rn;

SELECT 'vehicles updated' as step, COUNT(*) FROM vehicles WHERE owner_name NOT LIKE 'Raia%' AND owner_name != 'Raia Mtanzania';

-- ── 3. FIX PROPERTIES region/district (all showing Arusha) ───
UPDATE properties SET
  region = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya',
    'Morogoro','Tanga','Kagera','Kilimanjaro','Pwani','Geita','Shinyanga']
  )[(ROW_NUMBER() OVER (ORDER BY id) % 12) + 1],
  district = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana',
    'Arusha City','Dodoma City','Mbeya City','Morogoro Urban','Tanga City',
    'Moshi Urban','Shinyanga Urban']
  )[(ROW_NUMBER() OVER (ORDER BY id) % 12) + 1]
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn FROM properties) p
WHERE properties.id = p.id;

SELECT 'properties region fixed' as step, COUNT(DISTINCT region) as regions FROM properties;

-- ── 4. INSERT DEVICES 500 ────────────────────────────────────
INSERT INTO devices (serial_no, imei, description, category, owner_citizen_id, owner_name, owner_phone, status, report_date, created_at)
SELECT
  'SN-' || chr(65 + (ROW_NUMBER() OVER (ORDER BY c.id) % 26)::int) || '-' ||
    lpad(ROW_NUMBER() OVER (ORDER BY c.id)::text, 8, '0'),
  CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) % 7 < 4
    THEN '3582' || lpad((ROW_NUMBER() OVER (ORDER BY c.id) * 1234567 % 99999999999999 + 10000000000000)::text, 14, '0')
    ELSE NULL END,
  (ARRAY['Samsung Galaxy A54','iPhone 14 Pro','Tecno Spark 10','Infinix Hot 30',
    'Nokia G60','Huawei P30','HP Laptop 15','Dell Inspiron','Lenovo ThinkPad',
    'Samsung TV 43"','Canon Camera EOS','Sony Radio Digital']
  )[(ROW_NUMBER() OVER (ORDER BY c.id) % 12) + 1],
  (ARRAY['simu','simu','simu','simu','laptop','tablet','simu','TV','camera','simu','simu','radio']
  )[(ROW_NUMBER() OVER (ORDER BY c.id) % 12) + 1],
  c.id, c.name, c.mobile,
  (ARRAY['active','active','active','active','active','stolen','lost','recovered']
  )[(ROW_NUMBER() OVER (ORDER BY c.id) % 8) + 1],
  CURRENT_DATE - (ROW_NUMBER() OVER (ORDER BY c.id) % 365)::int,
  NOW() - ((ROW_NUMBER() OVER (ORDER BY c.id) % 365) || ' days')::interval
FROM citizens c
LIMIT 500;

SELECT 'devices inserted' as step, COUNT(*) FROM devices;

-- ── 5. FIX VEHICLE OWNERSHIP records ─────────────────────────
INSERT INTO vehicle_ownership (vehicle_id, owner_citizen_id, owner_name, owner_nida, owner_phone, status, is_current_owner, created_at)
SELECT v.id, v.owner_citizen_id, v.owner_name, v.owner_nida, v.owner_phone,
  CASE WHEN v.status='stolen' THEN 'stolen' ELSE 'active' END,
  TRUE, NOW()
FROM vehicles v
WHERE v.owner_citizen_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vehicle_ownership vo WHERE vo.vehicle_id=v.id AND vo.is_current_owner=TRUE)
ON CONFLICT DO NOTHING;

SELECT 'vehicle_ownership' as step, COUNT(*) FROM vehicle_ownership;

-- ── FINAL VERIFICATION ────────────────────────────────────────
SELECT tbl, count FROM (
  SELECT 'citizens_total' tbl, COUNT(*)::int count FROM citizens
  UNION ALL SELECT 'citizens_real_names', COUNT(*) FROM citizens WHERE name NOT LIKE 'Raia%'
  UNION ALL SELECT 'citizens_with_nida', COUNT(*) FROM citizens WHERE nida LIKE '%-%-%-__'
  UNION ALL SELECT 'citizens_with_region', COUNT(*) FROM citizens WHERE region IS NOT NULL
  UNION ALL SELECT 'vehicles_total', COUNT(*) FROM vehicles
  UNION ALL SELECT 'vehicles_real_owners', COUNT(*) FROM vehicles WHERE owner_name NOT LIKE 'Raia%'
  UNION ALL SELECT 'vehicles_with_chassis', COUNT(*) FROM vehicles WHERE chassis_no IS NOT NULL
  UNION ALL SELECT 'devices_total', COUNT(*) FROM devices
  UNION ALL SELECT 'properties_total', COUNT(*) FROM properties
  UNION ALL SELECT 'properties_with_regions', COUNT(DISTINCT region) FROM properties
) x ORDER BY tbl;
