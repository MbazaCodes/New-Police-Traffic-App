-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — COMMUNICATIONS & ORDERS
-- Migration: 00000000000016_communications_orders
-- Real-time messaging, command orders, duty roster,
-- broadcast system, SOS, shift management
-- ============================================================

-- ── Message Threads ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_threads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_type  VARCHAR(20) NOT NULL DEFAULT 'direct'
    CHECK (thread_type IN ('direct','group','broadcast','command')),
  title        VARCHAR(255),
  created_by   UUID REFERENCES users(id),
  station_id   UUID REFERENCES stations(id),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thread_participants (
  thread_id  UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read  TIMESTAMPTZ,
  is_admin   BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (thread_id, user_id)
);

-- ── Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id    UUID REFERENCES message_threads(id) ON DELETE SET NULL,
  from_user    UUID NOT NULL REFERENCES users(id),
  to_user      UUID REFERENCES users(id),              -- NULL = broadcast
  message_type VARCHAR(20) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text','image','file','location','alert','order')),
  content      TEXT NOT NULL,
  file_url     TEXT,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  priority     VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('normal','important','urgent')),
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  read_at      TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_thread  ON messages(thread_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_from    ON messages(from_user, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_to      ON messages(to_user, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_unread  ON messages(to_user, is_read) WHERE NOT is_read;

-- ── Command Orders ────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE order_status   AS ENUM ('sent','acknowledged','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_priority AS ENUM ('urgent','high','normal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS command_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      VARCHAR(50) NOT NULL UNIQUE,
  from_commander    UUID NOT NULL REFERENCES users(id),
  to_officer        UUID NOT NULL REFERENCES users(id),
  to_station_id     UUID REFERENCES stations(id),
  order_type        VARCHAR(50) DEFAULT 'field_order'
    CHECK (order_type IN ('field_order','patrol_order','investigation_order','arrest_order','other')),
  order_text        TEXT NOT NULL,
  priority          order_priority NOT NULL DEFAULT 'normal',
  status            order_status   NOT NULL DEFAULT 'sent',
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at   TIMESTAMPTZ,
  acknowledged_note TEXT,
  completed_at      TIMESTAMPTZ,
  completion_note   TEXT,
  due_by            TIMESTAMPTZ,
  location          VARCHAR(255),
  case_id           UUID REFERENCES cases(id),
  incident_id       UUID REFERENCES incidents(id),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;
CREATE OR REPLACE FUNCTION auto_order_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                        LPAD(nextval('order_seq')::TEXT, 4, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_order_number ON command_orders;
CREATE TRIGGER tg_order_number BEFORE INSERT ON command_orders FOR EACH ROW EXECUTE FUNCTION auto_order_number();

CREATE INDEX IF NOT EXISTS idx_ord_from    ON command_orders(from_commander, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_ord_to      ON command_orders(to_officer, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_ord_status  ON command_orders(status);
CREATE INDEX IF NOT EXISTS idx_ord_priority ON command_orders(priority);

-- ── SOS Events ───────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE sos_status AS ENUM ('active','responded','resolved','false_alarm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sos_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id       UUID NOT NULL REFERENCES users(id),
  patrol_id        UUID REFERENCES patrols(id),
  latitude         DECIMAL(10,7),
  longitude        DECIMAL(10,7),
  location_name    VARCHAR(255),
  description      TEXT,
  status           sos_status NOT NULL DEFAULT 'active',
  responded_by     UUID REFERENCES users(id),
  responded_at     TIMESTAMPTZ,
  response_note    TEXT,
  resolved_at      TIMESTAMPTZ,
  resolution_note  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_officer ON sos_events(officer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_status  ON sos_events(status);

-- ── Duty Roster ───────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE shift_type AS ENUM ('morning','afternoon','night','special'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE duty_status AS ENUM ('scheduled','active','completed','absent','swapped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS duty_roster (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id    UUID NOT NULL REFERENCES users(id),
  station_id    UUID NOT NULL REFERENCES stations(id),
  post_id       UUID REFERENCES posts(id),
  shift_date    DATE NOT NULL,
  shift_type    shift_type NOT NULL DEFAULT 'morning',
  start_time    TIME NOT NULL DEFAULT '08:00',
  end_time      TIME NOT NULL DEFAULT '16:00',
  status        duty_status NOT NULL DEFAULT 'scheduled',
  checked_in    TIMESTAMPTZ,
  checked_out   TIMESTAMPTZ,
  notes         TEXT,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (officer_id, shift_date, shift_type)
);

CREATE INDEX IF NOT EXISTS idx_dr_officer ON duty_roster(officer_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_dr_station ON duty_roster(station_id, shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_dr_date    ON duty_roster(shift_date);
CREATE INDEX IF NOT EXISTS idx_dr_status  ON duty_roster(status);

-- ── Shift Swaps ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shift_swaps (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roster_id         UUID NOT NULL REFERENCES duty_roster(id),
  requesting_officer UUID NOT NULL REFERENCES users(id),
  receiving_officer  UUID NOT NULL REFERENCES users(id),
  reason            TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ss_roster ON shift_swaps(roster_id);

-- ── Officer Status Tracking ───────────────────────────────────
CREATE TABLE IF NOT EXISTS officer_status_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id  UUID NOT NULL REFERENCES users(id),
  status      VARCHAR(50) NOT NULL,
  location    VARCHAR(255),
  latitude    DECIMAL(10,7),
  longitude   DECIMAL(10,7),
  notes       TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osl_officer ON officer_status_logs(officer_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_osl_status  ON officer_status_logs(status, recorded_at DESC);

-- ── Notification Queue ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id),
  notification_type VARCHAR(50) NOT NULL
    CHECK (notification_type IN ('alert','order','message','sos','system','reminder')),
  title            VARCHAR(255) NOT NULL,
  body             TEXT,
  data             JSONB,
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  read_at          TIMESTAMPTZ,
  is_sent          BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at          TIMESTAMPTZ,
  priority         VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','critical')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id, is_read) WHERE NOT is_read;

-- ── Functions ────────────────────────────────────────────────

-- Send command order
CREATE OR REPLACE FUNCTION send_command_order(
  p_from_commander UUID, p_to_officer UUID, p_order_text TEXT,
  p_priority order_priority DEFAULT 'normal', p_order_type VARCHAR DEFAULT 'field_order',
  p_location VARCHAR DEFAULT NULL, p_due_by TIMESTAMPTZ DEFAULT NULL,
  p_case_id UUID DEFAULT NULL, p_incident_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_order_id UUID;
BEGIN
  INSERT INTO command_orders (from_commander, to_officer, order_text, priority, order_type, location, due_by, case_id, incident_id)
  VALUES (p_from_commander, p_to_officer, p_order_text, p_priority, p_order_type, p_location, p_due_by, p_case_id, p_incident_id)
  RETURNING id INTO v_order_id;

  -- Create notification for officer
  INSERT INTO notifications (user_id, notification_type, title, body, priority)
  VALUES (p_to_officer, 'order', 'Amri Mpya kutoka Kamanda',
          LEFT(p_order_text, 100),
          CASE p_priority WHEN 'urgent' THEN 'critical' WHEN 'high' THEN 'high' ELSE 'normal' END::VARCHAR);

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'order_number', (SELECT order_number FROM command_orders WHERE id = v_order_id));
END; $$;

-- Acknowledge order
CREATE OR REPLACE FUNCTION acknowledge_order(p_order_id UUID, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE command_orders SET
    status           = 'acknowledged',
    acknowledged_at  = NOW(),
    acknowledged_note = p_note,
    updated_at       = NOW()
  WHERE id = p_order_id AND to_officer = auth.uid() AND status = 'sent';
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Order not found or not authorized'); END IF;
  RETURN jsonb_build_object('ok', true, 'acknowledged_at', NOW());
END; $$;

-- Complete order
CREATE OR REPLACE FUNCTION complete_order(p_order_id UUID, p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE command_orders SET
    status          = 'completed',
    completed_at    = NOW(),
    completion_note = p_note,
    updated_at      = NOW()
  WHERE id = p_order_id AND to_officer = auth.uid();
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Order not found'); END IF;
  RETURN jsonb_build_object('ok', true, 'completed_at', NOW());
END; $$;

-- Get unread notifications count
CREATE OR REPLACE FUNCTION get_notification_count(p_user_id UUID)
RETURNS INT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COUNT(*)::INT FROM notifications WHERE user_id = p_user_id AND NOT is_read;
$$;

-- RLS
ALTER TABLE message_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_roster          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swaps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_status_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY msg_select ON messages FOR SELECT TO authenticated
  USING (from_user = auth.uid() OR to_user = auth.uid() OR to_user IS NULL);
CREATE POLICY msg_insert ON messages FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());

CREATE POLICY ord_select ON command_orders FOR SELECT TO authenticated
  USING (from_commander = auth.uid() OR to_officer = auth.uid() OR is_commander());
CREATE POLICY ord_insert ON command_orders FOR INSERT TO authenticated
  WITH CHECK (is_commander() AND from_commander = auth.uid());
CREATE POLICY ord_update ON command_orders FOR UPDATE TO authenticated
  USING (from_commander = auth.uid() OR to_officer = auth.uid());

CREATE POLICY sos_select ON sos_events FOR SELECT TO authenticated USING (officer_id = auth.uid() OR is_commander());
CREATE POLICY sos_insert ON sos_events FOR INSERT TO authenticated WITH CHECK (officer_id = auth.uid());
CREATE POLICY sos_update ON sos_events FOR UPDATE TO authenticated USING (is_commander() OR responded_by = auth.uid());

CREATE POLICY dr_select ON duty_roster FOR SELECT TO authenticated USING (officer_id = auth.uid() OR is_commander());
CREATE POLICY dr_write  ON duty_roster FOR ALL    TO authenticated USING (is_commander()) WITH CHECK (TRUE);

CREATE POLICY notif_select ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notif_update ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY osl_select ON officer_status_logs FOR SELECT TO authenticated USING (officer_id = auth.uid() OR is_commander());
CREATE POLICY osl_insert ON officer_status_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Triggers
DROP TRIGGER IF EXISTS update_threads_updated_at ON message_threads;
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_orders_updated_at ON command_orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON command_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_dr_updated_at ON duty_roster;
CREATE TRIGGER update_dr_updated_at BEFORE UPDATE ON duty_roster FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed duty roster for current week
INSERT INTO duty_roster (officer_id, station_id, shift_date, shift_type, start_time, end_time, status)
SELECT
  u.id,
  u.station_id,
  CURRENT_DATE,
  CASE WHEN EXTRACT(HOUR FROM NOW()) < 16 THEN 'morning' ELSE 'afternoon' END::shift_type,
  CASE WHEN EXTRACT(HOUR FROM NOW()) < 16 THEN '08:00' ELSE '16:00' END::TIME,
  CASE WHEN EXTRACT(HOUR FROM NOW()) < 16 THEN '16:00' ELSE '00:00' END::TIME,
  'scheduled'
FROM users u
WHERE u.role IN ('officer-traffic','officer-general','post-officer')
  AND u.status = 'active'
  AND u.station_id IS NOT NULL
ON CONFLICT (officer_id, shift_date, shift_type) DO NOTHING;
