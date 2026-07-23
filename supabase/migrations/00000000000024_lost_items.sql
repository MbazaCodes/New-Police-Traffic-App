-- Migration 024: Lost Items table
-- Separate from the land/property management table (migration 014).
-- This tracks mali zilizopotea/kupatikana at police posts/stations.

CREATE TABLE IF NOT EXISTS lost_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_number     VARCHAR(30) UNIQUE NOT NULL,
  category        VARCHAR(50) NOT NULL DEFAULT 'mali-nyingine',
  description     TEXT NOT NULL,
  serial_no       VARCHAR(100),
  device_no       VARCHAR(100),
  brand           VARCHAR(100),
  color           VARCHAR(50),
  estimated_value VARCHAR(50),
  status          VARCHAR(20) NOT NULL DEFAULT 'searching'
    CHECK (status IN ('searching','found','returned','claimed','unclaimed','destroyed')),
  owner_name      VARCHAR(255),
  owner_phone     VARCHAR(20),
  owner_nida      VARCHAR(20),
  reporter_name   VARCHAR(255),
  reporter_phone  VARCHAR(20),
  reported_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  found_date      DATE,
  found_location  TEXT,
  station_id      UUID REFERENCES stations(id),
  station_name    VARCHAR(255),
  officer_id      UUID REFERENCES users(id),
  officer_name    VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate item number: LI-YYYY-NNNNN
CREATE SEQUENCE IF NOT EXISTS lost_item_seq START 1001;
CREATE OR REPLACE FUNCTION auto_lost_item_number() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.item_number IS NULL OR NEW.item_number = '' THEN
    NEW.item_number := 'LI-' || TO_CHAR(NOW(),'YYYY') || '-' ||
                       LPAD(nextval('lost_item_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS tg_lost_item_number ON lost_items;
CREATE TRIGGER tg_lost_item_number BEFORE INSERT ON lost_items
  FOR EACH ROW EXECUTE FUNCTION auto_lost_item_number();

CREATE INDEX IF NOT EXISTS idx_lost_items_status   ON lost_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_items_station  ON lost_items(station_id);
CREATE INDEX IF NOT EXISTS idx_lost_items_date     ON lost_items(reported_date);
