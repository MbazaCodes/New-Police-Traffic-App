-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — DB FUNCTIONS v2
-- Migration: 00000000000010_db_functions_v2
-- All PostgreSQL functions the app calls via .rpc()
-- Covers: auth, search, citations, incidents, arrests,
--         patrols, dashboard, OTP, missing, wanted, devices
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. OTP FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Upsert OTP code (called by send-otp edge function)
CREATE OR REPLACE FUNCTION upsert_otp_code(
  p_identifier  TEXT,
  p_code        TEXT,
  p_expires_at  TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Invalidate any existing codes for this identifier
  UPDATE otp_codes
  SET consumed_at = NOW()
  WHERE identifier = p_identifier AND consumed_at IS NULL;

  -- Insert the new code
  INSERT INTO otp_codes (identifier, code, expires_at)
  VALUES (p_identifier, p_code, p_expires_at);
END;
$$;

-- Verify OTP (called by verify-otp edge function and /api/auth/verify-otp)
CREATE OR REPLACE FUNCTION verify_otp_code(
  p_identifier TEXT,
  p_code       TEXT
)
RETURNS TABLE (
  ok        BOOLEAN,
  message   TEXT,
  user_id   UUID,
  user_role TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_otp  otp_codes;
  v_user users;
BEGIN
  -- Find the most recent unused, unexpired code
  SELECT * INTO v_otp
  FROM otp_codes
  WHERE identifier   = p_identifier
    AND consumed_at  IS NULL
    AND expires_at   > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- Demo/bypass mode: any 6-digit code is valid
    IF p_code ~ '^\d{6}$' THEN
      SELECT * INTO v_user
      FROM users
      WHERE username = p_identifier
         OR phone    = p_identifier
         OR email    = p_identifier
         OR badge_no = p_identifier
      LIMIT 1;

      RETURN QUERY SELECT
        TRUE,
        'demo_bypass',
        v_user.id,
        v_user.role::TEXT;
      RETURN;
    END IF;

    RETURN QUERY SELECT FALSE, 'no_active_otp', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Check code matches
  IF v_otp.code <> p_code THEN
    RETURN QUERY SELECT FALSE, 'invalid_code', NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Mark consumed
  UPDATE otp_codes SET consumed_at = NOW() WHERE id = v_otp.id;

  -- Resolve user
  SELECT * INTO v_user
  FROM users
  WHERE username = p_identifier
     OR phone    = p_identifier
     OR email    = p_identifier
     OR badge_no = p_identifier
  LIMIT 1;

  RETURN QUERY SELECT
    TRUE,
    'ok',
    v_user.id,
    v_user.role::TEXT;
END;
$$;

-- Cleanup expired OTP codes (call this from a cron job or periodic trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2. AUTHENTICATION HELPERS
-- ═══════════════════════════════════════════════════════════════

-- Resolve user by any identifier (username, phone, email, badge_no)
CREATE OR REPLACE FUNCTION resolve_user(p_identifier TEXT)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  short_name  TEXT,
  rank        TEXT,
  rank_short  TEXT,
  role        TEXT,
  badge_no    TEXT,
  username    TEXT,
  phone       TEXT,
  email       TEXT,
  station_id  UUID,
  region      TEXT,
  unit        TEXT,
  photo_url   TEXT,
  status      TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_clean TEXT := TRIM(p_identifier);
BEGIN
  RETURN QUERY
  SELECT
    u.id, u.name, u.short_name, u.rank, u.rank_short,
    u.role::TEXT, u.badge_no, u.username, u.phone, u.email,
    u.station_id, u.region, u.unit, u.photo_url, u.status::TEXT
  FROM users u
  WHERE u.username = v_clean
     OR REPLACE(u.phone, ' ', '') = REPLACE(v_clean, ' ', '')
     OR u.email    = LOWER(v_clean)
     OR u.badge_no = UPPER(v_clean)
  LIMIT 1;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. SEARCH FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Universal citizen search (called by /api/search/citizen)
CREATE OR REPLACE FUNCTION search_citizen(
  p_query TEXT,
  p_type  TEXT DEFAULT 'name'  -- 'name' | 'nida' | 'mobile' | 'license'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_citizen       citizens;
  v_license       licenses;
  v_vehicles      JSONB;
  v_licenses      JSONB;
  v_criminal      JSONB;
  v_wanted        BOOLEAN;
  v_risk_level    TEXT;
BEGIN
  -- Find citizen
  IF p_type = 'license' THEN
    SELECT c.* INTO v_citizen
    FROM citizens c
    JOIN licenses l ON l.citizen_id = c.id
    WHERE UPPER(REPLACE(l.license_no, ' ', '')) = UPPER(REPLACE(p_query, ' ', ''))
    LIMIT 1;
  ELSIF p_type = 'nida' THEN
    SELECT * INTO v_citizen FROM citizens
    WHERE nida = TRIM(p_query) LIMIT 1;
  ELSIF p_type = 'mobile' THEN
    SELECT * INTO v_citizen FROM citizens
    WHERE REPLACE(mobile, ' ', '') = REPLACE(TRIM(p_query), ' ', '') LIMIT 1;
  ELSE
    -- Fuzzy name search using pg_trgm
    SELECT * INTO v_citizen FROM citizens
    WHERE name ILIKE '%' || TRIM(p_query) || '%'
       OR (first_name || ' ' || last_name) ILIKE '%' || TRIM(p_query) || '%'
    ORDER BY similarity(name, p_query) DESC
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  -- Collect related data
  SELECT jsonb_agg(jsonb_build_object(
    'plate', v.plate, 'model', v.model, 'color', v.color,
    'year', v.year, 'outstanding_fines', v.outstanding_fines
  )) INTO v_vehicles
  FROM vehicles v WHERE v.owner_citizen_id = v_citizen.id;

  SELECT jsonb_agg(jsonb_build_object(
    'license_no', l.license_no, 'class', l.class,
    'expires_at', l.expires_at, 'status', l.status
  )) INTO v_licenses
  FROM licenses l WHERE l.citizen_id = v_citizen.id;

  SELECT jsonb_agg(jsonb_build_object(
    'case_no', cr.case_no, 'type', cr.type,
    'date', cr.date, 'outcome', cr.outcome
  ) ORDER BY cr.date DESC) INTO v_criminal
  FROM criminal_records cr WHERE cr.citizen_id = v_citizen.id;

  SELECT EXISTS(
    SELECT 1 FROM wanted w WHERE w.citizen_id = v_citizen.id AND w.active = TRUE
  ) INTO v_wanted;

  -- Risk level based on score
  v_risk_level := CASE
    WHEN v_citizen.risk_score > 70 THEN 'high'
    WHEN v_citizen.risk_score > 40 THEN 'medium'
    ELSE 'low'
  END;

  RETURN jsonb_build_object(
    'found',            true,
    'citizen',          to_jsonb(v_citizen),
    'vehicles',         COALESCE(v_vehicles, '[]'::jsonb),
    'licenses',         COALESCE(v_licenses, '[]'::jsonb),
    'criminal_records', COALESCE(v_criminal, '[]'::jsonb),
    'wanted',           v_wanted,
    'risk_level',       v_risk_level
  );
END;
$$;

-- Vehicle search with owner + violation history
CREATE OR REPLACE FUNCTION search_vehicle(p_plate TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_vehicle   vehicles;
  v_owner     JSONB;
  v_citations JSONB;
  v_inspections JSONB;
  v_wanted    BOOLEAN;
BEGIN
  SELECT * INTO v_vehicle
  FROM vehicles
  WHERE UPPER(REPLACE(plate, ' ', '')) = UPPER(REPLACE(TRIM(p_plate), ' ', ''))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  -- Owner
  SELECT to_jsonb(c.*) INTO v_owner
  FROM citizens c WHERE c.id = v_vehicle.owner_citizen_id;

  -- Citations history
  SELECT jsonb_agg(jsonb_build_object(
    'id', ct.id, 'citation_number', ct.citation_number,
    'offense', ct.offense, 'amount', ct.amount,
    'date', ct.date, 'status', ct.status
  ) ORDER BY ct.date DESC) INTO v_citations
  FROM citations ct WHERE ct.plate = v_vehicle.plate;

  -- Inspections
  SELECT jsonb_agg(jsonb_build_object(
    'id', vi.id, 'result', vi.result,
    'inspection_date', vi.inspection_date
  ) ORDER BY vi.inspection_date DESC) INTO v_inspections
  FROM vehicle_inspections vi WHERE vi.plate = v_vehicle.plate;

  -- Is it reported stolen/missing?
  SELECT EXISTS(
    SELECT 1 FROM missing_records mr
    WHERE mr.identifier ILIKE '%' || v_vehicle.plate || '%'
      AND mr.status = 'active' AND mr.type = 'car'
  ) INTO v_wanted;

  RETURN jsonb_build_object(
    'found',       true,
    'vehicle',     to_jsonb(v_vehicle),
    'owner',       COALESCE(v_owner, 'null'::jsonb),
    'citations',   COALESCE(v_citations, '[]'::jsonb),
    'inspections', COALESCE(v_inspections, '[]'::jsonb),
    'missing',     v_wanted
  );
END;
$$;

-- Device search by serial or IMEI
CREATE OR REPLACE FUNCTION search_device(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_device devices;
  v_owner  JSONB;
BEGIN
  SELECT * INTO v_device
  FROM devices
  WHERE serial_no ILIKE '%' || TRIM(p_query) || '%'
     OR imei = TRIM(p_query)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT to_jsonb(c.*) INTO v_owner
  FROM citizens c WHERE c.id = v_device.owner_citizen_id;

  RETURN jsonb_build_object(
    'found',  true,
    'device', to_jsonb(v_device),
    'owner',  COALESCE(v_owner, 'null'::jsonb)
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4. DASHBOARD STATS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_role        TEXT,
  p_region      TEXT DEFAULT NULL,
  p_station_id  UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_officers_total  INT := 0;
  v_officers_active INT := 0;
  v_citations_today INT := 0;
  v_incidents_today INT := 0;
  v_arrests_total   INT := 0;
  v_warnings_total  INT := 0;
  v_missing_active  INT := 0;
  v_detained_total  INT := 0;
  v_patrols_active  INT := 0;
  v_traffic_total   INT := 0;
  v_general_total   INT := 0;
  v_stations_total  INT := 0;
  v_today           DATE := CURRENT_DATE;
BEGIN
  -- Scope by level
  IF p_station_id IS NOT NULL THEN
    SELECT COUNT(*)       INTO v_officers_total FROM officers  WHERE station_id = p_station_id;
    SELECT COUNT(*)       INTO v_officers_active FROM officers WHERE station_id = p_station_id AND status = 'active';
    SELECT COUNT(*)       INTO v_citations_today FROM citations WHERE station_id = p_station_id AND date = v_today;
    SELECT COUNT(*)       INTO v_arrests_total   FROM arrests   WHERE station_id = p_station_id;
    SELECT COUNT(*)       INTO v_detained_total  FROM arrests   WHERE station_id = p_station_id AND status = 'held';
    SELECT COUNT(*)       INTO v_traffic_total   FROM citations WHERE station_id = p_station_id AND citation_type = 'traffic';
    SELECT COUNT(*)       INTO v_patrols_active  FROM patrols   WHERE officer_id IN (SELECT id FROM officers WHERE station_id = p_station_id) AND status = 'active';
    v_stations_total := 1;

  ELSIF p_region IS NOT NULL THEN
    SELECT COUNT(*)       INTO v_officers_total FROM officers o JOIN stations s ON s.id = o.station_id WHERE s.region = p_region;
    SELECT COUNT(*)       INTO v_officers_active FROM officers o JOIN stations s ON s.id = o.station_id WHERE s.region = p_region AND o.status = 'active';
    SELECT COUNT(*)       INTO v_citations_today FROM citations c JOIN stations s ON s.id = c.station_id WHERE s.region = p_region AND c.date = v_today;
    SELECT COUNT(*)       INTO v_arrests_total   FROM arrests   a JOIN stations s ON s.id = a.station_id WHERE s.region = p_region;
    SELECT COUNT(*)       INTO v_detained_total  FROM arrests   a JOIN stations s ON s.id = a.station_id WHERE s.region = p_region AND a.status = 'held';
    SELECT COUNT(*)       INTO v_traffic_total   FROM citations c JOIN stations s ON s.id = c.station_id WHERE s.region = p_region AND c.citation_type = 'traffic';
    SELECT COUNT(*)       INTO v_stations_total  FROM stations WHERE region = p_region;

  ELSE -- national
    SELECT COUNT(*) INTO v_officers_total FROM officers;
    SELECT COUNT(*) INTO v_officers_active FROM officers WHERE status = 'active';
    SELECT COUNT(*) INTO v_citations_today FROM citations WHERE date = v_today;
    SELECT COUNT(*) INTO v_incidents_today FROM incidents WHERE date = v_today;
    SELECT COUNT(*) INTO v_arrests_total   FROM arrests;
    SELECT COUNT(*) INTO v_warnings_total  FROM warnings;
    SELECT COUNT(*) INTO v_detained_total  FROM arrests WHERE status = 'held';
    SELECT COUNT(*) INTO v_traffic_total   FROM citations WHERE citation_type = 'traffic';
    SELECT COUNT(*) INTO v_general_total   FROM incidents;
    SELECT COUNT(*) INTO v_patrols_active  FROM patrols WHERE status = 'active';
    SELECT COUNT(*) INTO v_stations_total  FROM stations WHERE status = 'active';
  END IF;

  SELECT COUNT(*) INTO v_missing_active FROM missing_records WHERE status = 'active';

  RETURN jsonb_build_object(
    'officers_total',    v_officers_total,
    'officers_active',   v_officers_active,
    'citations_today',   v_citations_today,
    'incidents_today',   v_incidents_today,
    'arrests_total',     v_arrests_total,
    'warnings_total',    v_warnings_total,
    'missing_active',    v_missing_active,
    'detained_total',    v_detained_total,
    'patrols_active',    v_patrols_active,
    'traffic_total',     v_traffic_total,
    'general_total',     v_general_total,
    'stations_total',    v_stations_total,
    'generated_at',      NOW()
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5. CITATION FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Auto-number citations
CREATE SEQUENCE IF NOT EXISTS citation_seq START 1001;

CREATE OR REPLACE FUNCTION auto_citation_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.citation_number IS NULL OR NEW.citation_number = '' THEN
    NEW.citation_number := 'CT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                           LPAD(nextval('citation_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_citation_number ON citations;
CREATE TRIGGER tg_citation_number
  BEFORE INSERT ON citations
  FOR EACH ROW EXECUTE FUNCTION auto_citation_number();

-- Update vehicle outstanding_fines when citation inserted/updated
CREATE OR REPLACE FUNCTION sync_vehicle_fines()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE vehicles
  SET outstanding_fines = (
    SELECT COALESCE(SUM(amount), 0)
    FROM citations
    WHERE plate = NEW.plate AND status = 'unpaid'
  )
  WHERE UPPER(REPLACE(plate, ' ', '')) = UPPER(REPLACE(NEW.plate, ' ', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_sync_vehicle_fines ON citations;
CREATE TRIGGER tg_sync_vehicle_fines
  AFTER INSERT OR UPDATE ON citations
  FOR EACH ROW EXECUTE FUNCTION sync_vehicle_fines();

-- Get citations summary by type for a given scope
CREATE OR REPLACE FUNCTION get_citations_summary(
  p_station_id UUID DEFAULT NULL,
  p_region     TEXT DEFAULT NULL,
  p_date_from  DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_date_to    DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_total   INT; v_paid INT; v_unpaid INT; v_total_fines BIGINT;
BEGIN
  IF p_station_id IS NOT NULL THEN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status='paid'),
           COUNT(*) FILTER (WHERE status='unpaid'), COALESCE(SUM(amount),0)
    INTO v_total, v_paid, v_unpaid, v_total_fines
    FROM citations WHERE station_id = p_station_id
      AND date BETWEEN p_date_from AND p_date_to;
  ELSIF p_region IS NOT NULL THEN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE c.status='paid'),
           COUNT(*) FILTER (WHERE c.status='unpaid'), COALESCE(SUM(c.amount),0)
    INTO v_total, v_paid, v_unpaid, v_total_fines
    FROM citations c JOIN stations s ON s.id = c.station_id
    WHERE s.region = p_region AND c.date BETWEEN p_date_from AND p_date_to;
  ELSE
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status='paid'),
           COUNT(*) FILTER (WHERE status='unpaid'), COALESCE(SUM(amount),0)
    INTO v_total, v_paid, v_unpaid, v_total_fines
    FROM citations WHERE date BETWEEN p_date_from AND p_date_to;
  END IF;
  RETURN jsonb_build_object(
    'total', v_total, 'paid', v_paid, 'unpaid', v_unpaid,
    'total_fines', v_total_fines, 'date_from', p_date_from, 'date_to', p_date_to
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. PATROL FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS patrol_seq START 1001;

CREATE OR REPLACE FUNCTION auto_patrol_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.patrol_number IS NULL OR NEW.patrol_number = '' THEN
    NEW.patrol_number := 'PT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                         LPAD(nextval('patrol_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_patrol_number ON patrols;
CREATE TRIGGER tg_patrol_number
  BEFORE INSERT ON patrols
  FOR EACH ROW EXECUTE FUNCTION auto_patrol_number();

-- End a patrol and compute duration
CREATE OR REPLACE FUNCTION end_patrol(
  p_patrol_id  UUID,
  p_distance   NUMERIC DEFAULT NULL,
  p_notes      TEXT    DEFAULT NULL,
  p_events     TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_patrol patrols;
BEGIN
  SELECT * INTO v_patrol FROM patrols WHERE id = p_patrol_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Patrol not found');
  END IF;
  IF v_patrol.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Patrol is not active');
  END IF;

  UPDATE patrols SET
    end_time    = NOW(),
    status      = 'completed',
    distance_km = COALESCE(p_distance, distance_km),
    notes       = COALESCE(p_notes, notes),
    events      = COALESCE(p_events, events),
    progress    = 100
  WHERE id = p_patrol_id;

  -- Update officer patrols count
  UPDATE officers SET patrols_count = patrols_count + 1
  WHERE id = v_patrol.officer_id;

  RETURN jsonb_build_object('ok', true, 'patrol_id', p_patrol_id, 'completed_at', NOW());
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7. ARREST / DETENTION FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS arrest_seq START 1001;

CREATE OR REPLACE FUNCTION auto_arrest_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.arrest_number IS NULL OR NEW.arrest_number = '' THEN
    NEW.arrest_number := 'AR-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                         LPAD(nextval('arrest_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_arrest_number ON arrests;
CREATE TRIGGER tg_arrest_number
  BEFORE INSERT ON arrests
  FOR EACH ROW EXECUTE FUNCTION auto_arrest_number();

-- Release an arrested person
CREATE OR REPLACE FUNCTION release_detainee(
  p_arrest_id UUID,
  p_reason    TEXT DEFAULT 'Released by officer'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE arrests
  SET status = 'released', notes = COALESCE(notes || E'\n', '') || p_reason
  WHERE id = p_arrest_id AND status = 'held';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Arrest not found or not in held status');
  END IF;
  RETURN jsonb_build_object('ok', true, 'released_at', NOW());
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 8. MISSING / WANTED FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS missing_seq START 1001;

CREATE OR REPLACE FUNCTION auto_missing_case_no()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.case_no IS NULL OR NEW.case_no = '' THEN
    NEW.case_no := CASE
      WHEN NEW.type = 'person' THEN 'MP-'
      WHEN NEW.type = 'car'    THEN 'MV-'
      ELSE                          'MD-'
    END || TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(nextval('missing_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_missing_case_no ON missing_records;
CREATE TRIGGER tg_missing_case_no
  BEFORE INSERT ON missing_records
  FOR EACH ROW EXECUTE FUNCTION auto_missing_case_no();

-- Mark a missing record as found
CREATE OR REPLACE FUNCTION mark_found(
  p_case_no TEXT,
  p_notes   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE missing_records
  SET status = 'found', found_at = NOW(),
      details = COALESCE(details || E'\n', '') || COALESCE(p_notes, 'Marked as found')
  WHERE case_no = p_case_no AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Record not found or already closed');
  END IF;
  RETURN jsonb_build_object('ok', true, 'found_at', NOW());
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 9. ALERT FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Send broadcast alert to all officers (called by send-broadcast edge function)
CREATE OR REPLACE FUNCTION send_broadcast_alert(
  p_title      TEXT,
  p_message    TEXT,
  p_priority   TEXT DEFAULT 'normal',
  p_audience   TEXT DEFAULT 'all',
  p_sent_by    UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO alerts (title, message, priority, audience, sent_by, category)
  VALUES (
    p_title, p_message,
    p_priority::alert_priority,
    p_audience,
    p_sent_by,
    'all'
  )
  RETURNING id INTO v_alert_id;

  RETURN jsonb_build_object('ok', true, 'alert_id', v_alert_id, 'sent_at', NOW());
END;
$$;

-- Get unread alert count for a user
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id UUID)
RETURNS INT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COUNT(*)::INT
  FROM alerts a
  WHERE NOT EXISTS (
    SELECT 1 FROM alert_reads ar
    WHERE ar.alert_id = a.id AND ar.user_id = p_user_id
  )
  AND a.created_at > NOW() - INTERVAL '7 days';
$$;

-- ═══════════════════════════════════════════════════════════════
-- 10. INCIDENT FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS incident_seq START 1001;

CREATE OR REPLACE FUNCTION auto_incident_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    NEW.incident_number := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                           LPAD(nextval('incident_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_incident_number ON incidents;
CREATE TRIGGER tg_incident_number
  BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION auto_incident_number();

-- ═══════════════════════════════════════════════════════════════
-- 11. PF3 FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE SEQUENCE IF NOT EXISTS pf3_seq START 1001;

CREATE OR REPLACE FUNCTION auto_pf3_reference()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := 'PF3-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                            LPAD(nextval('pf3_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_pf3_reference ON pf3_forms;
CREATE TRIGGER tg_pf3_reference
  BEFORE INSERT ON pf3_forms
  FOR EACH ROW EXECUTE FUNCTION auto_pf3_reference();

-- ═══════════════════════════════════════════════════════════════
-- 12. REPORTING FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Officer performance summary
CREATE OR REPLACE FUNCTION get_officer_performance(
  p_officer_id UUID,
  p_date_from  DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_date_to    DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_citations   INT; v_incidents INT; v_patrols INT; v_arrests INT; v_warnings INT;
  v_patrol_km   NUMERIC; v_patrol_hrs NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_citations FROM citations
  WHERE officer_id = p_officer_id AND date BETWEEN p_date_from AND p_date_to;

  SELECT COUNT(*) INTO v_incidents FROM incidents
  WHERE assigned_officer_id = p_officer_id AND date BETWEEN p_date_from AND p_date_to;

  SELECT COUNT(*), COALESCE(SUM(distance_km),0),
         COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))/3600),0)
  INTO v_patrols, v_patrol_km, v_patrol_hrs
  FROM patrols
  WHERE officer_id = p_officer_id AND start_time::DATE BETWEEN p_date_from AND p_date_to;

  SELECT COUNT(*) INTO v_arrests FROM arrests
  WHERE officer_id = p_officer_id AND arrest_date BETWEEN p_date_from AND p_date_to;

  SELECT COUNT(*) INTO v_warnings FROM warnings
  WHERE officer_id = p_officer_id AND warning_date BETWEEN p_date_from AND p_date_to;

  RETURN jsonb_build_object(
    'officer_id',   p_officer_id,
    'citations',    v_citations,
    'incidents',    v_incidents,
    'patrols',      v_patrols,
    'patrol_km',    ROUND(v_patrol_km, 1),
    'patrol_hours', ROUND(v_patrol_hrs, 1),
    'arrests',      v_arrests,
    'warnings',     v_warnings,
    'date_from',    p_date_from,
    'date_to',      p_date_to
  );
END;
$$;

-- Weekly trend data (used by commissioner dashboard charts)
CREATE OR REPLACE FUNCTION get_weekly_trend(
  p_region     TEXT DEFAULT NULL,
  p_station_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_day    DATE;
  v_cits   INT; v_incs INT; v_arr INT;
BEGIN
  FOR i IN 0..6 LOOP
    v_day := CURRENT_DATE - i;

    IF p_station_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_cits FROM citations WHERE date = v_day AND station_id = p_station_id;
      SELECT COUNT(*) INTO v_incs FROM incidents WHERE date = v_day AND station_id IN (SELECT id FROM stations WHERE id = p_station_id);
      SELECT COUNT(*) INTO v_arr  FROM arrests   WHERE arrest_date = v_day AND station_id = p_station_id;
    ELSIF p_region IS NOT NULL THEN
      SELECT COUNT(*) INTO v_cits FROM citations c JOIN stations s ON s.id = c.station_id WHERE c.date = v_day AND s.region = p_region;
      SELECT COUNT(*) INTO v_incs FROM incidents i JOIN stations s ON s.id = i.station_id WHERE i.date = v_day AND s.region = p_region;
      SELECT COUNT(*) INTO v_arr  FROM arrests a   JOIN stations s ON s.id = a.station_id WHERE a.arrest_date = v_day AND s.region = p_region;
    ELSE
      SELECT COUNT(*) INTO v_cits FROM citations WHERE date = v_day;
      SELECT COUNT(*) INTO v_incs FROM incidents WHERE date = v_day;
      SELECT COUNT(*) INTO v_arr  FROM arrests   WHERE arrest_date = v_day;
    END IF;

    v_result := v_result || jsonb_build_object(
      'day', TO_CHAR(v_day, 'Dy'),
      'date', v_day,
      'citations', v_cits,
      'incidents', v_incs,
      'arrests', v_arr
    );
  END LOOP;

  RETURN v_result;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 13. DASHBOARD CACHE REFRESH
-- ═══════════════════════════════════════════════════════════════

-- Refresh the dashboard stats cache for all scopes
-- Call this via pg_cron: SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_cache()');
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_region TEXT;
  v_stats  JSONB;
BEGIN
  -- National
  v_stats := get_dashboard_stats('national');
  INSERT INTO dashboard_cache (scope, scope_value, stats, refreshed_at)
  VALUES ('national', 'TZ', v_stats, NOW())
  ON CONFLICT (scope, scope_value) DO UPDATE SET stats = EXCLUDED.stats, refreshed_at = NOW();

  -- Per region
  FOR v_region IN SELECT DISTINCT region FROM stations LOOP
    v_stats := get_dashboard_stats('regional', v_region);
    INSERT INTO dashboard_cache (scope, scope_value, stats, refreshed_at)
    VALUES ('regional', v_region, v_stats, NOW())
    ON CONFLICT (scope, scope_value) DO UPDATE SET stats = EXCLUDED.stats, refreshed_at = NOW();
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 14. UTILITY TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at for new tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS update_arrests_updated_at ON arrests;
CREATE TRIGGER update_arrests_updated_at
  BEFORE UPDATE ON arrests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add arrests/warnings counts to citizen risk_score
CREATE OR REPLACE FUNCTION update_citizen_risk()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_arrest_count INT; v_criminal_count INT;
BEGIN
  IF NEW.citizen_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_arrest_count  FROM arrests         WHERE citizen_id = NEW.citizen_id;
  SELECT COUNT(*) INTO v_criminal_count FROM criminal_records WHERE citizen_id = NEW.citizen_id;

  UPDATE citizens SET
    risk_score        = LEAST(100, (v_arrest_count * 15) + (v_criminal_count * 20)),
    has_criminal_record = (v_criminal_count > 0),
    cases_count       = v_arrest_count
  WHERE id = NEW.citizen_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_update_risk_on_arrest ON arrests;
CREATE TRIGGER tg_update_risk_on_arrest
  AFTER INSERT ON arrests
  FOR EACH ROW EXECUTE FUNCTION update_citizen_risk();

DROP TRIGGER IF EXISTS tg_update_risk_on_criminal ON criminal_records;
CREATE TRIGGER tg_update_risk_on_criminal
  AFTER INSERT ON criminal_records
  FOR EACH ROW EXECUTE FUNCTION update_citizen_risk();

-- Audit logging for key tables (extends migration 0003)
DROP TRIGGER IF EXISTS audit_arrests    ON arrests;
CREATE TRIGGER audit_arrests    AFTER INSERT OR UPDATE OR DELETE ON arrests    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
DROP TRIGGER IF EXISTS audit_missing    ON missing_records;
CREATE TRIGGER audit_missing    AFTER INSERT OR UPDATE OR DELETE ON missing_records FOR EACH ROW EXECUTE FUNCTION create_audit_log();
DROP TRIGGER IF EXISTS audit_wanted     ON wanted;
CREATE TRIGGER audit_wanted     AFTER INSERT OR UPDATE OR DELETE ON wanted     FOR EACH ROW EXECUTE FUNCTION create_audit_log();
DROP TRIGGER IF EXISTS audit_warnings   ON warnings;
CREATE TRIGGER audit_warnings   AFTER INSERT OR UPDATE OR DELETE ON warnings   FOR EACH ROW EXECUTE FUNCTION create_audit_log();

