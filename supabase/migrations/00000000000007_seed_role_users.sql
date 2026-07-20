-- ============================================================
-- TZ POLICE — SEED: ROLE USERS
-- Migration: 00000000000007_seed_role_users
-- Seeds all 21 users from mock-engine.ts into Supabase
-- Run AFTER schema migration 0005
-- ============================================================

-- ── Seed Regions ──────────────────────────────────────────────
INSERT INTO regions (code, name) VALUES
  ('DAR','Dar es Salaam'),('ARU','Arusha'),('MWZ','Mwanza'),
  ('DOM','Dodoma'),('IRG','Iringa'),('MOR','Morogoro'),
  ('TNG','Tanga'),('MBY','Mbeya'),('RUV','Ruvuma'),('KGM','Kigoma')
ON CONFLICT (code) DO NOTHING;

-- ── Seed Stations ─────────────────────────────────────────────
INSERT INTO stations (id, name, station_code, region, district, address, phone, officers_count, posts_count, status, established) VALUES
  ('11111111-0001-0001-0001-000000000001','Kituo Kikuu cha Polisi DSM',    'ST-001','Dar es Salaam','Ilala',    'Sokoine Drive, DSM',         '022 211 0001',42,6,'active','1961'),
  ('11111111-0001-0001-0001-000000000002','Kituo cha Polisi Ilala',         'ST-002','Dar es Salaam','Ilala',    'Mwembe Chai, Kariakoo, DSM', '022 218 5544',28,4,'active','1972'),
  ('11111111-0001-0001-0001-000000000003','Kituo cha Polisi Kinondoni',     'ST-003','Dar es Salaam','Kinondoni','Mwenge, Kinondoni, DSM',      '022 277 3311',35,5,'active','1975'),
  ('11111111-0001-0001-0001-000000000004','Kituo cha Polisi Temeke',        'ST-004','Dar es Salaam','Temeke',   'Temeke Street, DSM',          '022 285 9922',22,3,'active','1978'),
  ('11111111-0001-0001-0001-000000000005','Kituo cha Polisi Ubungo',        'ST-005','Dar es Salaam','Kinondoni','Ubungo Terminal, DSM',        '022 243 7788',20,4,'maintenance','1985'),
  ('11111111-0001-0001-0001-000000000006','Kituo cha Polisi Arusha',        'ST-006','Arusha',       'Arusha',   'Fire Road, Arusha',          '027 250 1100',38,5,'active','1963'),
  ('11111111-0001-0001-0001-000000000007','Kituo cha Polisi Mwanza',        'ST-007','Mwanza',       'Nyamagana','Kenyatta Road, Mwanza',       '028 250 2200',31,4,'active','1965'),
  ('11111111-0001-0001-0001-000000000008','Kituo cha Polisi Dodoma',        'ST-008','Dodoma',       'Dodoma',   'Dodoma Central, Dodoma',     '026 232 1100',29,3,'active','1970'),
  ('11111111-0001-0001-0001-000000000009','Kituo cha Polisi Iringa',        'ST-009','Iringa',       'Iringa',   'Iringa Town, Iringa',         '026 270 1100',24,3,'active','1968'),
  ('11111111-0001-0001-0001-000000000010','Kituo cha Polisi Iringa Vijijini','ST-010','Iringa',      'Iringa Rural','Kalenga, Iringa Vijijini', '026 270 2200',14,2,'active','1980'),
  ('11111111-0001-0001-0001-000000000099','Makao Makuu DSM',                'ST-HQ', 'National',    'National', 'Makao Makuu ya Polisi, DSM', '022 211 0000',0, 0,'active','1965')
ON CONFLICT (station_code) DO NOTHING;

-- ── Seed Users (21 ROLE_USERS) ────────────────────────────────
INSERT INTO users (id, name, short_name, rank, rank_short, role, badge_no, username, mobile, email, station_id, region, unit, status, joined_at) VALUES
  -- Traffic Officers
  ('22222222-0001-0001-0001-000000000001','Cprl. Juma Khamis Mwinyi',    'Cprl. Juma',    'Corporal',                       'Cprl.','officer-traffic',          'TP123456','juma.mwinyi',    '0712345678','juma.mwinyi@polisi.go.tz',   '11111111-0001-0001-0001-000000000001','Dar es Salaam','Trafiki - Ilala Zone',         'active',   '2019-03-15'),
  ('22222222-0001-0001-0001-000000000002','Sgt. Ali Hassan Salum',        'Sgt. Ali',      'Sergeant',                       'Sgt.', 'officer-traffic',          'TP234567','ali.hassan',     '0788123456','ali.hassan@polisi.go.tz',    '11111111-0001-0001-0001-000000000002','Dar es Salaam','Trafiki - Ilala Zone',         'active',   '2017-06-02'),
  ('22222222-0001-0001-0001-000000000003','Sgt. Fatuma Hassan Komba',     'Sgt. Fatuma',   'Sergeant',                       'Sgt.', 'officer-traffic',          'TP345678','fatuma.hassan',  '0722777888','fatuma.hassan@polisi.go.tz',  '11111111-0001-0001-0001-000000000003','Dar es Salaam','Trafiki - Kinondoni Zone',     'patrol',   '2020-01-10'),
  ('22222222-0001-0001-0001-000000000004','Cprl. Saidi Juma Bakari',      'Cprl. Saidi',   'Corporal',                       'Cprl.','officer-traffic',          'TP456789','saidi.juma',     '0755111222','saidi.juma@polisi.go.tz',    '11111111-0001-0001-0001-000000000004','Dar es Salaam','Trafiki - Temeke Zone',        'break',    '2021-08-07'),
  ('22222222-0001-0001-0001-000000000005','Cpl. Mariamu Ally Komba',      'Cpl. Mariamu',  'Corporal',                       'Cpl.', 'officer-traffic',          'TP567890','mariamu.ally',   '0744333444','mariamu.ally@polisi.go.tz',  '11111111-0001-0001-0001-000000000005','Dar es Salaam','Trafiki - Ubungo Zone',        'active',   '2022-02-20'),
  -- General Officers
  ('22222222-0001-0001-0001-000000000006','Insp. Grace Amina Mushi',      'Insp. Grace',   'Inspector',                      'Insp.','officer-general',          'GO123456','grace.mushi',    '0766987654','grace.mushi@polisi.go.tz',   '11111111-0001-0001-0001-000000000003','Dar es Salaam','Uhalifu - Kinondoni Zone',     'active',   '2016-09-12'),
  ('22222222-0001-0001-0001-000000000007','Insp. Hamisi Rashid Omar',     'Insp. Hamisi',  'Inspector',                      'Insp.','officer-general',          'GO234567','hamisi.rashid',  '0733555666','hamisi.rashid@polisi.go.tz',  '11111111-0001-0001-0001-000000000005','Dar es Salaam','Uhalifu - Ubungo Zone',        'off-duty', '2015-04-03'),
  ('22222222-0001-0001-0001-000000000008','Cprl. Emmanuel Joseph Mapunda','Cprl. Emmanuel','Corporal',                       'Cprl.','officer-general',          'GO345678','emmanuel.joseph','0711999000','emmanuel.joseph@polisi.go.tz','11111111-0001-0001-0001-000000000002','Dar es Salaam','Doria - Ilala Zone',           'patrol',   '2020-11-18'),
  ('22222222-0001-0001-0001-000000000009','Cprl. Zawadi Kimani Ochieng',  'Cprl. Zawadi',  'Corporal',                       'Cprl.','officer-general',          'GO456789','zawadi.kimani',  '0712111333','zawadi.kimani@polisi.go.tz',  '11111111-0001-0001-0001-000000000001','Dar es Salaam','Doria - Ilala Zone',           'active',   '2021-07-25'),
  ('22222222-0001-0001-0001-000000000010','Cst. Baraka John Mwanga',      'Cst. Baraka',   'Constable',                      'Cst.', 'officer-general',          'GO567890','baraka.john',    '0788654321','baraka.john@polisi.go.tz',   '11111111-0001-0001-0001-000000000004','Dar es Salaam','Uhalifu - Temeke Zone',        'active',   '2023-03-09'),
  -- Admin
  ('22222222-0001-0001-0001-000000000011','ACP. Mariam Juma Ally',        'ACP. Mariam',   'Assistant Commissioner of Police','ACP.', 'admin',                    'ADM-002', 'mariam.juma',   '0766100200','mariam.juma@polisi.go.tz',   '11111111-0001-0001-0001-000000000099','National',    'Usimamizi wa Mfumo',           'active',   '2014-01-01'),
  -- National Commissioner
  ('22222222-0001-0001-0001-000000000012','IGP. Saidi Hassan Waziri',     'IGP. Waziri',   'Inspector General of Police',    'IGP.', 'national-commissioner',    'IGP-001', 'igp.waziri',    '0766000001','igp@polisi.go.tz',            '11111111-0001-0001-0001-000000000099','National',    'Uongozi wa Kitaifa',           'active',   '2012-02-15'),
  -- Regional Commissioners
  ('22222222-0001-0001-0001-000000000013','CP. Omari Hassan Kitwana',     'CP. DSM',       'Commissioner of Police',         'CP.',  'regional-commissioner',    'CP-DSM',  'cp.dsm',        '0766001001','cp.dsm@polisi.go.tz',         '11111111-0001-0001-0001-000000000001','Dar es Salaam','Uongozi wa Mkoa - DSM',        'active',   '2015-03-10'),
  ('22222222-0001-0001-0001-000000000014','CP. Pendo Mkwawa Haji',        'CP. Arusha',    'Commissioner of Police',         'CP.',  'regional-commissioner',    'CP-ARU',  'cp.arusha',     '0766002001','cp.arusha@polisi.go.tz',      '11111111-0001-0001-0001-000000000006','Arusha',      'Uongozi wa Mkoa - Arusha',     'active',   '2016-07-05'),
  ('22222222-0001-0001-0001-000000000015','CP. Masoud Ally Mapunda',      'CP. Mwanza',    'Commissioner of Police',         'CP.',  'regional-commissioner',    'CP-MWZ',  'cp.mwanza',     '0766003001','cp.mwanza@polisi.go.tz',      '11111111-0001-0001-0001-000000000007','Mwanza',      'Uongozi wa Mkoa - Mwanza',     'active',   '2017-01-20'),
  ('22222222-0001-0001-0001-000000000016','CP. Nassoro Kombo Mataka',     'CP. Dodoma',    'Commissioner of Police',         'CP.',  'regional-commissioner',    'CP-DOD',  'cp.dodoma',     '0766004001','cp.dodoma@polisi.go.tz',      '11111111-0001-0001-0001-000000000008','Dodoma',      'Uongozi wa Mkoa - Dodoma',     'active',   '2018-08-14'),
  ('22222222-0001-0001-0001-000000000017','CP. Hidaya Ramadhani Chiku',   'CP. Iringa',    'Commissioner of Police',         'CP.',  'regional-commissioner',    'CP-IRI',  'cp.iringa',     '0766005001','cp.iringa@polisi.go.tz',      '11111111-0001-0001-0001-000000000009','Iringa',      'Uongozi wa Mkoa - Iringa',     'active',   '2019-09-30'),
  -- District Commissioners
  ('22222222-0001-0001-0001-000000000018','SP. Twaha Mrisho Lukindo',     'SP. Ilala',     'Senior Superintendent',          'SP.',  'district-commissioner',    'SP-ILA',  'sp.ilala',      '0755010001','sp.ilala@polisi.go.tz',       '11111111-0001-0001-0001-000000000002','Dar es Salaam','Uongozi wa Wilaya - Ilala',    'active',   '2016-04-12'),
  ('22222222-0001-0001-0001-000000000019','SP. Zainab Hemed Singida',     'SP. Kinondoni', 'Senior Superintendent',          'SP.',  'district-commissioner',    'SP-KIN',  'sp.kinondoni',  '0766020001','sp.kinondoni@polisi.go.tz',   '11111111-0001-0001-0001-000000000003','Dar es Salaam','Uongozi wa Wilaya - Kinondoni','active',   '2017-06-08'),
  -- Station Commissioners
  ('22222222-0001-0001-0001-000000000020','CSP. Yusuph Issa Majaliwa',    'CSP. Yusuph',   'Chief Superintendent',           'CSP.', 'station-commissioner',     'CSP-001', 'csp.kikuu',     '0712030001','csp.kikuu@polisi.go.tz',     '11111111-0001-0001-0001-000000000001','Dar es Salaam','Uongozi wa Kituo - Kikuu',     'active',   '2014-03-22'),
  ('22222222-0001-0001-0001-000000000021','CSP. Sikudhani Mwema Nyota',   'CSP. Sikudhani','Chief Superintendent',           'CSP.', 'station-commissioner',     'CSP-002', 'csp.ilala',     '0755030002','csp.ilala@polisi.go.tz',     '11111111-0001-0001-0001-000000000002','Dar es Salaam','Uongozi wa Kituo - Ilala',     'active',   '2015-07-16')
ON CONFLICT (badge_no) DO UPDATE SET
  name = EXCLUDED.name, role = EXCLUDED.role, mobile = EXCLUDED.mobile,
  status = EXCLUDED.status, station_id = EXCLUDED.station_id;
