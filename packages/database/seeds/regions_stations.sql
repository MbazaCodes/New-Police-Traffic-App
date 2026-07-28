-- Tanzania Regions and Police Stations Seed
-- Safe to run multiple times (ON CONFLICT DO NOTHING)

INSERT INTO regions (id, name, code, zone) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Dar es Salaam', 'DSM', 'Coastal'),
  ('10000000-0000-0000-0000-000000000002', 'Mwanza', 'MWZ', 'Lake'),
  ('10000000-0000-0000-0000-000000000003', 'Arusha', 'ARU', 'Northern'),
  ('10000000-0000-0000-0000-000000000004', 'Dodoma', 'DOD', 'Central'),
  ('10000000-0000-0000-0000-000000000005', 'Mbeya', 'MBY', 'Southern Highlands'),
  ('10000000-0000-0000-0000-000000000006', 'Morogoro', 'MRG', 'Eastern'),
  ('10000000-0000-0000-0000-000000000007', 'Tanga', 'TNG', 'Northern'),
  ('10000000-0000-0000-0000-000000000008', 'Kagera', 'KGR', 'Lake'),
  ('10000000-0000-0000-0000-000000000009', 'Kilimanjaro', 'KLM', 'Northern'),
  ('10000000-0000-0000-0000-000000000010', 'Shinyanga', 'SHY', 'Lake'),
  ('10000000-0000-0000-0000-000000000011', 'Tabora', 'TAB', 'Western'),
  ('10000000-0000-0000-0000-000000000012', 'Kigoma', 'KGM', 'Western'),
  ('10000000-0000-0000-0000-000000000013', 'Rukwa', 'RKW', 'Southern Highlands'),
  ('10000000-0000-0000-0000-000000000014', 'Iringa', 'IRG', 'Southern Highlands'),
  ('10000000-0000-0000-0000-000000000015', 'Mtwara', 'MTW', 'Southern'),
  ('10000000-0000-0000-0000-000000000016', 'Lindi', 'LND', 'Southern'),
  ('10000000-0000-0000-0000-000000000017', 'Ruvuma', 'RVM', 'Southern'),
  ('10000000-0000-0000-0000-000000000018', 'Singida', 'SGD', 'Central'),
  ('10000000-0000-0000-0000-000000000019', 'Mara', 'MRA', 'Lake'),
  ('10000000-0000-0000-0000-000000000020', 'Pwani', 'PWN', 'Coastal'),
  ('10000000-0000-0000-0000-000000000021', 'Geita', 'GTA', 'Lake'),
  ('10000000-0000-0000-0000-000000000022', 'Simiyu', 'SMY', 'Lake'),
  ('10000000-0000-0000-0000-000000000023', 'Katavi', 'KTV', 'Western'),
  ('10000000-0000-0000-0000-000000000024', 'Njombe', 'NJM', 'Southern Highlands'),
  ('10000000-0000-0000-0000-000000000025', 'Songwe', 'SGW', 'Southern Highlands'),
  ('10000000-0000-0000-0000-000000000031', 'Makao Makuu', 'MKM', 'National')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stations (id, name, region, district, address, status) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Makao Makuu - Dar es Salaam', 'Dar es Salaam', 'Ilala', 'Sokoine Drive, Dar es Salaam', 'active'),
  ('20000000-0000-0000-0000-000000000002', 'Kituo cha Polisi Mwanza', 'Mwanza', 'Nyamagana', 'Mwanza City Centre', 'active'),
  ('20000000-0000-0000-0000-000000000003', 'Kituo cha Polisi Arusha', 'Arusha', 'Arusha City', 'Arusha Town', 'active'),
  ('20000000-0000-0000-0000-000000000004', 'Kituo cha Polisi Dodoma', 'Dodoma', 'Dodoma City', 'Dodoma Town', 'active'),
  ('20000000-0000-0000-0000-000000000005', 'Kituo cha Polisi Mbeya', 'Mbeya', 'Mbeya City', 'Mbeya Town', 'active'),
  ('20000000-0000-0000-0000-000000000006', 'Kituo cha Polisi Morogoro', 'Morogoro', 'Morogoro Urban', 'Morogoro Town', 'active'),
  ('20000000-0000-0000-0000-000000000007', 'Kituo cha Polisi Tanga', 'Tanga', 'Tanga City', 'Tanga Town', 'active'),
  ('20000000-0000-0000-0000-000000000008', 'Kituo cha Polisi Kagera', 'Kagera', 'Bukoba Urban', 'Bukoba Town', 'active'),
  ('20000000-0000-0000-0000-000000000009', 'Kituo cha Polisi Kilimanjaro', 'Kilimanjaro', 'Moshi Urban', 'Moshi Town', 'active'),
  ('20000000-0000-0000-0000-000000000010', 'Kituo cha Polisi Temeke', 'Dar es Salaam', 'Temeke', 'Temeke, Dar es Salaam', 'active'),
  ('20000000-0000-0000-0000-000000000011', 'Kituo cha Polisi Kinondoni', 'Dar es Salaam', 'Kinondoni', 'Kinondoni, Dar es Salaam', 'active'),
  ('20000000-0000-0000-0000-000000000012', 'Kituo cha Polisi Ubungo', 'Dar es Salaam', 'Ubungo', 'Ubungo, Dar es Salaam', 'active')
ON CONFLICT (id) DO NOTHING;
