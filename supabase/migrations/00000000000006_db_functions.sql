-- ============================================================
-- TZ POLICE — DATABASE FUNCTIONS
-- Migration: 00000000000006_db_functions
-- Search, Dashboard stats, Lookup helpers
-- ============================================================

-- ── Universal citizen search ──────────────────────────────────
CREATE OR REPLACE FUNCTION search_citizen(
  p_query TEXT,
  p_type  TEXT DEFAULT 'name'  -- 'name' | 'nida' | 'mobile' | 'license'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_citizen JSONB;
  v_license RECORD;
BEGIN
  IF p_type = 'license' THEN
    SELECT c.* INTO v_citizen
    FROM citizens c
    JOIN licenses l ON l.citizen_id = c.id
    WHERE UPPER(l.license_no) = UPPER(p_query)
    LIMIT 1;
  ELSIF p_type = 'nida' THEN
    SELECT row_to_json(c.*) INTO v_citizen
    FROM citizens c WHERE c.nida = p_query LIMIT 1;
  ELSIF p_type = 'mobile' THEN
    SELECT row_to_json(c.*) INTO v_citizen
    FROM citizens c WHERE REPLACE(c.mobile,' ','') = REPLACE(p_query,' ','') LIMIT 1;
  ELSE -- name (fuzzy)
    SELECT row_to_json(c.*) INTO v_citizen
    FROM citizens c
    WHERE (c.first_name || ' ' || c.last_name) ILIKE '%' || p_query || '%'
    ORDER BY similarity((c.first_name || ' ' || c.last_name), p_query) DESC
    LIMIT 1;
  END IF;

  IF v_citizen IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  -- Enrich with vehicles, licenses, criminal records
  RETURN jsonb_build_object(
    'found', true,
    'citizen', v_citizen,
    'vehicles', (
      SELECT jsonb_agg(row_to_json(v.*))
      FROM vehicles v WHERE v.owner_citizen_id = (v_citizen->>'id')::UUID
    ),
    'licenses', (
      SELECT jsonb_agg(row_to_json(l.*))
      FROM licenses l WHERE l.citizen_id = (v_citizen->>'id')::UUID
    ),
    'criminal_records', (
      SELECT jsonb_agg(row_to_json(cr.*))
      FROM criminal_records cr WHERE cr.citizen_id = (v_citizen->>'id')::UUID
      ORDER BY cr.date DESC
    ),
    'wanted', (
      SELECT EXISTS(SELECT 1 FROM wanted w WHERE w.citizen_id = (v_citizen->>'id')::UUID AND w.active = TRUE)
    )
  );
END;
$$;

-- ── Vehicle search with owner + violations ────────────────────
CREATE OR REPLACE FUNCTION search_vehicle(p_plate TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_vehicle JSONB;
BEGIN
  SELECT row_to_json(v.*) INTO v_vehicle
  FROM vehicles v
  WHERE UPPER(REPLACE(v.plate_number,' ','')) = UPPER(REPLACE(p_plate,' ',''))
  LIMIT 1;

  IF v_vehicle IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'vehicle', v_vehicle,
    'owner', (
      SELECT row_to_json(c.*)
      FROM citizens c WHERE c.id = (v_vehicle->>'owner_citizen_id')::UUID
    ),
    'citations', (
      SELECT jsonb_agg(row_to_json(ct.*))
      FROM citations ct WHERE ct.plate = p_plate
      ORDER BY ct.date DESC
    ),
    'inspections', (
      SELECT jsonb_agg(row_to_json(vi.*))
      FROM vehicle_inspections vi WHERE vi.plate = p_plate
      ORDER BY vi.inspection_date DESC LIMIT 3
    )
  );
END;
$$;

-- ── Device search ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_device(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_device JSONB;
BEGIN
  SELECT row_to_json(d.*) INTO v_device
  FROM devices d
  WHERE d.serial_no ILIKE '%' || p_query || '%'
     OR d.imei = p_query
  LIMIT 1;

  IF v_device IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'device', v_device,
    'owner', (
      SELECT row_to_json(c.*)
      FROM citizens c WHERE c.id = (v_device->>'owner_citizen_id')::UUID
    )
  );
END;
$$;

-- ── Dashboard stats (role-scoped) ─────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_role       TEXT,
  p_region     TEXT DEFAULT NULL,
  p_station_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_officers_total  INT;
  v_officers_active INT;
  v_citations_today INT;
  v_incidents_today INT;
  v_arrests_total   INT;
  v_missing_active  INT;
  v_detained_total  INT;
  v_traffic_total   INT;
  v_general_total   INT;
  today             DATE := CURRENT_DATE;
BEGIN
  -- Scope: national sees all, regional filters by region, station filters by station
  IF p_station_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_officers_total FROM users u WHERE u.station_id = p_station_id AND u.role IN ('officer-traffic','officer-general','post-officer');
    SELECT COUNT(*) INTO v_officers_active FROM users u WHERE u.station_id = p_station_id AND u.status IN ('active','patrol');
    SELECT COUNT(*) INTO v_citations_today FROM citations c WHERE c.station_id = p_station_id AND c.date = today;
    SELECT COUNT(*) INTO v_incidents_today FROM incidents i WHERE i.station_id = p_station_id AND i.date = today;
    SELECT COUNT(*) INTO v_arrests_total   FROM arrests a WHERE a.station_id = p_station_id;
    SELECT COUNT(*) INTO v_traffic_total   FROM citations c WHERE c.station_id = p_station_id AND c.type = 'traffic';
    SELECT COUNT(*) INTO v_general_total   FROM incidents i WHERE i.station_id = p_station_id;
  ELSIF p_region IS NOT NULL THEN
    SELECT COUNT(*) INTO v_officers_total FROM users u JOIN stations s ON s.id = u.station_id WHERE s.region = p_region AND u.role IN ('officer-traffic','officer-general','post-officer');
    SELECT COUNT(*) INTO v_officers_active FROM users u JOIN stations s ON s.id = u.station_id WHERE s.region = p_region AND u.status IN ('active','patrol');
    SELECT COUNT(*) INTO v_citations_today FROM citations c JOIN stations s ON s.id = c.station_id WHERE s.region = p_region AND c.date = today;
    SELECT COUNT(*) INTO v_incidents_today FROM incidents i JOIN stations s ON s.id = i.station_id WHERE s.region = p_region AND i.date = today;
    SELECT COUNT(*) INTO v_arrests_total   FROM arrests a JOIN stations s ON s.id = a.station_id WHERE s.region = p_region;
    SELECT COUNT(*) INTO v_traffic_total   FROM citations c JOIN stations s ON s.id = c.station_id WHERE s.region = p_region AND c.type = 'traffic';
    SELECT COUNT(*) INTO v_general_total   FROM incidents i JOIN stations s ON s.id = i.station_id WHERE s.region = p_region;
  ELSE -- national
    SELECT COUNT(*) INTO v_officers_total FROM users WHERE role IN ('officer-traffic','officer-general','post-officer');
    SELECT COUNT(*) INTO v_officers_active FROM users WHERE status IN ('active','patrol');
    SELECT COUNT(*) INTO v_citations_today FROM citations WHERE date = today;
    SELECT COUNT(*) INTO v_incidents_today FROM incidents WHERE date = today;
    SELECT COUNT(*) INTO v_arrests_total   FROM arrests;
    SELECT COUNT(*) INTO v_traffic_total   FROM citations WHERE type = 'traffic';
    SELECT COUNT(*) INTO v_general_total   FROM incidents;
  END IF;

  SELECT COUNT(*) INTO v_missing_active FROM missing_records WHERE status = 'active';
  SELECT COUNT(*) INTO v_detained_total FROM arrests WHERE status = 'held';

  RETURN jsonb_build_object(
    'officers_total',    v_officers_total,
    'officers_active',   v_officers_active,
    'citations_today',   v_citations_today,
    'incidents_today',   v_incidents_today,
    'arrests_total',     v_arrests_total,
    'missing_active',    v_missing_active,
    'detained_total',    v_detained_total,
    'traffic_total',     v_traffic_total,
    'general_total',     v_general_total,
    'generated_at',      NOW()
  );
END;
$$;

-- ── Auto-increment citation/incident numbers ──────────────────
CREATE OR REPLACE FUNCTION generate_citation_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.citation_number IS NULL OR NEW.citation_number = '' THEN
    NEW.citation_number := 'CT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('citation_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (Sequence citation_seq defined with IF NOT EXISTS in 0010_db_functions_v2.sql)
DROP TRIGGER IF EXISTS tg_citation_number ON citations;
CREATE TRIGGER tg_citation_number BEFORE INSERT ON citations FOR EACH ROW EXECUTE FUNCTION generate_citation_number();

CREATE OR REPLACE FUNCTION generate_incident_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
    NEW.incident_number := 'INC-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('incident_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (Sequence incident_seq defined with IF NOT EXISTS in 0010_db_functions_v2.sql)
DROP TRIGGER IF EXISTS tg_incident_number ON incidents;
CREATE TRIGGER tg_incident_number BEFORE INSERT ON incidents FOR EACH ROW EXECUTE FUNCTION generate_incident_number();

-- ── Update vehicle outstanding fines ─────────────────────────
CREATE OR REPLACE FUNCTION update_vehicle_fines() RETURNS TRIGGER AS $$
BEGIN
  UPDATE vehicles
  SET outstanding_fines = (
    SELECT COALESCE(SUM(fine_amount), 0)
    FROM citations
    WHERE plate = NEW.plate AND status = 'unpaid'
  )
  WHERE plate_number = NEW.plate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_update_vehicle_fines ON citations;
CREATE TRIGGER tg_update_vehicle_fines AFTER INSERT OR UPDATE ON citations FOR EACH ROW EXECUTE FUNCTION update_vehicle_fines();
