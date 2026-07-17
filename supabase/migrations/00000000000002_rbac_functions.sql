-- ===== TZ Police Digital Platform — Migration 00000000000002_rbac_functions =====
-- PostgreSQL helper functions for Role-Based Access Control.
-- All are SECURITY DEFINER + SET search_path to prevent search-path injection.
-- These complement (but do not replace) the RLS policies defined in
-- 00000000000001_rls_policies.sql — application code and edge functions may
-- call them to perform authorization checks before/after queries.

-- ============================================================
-- 1. has_role(user_uuid, role_name) → boolean
--    Returns TRUE if the given user has the specified role.
--    `role_name` accepts a single role or comma-separated list
--    e.g. has_role(auth.uid(), 'admin,commander')
-- ============================================================
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = user_uuid
      AND (
        role::text = ANY(string_to_array(role_name, ','))
      )
  );
$$;

COMMENT ON FUNCTION has_role IS 'Returns TRUE if user_uuid has any of the comma-separated roles in role_name';

-- ============================================================
-- 2. can_access_resource(user_uuid, resource, action) → boolean
--    High-level permission check.
--    resource ∈ {users, officers, stations, posts, assignments,
--                vehicles, drivers, citizens, citations, incidents,
--                patrols, alerts, pf3_forms, vehicle_inspections, audit_logs}
--    action   ∈ {read, create, update, delete, broadcast, manage}
-- ============================================================
CREATE OR REPLACE FUNCTION can_access_resource(user_uuid UUID, resource TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Resolve the caller's role
  SELECT role INTO v_role FROM users WHERE id = user_uuid;
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- ===== Commanders can do anything =====
  IF v_role = 'commander' THEN
    RETURN TRUE;
  END IF;

  -- ===== Admins: full CRUD on lookup/management tables, no broadcasts =====
  IF v_role = 'admin' THEN
    IF action = 'broadcast' THEN
      RETURN FALSE;
    END IF;
    IF resource IN ('stations', 'posts', 'assignments', 'users', 'audit_logs') THEN
      RETURN TRUE;
    END IF;
    IF resource IN ('officers', 'vehicles', 'drivers', 'citizens',
                    'citations', 'incidents', 'patrols',
                    'pf3_forms', 'vehicle_inspections', 'alerts') THEN
      RETURN action IN ('read', 'create', 'update', 'delete', 'manage');
    END IF;
    RETURN FALSE;
  END IF;

  -- ===== Officer-traffic / officer-general =====
  IF v_role IN ('officer-traffic', 'officer-general') THEN
    IF resource IN ('vehicles', 'drivers', 'citizens', 'stations', 'posts') AND action = 'read' THEN
      RETURN TRUE;
    END IF;
    IF resource = 'citations' AND action IN ('read', 'create', 'update') THEN
      RETURN TRUE;
    END IF;
    IF resource = 'incidents' AND action IN ('read', 'create', 'update') THEN
      RETURN TRUE;
    END IF;
    IF resource = 'patrols' AND action IN ('read', 'create', 'update') THEN
      RETURN TRUE;
    END IF;
    IF resource = 'pf3_forms' AND action IN ('read', 'create', 'update') THEN
      RETURN TRUE;
    END IF;
    IF resource = 'vehicle_inspections' AND action IN ('read', 'create', 'update') THEN
      RETURN TRUE;
    END IF;
    IF resource = 'alerts' AND action = 'read' THEN
      RETURN TRUE;
    END IF;
    IF resource = 'officers' AND action = 'read' THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;

  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION can_access_resource IS
  'High-level RBAC check. Commander = all; admin = CRUD except broadcast; officer = scoped CRUD on operational tables.';

-- ============================================================
-- 3. get_user_station(user_uuid) → UUID
--    Returns the station_id associated with the user (via users.station_id
--    or their officer record). NULL if not assigned.
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_station(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT station_id FROM users WHERE id = user_uuid),
    (SELECT station_id FROM officers WHERE user_id = user_uuid LIMIT 1)
  );
$$;

COMMENT ON FUNCTION get_user_station IS 'Returns the station_id for the given user (users.station_id falls back to officers.station_id)';

-- ============================================================
-- 4. is_officer_assigned(officer_uuid, station_uuid) → boolean
--    Returns TRUE if the officer has an ACTIVE assignment at the station.
-- ============================================================
CREATE OR REPLACE FUNCTION is_officer_assigned(officer_uuid UUID, station_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM assignments a
    JOIN officers o ON o.id = a.officer_id
    WHERE o.id = officer_uuid
      AND a.station_id = station_uuid
      AND a.status = 'active'
  )
   OR EXISTS (
    SELECT 1 FROM officers o
    WHERE o.id = officer_uuid
      AND o.station_id = station_uuid
   );
$$;

COMMENT ON FUNCTION is_officer_assigned IS 'TRUE if officer has an active assignment at the given station';

-- ============================================================
-- 5. current_user_role() — convenience wrapper around auth.uid()
--    Returns the role of the authenticated user, or NULL.
-- ============================================================
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION current_user_role IS 'Returns the role of the authenticated user, or NULL';

-- ============================================================
-- 6. is_admin_or_commander() — convenience predicate
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin_or_commander()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin,commander');
$$;

COMMENT ON FUNCTION is_admin_or_commander IS 'TRUE if the authenticated user is admin or commander';
