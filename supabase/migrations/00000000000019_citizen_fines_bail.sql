-- ============================================================
-- Migration 019: Citizen Fines + Bail Requests
-- TZ Police Digital Platform
-- ============================================================

-- ── 1. CITIZEN FINES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_fines (
  id              TEXT PRIMARY KEY DEFAULT 'FP-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('citizen_fine_seq')::TEXT, 4, '0'),
  citation_ref    TEXT,                          -- links to an existing citation_id if applicable
  driver_name     TEXT NOT NULL,
  driver_phone    TEXT,
  driver_nida     TEXT,
  plate           TEXT,
  offense         TEXT NOT NULL,
  base_amount     INTEGER NOT NULL,              -- TZS
  penalty_amount  INTEGER NOT NULL DEFAULT 0,   -- calculated at payment time
  total_amount    INTEGER NOT NULL,             -- base + penalty
  weeks_overdue   INTEGER NOT NULL DEFAULT 0,
  due_date        TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT CHECK (payment_method IN ('mpesa','tigopesa','airtel','cash')),
  payment_ref     TEXT,                          -- mobile money transaction ref
  status          TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid','waived','disputed')),
  officer_id      TEXT,                          -- recording officer badge/id
  officer_name    TEXT,
  station         TEXT,
  region          TEXT,
  district        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequence for fine IDs
CREATE SEQUENCE IF NOT EXISTS citizen_fine_seq START 1000;

-- ── 2. BAIL REQUESTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bail_requests (
  id                  TEXT PRIMARY KEY DEFAULT 'BL-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('bail_seq')::TEXT, 4, '0'),
  arrest_id           TEXT,                      -- links to arrests table
  suspect_name        TEXT NOT NULL,
  suspect_nida        TEXT,
  offense             TEXT NOT NULL,
  arrest_date         DATE,
  cell_number         TEXT,

  -- Bail amount
  bail_amount         INTEGER NOT NULL,          -- TZS

  -- Guarantor
  guarantor_name      TEXT NOT NULL,
  guarantor_phone     TEXT NOT NULL,
  guarantor_nida      TEXT,
  guarantor_relation  TEXT,                      -- Mzazi, Ndugu, Mke/Mume, etc.

  -- Payment
  payment_method      TEXT CHECK (payment_method IN ('mpesa','tigopesa','airtel','cash')),
  payment_ref         TEXT,
  paid_at             TIMESTAMPTZ,

  -- Conditions
  conditions_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  conditions_text     TEXT[],

  -- Status
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','revoked','completed')),
  approved_by         TEXT,                      -- officer badge
  approved_at         TIMESTAMPTZ,
  revoke_reason       TEXT,

  -- Court
  court_date          DATE,
  court_appearance_confirmed BOOLEAN DEFAULT FALSE,

  -- Audit
  officer_id          TEXT,
  officer_name        TEXT,
  station             TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS bail_seq START 1000;

-- ── 3. PENALTY ESCALATION LOG ─────────────────────────────────
-- Tracks each time a fine's penalty was recalculated (audit trail)
CREATE TABLE IF NOT EXISTS fine_penalty_log (
  id            BIGSERIAL PRIMARY KEY,
  fine_id       TEXT NOT NULL REFERENCES citizen_fines(id) ON DELETE CASCADE,
  weeks_overdue INTEGER NOT NULL,
  penalty_rate  NUMERIC(5,4) NOT NULL,          -- e.g. 0.1500 = 15%
  penalty_added INTEGER NOT NULL,               -- TZS added this cycle
  new_total     INTEGER NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_citizen_fines_status   ON citizen_fines(status);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_plate    ON citizen_fines(plate);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_nida     ON citizen_fines(driver_nida);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_citation ON citizen_fines(citation_ref);
CREATE INDEX IF NOT EXISTS idx_citizen_fines_due_date ON citizen_fines(due_date) WHERE status = 'unpaid';
CREATE INDEX IF NOT EXISTS idx_bail_requests_arrest   ON bail_requests(arrest_id);
CREATE INDEX IF NOT EXISTS idx_bail_requests_status   ON bail_requests(status);

-- ── 5. UPDATED_AT TRIGGERS ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_citizen_fines_updated_at ON citizen_fines;
CREATE TRIGGER trg_citizen_fines_updated_at
  BEFORE UPDATE ON citizen_fines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bail_requests_updated_at ON bail_requests;
CREATE TRIGGER trg_bail_requests_updated_at
  BEFORE UPDATE ON bail_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. PENALTY ESCALATION FUNCTION ───────────────────────────
-- Called by a cron job or manually — recalculates all overdue fines
CREATE OR REPLACE FUNCTION escalate_overdue_fines()
RETURNS TABLE(fine_id TEXT, weeks_overdue INT, new_total INT) LANGUAGE plpgsql AS $$
DECLARE
  r RECORD;
  weeks INT;
  penalty INT;
  new_tot INT;
BEGIN
  FOR r IN
    SELECT * FROM citizen_fines
    WHERE status = 'unpaid'
      AND due_date IS NOT NULL
      AND due_date < now()
  LOOP
    weeks   := FLOOR(EXTRACT(EPOCH FROM (now() - r.due_date)) / (7 * 86400))::INT;
    penalty := ROUND(r.base_amount * weeks * 0.05)::INT;
    new_tot := r.base_amount + penalty;

    -- Only update if penalty has changed
    IF penalty <> r.penalty_amount THEN
      UPDATE citizen_fines
      SET penalty_amount = penalty,
          total_amount   = new_tot,
          weeks_overdue  = weeks
      WHERE id = r.id;

      INSERT INTO fine_penalty_log(fine_id, weeks_overdue, penalty_rate, penalty_added, new_total)
      VALUES (r.id, weeks, weeks * 0.05, penalty - r.penalty_amount, new_tot);

      fine_id       := r.id;
      weeks_overdue := weeks;
      new_total     := new_tot;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- ── 7. RLS POLICIES ───────────────────────────────────────────
ALTER TABLE citizen_fines   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bail_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_penalty_log ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all RLS (used by Edge Functions + server)
CREATE POLICY "service_role_all_fines"    ON citizen_fines    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_bail"     ON bail_requests    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_penlog"   ON fine_penalty_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated officers can read/insert (no delete)
CREATE POLICY "auth_read_fines"    ON citizen_fines    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_fines"  ON citizen_fines    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_fines"  ON citizen_fines    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_bail"     ON bail_requests    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_bail"   ON bail_requests    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_bail"   ON bail_requests    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_penlog"   ON fine_penalty_log FOR SELECT TO authenticated USING (true);

-- ── 8. SEED: sample unpaid fines (mirrors mock data) ─────────
INSERT INTO citizen_fines
  (id, driver_name, plate, offense, base_amount, penalty_amount, total_amount, weeks_overdue, due_date, status, officer_name, station)
VALUES
  ('FP-2026-1001', 'Juma Khamis Mwinyi',  'T 003 GHI', 'Over Speeding',                     150000, 0, 150000, 0, now() + interval '20 days', 'unpaid', 'Cprl. Juma Mwinyi', 'Kituo Kikuu DSM'),
  ('FP-2026-1002', 'Grace Amina Mushi',   'T 007 STU', 'Kutumia Simu wakati wa Udereva',      50000, 0,  50000, 0, now() + interval '15 days', 'unpaid', 'Sgt. Ali Hassan',   'Kinondoni'),
  ('FP-2026-1003', 'Baraka Msangi',       'T888ZZZ',   'No Insurance',                       200000, 0, 200000, 0, now() - interval '14 days', 'unpaid', 'Insp. Grace Mushi', 'Ilala'),
  ('FP-2026-1004', 'Hamisi Rashid Omar',  'T 018 ZAB', 'Kutopita kasi',                       30000, 0,  30000, 0, now() - interval '21 days', 'unpaid', 'Cprl. Saidi Juma',  'Temeke')
ON CONFLICT (id) DO NOTHING;

-- Run escalation immediately on seeded overdue fines
SELECT escalate_overdue_fines();

COMMENT ON TABLE citizen_fines    IS 'Minor traffic fine payments processed by field officers';
COMMENT ON TABLE bail_requests    IS 'Bail applications for arrested citizens with guarantor and payment records';
COMMENT ON TABLE fine_penalty_log IS 'Audit trail of 5%-per-week penalty escalation on overdue fines';
COMMENT ON FUNCTION escalate_overdue_fines IS 'Recalculates penalties for all unpaid overdue fines. Schedule via pg_cron: SELECT cron.schedule(''escalate-fines'', ''0 0 * * *'', ''SELECT escalate_overdue_fines()'');';
