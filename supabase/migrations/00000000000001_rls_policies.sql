-- ===== TZ Police Digital Platform — Migration 00000000000001_rls_policies =====
-- Row-Level Security policies for every table.
-- Principle: DENY BY DEFAULT, allow explicitly.
--
-- Role hierarchy:
--   commander > admin > officer-traffic, officer-general
--
-- Helper inline views (defined as SECURITY DEFINER functions in migration
-- 00000000000002_rbac_functions.sql) cannot be referenced here because they
-- are created later. Instead, every policy resolves the current user's role
-- by joining `users` directly. These policies remain valid even after the
-- RBAC functions exist.

-- ===== Helper: current user's id + role (defined as SECURITY DEFINER below) =====
-- We use `auth.uid()` (Supabase built-in) plus a join to `users`.
-- For server-side service-role clients, RLS is bypassed entirely.

-- ============================================================
-- USERS
-- ============================================================
-- Users can read their own profile; admins/commanders can read all.
DROP POLICY IF EXISTS users_select_self_or_admin ON users;
CREATE POLICY users_select_self_or_admin ON users
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

-- A user may update only their own profile (e.g. avatar, phone).
DROP POLICY IF EXISTS users_update_self ON users;
CREATE POLICY users_update_self ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only admins/commanders may insert or delete users.
DROP POLICY IF EXISTS users_insert_admin ON users;
CREATE POLICY users_insert_admin ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

DROP POLICY IF EXISTS users_delete_admin ON users;
CREATE POLICY users_delete_admin ON users
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

-- ============================================================
-- OFFICERS
-- ============================================================
-- Officers read their own row; admins/commanders read all;
-- officers can also read peers within their station (for assignment lists).
DROP POLICY IF EXISTS officers_select_scope ON officers;
CREATE POLICY officers_select_scope ON officers
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
    OR (
      -- same-station read
      station_id IS NOT NULL
      AND station_id = (
        SELECT o2.station_id FROM officers o2
        WHERE o2.user_id = auth.uid() LIMIT 1
      )
    )
  );

DROP POLICY IF EXISTS officers_insert_admin ON officers;
CREATE POLICY officers_insert_admin ON officers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

DROP POLICY IF EXISTS officers_update_admin ON officers;
CREATE POLICY officers_update_admin ON officers
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

DROP POLICY IF EXISTS officers_delete_admin ON officers;
CREATE POLICY officers_delete_admin ON officers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'commander')
    )
  );

-- ============================================================
-- STATIONS — read: authenticated; write: admins/commanders only
-- ============================================================
DROP POLICY IF EXISTS stations_select_all ON stations;
CREATE POLICY stations_select_all ON stations
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS stations_write_admin ON stations;
CREATE POLICY stations_write_admin ON stations
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- POSTS — same model as stations
-- ============================================================
DROP POLICY IF EXISTS posts_select_all ON posts;
CREATE POLICY posts_select_all ON posts
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS posts_write_admin ON posts;
CREATE POLICY posts_write_admin ON posts
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- ASSIGNMENTS — same model as stations
-- ============================================================
DROP POLICY IF EXISTS assignments_select_all ON assignments;
CREATE POLICY assignments_select_all ON assignments
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS assignments_write_admin ON assignments;
CREATE POLICY assignments_write_admin ON assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- VEHICLES / DRIVERS / CITIZENS — read: all authenticated; write: admins/commanders
-- (Lookup tables; officers need read access for searches.)
-- ============================================================
DROP POLICY IF EXISTS vehicles_select_all ON vehicles;
CREATE POLICY vehicles_select_all ON vehicles
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS vehicles_write_admin ON vehicles;
CREATE POLICY vehicles_write_admin ON vehicles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS drivers_select_all ON drivers;
CREATE POLICY drivers_select_all ON drivers
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS drivers_write_admin ON drivers;
CREATE POLICY drivers_write_admin ON drivers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS citizens_select_all ON citizens;
CREATE POLICY citizens_select_all ON citizens
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS citizens_write_admin ON citizens;
CREATE POLICY citizens_write_admin ON citizens
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- CITATIONS
-- Officers can read/create citations issued by them; admins/commanders read all.
-- ============================================================
DROP POLICY IF EXISTS citations_select_scope ON citations;
CREATE POLICY citations_select_scope ON citations
  FOR SELECT TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS citations_insert_officer ON citations;
CREATE POLICY citations_insert_officer ON citations
  FOR INSERT TO authenticated
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS citations_update_scope ON citations;
CREATE POLICY citations_update_scope ON citations
  FOR UPDATE TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS citations_delete_admin ON citations;
CREATE POLICY citations_delete_admin ON citations
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- INCIDENTS
-- Officers can read/create incidents assigned to them; admins/commanders all.
-- ============================================================
DROP POLICY IF EXISTS incidents_select_scope ON incidents;
CREATE POLICY incidents_select_scope ON incidents
  FOR SELECT TO authenticated
  USING (
    assigned_officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR assigned_officer_id IS NULL -- unassigned incidents visible to all officers for self-assignment
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS incidents_insert_officer ON incidents;
CREATE POLICY incidents_insert_officer ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    assigned_officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR assigned_officer_id IS NULL
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS incidents_update_scope ON incidents;
CREATE POLICY incidents_update_scope ON incidents
  FOR UPDATE TO authenticated
  USING (
    assigned_officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    assigned_officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR assigned_officer_id IS NULL
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS incidents_delete_admin ON incidents;
CREATE POLICY incidents_delete_admin ON incidents
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- PATROLS
-- Officers read/manage their own patrols; admins/commanders all.
-- ============================================================
DROP POLICY IF EXISTS patrols_select_scope ON patrols;
CREATE POLICY patrols_select_scope ON patrols
  FOR SELECT TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS patrols_insert_officer ON patrols;
CREATE POLICY patrols_insert_officer ON patrols
  FOR INSERT TO authenticated
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS patrols_update_scope ON patrols;
CREATE POLICY patrols_update_scope ON patrols
  FOR UPDATE TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS patrols_delete_admin ON patrols;
CREATE POLICY patrols_delete_admin ON patrols
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- ALERTS
-- All authenticated users can read alerts; only commanders can send broadcasts
-- (admins may also delete/mute to manage abuse).
-- ============================================================
DROP POLICY IF EXISTS alerts_select_all ON alerts;
CREATE POLICY alerts_select_all ON alerts
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS alerts_insert_commander ON alerts;
CREATE POLICY alerts_insert_commander ON alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('commander', 'admin')
    )
    AND COALESCE(sent_by, auth.uid()) = auth.uid()
  );

DROP POLICY IF EXISTS alerts_update_admin ON alerts;
CREATE POLICY alerts_update_admin ON alerts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('commander', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('commander', 'admin'))
  );

DROP POLICY IF EXISTS alerts_delete_commander ON alerts;
CREATE POLICY alerts_delete_commander ON alerts
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('commander', 'admin'))
  );

-- ============================================================
-- PF3 FORMS
-- Officers read/create their own forms; admins/commanders all.
-- ============================================================
DROP POLICY IF EXISTS pf3_forms_select_scope ON pf3_forms;
CREATE POLICY pf3_forms_select_scope ON pf3_forms
  FOR SELECT TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS pf3_forms_insert_officer ON pf3_forms;
CREATE POLICY pf3_forms_insert_officer ON pf3_forms
  FOR INSERT TO authenticated
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS pf3_forms_update_scope ON pf3_forms;
CREATE POLICY pf3_forms_update_scope ON pf3_forms
  FOR UPDATE TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS pf3_forms_delete_admin ON pf3_forms;
CREATE POLICY pf3_forms_delete_admin ON pf3_forms
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- VEHICLE INSPECTIONS
-- Officers read/create their own inspections; admins/commanders all.
-- ============================================================
DROP POLICY IF EXISTS inspections_select_scope ON vehicle_inspections;
CREATE POLICY inspections_select_scope ON vehicle_inspections
  FOR SELECT TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS inspections_insert_officer ON vehicle_inspections;
CREATE POLICY inspections_insert_officer ON vehicle_inspections
  FOR INSERT TO authenticated
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS inspections_update_scope ON vehicle_inspections;
CREATE POLICY inspections_update_scope ON vehicle_inspections
  FOR UPDATE TO authenticated
  USING (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  )
  WITH CHECK (
    officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS inspections_delete_admin ON vehicle_inspections;
CREATE POLICY inspections_delete_admin ON vehicle_inspections
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

-- ============================================================
-- AUDIT LOGS — only admins/commanders can read.
-- INSERT is allowed for any authenticated user (the trigger fills user_id);
-- UPDATE/DELETE are blocked entirely (immutable trail).
-- ============================================================
DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'commander'))
  );

DROP POLICY IF EXISTS audit_logs_insert_any ON audit_logs;
CREATE POLICY audit_logs_insert_any ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- No UPDATE or DELETE policies => immutable by default.
