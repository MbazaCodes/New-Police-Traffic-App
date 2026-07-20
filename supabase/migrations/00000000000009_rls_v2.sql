-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — RLS v2
-- Migration: 00000000000009_rls_v2
-- Extends RLS policies to cover all 20 roles and new tables.
-- Principle: DENY BY DEFAULT, allow explicitly.
-- Role groups:
--   COMMANDERS = national-commissioner, dig, regional-commissioner,
--                district-commissioner, station-commissioner, super-admin
--   INVESTIGATORS = cid-officer, investigator, investigation-supervisor, cyber-crime
--   SPECIALISTS   = immigration-liaison, prison-liaison, emergency-dispatcher,
--                   evidence-officer, audit-officer
--   OFFICERS      = officer-traffic, officer-general, post-officer
--   SUPPORT       = clerk, viewer, admin
-- ============================================================

-- ── Helper functions ─────────────────────────────────────────

-- Returns the current user's role as text
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role::text FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Returns TRUE if current user is in any commander role
CREATE OR REPLACE FUNCTION is_commander()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT current_user_role() = ANY(ARRAY[
    'commander','national-commissioner','dig','regional-commissioner',
    'district-commissioner','station-commissioner','super-admin','admin'
  ]);
$$;

-- Returns TRUE if current user is a field officer
CREATE OR REPLACE FUNCTION is_officer()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT current_user_role() = ANY(ARRAY[
    'officer-traffic','officer-general','post-officer'
  ]);
$$;

-- Returns TRUE if current user is CID/investigation
CREATE OR REPLACE FUNCTION is_investigator()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT current_user_role() = ANY(ARRAY[
    'cid-officer','investigator','investigation-supervisor','cyber-crime'
  ]);
$$;

-- Returns the current user's station_id
CREATE OR REPLACE FUNCTION current_user_station()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT station_id FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Returns the current user's region
CREATE OR REPLACE FUNCTION current_user_region()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT region FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- ══════════════════════════════════════════════════════════════
-- OTP CODES — service role only (no RLS policies needed)
-- ══════════════════════════════════════════════════════════════
-- No authenticated user policies. Edge functions use service_role key
-- which bypasses RLS entirely.

-- ══════════════════════════════════════════════════════════════
-- LICENSES
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS licenses_select ON licenses;
CREATE POLICY licenses_select ON licenses
  FOR SELECT TO authenticated
  USING (TRUE);  -- Any authenticated user can look up a license (needed for officer search)

DROP POLICY IF EXISTS licenses_write ON licenses;
CREATE POLICY licenses_write ON licenses
  FOR ALL TO authenticated
  USING (is_commander() OR is_investigator() OR current_user_role() = 'admin')
  WITH CHECK (is_commander() OR is_investigator() OR current_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════════
-- DEVICES
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS devices_select ON devices;
CREATE POLICY devices_select ON devices
  FOR SELECT TO authenticated
  USING (TRUE);  -- All officers can search devices (lost-property screen)

DROP POLICY IF EXISTS devices_write ON devices;
CREATE POLICY devices_write ON devices
  FOR ALL TO authenticated
  USING (is_commander() OR is_investigator() OR
         current_user_role() = ANY(ARRAY['evidence-officer','admin']))
  WITH CHECK (is_commander() OR is_investigator() OR
              current_user_role() = ANY(ARRAY['evidence-officer','admin']));

-- ══════════════════════════════════════════════════════════════
-- ARRESTS
-- ══════════════════════════════════════════════════════════════
-- Officers see own arrests; commanders/CID see all within scope
DROP POLICY IF EXISTS arrests_select ON arrests;
CREATE POLICY arrests_select ON arrests
  FOR SELECT TO authenticated
  USING (
    is_commander() OR is_investigator()
    OR officer_id IN (
      SELECT id FROM officers WHERE user_id = auth.uid()
    )
    OR station_id = current_user_station()
  );

DROP POLICY IF EXISTS arrests_insert ON arrests;
CREATE POLICY arrests_insert ON arrests
  FOR INSERT TO authenticated
  WITH CHECK (
    is_officer() OR is_investigator() OR is_commander()
  );

DROP POLICY IF EXISTS arrests_update ON arrests;
CREATE POLICY arrests_update ON arrests
  FOR UPDATE TO authenticated
  USING (
    is_commander() OR is_investigator()
    OR officer_id IN (SELECT id FROM officers WHERE user_id = auth.uid())
  );

-- ══════════════════════════════════════════════════════════════
-- WARNINGS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS warnings_select ON warnings;
CREATE POLICY warnings_select ON warnings
  FOR SELECT TO authenticated
  USING (
    is_commander()
    OR officer_id IN (SELECT id FROM officers WHERE user_id = auth.uid())
    OR station_id = current_user_station()
  );

DROP POLICY IF EXISTS warnings_insert ON warnings;
CREATE POLICY warnings_insert ON warnings
  FOR INSERT TO authenticated
  WITH CHECK (is_officer() OR is_commander());

DROP POLICY IF EXISTS warnings_update ON warnings;
CREATE POLICY warnings_update ON warnings
  FOR UPDATE TO authenticated
  USING (is_commander() OR officer_id IN (SELECT id FROM officers WHERE user_id = auth.uid()));

-- ══════════════════════════════════════════════════════════════
-- CRIMINAL RECORDS
-- ══════════════════════════════════════════════════════════════
-- Sensitive — only CID, commanders, and general officers with search permission
DROP POLICY IF EXISTS criminal_select ON criminal_records;
CREATE POLICY criminal_select ON criminal_records
  FOR SELECT TO authenticated
  USING (is_commander() OR is_investigator() OR is_officer());

DROP POLICY IF EXISTS criminal_write ON criminal_records;
CREATE POLICY criminal_write ON criminal_records
  FOR ALL TO authenticated
  USING (is_commander() OR is_investigator())
  WITH CHECK (is_commander() OR is_investigator());

-- ══════════════════════════════════════════════════════════════
-- WANTED
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS wanted_select ON wanted;
CREATE POLICY wanted_select ON wanted
  FOR SELECT TO authenticated
  USING (TRUE);  -- All roles can view wanted list

DROP POLICY IF EXISTS wanted_write ON wanted;
CREATE POLICY wanted_write ON wanted
  FOR ALL TO authenticated
  USING (is_commander() OR is_investigator())
  WITH CHECK (is_commander() OR is_investigator());

-- ══════════════════════════════════════════════════════════════
-- MISSING RECORDS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS missing_select ON missing_records;
CREATE POLICY missing_select ON missing_records
  FOR SELECT TO authenticated
  USING (TRUE);  -- All roles can view missing records

DROP POLICY IF EXISTS missing_insert ON missing_records;
CREATE POLICY missing_insert ON missing_records
  FOR INSERT TO authenticated
  WITH CHECK (
    is_commander() OR is_officer() OR is_investigator()
    OR current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS missing_update ON missing_records;
CREATE POLICY missing_update ON missing_records
  FOR UPDATE TO authenticated
  USING (is_commander() OR is_investigator() OR current_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════════
-- PATROL TRACK POINTS
-- ══════════════════════════════════════════════════════════════
-- Officers write their own track points; commanders read all
DROP POLICY IF EXISTS track_insert ON patrol_track_points;
CREATE POLICY track_insert ON patrol_track_points
  FOR INSERT TO authenticated
  WITH CHECK (
    patrol_id IN (
      SELECT p.id FROM patrols p
      JOIN officers o ON o.id = p.officer_id
      WHERE o.user_id = auth.uid()
    )
    OR is_commander()
  );

DROP POLICY IF EXISTS track_select ON patrol_track_points;
CREATE POLICY track_select ON patrol_track_points
  FOR SELECT TO authenticated
  USING (
    is_commander()
    OR patrol_id IN (
      SELECT p.id FROM patrols p
      JOIN officers o ON o.id = p.officer_id
      WHERE o.user_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════
-- ALERT READS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS alert_reads_select ON alert_reads;
CREATE POLICY alert_reads_select ON alert_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_commander());

DROP POLICY IF EXISTS alert_reads_insert ON alert_reads;
CREATE POLICY alert_reads_insert ON alert_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════
-- EXTEND EXISTING TABLE POLICIES FOR NEW ROLES
-- ══════════════════════════════════════════════════════════════

-- Citizens: investigators can also read/write
DROP POLICY IF EXISTS citizens_select_extended ON citizens;
CREATE POLICY citizens_select_extended ON citizens
  FOR SELECT TO authenticated
  USING (TRUE);  -- All authenticated roles need citizen search

DROP POLICY IF EXISTS citizens_write_extended ON citizens;
CREATE POLICY citizens_write_extended ON citizens
  FOR INSERT TO authenticated
  WITH CHECK (is_officer() OR is_commander() OR is_investigator() OR current_user_role() = 'admin');

-- Vehicles: all roles can search, but only officers/commanders write
DROP POLICY IF EXISTS vehicles_select_extended ON vehicles;
CREATE POLICY vehicles_select_extended ON vehicles
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS vehicles_write_extended ON vehicles;
CREATE POLICY vehicles_write_extended ON vehicles
  FOR INSERT TO authenticated
  WITH CHECK (is_officer() OR is_commander() OR current_user_role() = 'admin');

