-- ============================================================
-- FIX V3 — Real helper tables, verification after EVERY step.
-- ON_ERROR_STOP means it halts at the first real failure.
-- ============================================================
\set ON_ERROR_STOP on

\echo ''
\echo '### STEP 0: build numbering helper tables'

DROP TABLE IF EXISTS _cz_num;
CREATE TABLE _cz_num AS
  SELECT id, name, nida, mobile, dob,
         (row_number() OVER (ORDER BY id))::int AS rn
  FROM citizens;
CREATE INDEX ON _cz_num(rn);
SELECT COUNT(*) AS cz_num_rows FROM _cz_num;

DROP TABLE IF EXISTS _vh_num;
CREATE TABLE _vh_num AS
  SELECT id, (row_number() OVER (ORDER BY id))::int AS rn
  FROM vehicles;
CREATE INDEX ON _vh_num(rn);
SELECT COUNT(*) AS vh_num_rows FROM _vh_num;

DROP TABLE IF EXISTS _nm;
CREATE TABLE _nm AS
  SELECT (row_number() OVER ())::int AS rn, fn, ln
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
    ('Kapinga'),('Mhagama'),('Semvua'),('Chuwa'),('Kileo'),('Nnko'),('Urio')) l(ln);
CREATE INDEX ON _nm(rn);
SELECT COUNT(*) AS name_combos FROM _nm;

\echo ''
\echo '### STEP 1: update citizens (expect UPDATE 1001)'

UPDATE citizens c SET
  first_name = n.fn,
  last_name  = n.ln,
  name       = n.fn || ' ' || n.ln,
  gender     = CASE WHEN k.rn % 2 = 0 THEN 'Me' ELSE 'Ke' END,
  nida       = to_char(COALESCE(k.dob, CURRENT_DATE - (k.rn * 20 + 6000)), 'YYYYMMDD')
               || '-' || lpad(((k.rn * 7)  % 99999)::text, 5, '0')
               || '-' || lpad(((k.rn * 13) % 99999)::text, 5, '0')
               || '-' || lpad((k.rn % 99)::text, 2, '0'),
  region     = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro',
                'Tanga','Kagera','Kilimanjaro','Shinyanga','Tabora','Kigoma','Iringa',
                'Mtwara','Pwani','Geita','Mara','Singida','Ruvuma','Njombe'])[(k.rn % 20) + 1],
  district   = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana','Ilemela',
                'Arusha Mjini','Arumeru','Dodoma Mjini','Chamwino','Mbeya Mjini','Rungwe',
                'Morogoro Mjini','Kilosa','Tanga Mjini','Muheza','Bukoba Mjini',
                'Moshi Mjini','Shinyanga Mjini','Kahama'])[(k.rn % 20) + 1],
  occupation = (ARRAY['Mwalimu','Mfanyabiashara','Dereva','Daktari','Mkulima','Mhandisi',
                'Wakili','Muuguzi','Askari','Mpishi','Fundi Ujenzi','Fundi Umeme'])[(k.rn % 12) + 1]
FROM _cz_num k, _nm n
WHERE c.id = k.id
  AND n.rn  = ((k.rn - 1) % 2500) + 1;

SELECT COUNT(*) AS citizens_renamed FROM citizens WHERE name NOT LIKE 'Raia%';
SELECT COUNT(*) AS citizens_with_nida FROM citizens WHERE nida IS NOT NULL AND nida <> '';

\echo ''
\echo '### STEP 2: refresh helper (names changed) then update vehicles'

DROP TABLE IF EXISTS _cz_num;
CREATE TABLE _cz_num AS
  SELECT id, name, nida, mobile, (row_number() OVER (ORDER BY id))::int AS rn
  FROM citizens;
CREATE INDEX ON _cz_num(rn);

UPDATE vehicles v SET
  owner_name       = c.name,
  owner_nida       = c.nida,
  owner_phone      = c.mobile,
  owner_citizen_id = c.id
FROM _vh_num vn, _cz_num c
WHERE v.id  = vn.id
  AND c.rn  = ((vn.rn - 1) % 1001) + 1;

SELECT COUNT(*) AS vehicles_with_real_owner
FROM vehicles WHERE owner_name NOT LIKE 'Raia%' AND owner_name NOT LIKE 'Mmiliki%';

\echo ''
\echo '### STEP 3: devices (expect INSERT 0 500)'

INSERT INTO devices (serial_no, imei, description, category, owner_citizen_id,
                     owner_name, owner_phone, status, report_date, created_at)
SELECT
  'SN-' || lpad(k.rn::text, 8, '0'),
  CASE WHEN k.rn % 3 <> 0
       THEN '3582' || lpad((((k.rn * 987654321)::bigint % 99999999999999) + 10000000000000)::text, 14, '0')
       ELSE NULL END,
  (ARRAY['Samsung Galaxy A54','iPhone 14 Pro','Tecno Spark 10','Infinix Hot 30',
   'Nokia G60','Huawei P30 Lite','HP Laptop 15','Dell Inspiron 15','Lenovo ThinkPad',
   'Samsung TV 43','Canon EOS 250D','Sony Radio'])[(k.rn % 12) + 1],
  (ARRAY['simu','simu','simu','simu','laptop','tablet','simu','TV','camera','simu',
   'simu','radio'])[(k.rn % 12) + 1],
  k.id, k.name, k.mobile,
  (ARRAY['active','active','active','active','active','stolen','lost',
   'recovered'])[(k.rn % 8) + 1],
  CURRENT_DATE - (k.rn % 365),
  NOW() - ((k.rn % 365) || ' days')::interval
FROM _cz_num k
WHERE k.rn <= 500;

SELECT COUNT(*) AS devices_total FROM devices;

\echo ''
\echo '### STEP 4: sync vehicle_ownership'

UPDATE vehicle_ownership vo SET
  owner_citizen_id = v.owner_citizen_id,
  owner_name       = v.owner_name,
  owner_nida       = v.owner_nida,
  owner_phone      = v.owner_phone
FROM vehicles v
WHERE vo.vehicle_id = v.id AND vo.is_current_owner = TRUE;

\echo ''
\echo '### CLEANUP'
DROP TABLE IF EXISTS _cz_num;
DROP TABLE IF EXISTS _vh_num;
DROP TABLE IF EXISTS _nm;

\echo ''
\echo '### FINAL VERIFICATION'
SELECT tbl, cnt FROM (
  SELECT 'citizens_total'          AS tbl, COUNT(*)::int AS cnt FROM citizens
  UNION ALL SELECT 'citizens_real_names',  COUNT(*) FROM citizens WHERE name NOT LIKE 'Raia%'
  UNION ALL SELECT 'citizens_with_nida',   COUNT(*) FROM citizens WHERE nida IS NOT NULL AND nida <> ''
  UNION ALL SELECT 'vehicles_total',       COUNT(*) FROM vehicles
  UNION ALL SELECT 'vehicles_real_owners', COUNT(*) FROM vehicles WHERE owner_name NOT LIKE 'Raia%' AND owner_name NOT LIKE 'Mmiliki%'
  UNION ALL SELECT 'devices_total',        COUNT(*) FROM devices
  UNION ALL SELECT 'properties_regions',   COUNT(DISTINCT region) FROM properties
) x ORDER BY tbl;

\echo ''
\echo '### SAMPLES'
SELECT name, nida, region, district, occupation FROM citizens LIMIT 5;
SELECT plate, owner_name, owner_nida, chassis_no FROM vehicles LIMIT 5;
SELECT description, category, serial_no, owner_name, status FROM devices LIMIT 5;
