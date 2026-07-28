-- ============================================================
-- FINAL FIX SEED — Fix all empty fields definitively
-- ============================================================

-- ── 1. UPDATE PROPERTIES with real data ──────────────────────
-- Fix: name from address, type and value were set correctly in our seed
UPDATE properties SET
  property_type = (ARRAY['Nyumba','Ardhi','Ghorofa','Biashara','Shamba','Ghala','Kiwanja'])[
    (ROW_NUMBER() OVER (ORDER BY id) % 7 + 1)::int]
WHERE property_type IS NULL OR property_type = '';

UPDATE properties SET
  value = (floor(random()*500)+10) * 1000000
WHERE value IS NULL;

UPDATE properties SET
  region = (ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro',
    'Tanga','Kagera','Kilimanjaro','Pwani','Geita','Shinyanga'])[
    (ROW_NUMBER() OVER (ORDER BY id) % 12 + 1)::int]
WHERE region IS NULL OR region = 'Arusha';  -- fix wrong Arusha region

UPDATE properties SET
  district = (ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana','Ilemela',
    'Arusha City','Dodoma City','Mbeya City','Morogoro Urban','Tanga City','Moshi Urban'])[
    (ROW_NUMBER() OVER (ORDER BY id) % 12 + 1)::int]
WHERE district IS NULL OR district = 'Dodoma City';  -- fix wrong district

-- Fix property names to be meaningful
UPDATE properties SET
  name = property_type || ' - ' || COALESCE(ward, district, region)
WHERE name LIKE '%Rd,%' OR name IS NULL;

-- ── 2. UPDATE CITIZENS with real names and NIDA ───────────────
-- The "Raia N" citizens need real names
DO $$
DECLARE
  first_names TEXT[] := ARRAY[
    'Juma','Amina','Hassan','Fatuma','Daniel','Grace','Omar','Joyce',
    'Ally','Neema','Said','Maria','John','Rose','Samuel','Mercy',
    'Peter','Zawadi','David','Lilian','Abel','Faith','Emmanuel','Rehema',
    'Wycliffe','Gladness','Benjamin','Anastazia','Calvin','Josephine',
    'Rashid','Mariam','Patrick','Zuhura','Leonard','Amani','Baraka',
    'Asha','Raymond','Veronica','Salome','Ibrahim','Beatrice','Yusuf',
    'Constance','Abdallah','Esther','Mohammed','Paulina','Hamisi'
  ];
  last_names TEXT[] := ARRAY[
    'Ramadhani','Asha','Mwangi','Ali','Msema','Mwenda','Salim','Moshi',
    'Kibona','Simba','Baraka','Lukwago','Minja','Makala','Ngowi','Kimaro',
    'Mwita','Njau','Shirima','Mwakabungu','Msigwa','Lyimo','Mhina',
    'Massawe','Swai','Mlay','Mwanga','Kibanda','Meela','Kombo',
    'Kawemba','Mbise','Ndunguru','Merinyo','Mapunda','Otieno',
    'Mkandawire','Mwakasege','Luambano','Kimbi','Nyerere','Msikula',
    'Mjema','Mkubwa','Mwacha','Luhende','Mbwilo','Kapinga','Mhagama','Semvua'
  ];
  regions TEXT[] := ARRAY['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya',
    'Morogoro','Tanga','Kagera','Kilimanjaro','Shinyanga','Tabora','Kigoma',
    'Iringa','Mtwara','Lindi','Ruvuma','Singida','Mara','Pwani','Geita'];
  districts TEXT[] := ARRAY['Ilala','Kinondoni','Temeke','Ubungo','Nyamagana',
    'Arusha City','Dodoma City','Mbeya City','Morogoro Urban','Tanga City',
    'Moshi Urban','Bukoba Urban','Shinyanga Urban','Tabora Urban','Musoma Urban'];
  c RECORD; i INT := 0;
  fn TEXT; ln TEXT; reg TEXT; dist TEXT;
BEGIN
  FOR c IN SELECT id, name FROM citizens WHERE name LIKE 'Raia %' ORDER BY id LOOP
    i := i + 1;
    fn := first_names[(i % 50) + 1];
    ln := last_names[(i % 50) + 1];
    reg := regions[(i % 20) + 1];
    dist := districts[(i % 15) + 1];
    UPDATE citizens SET
      name = fn || ' ' || ln,
      first_name = fn,
      last_name = ln,
      region = reg,
      district = dist,
      gender = CASE WHEN i%2=0 THEN 'Me' ELSE 'Ke' END,
      nida = to_char(COALESCE(dob, CURRENT_DATE-(i*20+6000)),'YYYYMMDD') || '-' ||
             lpad((floor(random()*99999))::text,5,'0') || '-' ||
             lpad((floor(random()*99999))::text,5,'0') || '-' ||
             lpad((floor(random()*99))::text,2,'0'),
      occupation = (ARRAY['Mwalimu','Mfanyabiashara','Dereva','Daktari','Mkulima',
        'Mhandisi','Mwanasheria','Muuguzi','Askari','Mhubiri','Mpishi','Mjenzi'])[i%12+1]
    WHERE id = c.id;
  END LOOP;
  RAISE NOTICE 'Updated % citizens with real names', i;
END $$;

-- ── 3. UPDATE VEHICLES with real owner names from citizens ────
DO $$
DECLARE
  v RECORD; c RECORD; i INT := 0;
BEGIN
  FOR v IN SELECT id FROM vehicles WHERE owner_name LIKE 'Mmiliki%' ORDER BY id LOOP
    i := i + 1;
    SELECT id, name, nida, mobile INTO c
    FROM citizens OFFSET (i % (SELECT COUNT(*) FROM citizens))::int LIMIT 1;
    
    UPDATE vehicles SET
      owner_name = c.name,
      owner_nida = c.nida,
      owner_phone = c.mobile,
      owner_citizen_id = c.id,
      -- Real TZ chassis format: JTEHK + 9 digits
      chassis_no = 'JTEHK' || lpad(i::text, 9, '0')
    WHERE id = v.id;
  END LOOP;
  RAISE NOTICE 'Updated % vehicles with real owner names', i;
END $$;

-- ── 4. ADD 500 DEVICES ───────────────────────────────────────
DO $$
DECLARE
  categories TEXT[] := ARRAY['simu','laptop','tablet','TV','camera','radio','generator'];
  brands TEXT[] := ARRAY['Samsung','iPhone','Tecno','Infinix','Nokia','Huawei','Oppo','Vivo','Xiaomi','HP','Dell','Lenovo'];
  models_phone TEXT[] := ARRAY['Galaxy A54','Galaxy S23','iPhone 14','Spark 10','Hot 30','3310',
    'P30','Reno 8','Y35','Note 12','Redmi 12','Camon 20'];
  statuses TEXT[] := ARRAY['active','active','active','active','active','stolen','lost','recovered'];
  c RECORD; i INT := 0; brand TEXT; cat TEXT; mdl TEXT;
BEGIN
  FOR c IN SELECT id, name, mobile, nida FROM citizens ORDER BY random() LIMIT 500 LOOP
    i := i + 1;
    cat := categories[(i%7)+1];
    brand := brands[(i%12)+1];
    mdl := models_phone[(i%12)+1];
    INSERT INTO devices (
      serial_no, imei, description, category, owner_citizen_id,
      owner_name, owner_phone, status, report_date, created_at
    ) VALUES (
      brand || '-SN-' || lpad(i::text,8,'0'),
      CASE WHEN cat='simu' THEN '3582' || lpad((floor(random()*99999999999999)+10000000000000)::bigint::text,14,'0') ELSE NULL END,
      brand || ' ' || mdl || CASE WHEN cat!='simu' THEN ' (' || cat || ')' ELSE '' END,
      cat,
      c.id, c.name, c.mobile,
      statuses[(floor(random()*8)+1)::int],
      CURRENT_DATE - floor(random()*365)::int,
      NOW() - (floor(random()*365)||' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Devices inserted: %', (SELECT COUNT(*) FROM devices);
END $$;

-- ── 5. UPDATE VEHICLE OWNERSHIP with real citizen links ────────
INSERT INTO vehicle_ownership (vehicle_id, owner_citizen_id, owner_name, owner_nida, owner_phone, status, is_current_owner, created_at)
SELECT v.id, v.owner_citizen_id, v.owner_name, v.owner_nida, v.owner_phone, 'active', TRUE, NOW()
FROM vehicles v
WHERE v.owner_citizen_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM vehicle_ownership vo WHERE vo.vehicle_id=v.id AND vo.is_current_owner=TRUE)
ON CONFLICT DO NOTHING;

-- ── 6. FIX PROPERTY OWNERS link ───────────────────────────────
DO $$
DECLARE
  p RECORD; c RECORD; i INT := 0;
BEGIN
  FOR p IN SELECT id FROM properties WHERE NOT EXISTS (
    SELECT 1 FROM property_owners po WHERE po.property_id=p.id AND po.is_current=TRUE
  ) LIMIT 2000 LOOP
    i := i+1;
    SELECT id, name INTO c FROM citizens OFFSET (i % (SELECT COUNT(*) FROM citizens))::int LIMIT 1;
    INSERT INTO property_owners (property_id, citizen_id, owner_name, ownership_type, owned_from, is_current, created_at)
    VALUES (p.id, c.id, c.name, 
      (ARRAY['full','partial','leased','mortgaged'])[i%4+1],
      CURRENT_DATE - floor(random()*3000)::int, TRUE, NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Property owners linked: %', i;
END $$;

-- Final verification
SELECT tbl, count FROM (
  SELECT 'citizens' tbl, COUNT(*)::int count FROM citizens
  UNION ALL SELECT 'citizens_with_nida', COUNT(*) FROM citizens WHERE nida IS NOT NULL AND nida LIKE '%-%-%-__'
  UNION ALL SELECT 'citizens_with_region', COUNT(*) FROM citizens WHERE region IS NOT NULL
  UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
  UNION ALL SELECT 'vehicles_with_chassis', COUNT(*) FROM vehicles WHERE chassis_no IS NOT NULL
  UNION ALL SELECT 'vehicles_with_owner', COUNT(*) FROM vehicles WHERE owner_name NOT LIKE 'Mmiliki%'
  UNION ALL SELECT 'devices', COUNT(*) FROM devices
  UNION ALL SELECT 'properties', COUNT(*) FROM properties
  UNION ALL SELECT 'properties_with_type', COUNT(*) FROM properties WHERE property_type IS NOT NULL
  UNION ALL SELECT 'properties_with_value', COUNT(*) FROM properties WHERE value IS NOT NULL
  UNION ALL SELECT 'property_owners', COUNT(*) FROM property_owners
) x ORDER BY tbl;
