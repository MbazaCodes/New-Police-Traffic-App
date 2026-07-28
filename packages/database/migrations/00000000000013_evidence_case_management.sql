-- ============================================================
-- TZ POLICE DIGITAL PLATFORM — EVIDENCE & CASE MANAGEMENT
-- Migration: 00000000000013_evidence_case_management
-- Full evidence chain-of-custody + complete case lifecycle
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- CASE MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE case_status   AS ENUM ('open','investigating','charging','court','closed','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE case_priority AS ENUM ('critical','high','medium','low');                               EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE case_type     AS ENUM ('criminal','traffic','administrative','civil','missing_person'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Cases ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number     VARCHAR(50) NOT NULL UNIQUE,
  title           VARCHAR(255) NOT NULL,
  case_type       case_type    NOT NULL DEFAULT 'criminal',
  priority        case_priority NOT NULL DEFAULT 'medium',
  status          case_status   NOT NULL DEFAULT 'open',
  description     TEXT,
  incident_id     UUID REFERENCES incidents(id),
  arrest_id       UUID REFERENCES arrests(id),
  opened_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  opened_by       UUID REFERENCES users(id),
  assigned_to     UUID REFERENCES users(id),     -- Lead investigator
  assigned_by     UUID REFERENCES users(id),
  station_id      UUID REFERENCES stations(id),
  region          VARCHAR(100),
  closed_date     DATE,
  closed_by       UUID REFERENCES users(id),
  closure_reason  TEXT,
  court_case_id   UUID,                           -- FK added after court table
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS case_seq START 1001;
CREATE OR REPLACE FUNCTION auto_case_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := 'CS-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                       LPAD(nextval('case_seq')::TEXT, 4, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_case_number ON cases;
CREATE TRIGGER tg_case_number BEFORE INSERT ON cases FOR EACH ROW EXECUTE FUNCTION auto_case_number();

CREATE INDEX IF NOT EXISTS idx_case_status    ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_type      ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_case_assigned  ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_case_station   ON cases(station_id);
CREATE INDEX IF NOT EXISTS idx_case_date      ON cases(opened_date DESC);

-- ── Case Assignments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  officer_id    UUID NOT NULL REFERENCES users(id),
  role          VARCHAR(50) NOT NULL DEFAULT 'support'
    CHECK (role IN ('lead','support','forensic','analyst','supervisor')),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_by   UUID REFERENCES users(id),
  status        VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','transferred')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ca_case    ON case_assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_ca_officer ON case_assignments(officer_id);

-- ── Case Notes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  officer_id  UUID NOT NULL REFERENCES users(id),
  note_type   VARCHAR(50) DEFAULT 'update'
    CHECK (note_type IN ('observation','action','decision','update','interview','lab_result')),
  note        TEXT NOT NULL,
  is_private  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cn_case    ON case_notes(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cn_officer ON case_notes(officer_id);

-- ── Case Timeline ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_timeline (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type   VARCHAR(50) NOT NULL,
  description  TEXT NOT NULL,
  event_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  officer_id   UUID REFERENCES users(id),
  location     VARCHAR(255),
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ct_case ON case_timeline(case_id, event_date DESC);

-- ── Case Witnesses ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_witnesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  citizen_id      UUID REFERENCES citizens(id),
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  address         VARCHAR(255),
  witness_type    VARCHAR(50) DEFAULT 'eye'
    CHECK (witness_type IN ('eye','expert','character','hearsay')),
  relationship    VARCHAR(100),
  statement       TEXT,
  statement_date  DATE,
  recorded_by     UUID REFERENCES users(id),
  is_protected    BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cw_case ON case_witnesses(case_id);

-- ── Case Status History ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_status_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  old_status   VARCHAR(50),
  new_status   VARCHAR(50) NOT NULL,
  changed_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by   UUID REFERENCES users(id),
  reason       TEXT
);

CREATE INDEX IF NOT EXISTS idx_csh_case ON case_status_history(case_id, changed_date DESC);

-- ── Case Documents ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  document_name VARCHAR(255) NOT NULL,
  file_url      TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by   UUID REFERENCES users(id),
  description   TEXT
);

CREATE INDEX IF NOT EXISTS idx_cd_case ON case_documents(case_id);

-- ── Case Tags ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_tags (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id  UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tag      VARCHAR(50) NOT NULL,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ctag_case ON case_tags(case_id);
CREATE INDEX IF NOT EXISTS idx_ctag_tag  ON case_tags(tag);

-- ── Case → Suspects link ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_suspects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  citizen_id  UUID REFERENCES citizens(id),
  arrest_id   UUID REFERENCES arrests(id),
  suspect_name VARCHAR(255) NOT NULL,
  role        VARCHAR(100),   -- 'primary', 'accomplice', 'suspect', 'charged'
  status      VARCHAR(50) DEFAULT 'suspect',
  notes       TEXT,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csusp_case ON case_suspects(case_id);

-- ── Full-text search index ────────────────────────────────────
ALTER TABLE cases ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION update_case_search()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.case_number,'') || ' ' ||
    COALESCE(NEW.title,'') || ' ' ||
    COALESCE(NEW.description,'')
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_case_search ON cases;
CREATE TRIGGER tg_case_search BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_case_search();

CREATE INDEX IF NOT EXISTS idx_case_search ON cases USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- EVIDENCE MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE evidence_status AS ENUM ('collected','transit','lab','storage','court','returned','disposed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Evidence Categories & Types ───────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_types (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id              UUID REFERENCES evidence_categories(id),
  name                     VARCHAR(100) NOT NULL,
  description              TEXT,
  requires_special_handling BOOLEAN DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Evidence Storage Locations ────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_storage (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(100) NOT NULL,
  location            VARCHAR(255) NOT NULL,
  type                VARCHAR(50) DEFAULT 'room'
    CHECK (type IN ('room','cabinet','safe','freezer','digital','vault')),
  capacity            VARCHAR(100),
  current_occupancy   VARCHAR(100),
  status              VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active','full','maintenance','decommissioned')),
  station_id          UUID REFERENCES stations(id),
  responsible_officer UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Evidence Records ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_number   VARCHAR(50) NOT NULL UNIQUE,
  case_id           UUID REFERENCES cases(id),
  incident_id       UUID REFERENCES incidents(id),
  type_id           UUID REFERENCES evidence_types(id),
  description       TEXT NOT NULL,
  quantity          INT DEFAULT 1,
  unit              VARCHAR(20),
  collected_by      UUID REFERENCES users(id),
  collected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collection_location VARCHAR(255),
  storage_id        UUID REFERENCES evidence_storage(id),
  storage_location  VARCHAR(255),
  storage_shelf     VARCHAR(50),
  status            evidence_status NOT NULL DEFAULT 'collected',
  condition         VARCHAR(100) DEFAULT 'Nzuri',
  is_digital        BOOLEAN NOT NULL DEFAULT FALSE,
  file_url          TEXT,
  file_hash         VARCHAR(255),
  seal_number       VARCHAR(100),
  seal_photo_url    TEXT,
  barcode           VARCHAR(100),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS evidence_seq START 1001;
CREATE OR REPLACE FUNCTION auto_evidence_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.evidence_number IS NULL OR NEW.evidence_number = '' THEN
    NEW.evidence_number := 'EV-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                           LPAD(nextval('evidence_seq')::TEXT, 4, '0');
  END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_evidence_number ON evidence;
CREATE TRIGGER tg_evidence_number BEFORE INSERT ON evidence FOR EACH ROW EXECUTE FUNCTION auto_evidence_number();

CREATE INDEX IF NOT EXISTS idx_ev_case   ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_ev_status ON evidence(status);

-- ── Case → Evidence Link ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_evidence (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence(id),
  added_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by    UUID REFERENCES users(id),
  status      VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active','removed','used_in_court','returned')),
  notes       TEXT,
  UNIQUE(case_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_ce_case     ON case_evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_ce_evidence ON case_evidence(evidence_id);

-- ── Chain of Custody ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chain_of_custody (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id           UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  transferred_from      UUID REFERENCES users(id),
  transferred_to        UUID REFERENCES users(id),
  transfer_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transfer_reason       TEXT,
  sender_signature      TEXT,
  recipient_signature   TEXT,
  condition_on_transfer VARCHAR(100),
  condition_on_receipt  VARCHAR(100),
  location              VARCHAR(255),
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_coc_evidence ON chain_of_custody(evidence_id, transfer_date DESC);

-- ── Evidence Files ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_files (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  file_name   VARCHAR(255) NOT NULL,
  file_type   VARCHAR(50),
  file_size   BIGINT,
  file_url    TEXT NOT NULL,
  file_hash   VARCHAR(255),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_ef_evidence ON evidence_files(evidence_id);

-- ── Evidence Analysis (Lab reports) ──────────────────────────
CREATE TABLE IF NOT EXISTS evidence_analysis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id     UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  analysis_type   VARCHAR(100) NOT NULL,
  analyst_id      UUID REFERENCES users(id),
  analyst_name    VARCHAR(255),
  analysis_date   DATE,
  lab_name        VARCHAR(255),
  findings        TEXT,
  conclusion      TEXT,
  report_url      TEXT,
  status          VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','completed','rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ea_evidence ON evidence_analysis(evidence_id);
CREATE INDEX IF NOT EXISTS idx_ea_status   ON evidence_analysis(status);

-- ── Evidence Disposal ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_disposal (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id         UUID NOT NULL REFERENCES evidence(id),
  disposal_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  disposal_method     VARCHAR(100) NOT NULL,
  authorized_by       UUID REFERENCES users(id),
  disposed_by         UUID REFERENCES users(id),
  reason              TEXT,
  certificate_number  VARCHAR(50),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Evidence Requests ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id    UUID NOT NULL REFERENCES evidence(id),
  requested_by   UUID NOT NULL REFERENCES users(id),
  request_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_reason TEXT NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','fulfilled','returned')),
  approved_by    UUID REFERENCES users(id),
  approved_at    TIMESTAMPTZ,
  fulfilled_at   TIMESTAMPTZ,
  returned_at    TIMESTAMPTZ,
  due_date       DATE,
  notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_er_evidence ON evidence_requests(evidence_id);
CREATE INDEX IF NOT EXISTS idx_er_status   ON evidence_requests(status);

-- ── Updated_at triggers ───────────────────────────────────────
DROP TRIGGER IF EXISTS update_cases_updated_at    ON cases;
CREATE TRIGGER update_cases_updated_at    BEFORE UPDATE ON cases    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_evidence_updated_at ON evidence;
CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_cn_updated_at       ON case_notes;
CREATE TRIGGER update_cn_updated_at       BEFORE UPDATE ON case_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Case status trigger — log every status change ─────────────
CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_status_history(case_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status::TEXT, NEW.status::TEXT, auth.uid());

    INSERT INTO case_timeline(case_id, event_type, description, officer_id)
    VALUES (NEW.id, 'status_change',
            'Hali imebadilishwa: ' || OLD.status || ' → ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_case_status ON cases;
CREATE TRIGGER tg_case_status AFTER UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION log_case_status_change();

-- ── Evidence status trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION log_evidence_movement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chain_of_custody(evidence_id, transfer_reason)
    VALUES (NEW.id, 'Status change: ' || OLD.status || ' → ' || NEW.status);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_evidence_movement ON evidence;
CREATE TRIGGER tg_evidence_movement AFTER UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION log_evidence_movement();

-- ── Audit triggers ────────────────────────────────────────────
DROP TRIGGER IF EXISTS audit_cases    ON cases;    CREATE TRIGGER audit_cases    AFTER INSERT OR UPDATE OR DELETE ON cases    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
DROP TRIGGER IF EXISTS audit_evidence ON evidence; CREATE TRIGGER audit_evidence AFTER INSERT OR UPDATE OR DELETE ON evidence FOR EACH ROW EXECUTE FUNCTION create_audit_log();
DROP TRIGGER IF EXISTS audit_coc      ON chain_of_custody; CREATE TRIGGER audit_coc AFTER INSERT ON chain_of_custody FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE cases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_timeline       ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_witnesses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_suspects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_evidence       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence            ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_storage    ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_analysis   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_disposal   ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_of_custody    ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY cases_select ON cases FOR SELECT TO authenticated
  USING (is_commander() OR is_investigator() OR assigned_to = auth.uid() OR opened_by = auth.uid());
CREATE POLICY cases_insert ON cases FOR INSERT TO authenticated
  WITH CHECK (is_commander() OR is_investigator() OR is_officer());
CREATE POLICY cases_update ON cases FOR UPDATE TO authenticated
  USING (is_commander() OR is_investigator() OR assigned_to = auth.uid());

CREATE POLICY ca_select ON case_assignments FOR SELECT TO authenticated
  USING (officer_id = auth.uid() OR is_commander() OR is_investigator());
CREATE POLICY ca_write  ON case_assignments FOR ALL TO authenticated
  USING (is_commander() OR is_investigator()) WITH CHECK (TRUE);

CREATE POLICY cn_select ON case_notes FOR SELECT TO authenticated
  USING ((is_commander() OR is_investigator() OR officer_id = auth.uid())
         AND (NOT is_private OR officer_id = auth.uid() OR is_commander()));
CREATE POLICY cn_insert ON case_notes FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY ct_select ON case_timeline   FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY cw_select ON case_witnesses  FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY cw_write  ON case_witnesses  FOR ALL TO authenticated    USING (is_investigator() OR is_commander()) WITH CHECK (TRUE);
CREATE POLICY cd_select ON case_documents  FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY cd_write  ON case_documents  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY ev_select ON evidence FOR SELECT TO authenticated
  USING (is_commander() OR is_investigator() OR current_user_role() = ANY(ARRAY['evidence-officer','audit-officer']));
CREATE POLICY ev_insert ON evidence FOR INSERT TO authenticated
  WITH CHECK (is_officer() OR is_investigator() OR is_commander());
CREATE POLICY ev_update ON evidence FOR UPDATE TO authenticated
  USING (is_investigator() OR is_commander() OR current_user_role() = 'evidence-officer');

CREATE POLICY ev_cat_sel  ON evidence_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY ev_type_sel ON evidence_types      FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY ev_stor_sel ON evidence_storage    FOR SELECT TO authenticated USING (is_commander() OR is_investigator() OR current_user_role() = 'evidence-officer');
CREATE POLICY ev_file_sel ON evidence_files      FOR SELECT TO authenticated USING (is_commander() OR is_investigator());
CREATE POLICY ev_file_ins ON evidence_files      FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY coc_select  ON chain_of_custody    FOR SELECT TO authenticated USING (is_commander() OR is_investigator() OR current_user_role() = 'evidence-officer');
CREATE POLICY coc_insert  ON chain_of_custody    FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY er_select   ON evidence_requests   FOR SELECT TO authenticated USING (requested_by = auth.uid() OR is_commander() OR is_investigator());
CREATE POLICY er_insert   ON evidence_requests   FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY er_update   ON evidence_requests   FOR UPDATE TO authenticated USING (is_commander() OR current_user_role() = 'evidence-officer');

-- Seed evidence categories
INSERT INTO evidence_categories (name, description) VALUES
  ('Silaha',           'Weapons and firearms'),
  ('Hati',             'Documents and papers'),
  ('Fedha',            'Money and valuables'),
  ('Vifaa vya Kidijitali', 'Digital devices and media'),
  ('Dawa za Kulevya',  'Narcotics and controlled substances'),
  ('Magari',           'Vehicles and transport'),
  ('DNA / Mkojo',      'Biological samples'),
  ('Picha / Video',    'Photos and video footage'),
  ('Ushahidi Mwingine','Other evidence')
ON CONFLICT (name) DO NOTHING;
