-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — FULL SEED v2
-- Migration: 00000000000011_seed_full
-- Seeds ALL mock database records into Supabase
-- Citizens (20), Vehicles (20), Devices (20), Licenses (20)
-- Missing Records (8), Citations (20), Patrols (5)
-- All inserts are ON CONFLICT DO NOTHING (idempotent)
-- ============================================================

BEGIN;

-- ── CITIZENS (20) ─────────────────────────────────────────────
INSERT INTO citizens (id, name, first_name, last_name, nida, mobile, gender, dob, age,
  address, risk_score, has_criminal_record, license_no, photo_url) VALUES
  ('C0000001-0000-0000-0000-000000000001','Juma Khamis Mwinyi',      'Juma',     'Mwinyi',    '199012031234567','0712 345 678','M','1990-12-03',35,'Mbezi Beach, Kinondoni',    15, false,'DL001001TZ','https://ui-avatars.com/api/?name=Juma+Mwinyi&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000002','Fatuma Hassan Mwanga',    'Fatuma',   'Mwanga',    '199507081234568','0754 123 456','F','1995-07-08',30,'Mikocheni, Kinondoni',       5, false,'DL002002TZ','https://ui-avatars.com/api/?name=Fatuma+Mwanga&background=EF4444&color=fff'),
  ('C0000001-0000-0000-0000-000000000003','Ali Mohamed Salum',       'Ali',      'Salum',     '198803221234569','0712 987 654','M','1988-03-22',38,'Magomeni, Kinondoni',        45, true, 'DL003003TZ','https://ui-avatars.com/api/?name=Ali+Salum&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000004','Grace Amina Mushi',       'Grace',    'Mushi',     '199209141234570','0766 456 789','F','1992-09-14',33,'Sinza, Kinondoni',           10, false,'DL004004TZ','https://ui-avatars.com/api/?name=Grace+Mushi&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000005','Saidi Omari Bakari',      'Saidi',    'Bakari',    '197612301234571','0788 321 654','M','1976-12-30',49,'Temeke, Temeke',             65, true, 'DL005005TZ','https://ui-avatars.com/api/?name=Saidi+Bakari&background=FF9800&color=fff'),
  ('C0000001-0000-0000-0000-000000000006','Amina Said Juma',         'Amina',    'Juma',      '200101151234572','0755 789 012','F','2001-01-15',25,'Ubungo, Ubungo',             0, false,'DL006006TZ','https://ui-avatars.com/api/?name=Amina+Juma&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000007','Baraka John Mwanga',      'Baraka',   'Mwanga',    '200005121234573','0788 654 321','M','2000-05-12',26,'Manzese, Ubungo',            20, false,'DL007007TZ','https://ui-avatars.com/api/?name=Baraka+Mwanga&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000008','Zawadi Kimani Ochieng',   'Zawadi',   'Ochieng',   '198506201234574','0712 111 333','F','1985-06-20',40,'Ilala, Ilala',               5, false,'DL008008TZ','https://ui-avatars.com/api/?name=Zawadi+Ochieng&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000009','Hamisi Rashid Omar',      'Hamisi',   'Omar',      '197805091234575','0766 222 444','M','1978-05-09',48,'Kariakoo, Ilala',            80, true, 'DL009009TZ','https://ui-avatars.com/api/?name=Hamisi+Omar&background=EF4444&color=fff'),
  ('C0000001-0000-0000-0000-000000000010','Rashid Omari Said',       'Rashid',   'Said',      '199203151234576','0755 321 654','M','1992-03-15',34,'Magomeni, Kinondoni',        30, false,'DL010010TZ','https://ui-avatars.com/api/?name=Rashid+Said&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000011','Mariamu Ally Komba',      'Mariamu',  'Komba',     '199811271234577','0712 555 666','F','1998-11-27',27,'Mwananyamala, Kinondoni',    0, false,'DL011011TZ','https://ui-avatars.com/api/?name=Mariamu+Komba&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000012','Omari Hassan Kitwana',    'Omari',    'Kitwana',   '198210081234578','0766 777 888','M','1982-10-08',43,'Kijitonyama, Kinondoni',     10, false,'DL012012TZ','https://ui-avatars.com/api/?name=Omari+Kitwana&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000013','Pendo Mkwawa Haji',       'Pendo',    'Haji',      '199604031234579','0788 999 000','F','1996-04-03',30,'Tabata, Ilala',              0, false,'DL013013TZ','https://ui-avatars.com/api/?name=Pendo+Haji&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000014','Yusuph Issa Majaliwa',    'Yusuph',   'Majaliwa',  '197001171234580','0712 444 555','M','1970-01-17',56,'Buguruni, Ilala',            15, false,'DL014014TZ','https://ui-avatars.com/api/?name=Yusuph+Majaliwa&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000015','Sikudhani Mwema Nyota',   'Sikudhani','Nyota',     '199309251234581','0755 666 777','F','1993-09-25',32,'Kimara, Ubungo',             0, false,'DL015015TZ','https://ui-avatars.com/api/?name=Sikudhani+Nyota&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000016','Masoud Ally Mapunda',     'Masoud',   'Mapunda',   '198107141234582','0766 888 999','M','1981-07-14',44,'Mwenge, Kinondoni',          5, false,'DL016016TZ','https://ui-avatars.com/api/?name=Masoud+Mapunda&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000017','Hidaya Ramadhani Chiku',  'Hidaya',   'Chiku',     '200208061234583','0788 000 111','F','2002-08-06',23,'Msasani, Kinondoni',         0, false,'DL017017TZ','https://ui-avatars.com/api/?name=Hidaya+Chiku&background=10B981&color=fff'),
  ('C0000001-0000-0000-0000-000000000018','Nassoro Kombo Mataka',    'Nassoro',  'Mataka',    '198905231234584','0712 222 333','M','1989-05-23',37,'Goba, Kinondoni',            95, true, 'DL018018TZ','https://ui-avatars.com/api/?name=Nassoro+Mataka&background=EF4444&color=fff'),
  ('C0000001-0000-0000-0000-000000000019','Twaha Mrisho Lukindo',    'Twaha',    'Lukindo',   '197503311234585','0755 444 555','M','1975-03-31',51,'Segerea, Ilala',             5, false,'DL019019TZ','https://ui-avatars.com/api/?name=Twaha+Lukindo&background=1E3A8A&color=fff'),
  ('C0000001-0000-0000-0000-000000000020','Zainab Hemed Singida',    'Zainab',   'Singida',   '199704121234586','0766 333 444','F','1997-04-12',29,'Makuburi, Kinondoni',        0, false,'DL020020TZ','https://ui-avatars.com/api/?name=Zainab+Singida&background=10B981&color=fff')
ON CONFLICT (nida) DO NOTHING;

-- ── VEHICLES (20) ─────────────────────────────────────────────
INSERT INTO vehicles (id, plate, model, type, color, year, make,
  owner_citizen_id, owner_name, owner_nida, owner_phone,
  insurance_company, insurance_policy, insurance_expires, insurance_valid, outstanding_fines) VALUES
  ('V0000001-0000-0000-0000-000000000001','T 001 ABC','Toyota Corolla',     'Saloon','Nyeupe',  '2020','Toyota', 'C0000001-0000-0000-0000-000000000001','Juma Khamis Mwinyi',    '199012031234567','0712 345 678','Jubilee',  'JUB-001','2025-12-31', true,       0),
  ('V0000001-0000-0000-0000-000000000002','T 002 DEF','Toyota Vitz',        'Saloon','Nyekundu','2019','Toyota', 'C0000001-0000-0000-0000-000000000002','Fatuma Hassan Mwanga',  '199507081234568','0754 123 456','GA Insurance','GA-002','2025-06-30', true,      0),
  ('V0000001-0000-0000-0000-000000000003','T 003 GHI','Toyota Hiace',       'Minibus','Fedha',  '2018','Toyota', 'C0000001-0000-0000-0000-000000000003','Ali Mohamed Salum',     '198803221234569','0712 987 654','Strategies','STR-003','2024-03-31', false, 150000),
  ('V0000001-0000-0000-0000-000000000004','T 004 JKL','Suzuki Swift',       'Saloon','Bluu',    '2021','Suzuki', 'C0000001-0000-0000-0000-000000000004','Grace Amina Mushi',     '199209141234570','0766 456 789','Alliance', 'ALL-004','2026-01-31', true,      0),
  ('V0000001-0000-0000-0000-000000000005','T 005 MNO','Toyota Land Cruiser','SUV',   'Mweusi',  '2016','Toyota', 'C0000001-0000-0000-0000-000000000005','Saidi Omari Bakari',    '197612301234571','0788 321 654','Heritage', 'HER-005','2023-12-31', false, 300000),
  ('V0000001-0000-0000-0000-000000000006','T 006 PQR','Honda Fit',          'Saloon','Kijani',  '2022','Honda',  'C0000001-0000-0000-0000-000000000006','Amina Said Juma',       '200101151234572','0755 789 012','UAP',       'UAP-006','2026-06-30', true,      0),
  ('V0000001-0000-0000-0000-000000000007','T 007 STU','Nissan Note',        'Saloon','Dhahabu', '2020','Nissan', 'C0000001-0000-0000-0000-000000000007','Baraka John Mwanga',    '200005121234573','0788 654 321','Jubilee',  'JUB-007','2025-08-31', true,  50000),
  ('V0000001-0000-0000-0000-000000000008','T 008 VWX','Toyota Prado',       'SUV',   'Kahawia', '2023','Toyota', 'C0000001-0000-0000-0000-000000000008','Zawadi Kimani Ochieng', '198506201234574','0712 111 333','ICEA Lion','ICE-008','2026-09-30', true,      0),
  ('V0000001-0000-0000-0000-000000000009','T 009 YZA','Bajaji RE',          'Bajaji','Njano',   '2019','Bajaj',  'C0000001-0000-0000-0000-000000000009','Hamisi Rashid Omar',    '197805091234575','0766 222 444','Madison',  'MAD-009','2024-01-31', false, 250000),
  ('V0000001-0000-0000-0000-000000000010','T 010 BCD','Toyota Ipsum',       'Minibus','Nyeupe', '2017','Toyota', 'C0000001-0000-0000-0000-000000000010','Rashid Omari Said',     '199203151234576','0755 321 654','Jubilee',  'JUB-010','2025-11-30', true,      0),
  ('V0000001-0000-0000-0000-000000000011','T 011 EFG','Toyota Axio',        'Saloon','Fedha',   '2021','Toyota', 'C0000001-0000-0000-0000-000000000011','Mariamu Ally Komba',    '199811271234577','0712 555 666','GA Insurance','GA-011','2026-02-28', true,  0),
  ('V0000001-0000-0000-0000-000000000012','T 012 HIJ','Mitsubishi Outlander','SUV',  'Mweusi',  '2022','Mitsubishi','C0000001-0000-0000-0000-000000000012','Omari Hassan Kitwana','198210081234578','0766 777 888','Strategies','STR-012','2026-04-30', true, 0),
  ('V0000001-0000-0000-0000-000000000013','T 013 KLM','Toyota Rush',        'SUV',   'Bluu',    '2023','Toyota', 'C0000001-0000-0000-0000-000000000013','Pendo Mkwawa Haji',     '199604031234579','0788 999 000','Alliance', 'ALL-013','2026-07-31', true,      0),
  ('V0000001-0000-0000-0000-000000000014','T 014 NOP','Toyota Hilux',       'Pick Up','Nyeupe', '2015','Toyota', 'C0000001-0000-0000-0000-000000000014','Yusuph Issa Majaliwa',  '197001171234580','0712 444 555','Heritage', 'HER-014','2025-05-31', true,      0),
  ('V0000001-0000-0000-0000-000000000015','T 015 QRS','Nissan Leaf',        'Saloon','Nyeupe',  '2024','Nissan', 'C0000001-0000-0000-0000-000000000015','Sikudhani Mwema Nyota', '199309251234581','0755 666 777','UAP',       'UAP-015','2027-01-31', true,      0),
  ('V0000001-0000-0000-0000-000000000016','T 016 TUV','Toyota Fortuner',    'SUV',   'Fedha',   '2022','Toyota', 'C0000001-0000-0000-0000-000000000016','Masoud Ally Mapunda',   '198107141234582','0766 888 999','ICEA Lion','ICE-016','2026-11-30', true,      0),
  ('V0000001-0000-0000-0000-000000000017','T 017 WXY','Suzuki Alto',        'Saloon','Pinki',   '2023','Suzuki', 'C0000001-0000-0000-0000-000000000017','Hidaya Ramadhani Chiku','200208061234583','0788 000 111','Madison',  'MAD-017','2026-08-31', true,      0),
  ('V0000001-0000-0000-0000-000000000018','T 018 ZAB','Toyota Premio',      'Saloon','Mekundu', '2018','Toyota', 'C0000001-0000-0000-0000-000000000018','Nassoro Kombo Mataka',  '198905231234584','0712 222 333','Jubilee',  'JUB-018','2024-06-30', false, 200000),
  ('V0000001-0000-0000-0000-000000000019','T 019 CDE','Toyota Dyna',        'Lori',  'Bluu',    '2014','Toyota', 'C0000001-0000-0000-0000-000000000019','Twaha Mrisho Lukindo',  '197503311234585','0755 444 555','GA Insurance','GA-019','2025-10-31', true,  0),
  ('V0000001-0000-0000-0000-000000000020','T 020 FGH','Toyota RAV4',        'SUV',   'Nyeupe',  '2024','Toyota', 'C0000001-0000-0000-0000-000000000020','Zainab Hemed Singida',  '199704121234586','0766 333 444','Strategies','STR-020','2027-03-31', true,  0)
ON CONFLICT (plate) DO NOTHING;

-- ── LICENSES (20) ──────────────────────────────────────────────
INSERT INTO licenses (citizen_id, license_no, class, issued_at, expires_at, status) VALUES
  ('C0000001-0000-0000-0000-000000000001','DL001001TZ','B','2015-03-10','2025-03-10','valid'),
  ('C0000001-0000-0000-0000-000000000002','DL002002TZ','B','2018-07-22','2028-07-22','valid'),
  ('C0000001-0000-0000-0000-000000000003','DL003003TZ','B','2010-01-15','2024-01-15','expired'),
  ('C0000001-0000-0000-0000-000000000004','DL004004TZ','B','2019-09-05','2029-09-05','valid'),
  ('C0000001-0000-0000-0000-000000000005','DL005005TZ','BCE','2005-12-01','2023-12-01','expired'),
  ('C0000001-0000-0000-0000-000000000006','DL006006TZ','B','2022-02-18','2032-02-18','valid'),
  ('C0000001-0000-0000-0000-000000000007','DL007007TZ','B','2021-05-30','2031-05-30','valid'),
  ('C0000001-0000-0000-0000-000000000008','DL008008TZ','B','2012-06-10','2026-06-10','valid'),
  ('C0000001-0000-0000-0000-000000000009','DL009009TZ','BCE','2008-09-14','2022-09-14','expired'),
  ('C0000001-0000-0000-0000-000000000010','DL010010TZ','B','2016-03-20','2026-03-20','valid'),
  ('C0000001-0000-0000-0000-000000000011','DL011011TZ','B','2023-11-11','2033-11-11','valid'),
  ('C0000001-0000-0000-0000-000000000012','DL012012TZ','B','2014-10-03','2024-10-03','valid'),
  ('C0000001-0000-0000-0000-000000000013','DL013013TZ','B','2020-04-15','2030-04-15','valid'),
  ('C0000001-0000-0000-0000-000000000014','DL014014TZ','BCE','2001-01-20','2025-01-20','valid'),
  ('C0000001-0000-0000-0000-000000000015','DL015015TZ','B','2017-09-08','2027-09-08','valid'),
  ('C0000001-0000-0000-0000-000000000016','DL016016TZ','B','2013-07-12','2027-07-12','valid'),
  ('C0000001-0000-0000-0000-000000000017','DL017017TZ','B','2024-08-01','2034-08-01','valid'),
  ('C0000001-0000-0000-0000-000000000018','DL018018TZ','B','2011-05-25','2023-05-25','suspended'),
  ('C0000001-0000-0000-0000-000000000019','DL019019TZ','BCE','2003-03-14','2027-03-14','valid'),
  ('C0000001-0000-0000-0000-000000000020','DL020020TZ','B','2021-04-20','2031-04-20','valid')
ON CONFLICT (license_no) DO NOTHING;

-- ── DEVICES (20) ──────────────────────────────────────────────
INSERT INTO devices (serial_no, imei, description, category, owner_citizen_id, owner_name, owner_phone, status) VALUES
  ('SM-S928B-TZ-001','358423092847001','Samsung Galaxy S24 Ultra',     'simu',     'C0000001-0000-0000-0000-000000000001','Juma Khamis Mwinyi',    '0712 345 678','clean'),
  ('DNPXK-TZ-002',   '352098103456002','iPhone 15 Pro — Dhahabu',      'simu',     'C0000001-0000-0000-0000-000000000002','Fatuma Hassan Mwanga',  '0754 123 456','stolen'),
  ('SM-A546E-TZ-003','358423092847003','Samsung Galaxy A54',           'simu',     'C0000001-0000-0000-0000-000000000003','Ali Mohamed Salum',     '0712 987 654','clean'),
  ('CPH2551-TZ-004', '869912034567004','OPPO Reno 11',                 'simu',     'C0000001-0000-0000-0000-000000000004','Grace Amina Mushi',     '0766 456 789','clean'),
  ('CNF-HP-TZ-005',  NULL,             'HP Laptop 15s-fq5 — Fedha',    'kompyuta', 'C0000001-0000-0000-0000-000000000005','Saidi Omari Bakari',    '0788 321 654','stolen'),
  ('SM-T500-TZ-006', '354513069012006','Samsung Galaxy Tab A7',        'tablet',   'C0000001-0000-0000-0000-000000000006','Amina Said Juma',       '0755 789 012','clean'),
  ('POCO-X6-TZ-007', '863947056789007','Xiaomi Poco X6 Pro',           'simu',     'C0000001-0000-0000-0000-000000000007','Baraka John Mwanga',    '0788 654 321','clean'),
  ('ASUS-TUF-TZ-008',NULL,             'ASUS TUF Gaming Laptop F15',   'kompyuta', 'C0000001-0000-0000-0000-000000000008','Zawadi Kimani Ochieng', '0712 111 333','clean'),
  ('DNPXK-TZ-009',   '352098103456009','iPhone 14 — Midnait',          'simu',     'C0000001-0000-0000-0000-000000000009','Hamisi Rashid Omar',    '0766 222 444','stolen'),
  ('TECNO-TZ-010',   '358741023456010','Tecno Camon 30 Pro',           'simu',     'C0000001-0000-0000-0000-000000000010','Rashid Omari Said',     '0755 321 654','clean'),
  ('SM-S928B-TZ-011','358423092847011','Samsung Galaxy S23',            'simu',     'C0000001-0000-0000-0000-000000000011','Mariamu Ally Komba',    '0712 555 666','found'),
  ('DELL-I5-TZ-012', NULL,             'Dell Inspiron 15 3520 — Fedha','kompyuta', 'C0000001-0000-0000-0000-000000000012','Omari Hassan Kitwana',  '0766 777 888','clean'),
  ('INFINIX-TZ-013', '359047012345013','Infinix Note 40 Pro',          'simu',     'C0000001-0000-0000-0000-000000000013','Pendo Mkwawa Haji',     '0788 999 000','clean'),
  ('NOKIA-TZ-014',   '351456087890014','Nokia G60 5G',                 'simu',     'C0000001-0000-0000-0000-000000000014','Yusuph Issa Majaliwa',  '0712 444 555','clean'),
  ('OPPO-TZ-015',    '869374056789015','OPPO A98 5G',                  'simu',     'C0000001-0000-0000-0000-000000000015','Sikudhani Mwema Nyota', '0755 666 777','clean'),
  ('APPLE-MBP-TZ-016',NULL,            'MacBook Pro M3',               'kompyuta', 'C0000001-0000-0000-0000-000000000016','Masoud Ally Mapunda',   '0766 888 999','clean'),
  ('SM-F946B-TZ-017','354223098765017','Samsung Galaxy Z Fold5',       'simu',     'C0000001-0000-0000-0000-000000000017','Hidaya Ramadhani Chiku','0788 000 111','clean'),
  ('VIVO-TZ-018',    '864523012345018','Vivo V29 5G — Jewel Red',      'simu',     'C0000001-0000-0000-0000-000000000018','Nassoro Kombo Mataka',  '0712 222 333','stolen'),
  ('HONOR-TZ-019',   '352789045678019','Honor X8b — Titanium Silver',  'simu',     'C0000001-0000-0000-0000-000000000019','Twaha Mrisho Lukindo',  '0755 444 555','clean'),
  ('REAL-TZ-020',    '868412034567020','Realme 12 Pro+',               'simu',     'C0000001-0000-0000-0000-000000000020','Zainab Hemed Singida',  '0766 333 444','clean')
ON CONFLICT (serial_no) DO NOTHING;

-- ── MISSING RECORDS (8) ───────────────────────────────────────
INSERT INTO missing_records (case_no, type, title, identifier, details,
  last_seen, last_seen_location, reported_by, reported_date, status,
  age, gender, guardian_name, guardian_phone, reward_amount, crime, risk_level) VALUES
  ('MP-2026-0031','person','Mtoto Aliyepotea — Amani John Mwanga',
   'NIDA: Bado — Umri: Miaka 8',
   'Mtoto wa miaka 8. Nguo: shati nyekundu, suruali ya bluu. Alitoweka akienda shule.',
   'Asubuhi 07:30','Kariakoo Bus Terminal, Ilala, DSM',
   'Baraka John Mwanga','2026-05-15','active',
   8,'Mme','Baraka John Mwanga','0788 654 321',NULL,NULL,'high'),

  ('MW-2026-0029','person','Mtu Anayetafutwa — Nassoro Kombo Mataka',
   'NIDA: 198905231234584',
   'Mshukiwa wa wizi wa benki TZS 50M. Hatari — hubeba silaha. Usijaribu kumkamata peke yako.',
   'Mchana 14:00','Goba, Kinondoni, DSM',
   'CID Headquarters DSM','2026-05-11','active',
   37,'Mme',NULL,NULL,'TZS 1,000,000','Wizi wa Benki','high'),

  ('MV-2026-0022','car','Gari Lililopotea — Toyota Hiace T 003 GHI',
   'Plate: T 003 GHI',
   'Toyota Hiace 2018, rangi fedha. Chassis: TZ003GHI2018. Ilikuwa ikisimama nje ya nyumba usiku.',
   'Usiku 02:00','Magomeni, Kinondoni, DSM',
   'Ali Mohamed Salum','2026-04-28','active',
   NULL,NULL,NULL,NULL,NULL,NULL,'medium'),

  ('MV-2026-0018','car','Gari Lililobiwa — Toyota Land Cruiser T 005 MNO',
   'Plate: T 005 MNO',
   'Land Cruiser V8 2016, rangi nyeusi, gari kubwa. Thamani TZS 180M. Inatumiwa na wafanyabiashara.',
   'Mchana 13:00','Temeke, Temeke, DSM',
   'Saidi Omari Bakari','2026-04-15','active',
   NULL,NULL,NULL,NULL,'TZS 500,000',NULL,'high'),

  ('MD-2026-0045','device','Simu Iliyobiwa — iPhone 15 Pro',
   'IMEI: 352098103456002',
   'iPhone 15 Pro dhahabu. Ilikuwa ndani ya mfuko ukiwa umefungwa. Thamani TZS 2.8M.',
   'Jioni 17:30','Kariakoo Market, Ilala, DSM',
   'Fatuma Hassan Mwanga','2026-06-01','active',
   NULL,NULL,NULL,NULL,NULL,NULL,'low'),

  ('MD-2026-0038','device','Laptop Iliyobiwa — HP 15s',
   'S/N: CNF-HP-TZ-005',
   'HP Laptop 15s rangi fedha. Ilikuwa kwenye mkoba wa shule. Thamani TZS 1.5M.',
   'Asubuhi 10:00','Ubungo Bus Terminal, DSM',
   'Saidi Omari Bakari','2026-05-20','active',
   NULL,NULL,NULL,NULL,NULL,NULL,'low'),

  ('MD-2026-0019','device','Simu Ilipatikana — Samsung Galaxy S23',
   'IMEI: 358423092847011',
   'Samsung S23 ilipatikana Kariakoo. Ilikuwa imefungwa lakini ina nguvu. Bado inatafuta mmiliki.',
   'Jioni 16:00','Kariakoo, Ilala, DSM',
   'Cprl. Juma Mwinyi (TP123456)','2026-03-15','found',
   NULL,NULL,NULL,NULL,NULL,NULL,'low'),

  ('MP-2026-0028','person','Mtu Aliyepotea — Omari Bakari Hassan',
   'NIDA: 198903221234xxx',
   'Mtu mzee wa miaka 45. Aliondoka nyumbani asubuhi na hakurudi. Ana ugonjwa wa akili kidogo.',
   'Asubuhi 09:00','Buguruni, Ilala, DSM',
   'Familia ya Omari','2026-05-08','found',
   45,'Mme','Saidi Bakari Hassan','0788 321 654',NULL,NULL,'medium')
ON CONFLICT (case_no) DO NOTHING;

-- ── WANTED (1 active — Nassoro) ────────────────────────────────
INSERT INTO wanted (suspect_name, suspect_nida, crime, issued_date,
  citizen_id, risk_level, reward_amount, active) VALUES
  ('Nassoro Kombo Mataka', '198905231234584', 'Wizi wa Benki — TZS 50,000,000',
   '2026-05-11', 'C0000001-0000-0000-0000-000000000018', 'high', 'TZS 1,000,000', TRUE)
ON CONFLICT DO NOTHING;

-- ── CRIMINAL RECORDS (2 — Hamisi and Nassoro) ──────────────────
INSERT INTO criminal_records (citizen_id, case_no, type, date, outcome) VALUES
  ('C0000001-0000-0000-0000-000000000009','CR-2022-0341','Ugomvi na Mapigano','2022-03-10','Convicted'),
  ('C0000001-0000-0000-0000-000000000009','CR-2020-0112','Wizi wa Gari',      '2020-11-05','Acquitted'),
  ('C0000001-0000-0000-0000-000000000018','CR-2026-0089','Wizi wa Benki',     '2026-05-11','Pending'),
  ('C0000001-0000-0000-0000-000000000018','CR-2024-0234','Udanganyifu',       '2024-08-18','Convicted'),
  ('C0000001-0000-0000-0000-000000000005','CR-2023-0445','Usafirishaji Haramu','2023-06-22','Acquitted')
ON CONFLICT DO NOTHING;

COMMIT;
