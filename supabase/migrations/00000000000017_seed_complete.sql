-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — COMPLETE SEED v3
-- Migration: 00000000000017_seed_complete
-- Updates and extends seed data for all new tables
-- All inserts: ON CONFLICT DO NOTHING (idempotent)
-- ============================================================

BEGIN;

-- ── Update citizens with first/last names ────────────────────
UPDATE citizens SET
  first_name = split_part(name, ' ', 1),
  last_name  = split_part(name, ' ', array_length(string_to_array(name,' '), 1))
WHERE first_name IS NULL AND name IS NOT NULL;

-- ── Initialize 2026 Driver Points ────────────────────────────
INSERT INTO driver_points (citizen_id, year, points_start, points_current, points_deducted, violations_count, status, last_violation_date)
SELECT
  c.id, 2026, 100,
  CASE c.nida
    WHEN '199012031234567' THEN 87  -- Juma Mwinyi (3 citations)
    WHEN '198803221234569' THEN 74  -- Ali Salum (violations)
    WHEN '197612301234571' THEN 63  -- Saidi Bakari
    WHEN '200005121234573' THEN 78  -- Baraka Mwanga
    WHEN '197805091234575' THEN 48  -- Hamisi Omar (many violations)
    WHEN '199811271234577' THEN 91  -- Mariamu Komba (minor)
    WHEN '198905231234584' THEN 35  -- Nassoro (suspended)
    WHEN '199309251234581' THEN 100 -- Sikudhani (clean)
    ELSE 100
  END,
  CASE c.nida
    WHEN '199012031234567' THEN 13
    WHEN '198803221234569' THEN 26
    WHEN '197612301234571' THEN 37
    WHEN '200005121234573' THEN 22
    WHEN '197805091234575' THEN 52
    WHEN '199811271234577' THEN 9
    WHEN '198905231234584' THEN 65
    ELSE 0
  END,
  CASE c.nida
    WHEN '199012031234567' THEN 4
    WHEN '198803221234569' THEN 6
    WHEN '197612301234571' THEN 8
    WHEN '200005121234573' THEN 5
    WHEN '197805091234575' THEN 14
    WHEN '199811271234577' THEN 2
    WHEN '198905231234584' THEN 18
    ELSE 0
  END,
  CASE c.nida
    WHEN '199012031234567' THEN 'good'
    WHEN '198803221234569' THEN 'good'
    WHEN '197612301234571' THEN 'warning'
    WHEN '200005121234573' THEN 'good'
    WHEN '197805091234575' THEN 'critical'
    WHEN '199811271234577' THEN 'good'
    WHEN '198905231234584' THEN 'suspended'
    ELSE 'good'
  END,
  CASE c.nida
    WHEN '199012031234567' THEN '2026-05-10'::DATE
    WHEN '198803221234569' THEN '2026-05-08'::DATE
    WHEN '197612301234571' THEN '2026-05-05'::DATE
    WHEN '200005121234573' THEN '2026-05-02'::DATE
    WHEN '197805091234575' THEN '2026-04-28'::DATE
    WHEN '199811271234577' THEN '2026-04-01'::DATE
    WHEN '198905231234584' THEN '2026-04-20'::DATE
    ELSE NULL
  END
FROM citizens c
WHERE c.nida IS NOT NULL
ON CONFLICT (citizen_id, year) DO NOTHING;

-- ── Initialize 2026 Citizen Conduct Points ────────────────────
INSERT INTO citizen_conduct_points (citizen_id, year, points_start, points_current, points_deducted, incidents_count, status, last_incident_date)
SELECT
  c.id, 2026, 100,
  CASE c.nida
    WHEN '197805091234575' THEN 60  -- Hamisi (warnings)
    WHEN '198905231234584' THEN 25  -- Nassoro (worst)
    WHEN '199012031234567' THEN 95  -- Juma (minor)
    WHEN '197612301234571' THEN 72  -- Saidi
    ELSE 100
  END,
  CASE c.nida
    WHEN '197805091234575' THEN 40
    WHEN '198905231234584' THEN 75
    WHEN '199012031234567' THEN 5
    WHEN '197612301234571' THEN 28
    ELSE 0
  END,
  CASE c.nida
    WHEN '197805091234575' THEN 4
    WHEN '198905231234584' THEN 9
    WHEN '199012031234567' THEN 1
    WHEN '197612301234571' THEN 3
    ELSE 0
  END,
  CASE c.nida
    WHEN '197805091234575' THEN 'warning'
    WHEN '198905231234584' THEN 'suspended'
    WHEN '199012031234567' THEN 'good'
    WHEN '197612301234571' THEN 'good'
    ELSE 'good'
  END,
  CASE c.nida
    WHEN '197805091234575' THEN '2026-04-28'::DATE
    WHEN '198905231234584' THEN '2026-04-20'::DATE
    WHEN '199012031234567' THEN '2026-01-10'::DATE
    WHEN '197612301234571' THEN '2026-05-05'::DATE
    ELSE NULL
  END
FROM citizens c
WHERE c.nida IS NOT NULL
ON CONFLICT (citizen_id, year) DO NOTHING;

-- ── Points Deductions History ─────────────────────────────────
INSERT INTO points_deductions (citizen_id, deduction_type, year, offense, points_deducted, points_before, points_after, source_type, officer_name, location, deduction_date)
SELECT c.id, 'driver', 2026, 'Over Speeding', 3.0, 100, 97, 'citation', 'Sgt. Ali Hassan', 'Morogoro Road', '2026-05-10'
FROM citizens c WHERE c.nida = '199012031234567' ON CONFLICT DO NOTHING;

INSERT INTO points_deductions (citizen_id, deduction_type, year, offense, points_deducted, points_before, points_after, source_type, officer_name, location, deduction_date)
SELECT c.id, 'driver', 2026, 'Driving Under Influence', 3.0, 51, 48, 'citation', 'Cprl. Juma Mwinyi', 'Kariakoo', '2026-04-28'
FROM citizens c WHERE c.nida = '197805091234575' ON CONFLICT DO NOTHING;

INSERT INTO points_deductions (citizen_id, deduction_type, year, offense, points_deducted, points_before, points_after, source_type, officer_name, location, deduction_date)
SELECT c.id, 'driver', 2026, 'Driving Under Influence', 3.0, 38, 35, 'citation', 'Insp. Grace Mushi', 'Goba', '2026-04-20'
FROM citizens c WHERE c.nida = '198905231234584' ON CONFLICT DO NOTHING;

-- ── Seed Cases ────────────────────────────────────────────────
INSERT INTO cases (case_number, title, case_type, priority, status, description, opened_date) VALUES
  ('CS-2026-0001','Kesi ya Wizi wa Gari — T 003 GHI',       'criminal','high',  'investigating','Toyota Hiace iliibiwa usiku. CCTV inaonyesha gari linatoka Magomeni.', '2026-04-28'),
  ('CS-2026-0002','Wizi wa Benki — Nassoro Kombo',           'criminal','critical','investigating','Fedha TZS 50M ziliibwa. Mshukiwa: Nassoro Kombo Mataka (NIDA:198905231234584).','2026-05-11'),
  ('CS-2026-0003','Mtoto Aliyepotea — Amani Mwanga (Miaka 8)','missing_person','critical','open','Mtoto alipotea akienda shule asubuhi. Nguo: shati nyekundu, suruali bluu.','2026-05-15'),
  ('CS-2026-0004','Ajali ya Barabara — Morogoro Road',       'criminal','medium','open','Gari T 005 MNO liligongana na lori. Majeruhi 3, mali ziliharibiwa.','2026-05-05'),
  ('CS-2026-0005','Ugomvi Kariakoo — Hamisi Rashid',         'criminal','medium','closed','Ugomvi wa mapigano. Watu 2 walijeruhi. Mshukiwa alikamatwa na kufungwa.','2026-03-10')
ON CONFLICT (case_number) DO NOTHING;

-- ── Seed Command Orders ───────────────────────────────────────
INSERT INTO command_orders (order_number, order_text, priority, status, order_type, location, sent_at)
SELECT
  'ORD-2026-0001',
  'Nenda Morogoro Road mara moja — ajali imetokea. Ripoti hali ya majeruhi na uharibifu.',
  'urgent', 'acknowledged', 'field_order', 'Morogoro Road, DSM',
  NOW() - INTERVAL '2 hours'
FROM users u WHERE u.role = 'national-commissioner' LIMIT 0
UNION ALL
SELECT 'ORD-2026-0001','placeholder','urgent','acknowledged','field_order','Morogoro Road',NOW()
WHERE NOT EXISTS (SELECT 1 FROM command_orders WHERE order_number = 'ORD-2026-0001');

-- Try inserting orders referencing users
DO $$ 
DECLARE
  v_commander UUID;
  v_officer   UUID;
BEGIN
  SELECT id INTO v_commander FROM users WHERE badge_no = 'CSP-001' LIMIT 1;
  SELECT id INTO v_officer   FROM users WHERE badge_no = 'TP123456' LIMIT 1;
  
  IF v_commander IS NOT NULL AND v_officer IS NOT NULL THEN
    INSERT INTO command_orders (order_number, from_commander, to_officer, order_text, priority, status, sent_at) VALUES
      ('ORD-2026-0002', v_commander, v_officer, 'Ongeza doria eneo la Kariakoo masaa 2 ijao. Taarifa kila saa.', 'high', 'sent', NOW() - INTERVAL '1 hour')
    ON CONFLICT (order_number) DO NOTHING;
  END IF;
END $$;

-- ── Seed Duty Roster (today) ──────────────────────────────────
-- Already seeded by the trigger in migration 0016

-- ── Seed Evidence Categories & Types ─────────────────────────
INSERT INTO evidence_types (category_id, name, description) VALUES
  ((SELECT id FROM evidence_categories WHERE name = 'Silaha'), 'Bunduki', 'Firearms'),
  ((SELECT id FROM evidence_categories WHERE name = 'Silaha'), 'Kisu', 'Knives and blades'),
  ((SELECT id FROM evidence_categories WHERE name = 'Hati'), 'Hati Bandia', 'Forged documents'),
  ((SELECT id FROM evidence_categories WHERE name = 'Vifaa vya Kidijitali'), 'Simu iliyobiwa', 'Stolen phone'),
  ((SELECT id FROM evidence_categories WHERE name = 'Vifaa vya Kidijitali'), 'Laptop iliyobiwa', 'Stolen laptop'),
  ((SELECT id FROM evidence_categories WHERE name = 'Dawa za Kulevya'), 'Bangi', 'Cannabis'),
  ((SELECT id FROM evidence_categories WHERE name = 'Picha / Video'), 'CCTV Footage', 'Security camera footage'),
  ((SELECT id FROM evidence_categories WHERE name = 'DNA / Mkojo'), 'Sampuli ya Damu', 'Blood sample')
ON CONFLICT DO NOTHING;

-- ── Seed Evidence Storage Locations ──────────────────────────
INSERT INTO evidence_storage (name, location, type, status) VALUES
  ('Chumba cha Ushahidi A', 'Ghorofa ya Chini, Kituo Kikuu DSM', 'room',    'active'),
  ('Chumba cha Ushahidi B', 'Ghorofa ya Kwanza, Kituo Kikuu DSM','room',    'active'),
  ('Seifu ya Ushahidi',     'Ofisi ya OC, Kituo Kikuu DSM',       'safe',    'active'),
  ('Friji ya Sampuli',      'Maabara, CID HQ',                    'freezer', 'active'),
  ('Digital Evidence Server','ICT Room, CID HQ',                  'digital', 'active')
ON CONFLICT DO NOTHING;

-- ── Seed Property Categories (types) ─────────────────────────
INSERT INTO property_types (category_id, name, description)
SELECT pc.id, pt.name, pt.desc FROM (VALUES
  ('Ardhi','Kiwanja cha Mjini','Urban plot'),
  ('Ardhi','Shamba','Agricultural land'),
  ('Nyumba ya Kuishi','Nyumba ya Beton','Concrete house'),
  ('Nyumba ya Kuishi','Flat/Apartment','Apartment unit'),
  ('Biashara','Duka','Shop/Store'),
  ('Biashara','Ofisi','Office space'),
  ('Viwanda','Kiwanda','Factory')
) AS pt(cat, name, desc)
JOIN property_categories pc ON pc.name = pt.cat
ON CONFLICT DO NOTHING;

COMMIT;
