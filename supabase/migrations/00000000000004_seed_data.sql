-- ===== TZ Police Digital Platform — Migration 00000000000004_seed_data =====
-- Seeds the database with sample data mirrored from:
--   * src/lib/admin-mgmt-data.ts  (STATIONS, POSTS, ASSIGNMENTS)
--   * src/lib/admin-data.ts       (OFFICERS, ADMIN_INCIDENTS, ADMIN_CITATIONS, ACTIVE_PATROLS)
--   * src/lib/police-data.ts      (ALERTS)
--   * src/lib/admin-data.ts       (ADMIN_USER, ADMIN_USERS)
--
-- All inserts are idempotent (ON CONFLICT DO NOTHING) so this file can be
-- re-run safely. Deterministic UUIDs are used so foreign-key references
-- remain stable across re-seeds.

BEGIN;

-- ============================================================
-- STATIONS (7) — from STATIONS in admin-mgmt-data.ts
-- ============================================================
INSERT INTO stations (id, name, region, district, address, phone, status, established) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Kituo Kikuu cha Polisi Dar es Salaam', 'Dar es Salaam', 'Ilala',      'Sokoine Drive, Dar es Salaam', '022 211 0001', 'active',      '1961'),
  ('11111111-0000-0000-0000-000000000002', 'Kituo cha Polisi Kariakoo',           'Dar es Salaam', 'Ilala',      'Mwembe Chai, Kariakoo',         '022 218 5544', 'active',      '1972'),
  ('11111111-0000-0000-0000-000000000003', 'Kituo cha Polisi Kinondoni',          'Dar es Salaam', 'Kinondoni',  'Mwenge, Kinondoni',             '022 277 3311', 'active',      '1975'),
  ('11111111-0000-0000-0000-000000000004', 'Kituo cha Polisi Temeke',             'Dar es Salaam', 'Temeke',     'Temeke St, Temeke',             '022 285 9922', 'active',      '1978'),
  ('11111111-0000-0000-0000-000000000005', 'Kituo cha Polisi Ubungo',             'Dar es Salaam', 'Kinondoni',  'Ubungo Terminal, DSM',          '022 243 7788', 'maintenance', '1985'),
  ('11111111-0000-0000-0000-000000000006', 'Kituo cha Polisi Arusha Mkoani',      'Arusha',        'Arusha',     'Fire Road, Arusha',             '027 250 1100', 'active',      '1963'),
  ('11111111-0000-0000-0000-000000000007', 'Kituo cha Polisi Mwanza',             'Mwanza',        'Nyamagana',  'Kenyatta Road, Mwanza',         '028 250 2200', 'active',      '1965')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USERS (4) — one per role
-- ============================================================
INSERT INTO users (id, name, short_name, rank, rank_short, role, id_number, station_id, unit, phone, email, password_hash, status) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Insp. Juma Mwinyi',    'Juma Mwinyi',    'Police Inspector',         'Insp.', 'officer-traffic', 'TP123456', '11111111-0000-0000-0000-000000000001', 'Trafiki - Mkoa wa Dar es Salaam', '0712 345 678', 'juma.mwinyi@polisi.go.tz',    crypt('password123', gen_salt('bf')), 'active'),
  ('22222222-0000-0000-0000-000000000002', 'Insp. Grace Mushi',    'Grace Mushi',    'Police Inspector',         'Insp.', 'officer-general', 'TP345678', '11111111-0000-0000-0000-000000000003', 'Uhalifu - Mkoa wa Dar es Salaam', '0766 987 654', 'grace.mushi@polisi.go.tz',    crypt('password123', gen_salt('bf')), 'active'),
  ('22222222-0000-0000-0000-000000000003', 'ACP. Mariam Juma',     'Mariam Juma',    'Assistant Commissioner',   'ACP.',  'admin',           'ADM-002',  '11111111-0000-0000-0000-000000000001', 'Idara ya Utawala',                '0714 222 333', 'mariam.juma@polisi.go.tz',    crypt('admin123',    gen_salt('bf')), 'active'),
  ('22222222-0000-0000-0000-000000000004', 'CP. Saidi Waziri',     'Saidi Waziri',   'Commissioner of Police',   'CP.',   'commander',       'ADM-001',  '11111111-0000-0000-0000-000000000001', 'Makao Makuu - Dar es Salaam',     '0716 555 777', 'saidi.waziri@polisi.go.tz',   crypt('commander123',gen_salt('bf')), 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- OFFICERS (8) — from OFFICERS in admin-data.ts
-- ============================================================
INSERT INTO officers (id, user_id, officer_number, name, rank, unit, station_id, post_id, status, phone, patrols_count, citations_count, incidents_count, hours_today) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'TP123456', 'Insp. Juma Mwinyi',     'Inspector', 'Trafiki - Dar es Salaam', '11111111-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', 'active',   '0712 345 678', 3, 12, 18, 8.5),
  ('33333333-0000-0000-0000-000000000002', NULL,                                       'TP234567', 'Sgt. Ali Hassan',       'Sergeant',  'Trafiki - Dar es Salaam', '11111111-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'active',   '0788 123 456', 2, 8,  5, 6.0),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'TP345678', 'Insp. Grace Mushi',     'Inspector', 'Uhalifu - Dar es Salaam', '11111111-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', 'active',   '0766 987 654', 1, 0,  9, 7.5),
  ('33333333-0000-0000-0000-000000000004', NULL,                                       'TP456789', 'Sgt. Saidi Juma',       'Sergeant',  'Trafiki - Dar es Salaam', '11111111-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000006', 'break',    '0755 111 222', 2, 5,  3, 5.0),
  ('33333333-0000-0000-0000-000000000005', NULL,                                       'TP567890', 'Cpl. Mariam Ally',      'Corporal',  'Patrol - Dar es Salaam',  '11111111-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'active',   '0744 333 444', 4, 7,  2, 9.0),
  ('33333333-0000-0000-0000-000000000006', NULL,                                       'TP678901', 'Insp. Hamisi Rashid',   'Inspector', 'Uhalifu - Dar es Salaam', '11111111-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000002', 'off-duty', '0733 555 666', 0, 0,  0, 0.0),
  ('33333333-0000-0000-0000-000000000007', NULL,                                       'TP789012', 'Sgt. Fatuma Hassan',    'Sergeant',  'Trafiki - Dar es Salaam', '11111111-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000005', 'active',   '0722 777 888', 2, 15, 7, 7.0),
  ('33333333-0000-0000-0000-000000000008', NULL,                                       'TP890123', 'Cpl. Emmanuel Joseph',  'Corporal',  'Patrol - Dar es Salaam',  '11111111-0000-0000-0000-000000000001', NULL,                                    'active',   '0711 999 000', 3, 4,  1, 8.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- POSTS (7) — from POSTS in admin-mgmt-data.ts
-- ============================================================
INSERT INTO posts (id, name, station_id, location, type, status, shift) VALUES
  ('44444444-0000-0000-0000-000000000001', 'Posti ya Mwenge',           '11111111-0000-0000-0000-000000000003', 'Mwenge Bus Terminal',      'Traffic', 'active',   '24/7'),
  ('44444444-0000-0000-0000-000000000002', 'Posti ya Ubungo',           '11111111-0000-0000-0000-000000000005', 'Ubungo Terminal',          'Traffic', 'active',   '24/7'),
  ('44444444-0000-0000-0000-000000000003', 'Posti ya Kariakoo Market',  '11111111-0000-0000-0000-000000000002', 'Kariakoo Market',          'Patrol',  'active',   '06:00 - 22:00'),
  ('44444444-0000-0000-0000-000000000004', 'Posti ya Samora Avenue',    '11111111-0000-0000-0000-000000000001', 'Samora Avenue CBD',        'Traffic', 'active',   '24/7'),
  ('44444444-0000-0000-0000-000000000005', 'Posti ya Mbezi Beach',      '11111111-0000-0000-0000-000000000003', 'Mbezi Beach Junction',     'Patrol',  'active',   '18:00 - 06:00'),
  ('44444444-0000-0000-0000-000000000006', 'Posti ya Temeke St',        '11111111-0000-0000-0000-000000000004', 'Temeke Road',              'Traffic', 'inactive', '06:00 - 18:00'),
  ('44444444-0000-0000-0000-000000000007', 'Posti ya Mandela Road',     '11111111-0000-0000-0000-000000000001', 'Mandela Expressway',       'Traffic', 'active',   '24/7')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ASSIGNMENTS (7) — from ASSIGNMENTS in admin-mgmt-data.ts
-- ============================================================
INSERT INTO assignments (id, officer_id, station_id, post_id, role, assigned_date, status) VALUES
  ('55555555-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', 'Traffic Officer',  '2026-01-01', 'active'),
  ('55555555-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'Patrol Officer',   '2026-02-15', 'active'),
  ('55555555-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', 'General Duty',     '2026-03-10', 'active'),
  ('55555555-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000006', 'Traffic Officer',  '2026-03-20', 'active'),
  ('55555555-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000003', 'Patrol Officer',   '2026-04-05', 'active'),
  ('55555555-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000005', 'Patrol Officer',   '2026-04-12', 'active'),
  ('55555555-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000002', 'General Duty',     '2026-05-01', 'on-leave')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VEHICLES (7) — sample vehicles referenced by citations
-- ============================================================
INSERT INTO vehicles (id, plate, model, type, year, color, owner_name, owner_nida, owner_phone, insurance_company, insurance_policy, insurance_expires, insurance_valid, accident_involved) VALUES
  ('66666666-0000-0000-0000-000000000001', 'T123ABC', 'Toyota Hilux',    'Pick Up',  '2022', 'White',  'Juma Khamis Mwinyi',   '1990123456789', '0712 345 678', 'CRDB Insurance Company', 'CRDB/2026/154689', '2027-05-15', TRUE,  TRUE),
  ('66666666-0000-0000-0000-000000000002', 'T789GHI', 'Toyota Hiace',    'Minibus',  '2019', 'Silver', 'Ali Mohamed Salum',    '1985112233445', '0755 987 654', 'Jubilee Insurance',       'JUB/2026/88213',  '2026-12-31', TRUE,  TRUE),
  ('66666666-0000-0000-0000-000000000003', 'T456DEF', 'Toyota Corolla',  'Saloon',   '2020', 'Blue',   'Saidi Juma Khamis',    '1988071234567', '0788 222 333', 'AAR Insurance',           'AAR/2026/44521',  '2027-03-01', TRUE,  FALSE),
  ('66666666-0000-0000-0000-000000000004', 'T321XYZ', 'Honda Fit',       'Saloon',   '2021', 'Red',    'Grace Mushi',          '1992082345678', '0766 987 654', 'Sanlam Insurance',        'SAN/2026/66712',  '2026-08-30', TRUE,  FALSE),
  ('66666666-0000-0000-0000-000000000005', 'T654ABC', 'Nissan X-Trail',  'Pick Up',  '2018', 'Black',  'Hamisi Rashid',        '1985021456789', '0733 555 666', 'ICEA Lion',               'ICEA/2026/99041', '2027-01-15', TRUE,  FALSE),
  ('66666666-0000-0000-0000-000000000006', 'T987GHI', 'Toyota Premio',   'Saloon',   '2017', 'Gray',   'Mariam Ally',          '1994061234567', '0744 333 444', 'CRDB Insurance Company',  'CRDB/2026/154690','2026-06-30', FALSE, FALSE),
  ('66666666-0000-0000-0000-000000000007', 'T111ABC', 'Mazda Demio',     'Saloon',   '2016', 'White',  'Emmanuel Joseph',      '1987040634567', '0711 999 000', 'Jubilee Insurance',       'JUB/2026/88214',  '2027-02-28', TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DRIVERS (4) — sample drivers
-- ============================================================
INSERT INTO drivers (id, name, gender, license_number, license_class, nida, mobile) VALUES
  ('77777777-0000-0000-0000-000000000001', 'Juma Khamis Mwinyi', 'Male',   'DL123456789TZ', 'Class B', '1990123456789', '0712 345 678'),
  ('77777777-0000-0000-0000-000000000002', 'Ali Mohamed Salum',  'Male',   'DL987654321TZ', 'Class C', '1985112233445', '0755 987 654'),
  ('77777777-0000-0000-0000-000000000003', 'Saidi Juma Khamis',  'Male',   'DL555000111TZ', 'Class B', '1988071234567', '0788 222 333'),
  ('77777777-0000-0000-0000-000000000004', 'Grace Mushi',        'Female', 'DL444333222TZ', 'Class A', '1992082345678', '0766 987 654')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CITIZENS (2) — for citizen-search demo
-- ============================================================
INSERT INTO citizens (id, name, nida, mobile, gender, dob, address, occupation, status, has_criminal_record, cases_count, convictions_count) VALUES
  ('cccccccc-0000-0000-0000-000000000001', 'Juma Khamis Mwinyi', '1990123456789', '0712 345 678', 'Male', '1990-06-15', 'House No. 45, Mbezi Beach, Kinondoni, Dar es Salaam', 'Mfanyabiashara', 'Mtu wa Kawaida', FALSE, 0, 0),
  ('cccccccc-0000-0000-0000-000000000002', 'Saidi Matumishi',    '1985010111223', '0788 111 222', 'Male', '1985-01-01', 'House No. 12, Kariakoo, Ilala, Dar es Salaam',       'M dereva',       'Muhalifu',       TRUE,  2, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CITATIONS (7) — from ADMIN_CITATIONS
-- ============================================================
INSERT INTO citations (id, citation_number, vehicle_id, plate, offense, driver_name, driver_id, date, time, location, amount, status, officer_id) VALUES
  ('88888888-0000-0000-0000-000000000001', 'CT-2026-0451', '66666666-0000-0000-0000-000000000001', 'T123ABC', 'Over Speeding',             'Juma Khamis Mwinyi', '77777777-0000-0000-0000-000000000001', '2026-05-10', '14:30', 'Mandela Road, DSM',     150000.00, 'unpaid', '33333333-0000-0000-0000-000000000001'),
  ('88888888-0000-0000-0000-000000000002', 'CT-2026-0450', '66666666-0000-0000-0000-000000000002', 'T789GHI', 'No Seatbelt',               'Ali Mohamed Salum',  '77777777-0000-0000-0000-000000000002', '2026-05-08', '09:15', 'Mbezi Beach, DSM',       50000.00, 'paid',   '33333333-0000-0000-0000-000000000002'),
  ('88888888-0000-0000-0000-000000000003', 'CT-2026-0449', '66666666-0000-0000-0000-000000000003', 'T456DEF', 'Traffic Light Violation',   'Saidi Juma Khamis',  '77777777-0000-0000-0000-000000000003', '2026-05-05', '17:45', 'Samora Ave, DSM',       100000.00, 'paid',   '33333333-0000-0000-0000-000000000007'),
  ('88888888-0000-0000-0000-000000000004', 'CT-2026-0448', '66666666-0000-0000-0000-000000000004', 'T321XYZ', 'Phone While Driving',       'Grace Mushi',        '77777777-0000-0000-0000-000000000004', '2026-05-02', '11:20', 'Nkrumah Street, DSM',    50000.00, 'unpaid', '33333333-0000-0000-0000-000000000001'),
  ('88888888-0000-0000-0000-000000000005', 'CT-2026-0447', '66666666-0000-0000-0000-000000000005', 'T654ABC', 'Over Speeding',             'Hamisi Rashid',      NULL,                                     '2026-04-28', '08:05', 'Morogoro Road, DSM',     30000.00, 'paid',   '33333333-0000-0000-0000-000000000005'),
  ('88888888-0000-0000-0000-000000000006', 'CT-2026-0446', '66666666-0000-0000-0000-000000000006', 'T987GHI', 'No Seatbelt',               'Mariam Ally',        NULL,                                     '2026-04-25', '15:10', 'Kariakoo Market, DSM',   50000.00, 'unpaid', '33333333-0000-0000-0000-000000000002'),
  ('88888888-0000-0000-0000-000000000007', 'CT-2026-0445', '66666666-0000-0000-0000-000000000007', 'T111ABC', 'Traffic Light Violation',   'Emmanuel Joseph',    NULL,                                     '2026-04-22', '19:40', 'Mwenge Bus Terminal',   100000.00, 'paid',   '33333333-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INCIDENTS (5) — from ADMIN_INCIDENTS
-- ============================================================
INSERT INTO incidents (id, incident_number, type, location, latitude, longitude, date, time, status, priority, assigned_officer_id, description) VALUES
  ('99999999-0000-0000-0000-000000000001', 'INC-2026-0341', 'Ajali ya Gari',       'Morogoro Road, DSM', -6.8235000, 39.2695000, '2026-05-15', '08:15', 'urgent',       'high',   '33333333-0000-0000-0000-000000000001', 'Mgongano wa magari mawili, majeruhi 2'),
  ('99999999-0000-0000-0000-000000000002', 'INC-2026-0340', 'Kosa la Trafiki',     'Samora Ave, DSM',    -6.8160000, 39.2890000, '2026-05-15', '08:07', 'active',       'medium', '33333333-0000-0000-0000-000000000002', 'Kupita mwanga mwekundu'),
  ('99999999-0000-0000-0000-000000000003', 'INC-2026-0339', 'Wizi wa Gari',        'Kariakoo, DSM',      -6.8240000, 39.2770000, '2026-05-15', '07:45', 'active',       'high',   '33333333-0000-0000-0000-000000000003', 'Gari la Toyota Corolla limeibiwa'),
  ('99999999-0000-0000-0000-000000000004', 'INC-2026-0338', 'Mgogoro wa Trafiki',  'Ubungo, DSM',        -6.7780000, 39.2330000, '2026-05-15', '07:20', 'resolved',     'low',    '33333333-0000-0000-0000-000000000004', 'Mgogoro kati ya madereva wawili'),
  ('99999999-0000-0000-0000-000000000005', 'INC-2026-0337', 'Kosa la Trafiki',     'Mbezi Beach, DSM',   -6.7660000, 39.2510000, '2026-05-15', '06:50', 'resolved',     'low',    '33333333-0000-0000-0000-000000000001', 'Kutovaa mkanda wa usalama')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PATROLS (5) — from ACTIVE_PATROLS
-- ============================================================
INSERT INTO patrols (id, patrol_number, officer_id, area, start_time, end_time, distance_km, status, progress, last_latitude, last_longitude, last_updated_at) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PT-2026-0001', '33333333-0000-0000-0000-000000000001', 'Kariakoo - Ilala Zone', '2026-05-15 06:30:00+03', NULL,                      12.50, 'active',    65, -6.8240000, 39.2770000, '2026-05-15 08:30:00+03'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'PT-2026-0002', '33333333-0000-0000-0000-000000000002', 'Samora Avenue',         '2026-05-15 07:00:00+03', NULL,                       8.20, 'active',    40, -6.8160000, 39.2890000, '2026-05-15 08:30:00+03'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'PT-2026-0003', '33333333-0000-0000-0000-000000000003', 'Kinondoni Zone',        '2026-05-15 06:45:00+03', NULL,                      15.30, 'active',    80, -6.7780000, 39.2330000, '2026-05-15 08:30:00+03'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'PT-2026-0004', '33333333-0000-0000-0000-000000000005', 'Kariakoo Market',       '2026-05-15 07:15:00+03', NULL,                       5.70, 'active',    25, -6.8240000, 39.2770000, '2026-05-15 08:30:00+03'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'PT-2026-0005', '33333333-0000-0000-0000-000000000007', 'Mbezi Beach',           '2026-05-15 06:00:00+03', NULL,                      22.10, 'active',    90, -6.7660000, 39.2510000, '2026-05-15 08:30:00+03')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ALERTS (5) — from ALERTS
-- sent_by: commander (user 4)
-- ============================================================
INSERT INTO alerts (id, title, message, source, category, priority, icon, icon_color, border_color, is_read, sent_by, audience) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Gari la Uhalifu limeonekana',
    'Gari la aina ya Toyota Corolla, nambari ya usajili T789GHI, limeordeshwa kama gari la wizi. Endelea kwa tahadhari.',
    'Kituo Kikuu cha Polisi', 'mine', 'urgent',
    'car', '#F44336', '#F44336', FALSE,
    '22222222-0000-0000-0000-000000000004', 'all'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Onyo la Mvua Kubwa',
    'Tahadhari: Mvua kubwa inatarajiwa katika mkoa wa Dar es Salaam kuanzia saa 2 asubuhi. Waofisa wa trafiki watahimizwa kuwa makini.',
    'Idara ya Hali ya Hewa', 'all', 'important',
    'cloud-rain', '#9E9E9E', '#2196F3', FALSE,
    '22222222-0000-0000-0000-000000000004', 'all'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Mafunzo ya IPS mpya',
    'Mafunzo mapya ya IPS (International Police System) yatapokelewa wiki ijayo. Waofisa wote watahitajiwa kuhudhuria.',
    'Mkuu wa Mkoa - Dar es Salaam', 'all', 'normal',
    'graduation-cap', '#4CAF50', '#4CAF50', TRUE,
    '22222222-0000-0000-0000-000000000004', 'all'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Kesi Mpya Imekabidhiwa',
    'Kesi mpya ya wizi imerekodiwa na imekabidhiwa kwako. Tafadhali kagua maelezo na uanze uchunguzi haraka.',
    'Kituo Kikuu cha Polisi', 'mine', 'normal',
    'shield-alert', '#FF9800', '#FF9800', FALSE,
    '22222222-0000-0000-0000-000000000004', 'mine'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'Tahadhari ya Usalama - Eneo la Ubungo',
    'Ripoti za majambazi zimeongezeka katika eneo la Ubungo. Patroli za ziada zimepangwa. Waofisa wa jirani waone kesi husika.',
    'Kamanda wa Mkoa', 'all', 'urgent',
    'alert-triangle', '#F44336', '#F44336', TRUE,
    '22222222-0000-0000-0000-000000000004', 'all')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PF3 FORMS (1) — from PF3_FORM
-- ============================================================
INSERT INTO pf3_forms (id, reference_number, region, district, station_id, accident_type, severity, weather, road_surface, light_condition, vehicles_json, casualties_json, witnesses_json, officer_id, status) VALUES
  ('cccccccc-0000-0000-0000-000000000010', 'PF3/DSM/2026/00892',
   'Dar es Salaam', 'Kinondoni', '11111111-0000-0000-0000-000000000001',
   'Mgongano wa Magari Mawili', 'Mdogo', 'Wazi', 'Lami', 'Mchana',
   '[
     {"plate":"T123ABC","make":"Toyota Corolla","year":"2020","color":"Nyeupe","driver":"Juma Khamis Mwinyi","license":"DL123456789TZ","direction":"Kuelekea Ubungo","damage":"Mbele - Upande wa Kulia","insured":true},
     {"plate":"T789GHI","make":"Toyota Hiace","year":"2019","color":"Fedha","driver":"Ali Mohamed Salum","license":"DL987654321TZ","direction":"Kutoka Ubungo","damage":"Nyuma - Upande wa Kushoto","insured":true}
   ]'::jsonb,
   '[
     {"name":"Ali Mohamed Salum","type":"Abiria","injury":"Maumivu Madogo","hospital":"Mwananyamala","status":"Matibabu"},
     {"name":"Fatuma Hassan","type":"Abiria","injury":"Hakuna Madhara","hospital":"-","status":"Ametoka"}
   ]'::jsonb,
   '[
     {"name":"Saidi Juma","phone":"0788 123 456","statement":"Gari la T123ABC lilipita kasi na kupoteza udhibiti."},
     {"name":"Mariam Ally","phone":"0766 987 654","statement":"Niliona gari la pindi likijaribu kuepuka."}
   ]'::jsonb,
   '33333333-0000-0000-0000-000000000001', 'submitted')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VEHICLE INSPECTIONS (1) — from VEHICLE_INSPECTION
-- ============================================================
INSERT INTO vehicle_inspections (id, vehicle_id, plate, officer_id, location, inspection_date, documents_json, mechanical_json, photos_json, result, notes) VALUES
  ('dddddddd-0000-0000-0000-000000000001',
   '66666666-0000-0000-0000-000000000001',
   'T123ABC',
   '33333333-0000-0000-0000-000000000001',
   'Morogoro Road, DSM',
   '2026-05-15 08:15:00+03',
   '[
     {"label":"Leseni ya Udereva","status":"Sahihi","pass":true},
     {"label":"Hati ya Usajili (Logbook)","status":"Sahihi","pass":true},
     {"label":"Bima ya Gari","status":"Sahihi","pass":true},
     {"label":"Vyeti vya Ukaguzi","status":"Haijasahihi","pass":false},
     {"label":"Kibali cha Biashara / PSV Badge","status":"Sahihi","pass":true}
   ]'::jsonb,
   '[
     {"label":"Taa za Mbele na Nyuma","status":"Nzuri","pass":true},
     {"label":"Brenki","status":"Nzuri","pass":true},
     {"label":"Matairi","status":"Nzuri","pass":true},
     {"label":"Kioo cha Mbele (Wiper)","status":"Nzuri","pass":true},
     {"label":"Viashiria (Indicators)","status":"Nzuri","pass":true},
     {"label":"Horn","status":"Nzuri","pass":true},
     {"label":"Suspension","status":"Nzuri","pass":true}
   ]'::jsonb,
   '[{"label":"Nje - Nyuma"},{"label":"Nje - Mbele"},{"label":"Tairi la Mbele Kushoto"},{"label":"Dashibodi"}]'::jsonb,
   'fail',
   'Vyeti vya ukaguzi vimekosa muhuri rasmi; gari limerudishiwa kituoni kwa ukaguzi wa ziada.')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================
-- Verification queries (for manual inspection; harmless if run).
-- ============================================================
-- SELECT 'stations' AS t, COUNT(*) FROM stations
-- UNION ALL SELECT 'users',        COUNT(*) FROM users
-- UNION ALL SELECT 'officers',     COUNT(*) FROM officers
-- UNION ALL SELECT 'posts',        COUNT(*) FROM posts
-- UNION ALL SELECT 'assignments',  COUNT(*) FROM assignments
-- UNION ALL SELECT 'vehicles',     COUNT(*) FROM vehicles
-- UNION ALL SELECT 'drivers',      COUNT(*) FROM drivers
-- UNION ALL SELECT 'citizens',     COUNT(*) FROM citizens
-- UNION ALL SELECT 'citations',    COUNT(*) FROM citations
-- UNION ALL SELECT 'incidents',    COUNT(*) FROM incidents
-- UNION ALL SELECT 'patrols',      COUNT(*) FROM patrols
-- UNION ALL SELECT 'alerts',       COUNT(*) FROM alerts
-- UNION ALL SELECT 'pf3_forms',    COUNT(*) FROM pf3_forms
-- UNION ALL SELECT 'inspections',  COUNT(*) FROM vehicle_inspections;
