-- ===== TZ Police Digital Platform — Migration 00000000000003_triggers =====
-- Database triggers:
--   * update_updated_at()           — auto-update updated_at on UPDATE
--   * create_audit_log()            — log INSERT/UPDATE/DELETE on key tables
--   * assign_citation_number()      — auto-generate citation number on INSERT
--   * assign_incident_number()      — auto-generate incident number on INSERT
--   * assign_patrol_number()        — bonus: auto-generate patrol number on INSERT
--   * auto_assign_pf3_reference()   — bonus: auto-generate PF3 reference on INSERT

-- ============================================================
-- 1. update_updated_at()
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at IS 'Sets NEW.updated_at = NOW() before UPDATE';

-- Apply to every table that has an updated_at column.
DROP TRIGGER IF EXISTS update_users_updated_at               ON users;
CREATE TRIGGER  update_users_updated_at               BEFORE UPDATE ON users               FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_stations_updated_at           ON stations;
CREATE TRIGGER  update_stations_updated_at           BEFORE UPDATE ON stations           FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_posts_updated_at             ON posts;
CREATE TRIGGER  update_posts_updated_at             BEFORE UPDATE ON posts             FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_officers_updated_at           ON officers;
CREATE TRIGGER  update_officers_updated_at           BEFORE UPDATE ON officers           FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_assignments_updated_at        ON assignments;
CREATE TRIGGER  update_assignments_updated_at        BEFORE UPDATE ON assignments        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_vehicles_updated_at           ON vehicles;
CREATE TRIGGER  update_vehicles_updated_at           BEFORE UPDATE ON vehicles           FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_citizens_updated_at           ON citizens;
CREATE TRIGGER  update_citizens_updated_at           BEFORE UPDATE ON citizens           FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_citations_updated_at          ON citations;
CREATE TRIGGER  update_citations_updated_at          BEFORE UPDATE ON citations          FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_incidents_updated_at          ON incidents;
CREATE TRIGGER  update_incidents_updated_at          BEFORE UPDATE ON incidents          FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_pf3_forms_updated_at          ON pf3_forms;
CREATE TRIGGER  update_pf3_forms_updated_at          BEFORE UPDATE ON pf3_forms          FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- patrols and vehicle_inspections do not have updated_at by design (append-only).

-- ============================================================
-- 2. create_audit_log()
--    Generic trigger function that writes a row to audit_logs for any table.
--    Use: CREATE TRIGGER ... AFTER INSERT OR UPDATE OR DELETE ON <table>
--         FOR EACH ROW EXECUTE FUNCTION create_audit_log();
-- ============================================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_action  TEXT;
  v_row_id  UUID;
  v_details JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_row_id := (CASE WHEN TG_TABLE_NAME = 'audit_logs' THEN NULL ELSE (NEW).id END);
    v_details := jsonb_build_object('after', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_row_id := (NEW).id;
    v_details := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_row_id := OLD.id;
    v_details := jsonb_build_object('before', to_jsonb(OLD));
  END IF;

  INSERT INTO audit_logs (user_id, action, resource, resource_id, details)
  VALUES (v_user_id, v_action, TG_TABLE_NAME, v_row_id, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION create_audit_log IS 'Generic audit logger. Reads TG_OP/TG_TABLE_NAME and writes one audit_logs row per change.';

-- Attach to key tables (NOT audit_logs itself, to avoid recursion).
DROP TRIGGER IF EXISTS audit_users        ON users;
CREATE TRIGGER  audit_users        AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_officers     ON officers;
CREATE TRIGGER  audit_officers     AFTER INSERT OR UPDATE OR DELETE ON officers
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_stations     ON stations;
CREATE TRIGGER  audit_stations     AFTER INSERT OR UPDATE OR DELETE ON stations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_posts        ON posts;
CREATE TRIGGER  audit_posts        AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_assignments  ON assignments;
CREATE TRIGGER  audit_assignments  AFTER INSERT OR UPDATE OR DELETE ON assignments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_citations    ON citations;
CREATE TRIGGER  audit_citations    AFTER INSERT OR UPDATE OR DELETE ON citations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_incidents    ON incidents;
CREATE TRIGGER  audit_incidents    AFTER INSERT OR UPDATE OR DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_patrols      ON patrols;
CREATE TRIGGER  audit_patrols      AFTER INSERT OR UPDATE OR DELETE ON patrols
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_alerts       ON alerts;
CREATE TRIGGER  audit_alerts       AFTER INSERT OR UPDATE OR DELETE ON alerts
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_pf3_forms    ON pf3_forms;
CREATE TRIGGER  audit_pf3_forms    AFTER INSERT OR UPDATE OR DELETE ON pf3_forms
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_inspections  ON vehicle_inspections;
CREATE TRIGGER  audit_inspections  AFTER INSERT OR UPDATE OR DELETE ON vehicle_inspections
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================================
-- 3. assign_citation_number()
--    Auto-generate citation_number if NULL on INSERT.
--    Format: CT-YYYY-NNNN  (zero-padded, year-based sequence)
-- ============================================================
CREATE OR REPLACE FUNCTION assign_citation_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year  INT := EXTRACT(YEAR FROM NOW())::INT;
  v_count INT;
  v_num   TEXT;
BEGIN
  IF NEW.citation_number IS NULL OR NEW.citation_number = '' THEN
    SELECT COALESCE(MAX(
      COALESCE(NULLIF(regexp_replace(citation_number, '\D', '', 'g'), '')::int, 0)
    ), 0) + 1
    INTO v_count
    FROM citations
    WHERE citation_number LIKE 'CT-' || v_year || '-%';

    v_num := lpad(v_count::text, 4, '0');
    NEW.citation_number := 'CT-' || v_year || '-' || v_num;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION assign_citation_number IS 'Auto-generates CT-YYYY-NNNN citation_number on INSERT when NULL';

DROP TRIGGER IF EXISTS trg_assign_citation_number ON citations;
CREATE TRIGGER  trg_assign_citation_number
  BEFORE INSERT ON citations
  FOR EACH ROW EXECUTE FUNCTION assign_citation_number();

-- ============================================================
-- 4. assign_incident_number()
--    Auto-generate incident_number if NULL on INSERT.
--    Format: INC-YYYY-NNNN
-- ============================================================
CREATE OR REPLACE FUNCTION assign_incident_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year  INT := EXTRACT(YEAR FROM NOW())::INT;
  v_count INT;
  v_num   TEXT;
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    SELECT COALESCE(MAX(
      COALESCE(NULLIF(regexp_replace(incident_number, '\D', '', 'g'), '')::int, 0)
    ), 0) + 1
    INTO v_count
    FROM incidents
    WHERE incident_number LIKE 'INC-' || v_year || '-%';

    v_num := lpad(v_count::text, 4, '0');
    NEW.incident_number := 'INC-' || v_year || '-' || v_num;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION assign_incident_number IS 'Auto-generates INC-YYYY-NNNN incident_number on INSERT when NULL';

DROP TRIGGER IF EXISTS trg_assign_incident_number ON incidents;
CREATE TRIGGER  trg_assign_incident_number
  BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION assign_incident_number();

-- ============================================================
-- 5. assign_patrol_number() — bonus, follows same convention.
-- ============================================================
CREATE OR REPLACE FUNCTION assign_patrol_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year  INT := EXTRACT(YEAR FROM NOW())::INT;
  v_count INT;
  v_num   TEXT;
BEGIN
  IF NEW.patrol_number IS NULL OR NEW.patrol_number = '' THEN
    SELECT COALESCE(MAX(
      COALESCE(NULLIF(regexp_replace(patrol_number, '\D', '', 'g'), '')::int, 0)
    ), 0) + 1
    INTO v_count
    FROM patrols
    WHERE patrol_number LIKE 'PT-' || v_year || '-%';

    v_num := lpad(v_count::text, 4, '0');
    NEW.patrol_number := 'PT-' || v_year || '-' || v_num;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_patrol_number ON patrols;
CREATE TRIGGER  trg_assign_patrol_number
  BEFORE INSERT ON patrols
  FOR EACH ROW EXECUTE FUNCTION assign_patrol_number();

-- ============================================================
-- 6. auto_assign_pf3_reference() — bonus, follows same convention.
-- ============================================================
CREATE OR REPLACE FUNCTION auto_assign_pf3_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year  INT := EXTRACT(YEAR FROM NOW())::INT;
  v_count INT;
  v_num   TEXT;
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    SELECT COALESCE(MAX(
      COALESCE(NULLIF(regexp_replace(reference_number, '\D', '', 'g'), '')::int, 0)
    ), 0) + 1
    INTO v_count
    FROM pf3_forms
    WHERE reference_number LIKE 'PF3/DSM/' || v_year || '/%';

    v_num := lpad(v_count::text, 5, '0');
    NEW.reference_number := 'PF3/DSM/' || v_year || '/' || v_num;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_pf3_reference ON pf3_forms;
CREATE TRIGGER  trg_assign_pf3_reference
  BEFORE INSERT ON pf3_forms
  FOR EACH ROW EXECUTE FUNCTION auto_assign_pf3_reference();
