-- ============================================================
-- COMMAND REQUESTS & APPROVALS SYSTEM
-- TPF — Any department can send requests up the chain
-- IGP / Commanders can approve, decline, or hold
-- ============================================================

CREATE TYPE request_type AS ENUM (
  'recruitment',        -- HR: hire new employee
  'transfer',           -- Transfer officer to another station
  'promotion',          -- Promotion request
  'equipment',          -- Equipment/vehicle request
  'budget',             -- Budget allocation request
  'training',           -- Training program request
  'leave',              -- Leave/absence request
  'disciplinary',       -- Disciplinary action
  'investigation',      -- Open investigation request
  'operation',          -- Operation approval
  'procurement',        -- Procurement request
  'construction',       -- Infrastructure request
  'medical',            -- Medical/welfare request
  'legal',              -- Legal advice/action request
  'other'               -- General request
);

CREATE TYPE request_status AS ENUM (
  'draft',
  'pending',
  'under_review',
  'on_hold',
  'approved',
  'declined',
  'cancelled'
);

CREATE TYPE request_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TABLE command_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request metadata
  reference_no      VARCHAR(30) UNIQUE NOT NULL,
  type              request_type NOT NULL,
  subject           VARCHAR(500) NOT NULL,
  description       TEXT NOT NULL,
  priority          request_priority NOT NULL DEFAULT 'normal',
  status            request_status NOT NULL DEFAULT 'pending',

  -- Requester (who sent it)
  requester_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name    VARCHAR(255) NOT NULL,
  requester_role    VARCHAR(100) NOT NULL,
  requester_dept    VARCHAR(255),
  requester_region  VARCHAR(100),
  requester_station VARCHAR(255),

  -- Target approver (who it is sent to)
  approver_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  approver_role     VARCHAR(100),   -- e.g. 'igp', 'national-commissioner'
  approver_name     VARCHAR(255),

  -- Attachments (stored as JSON array of file URLs)
  attachments       JSONB DEFAULT '[]',

  -- Additional form data (flexible per request type)
  form_data         JSONB DEFAULT '{}',

  -- Response
  response_note     TEXT,
  responded_by_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_by_name VARCHAR(255),
  responded_at      TIMESTAMPTZ,

  -- Hold details
  hold_reason       TEXT,
  held_by_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  held_at           TIMESTAMPTZ,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments/notes thread on each request
CREATE TABLE request_comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id    UUID NOT NULL REFERENCES command_requests(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name   VARCHAR(255) NOT NULL,
  author_role   VARCHAR(100),
  comment       TEXT NOT NULL,
  is_internal   BOOLEAN NOT NULL DEFAULT FALSE, -- internal = only commanders see it
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cmd_requests_status   ON command_requests(status);
CREATE INDEX idx_cmd_requests_type     ON command_requests(type);
CREATE INDEX idx_cmd_requests_requester ON command_requests(requester_id);
CREATE INDEX idx_cmd_requests_approver  ON command_requests(approver_id);
CREATE INDEX idx_cmd_requests_created  ON command_requests(created_at DESC);
CREATE INDEX idx_req_comments_request  ON request_comments(request_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_command_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_command_requests_updated
  BEFORE UPDATE ON command_requests
  FOR EACH ROW EXECUTE FUNCTION update_command_request_timestamp();

-- Reference number generator function
CREATE OR REPLACE FUNCTION generate_request_ref(req_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq    BIGINT;
BEGIN
  prefix := CASE req_type
    WHEN 'recruitment'   THEN 'REC'
    WHEN 'transfer'      THEN 'TRF'
    WHEN 'promotion'     THEN 'PRM'
    WHEN 'equipment'     THEN 'EQP'
    WHEN 'budget'        THEN 'BGT'
    WHEN 'training'      THEN 'TRN'
    WHEN 'leave'         THEN 'LVE'
    WHEN 'disciplinary'  THEN 'DSC'
    WHEN 'investigation' THEN 'INV'
    WHEN 'operation'     THEN 'OPS'
    WHEN 'procurement'   THEN 'PRO'
    WHEN 'construction'  THEN 'CON'
    WHEN 'medical'       THEN 'MED'
    WHEN 'legal'         THEN 'LGL'
    ELSE 'REQ'
  END;
  SELECT COUNT(*) + 1 INTO seq FROM command_requests WHERE type = req_type::request_type;
  RETURN prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
