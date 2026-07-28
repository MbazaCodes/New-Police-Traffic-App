-- ============================================================
-- CORE USERS SEED — Focus roles only
-- TPF Hierarchy:
--   IGP (Inspector General) → National Commander
--   DIG (Deputy IGP)        → National Commander  
--   Regional Commissioner   → Regional Commander
--   District Commissioner   → District Commander
--   OCS/OCD                 → Station Commander
--   Traffic Officer         → officer-traffic
--   General Officer         → officer-general
--   Post Officer            → post-officer
--   Clerk                   → clerk/national-clerk/regional-clerk/district-clerk
-- ============================================================

\set ON_ERROR_STOP on

-- ── IGP & NATIONAL COMMAND ───────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  -- IGP — Inspector General of Police (TOP COMMANDER, not admin)
  ('60000000-0000-0000-0000-000000000001',
   'IGP Emmanuel Nchimbi','IGP Nchimbi',
   'national-commissioner','IGP',
   'IGP-TZ-2026-001','IGP-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  -- DIG — Deputy IGP
  ('60000000-0000-0000-0000-000000000002',
   'DIG Samweli Kaiza','DIG Kaiza',
   'national-commissioner','DIG',
   'DIG-TZ-2026-001','DIG-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  -- National Commissioner Operations
  ('60000000-0000-0000-0000-000000000003',
   'Comm. Fatuma Mwakagenda','Comm. Mwakagenda',
   'national-commissioner','Commissioner of Police',
   'CP-NAT-2026-001','CP-NAT-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── REGIONAL COMMANDERS ──────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000010',
   'CP Salome Ngowi','CP Ngowi',
   'regional-commissioner','Commissioner of Police',
   'CP-DSM-2026-001','CP-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000011',
   'CP Hassan Mwalimu','CP Mwalimu',
   'regional-commissioner','Commissioner of Police',
   'CP-MWZ-2026-001','CP-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW()),

  ('60000000-0000-0000-0000-000000000012',
   'CP Anastazia Shayo','CP Shayo',
   'regional-commissioner','Commissioner of Police',
   'CP-ARU-2026-001','CP-ARU-001',
   '30000000-0000-0000-0000-000000000009','Arusha','active',NOW()),

  ('60000000-0000-0000-0000-000000000013',
   'CP Benson Mwita','CP Mwita',
   'regional-commissioner','Commissioner of Police',
   'CP-DOD-2026-001','CP-DOD-001',
   '30000000-0000-0000-0000-000000000012','Dodoma','active',NOW()),

  ('60000000-0000-0000-0000-000000000014',
   'CP Grace Kimaro','CP Kimaro',
   'regional-commissioner','Commissioner of Police',
   'CP-MBY-2026-001','CP-MBY-001',
   '30000000-0000-0000-0000-000000000014','Mbeya','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, region=EXCLUDED.region, status=EXCLUDED.status;

-- ── DISTRICT COMMANDERS ──────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,unit,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000020',
   'DSP Mwenda Kibwana','DSP Kibwana',
   'district-commissioner','Superintendent of Police',
   'SP-ILA-2026-001','SP-ILA-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','Ilala','active',NOW()),

  ('60000000-0000-0000-0000-000000000021',
   'DSP Omar Suleiman','DSP Suleiman',
   'district-commissioner','Superintendent of Police',
   'SP-TEM-2026-001','SP-TEM-001',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','Temeke','active',NOW()),

  ('60000000-0000-0000-0000-000000000022',
   'DSP Josephine Mlay','DSP Mlay',
   'district-commissioner','Superintendent of Police',
   'SP-KIN-2026-001','SP-KIN-001',
   '30000000-0000-0000-0000-000000000003','Dar es Salaam','Kinondoni','active',NOW()),

  ('60000000-0000-0000-0000-000000000023',
   'DSP Rajabu Msemwa','DSP Msemwa',
   'district-commissioner','Superintendent of Police',
   'SP-MWZ-2026-001','SP-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','Nyamagana','active',NOW()),

  ('60000000-0000-0000-0000-000000000024',
   'DSP Veronica Lyimo','DSP Lyimo',
   'district-commissioner','Superintendent of Police',
   'SP-ARU-2026-001','SP-ARU-001',
   '30000000-0000-0000-0000-000000000009','Arusha','Arusha City','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, region=EXCLUDED.region,
  unit=EXCLUDED.unit, status=EXCLUDED.status;

-- ── TRAFFIC OFFICERS ─────────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000030',
   'PC Juma Rashidi','PC Rashidi',
   'officer-traffic','Police Constable',
   'PC-TP-DSM-001','TP-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000031',
   'CPL Amina Hassan','CPL Hassan',
   'officer-traffic','Corporal',
   'CPL-TP-DSM-001','TP-DSM-002',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000032',
   'SGT Baraka Mwangi','SGT Mwangi',
   'officer-traffic','Sergeant',
   'SGT-TP-DSM-001','TP-DSM-003',
   '30000000-0000-0000-0000-000000000004','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000033',
   'PC Said Kombo','PC Kombo',
   'officer-traffic','Police Constable',
   'PC-TP-MWZ-001','TP-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW()),

  ('60000000-0000-0000-0000-000000000034',
   'PC Neema Mwanga','PC Mwanga',
   'officer-traffic','Police Constable',
   'PC-TP-ARU-001','TP-ARU-001',
   '30000000-0000-0000-0000-000000000009','Arusha','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── GENERAL OFFICERS ─────────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000040',
   'PC Daniel Macha','PC Macha',
   'officer-general','Police Constable',
   'PC-GP-DSM-001','GP-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000041',
   'PC Joyce Luambano','PC Luambano',
   'officer-general','Police Constable',
   'PC-GP-DSM-002','GP-DSM-002',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000042',
   'CPL Abel Minja','CPL Minja',
   'officer-general','Corporal',
   'CPL-GP-MWZ-001','GP-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── POST OFFICERS ────────────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000050',
   'PC Wycliffe Massawe','PC Massawe',
   'post-officer','Police Constable',
   'PC-PO-DSM-001','PO-DSM-001',
   '30000000-0000-0000-0000-000000000004','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000051',
   'PC Gladness Nyerere','PC Nyerere',
   'post-officer','Police Constable',
   'PC-PO-MWZ-001','PO-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── CLERKS ───────────────────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,unit,status,created_at)
VALUES
  -- National Clerk
  ('60000000-0000-0000-0000-000000000060',
   'PC Emmanuel Temu','PC Temu',
   'national-clerk','Police Constable',
   'PC-CLK-NAT-001','CLK-NAT-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam',NULL,'active',NOW()),

  -- Regional Clerk DSM
  ('60000000-0000-0000-0000-000000000061',
   'PC Mariam Kawemba','PC Kawemba',
   'regional-clerk','Police Constable',
   'PC-CLK-DSM-001','CLK-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam',NULL,'active',NOW()),

  -- District Clerk Ilala
  ('60000000-0000-0000-0000-000000000062',
   'PC Rehema Swai','PC Swai',
   'district-clerk','Police Constable',
   'PC-CLK-ILA-001','CLK-ILA-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','Ilala','active',NOW()),

  -- Regional Clerk Mwanza
  ('60000000-0000-0000-0000-000000000063',
   'PC Salome Meela','PC Meela',
   'regional-clerk','Police Constable',
   'PC-CLK-MWZ-001','CLK-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza',NULL,'active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, region=EXCLUDED.region,
  unit=EXCLUDED.unit, status=EXCLUDED.status;

-- ── STATION COMMANDERS (OCS) ─────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000070',
   'ASP Penina Mwasanga','ASP Mwasanga',
   'station-commissioner','Assistant Superintendent',
   'ASP-ILA-2026-001','OCS-ILA-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000071',
   'ASP John Merinyo','ASP Merinyo',
   'station-commissioner','Assistant Superintendent',
   'ASP-KIN-2026-001','OCS-KIN-001',
   '30000000-0000-0000-0000-000000000003','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000072',
   'ASP Salim Baraka','ASP Baraka',
   'station-commissioner','Assistant Superintendent',
   'ASP-MWZ-2026-001','OCS-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW())

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── ADMIN (System only, not police rank) ─────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000099',
   'Msimamizi wa Mfumo','SysAdmin',
   'admin','—',
   'ADMIN-SYS-001','ADM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── CREATE OFFICER RECORDS ────────────────────────────────────
INSERT INTO officers (user_id, name, officer_number, badge_no, rank, station_id, region, status, patrols_count, citations_count, incidents_count, joined_at, created_at)
SELECT u.id, u.name, u.badge_no, u.badge_no, u.rank, u.station_id, u.region,
       'active', 0, 0, 0, CURRENT_DATE - 365, NOW()
FROM users u
WHERE u.id::text LIKE '6%'
  AND u.role NOT IN ('admin','national-clerk','regional-clerk','district-clerk',
                     'national-commissioner','regional-commissioner','district-commissioner',
                     'station-commissioner')
ON CONFLICT DO NOTHING;

-- ── ASSIGN STATION STAFF ─────────────────────────────────────
INSERT INTO station_staff (station_id, user_id, station_role, rank, is_commanding, status, assigned_by_name, created_at)
SELECT
  u.station_id, u.id,
  CASE u.role
    WHEN 'station-commissioner' THEN 'OCS'
    WHEN 'officer-traffic'       THEN 'OFFICER'
    WHEN 'officer-general'       THEN 'OFFICER'
    WHEN 'post-officer'          THEN 'OFFICER'
    WHEN 'district-clerk'        THEN 'CLERK'
    WHEN 'regional-clerk'        THEN 'CLERK'
    ELSE 'OFFICER'
  END,
  u.rank,
  u.role = 'station-commissioner',
  'active', 'System Seed', NOW()
FROM users u
WHERE u.id::text LIKE '6%'
  AND u.station_id IS NOT NULL
  AND u.role NOT IN ('national-commissioner','regional-commissioner',
                     'district-commissioner','national-clerk','admin')
ON CONFLICT DO NOTHING;

-- ── VERIFICATION ─────────────────────────────────────────────
SELECT
  role,
  COUNT(*) as count,
  string_agg(badge_no, ', ' ORDER BY badge_no) as badges
FROM users
WHERE id::text LIKE '6%'
GROUP BY role
ORDER BY role;

\echo ''
\echo '=== TEST LOGINS ==='
SELECT
  name,
  badge_no as "Login Badge",
  id_number as "Login ID",
  role,
  region,
  CASE
    WHEN id_number IS NOT NULL THEN '✅ Can login'
    ELSE '❌ No id_number'
  END as login_status
FROM users
WHERE id::text LIKE '6%'
ORDER BY role, name;

-- ── POST OFFICER (Posti ya Ukaguzi) ─────────────────────────
-- Post officer manages a checkpoint/post
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000052',
   'SGT Zawadi Msemwa','SGT Msemwa',
   'post-officer','Sergeant',
   'SGT-PO-DSM-001','PO-DSM-002',
   '30000000-0000-0000-0000-000000000004','Dar es Salaam','active',NOW()),

  ('60000000-0000-0000-0000-000000000053',
   'CPL Hamisi Kombo','CPL Kombo',
   'post-officer','Corporal',
   'CPL-PO-ARU-001','PO-ARU-001',
   '30000000-0000-0000-0000-000000000009','Arusha','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- Assign post officers to actual posts
INSERT INTO post_staff (post_id, user_id, station_role, rank, is_commanding, shift, status, assigned_by_name, created_at)
SELECT
  p.id,
  u.id,
  CASE WHEN u.badge_no='PO-DSM-002' THEN 'OCS' ELSE 'OFFICER' END,
  u.rank,
  u.badge_no='PO-DSM-002',
  'all',
  'active',
  'System Seed',
  NOW()
FROM users u
JOIN posts p ON p.station_id = u.station_id
WHERE u.id IN ('60000000-0000-0000-0000-000000000050',
               '60000000-0000-0000-0000-000000000051',
               '60000000-0000-0000-0000-000000000052',
               '60000000-0000-0000-0000-000000000053')
LIMIT 4
ON CONFLICT DO NOTHING;

-- ── STATION ADMIN / OCD (Mkurugenzi wa Kituo) ────────────────
-- Station admin = OCD/OCS — already have station-commissioner role
-- Add one more with explicit OCD role for clarity
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000073',
   'ASP Naomi Maselle','ASP Maselle',
   'station-commissioner','Assistant Superintendent',
   'ASP-TEM-2026-001','OCS-TEM-001',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','active',NOW()),

  -- Station Clerk (admin support at station level)
  ('60000000-0000-0000-0000-000000000074',
   'PC Fatuma Ally','PC Ally',
   'clerk','Police Constable',
   'PC-CLK-TEM-001','CLK-TEM-001',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── CID OFFICERS ─────────────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  -- CID Commander (National)
  ('60000000-0000-0000-0000-000000000080',
   'SP Zawadi Mwakasege','SP Mwakasege',
   'investigator','Superintendent of Police',
   'SP-CID-NAT-001','CID-NAT-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  -- CID Officer DSM
  ('60000000-0000-0000-0000-000000000081',
   'IP Lilian Mbise','IP Mbise',
   'cid-officer','Inspector of Police',
   'IP-CID-DSM-001','CID-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  -- CID Investigator
  ('60000000-0000-0000-0000-000000000082',
   'IP Samuel Ngowi','IP Ngowi',
   'investigation-supervisor','Inspector of Police',
   'IP-CID-DSM-002','CID-DSM-002',
   '30000000-0000-0000-0000-000000000003','Dar es Salaam','active',NOW()),

  -- Cyber Crime Officer
  ('60000000-0000-0000-0000-000000000083',
   'ASP David Mhina','ASP Mhina',
   'cyber-crime','Assistant Superintendent',
   'ASP-CC-NAT-001','CID-CC-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),

  -- CID Mwanza
  ('60000000-0000-0000-0000-000000000084',
   'IP Grace Mmbaga','IP Mmbaga',
   'cid-officer','Inspector of Police',
   'IP-CID-MWZ-001','CID-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- ── REGIONAL ADMIN CLERKS (one per region) ───────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000064',
   'PC Beatrice Shirima','PC Shirima',
   'regional-clerk','Police Constable',
   'PC-CLK-ARU-001','CLK-ARU-001',
   '30000000-0000-0000-0000-000000000009','Arusha','active',NOW()),

  ('60000000-0000-0000-0000-000000000065',
   'PC Rashidi Mwanga','PC Mwanga',
   'regional-clerk','Police Constable',
   'PC-CLK-DOD-001','CLK-DOD-001',
   '30000000-0000-0000-0000-000000000012','Dodoma','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, region=EXCLUDED.region, status=EXCLUDED.status;

-- ── DISTRICT ADMIN CLERKS ────────────────────────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,unit,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000066',
   'PC Consolata Lyimo','PC Lyimo',
   'district-clerk','Police Constable',
   'PC-CLK-KIN-001','CLK-KIN-001',
   '30000000-0000-0000-0000-000000000003','Dar es Salaam','Kinondoni','active',NOW()),

  ('60000000-0000-0000-0000-000000000067',
   'PC Yusufu Kapinga','PC Kapinga',
   'district-clerk','Police Constable',
   'PC-CLK-TEM-002','CLK-TEM-002',
   '30000000-0000-0000-0000-000000000002','Dar es Salaam','Temeke','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, region=EXCLUDED.region,
  unit=EXCLUDED.unit, status=EXCLUDED.status;

-- Create officer records for CID
INSERT INTO officers (user_id, name, officer_number, badge_no, rank, station_id, region, status, joined_at, created_at)
SELECT u.id, u.name, u.badge_no, u.badge_no, u.rank, u.station_id, u.region,
       'active', CURRENT_DATE-365, NOW()
FROM users u
WHERE u.id IN (
  '60000000-0000-0000-0000-000000000080',
  '60000000-0000-0000-0000-000000000081',
  '60000000-0000-0000-0000-000000000082',
  '60000000-0000-0000-0000-000000000083',
  '60000000-0000-0000-0000-000000000084',
  '60000000-0000-0000-0000-000000000052',
  '60000000-0000-0000-0000-000000000053',
  '60000000-0000-0000-0000-000000000073'
)
ON CONFLICT DO NOTHING;

-- ── FINAL LOGIN TABLE ─────────────────────────────────────────
\echo ''
\echo '=== ALL USERS AND LOGIN CREDENTIALS ==='
SELECT
  name as "Jina",
  badge_no as "Badge (Login)",
  role as "Jukumu",
  region as "Mkoa",
  CASE role
    WHEN 'national-commissioner' THEN '/command/national/dashboard'
    WHEN 'regional-commissioner' THEN '/command/regional/dashboard'
    WHEN 'district-commissioner' THEN '/command/district/dashboard'
    WHEN 'station-commissioner'  THEN '/command/station/dashboard'
    WHEN 'officer-traffic'       THEN '/officer/traffic/home'
    WHEN 'officer-general'       THEN '/officer/general/home'
    WHEN 'post-officer'          THEN '/officer/post/home'
    WHEN 'investigator'          THEN '/cid/home'
    WHEN 'cid-officer'           THEN '/cid/home'
    WHEN 'investigation-supervisor' THEN '/cid/home'
    WHEN 'cyber-crime'           THEN '/cid/home'
    WHEN 'national-clerk'        THEN '/clerk/records'
    WHEN 'regional-clerk'        THEN '/clerk/records'
    WHEN 'district-clerk'        THEN '/clerk/records'
    WHEN 'clerk'                 THEN '/clerk/records'
    WHEN 'admin'                 THEN '/admin/dashboard'
    ELSE '/admin/dashboard'
  END as "Dashboard"
FROM users
WHERE id::text LIKE '6%'
ORDER BY
  CASE role
    WHEN 'national-commissioner' THEN 1
    WHEN 'regional-commissioner' THEN 2
    WHEN 'district-commissioner' THEN 3
    WHEN 'station-commissioner'  THEN 4
    WHEN 'officer-traffic'       THEN 5
    WHEN 'officer-general'       THEN 6
    WHEN 'post-officer'          THEN 7
    WHEN 'investigator'          THEN 8
    WHEN 'cid-officer'           THEN 8
    WHEN 'investigation-supervisor' THEN 8
    WHEN 'cyber-crime'           THEN 8
    ELSE 9
  END, name;

-- ── CID OFFICERS (added separately after fix) ─────────────────
INSERT INTO users (id,name,short_name,role,rank,id_number,badge_no,station_id,region,status,created_at)
VALUES
  ('60000000-0000-0000-0000-000000000080',
   'SP Zawadi Mwakasege','SP Mwakasege',
   'investigator','Superintendent of Police',
   'SP-CID-NAT-001','CID-NAT-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),
  ('60000000-0000-0000-0000-000000000081',
   'IP Lilian Mbise','IP Mbise',
   'cid-officer','Inspector of Police',
   'IP-CID-DSM-001','CID-DSM-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),
  ('60000000-0000-0000-0000-000000000082',
   'IP Samuel Ngowi','IP Ngowi',
   'investigation-supervisor','Inspector of Police',
   'IP-CID-DSM-002','CID-DSM-002',
   '30000000-0000-0000-0000-000000000003','Dar es Salaam','active',NOW()),
  ('60000000-0000-0000-0000-000000000083',
   'ASP David Mhina','ASP Mhina',
   'cyber-crime','Assistant Superintendent',
   'ASP-CC-NAT-001','CID-CC-001',
   '30000000-0000-0000-0000-000000000001','Dar es Salaam','active',NOW()),
  ('60000000-0000-0000-0000-000000000084',
   'IP Grace Mmbaga','IP Mmbaga',
   'cid-officer','Inspector of Police',
   'IP-CID-MWZ-001','CID-MWZ-001',
   '30000000-0000-0000-0000-000000000006','Mwanza','active',NOW())
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, id_number=EXCLUDED.id_number,
  badge_no=EXCLUDED.badge_no, status=EXCLUDED.status;

-- Create officer records for CID
INSERT INTO officers (user_id,name,officer_number,badge_no,rank,station_id,region,status,joined_at,created_at)
SELECT u.id,u.name,u.badge_no,u.badge_no,u.rank,u.station_id,u.region,'active',CURRENT_DATE-365,NOW()
FROM users u
WHERE u.id::text IN (
  '60000000-0000-0000-0000-000000000080',
  '60000000-0000-0000-0000-000000000081',
  '60000000-0000-0000-0000-000000000082',
  '60000000-0000-0000-0000-000000000083',
  '60000000-0000-0000-0000-000000000084'
)
ON CONFLICT DO NOTHING;

-- Final CID summary
SELECT name, badge_no as "Login", role FROM users
WHERE id::text LIKE '60000000-0000-0000-0000-0000000000%'
  AND role IN ('investigator','cid-officer','investigation-supervisor','cyber-crime')
ORDER BY name;
