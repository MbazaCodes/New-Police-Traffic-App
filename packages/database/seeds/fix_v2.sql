-- ============================================================
-- FIX V2 — Valid SQL only. Window functions in CTEs, not SET.
-- ============================================================

\echo '=== STEP 1: CITIZENS ==='

WITH names AS (
  SELECT ROW_NUMBER() OVER () AS rn, fn, ln
  FROM (VALUES ('Juma'),('Amina'),('Hassan'),('Fatuma'),('Daniel'),('Grace'),
    ('Omari'),('Joyce'),('Ally'),('Neema'),('Said'),('Maria'),('Yohana'),('Rose'),
    ('Samweli'),('Mercy'),('Petro'),('Zawadi'),('Daudi'),('Lilian'),('Abeli'),
    ('Imani'),('Emanueli'),('Rehema'),('Wilfred'),('Furaha'),('Benjamin'),
    ('Anastazia'),('Kelvin'),('Josephina'),('Rashidi'),('Mariamu'),('Patrick'),
    ('Zuhura'),('Leonard'),('Amani'),('Baraka'),('Asha'),('Raymond'),('Veronika'),
    ('Salome'),('Ibrahim'),('Beatrice'),('Yusufu'),('Consolata'),('Abdallah'),
    ('Esta'),('Mohamedi'),('Paulina'),('Hamisi')) f(fn)
  CROSS JOIN (VALUES ('Ramadhani'),('Mwangi'),('Ally'),('Msemwa'),('Mwenda'),
    ('Salumu'),('Moshi'),('Kibona'),('Simba'),('Baraka'),('Lukwaro'),('Minja'),
    ('Makala'),('Ngowi'),('Kimaro'),('Mwita'),('Njau'),('Shirima'),('Mwakabungu'),
    ('Msigwa'),('Lyimo'),('Mhina'),('Massawe'),('Swai'),('Mlay'),('Mwanga'),
    ('Kibanda'),('Meela'),('Kombo'),('Kawemba'),('Mbise'),('Ndunguru'),
    ('Merinyo'),('Mapunda'),('Mkandawire'),('Mwakasege'),('Luambano'),
    ('Nyerere'),('Msikula'),('Mjema'),('Mwacha'),('Luhende'),('Mbwilo'),
    ('Kapinga'),('Mhagama'),('Semvua'),('Chuwa'),('Kileo'),('Nnko'),('Urio')) l(ln)
),
numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM citizens
)
UPDATE citizens c SET
  name       = n.fn || ' ' || n.ln,
  first_name = n.fn,
  last_name  = n.ln,
  gender     = CASE WHEN nm.rn % 2 = 0 THEN 'Me' ELSE 'Ke' END,
  nida       = to_char(COALESCE(c.dob, CURRENT_DATE - (nm.rn * 20 + 6000)), 'YYYYMMDD')
               || '-' || lpad(((nm.rn * 7) % 99999)::text, 5, '0')
               || '-' || lpad(((nm.rn * 13) % 99999)::text, 5, '0')
               || '-' || lpad((nm.rn % 99)::text, 2, '0'),
  region     = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro',
                'Tanga','Kagera','Kilimanjaro','Shinyanga','Tabora','Kigoma','Iringa',
                'Mtwara','Pwani','Geita','Mara','Singida','Ruvuma','Njombe'])[(nm.rn % 20) + 1],
  district   = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana','Ilemela',
                'Arusha Mjini','Arumeru','Dodoma Mjini','Chamwino','Mbeya Mjini','Rungwe',
                'Morogoro Mjini','Kilosa','Tanga Mjini','Muheza','Bukoba Mjini',
                'Moshi Mjini','Shinyanga Mjini','Kahama'])[(nm.rn % 20) + 1],
  occupation = (ARRAY['Mwalimu','Mfanyabiashara','Dereva','Daktari','Mkulima','Mhandisi',
                'Wakili','Muuguzi','Askari','Mpishi','Fundi Ujenzi','Fundi Umeme'])[(nm.rn % 12) + 1]
FROM numbered nm
JOIN names n ON n.rn = ((nm.rn - 1) % 2500) + 1
WHERE c.id = nm.id;

\echo '=== STEP 2: VEHICLES ==='

WITH cz AS (
  SELECT id, name, nida, mobile, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM citizens
),
vh AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM vehicles
),
total AS (SELECT COUNT(*)::int AS n FROM citizens)
UPDATE vehicles v SET
  owner_name       = cz.name,
  owner_nida       = cz.nida,
  owner_phone      = cz.mobile,
  owner_citizen_id = cz.id
FROM vh, total t, cz
WHERE v.id = vh.id
  AND cz.rn = ((vh.rn - 1) % t.n) + 1;

\echo '=== STEP 3: PROPERTIES REGION/DISTRICT ==='

WITH pn AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM properties
)
UPDATE properties p SET
  region   = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro',
              'Tanga','Kagera','Kilimanjaro','Pwani','Geita','Shinyanga'])[(pn.rn % 12) + 1],
  district = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana','Arusha Mjini',
              'Dodoma Mjini','Mbeya Mjini','Morogoro Mjini','Tanga Mjini','Moshi Mjini',
              'Shinyanga Mjini'])[(pn.rn % 12) + 1]
FROM pn
WHERE p.id = pn.id;

\echo '=== STEP 4: PROPERTY NAMES ==='

UPDATE properties SET
  name = property_type || ' - ' || district || ', ' || region
WHERE name IS NULL OR name LIKE '%Rd,%' OR name LIKE 'plot %';

\echo '=== STEP 5: DEVICES ==='

INSERT INTO devices (serial_no, imei, description, category, owner_citizen_id,
                     owner_name, owner_phone, status, report_date, created_at)
SELECT
  'SN-' || lpad(d.rn::text, 8, '0'),
  CASE WHEN d.rn % 3 <> 0
       THEN '3582' || lpad(((d.rn * 987654321) % 99999999999999 + 10000000000000)::text, 14, '0')
       ELSE NULL END,
  (ARRAY['Samsung Galaxy A54','iPhone 14 Pro','Tecno Spark 10','Infinix Hot 30',
   'Nokia G60','Huawei P30 Lite','HP Laptop 15','Dell Inspiron 15','Lenovo ThinkPad',
   'Samsung TV 43','Canon EOS 250D','Sony Radio'])[(d.rn % 12) + 1],
  (ARRAY['simu','simu','simu','simu','laptop','tablet','simu','TV','camera','simu',
   'simu','radio'])[(d.rn % 12) + 1],
  d.id, d.name, d.mobile,
  (ARRAY['active','active','active','active','active','stolen','lost',
   'recovered'])[(d.rn % 8) + 1],
  CURRENT_DATE - (d.rn % 365),
  NOW() - ((d.rn % 365) || ' days')::interval
FROM (
  SELECT id, name, mobile, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM citizens LIMIT 500
) d;

\echo '=== STEP 6: VEHICLE OWNERSHIP SYNC ==='

UPDATE vehicle_ownership vo SET
  owner_citizen_id = v.owner_citizen_id,
  owner_name       = v.owner_name,
  owner_nida       = v.owner_nida,
  owner_phone      = v.owner_phone
FROM vehicles v
WHERE vo.vehicle_id = v.id AND vo.is_current_owner = TRUE;

\echo '=== VERIFICATION ==='

SELECT tbl, cnt FROM (
  SELECT 'citizens_total'          AS tbl, COUNT(*)::int AS cnt FROM citizens
  UNION ALL SELECT 'citizens_real_names',  COUNT(*) FROM citizens WHERE name NOT LIKE 'Raia%'
  UNION ALL SELECT 'citizens_with_nida',   COUNT(*) FROM citizens WHERE nida IS NOT NULL AND nida <> ''
  UNION ALL SELECT 'vehicles_total',       COUNT(*) FROM vehicles
  UNION ALL SELECT 'vehicles_real_owners', COUNT(*) FROM vehicles WHERE owner_name NOT LIKE 'Raia%' AND owner_name NOT LIKE 'Mmiliki%'
  UNION ALL SELECT 'devices_total',        COUNT(*) FROM devices
  UNION ALL SELECT 'properties_regions',   COUNT(DISTINCT region) FROM properties
  UNION ALL SELECT 'properties_districts', COUNT(DISTINCT district) FROM properties
) x ORDER BY tbl;

\echo '=== SAMPLES ==='
SELECT name, nida, region, district, occupation FROM citizens LIMIT 5;
SELECT plate, owner_name, chassis_no FROM vehicles LIMIT 5;
SELECT name, property_type, region, district, value FROM properties LIMIT 5;
SELECT description, category, serial_no, owner_name, status FROM devices LIMIT 5;
