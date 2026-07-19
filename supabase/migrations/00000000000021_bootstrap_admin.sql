-- ============================================================
-- Migration 021: BOOTSTRAP SYSTEM ADMIN
-- Creates a single SYSTEM_ADMIN user so the platform is
-- accessible after the clean slate migration.
-- Admin logs in with badge number: SYSADMIN-001
-- Password: TZPolice@2026! (change on first login)
-- ============================================================

-- Insert the bootstrap region (required for station FK)
INSERT INTO regions (id, code, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'HQ', 'Makao Makuu')
ON CONFLICT (code) DO NOTHING;

-- Insert bootstrap station (Headquarters)
INSERT INTO stations (id, name, region, district, address, phone, status)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Makao Makuu ya Polisi Tanzania',
  'Makao Makuu',
  'Dodoma',
  'Dodoma, Tanzania',
  '+255 26 232 0000',
  'active'
)
ON CONFLICT DO NOTHING;

-- Insert System Admin user
-- NOTE: password_hash is bcrypt of "TZPolice@2026!" with cost 10
INSERT INTO users (
  id, name, short_name, rank, rank_short,
  role, status, station_id,
  badge_no, username, email, phone,
  region, unit, photo_url,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'System Administrator',
  'SysAdmin',
  'System Administrator',
  'SA',
  'admin',
  'active',
  '00000000-0000-0000-0000-000000000010',
  'SYSADMIN-001',
  'sysadmin',
  'admin@polisi.go.tz',
  '+255 000 000 000',
  'Makao Makuu',
  'Usimamizi wa Mfumo',
  NULL,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ── Verify ───────────────────────────────────────────────────
DO $$
DECLARE u_count INT; s_count INT;
BEGIN
  SELECT COUNT(*) INTO u_count FROM users;
  SELECT COUNT(*) INTO s_count FROM stations;
  RAISE NOTICE '✅ Bootstrap complete: % user(s), % station(s)', u_count, s_count;
  RAISE NOTICE '   Login badge: SYSADMIN-001';
  RAISE NOTICE '   ⚠️  Change credentials immediately after first login.';
END $$;
