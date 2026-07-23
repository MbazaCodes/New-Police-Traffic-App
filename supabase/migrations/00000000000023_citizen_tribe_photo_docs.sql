-- Migration 023: Add tribe, photo, and documents to citizens table
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS tribe        VARCHAR(100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS photo_url    TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS documents    JSONB DEFAULT '[]'::jsonb;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS nationality  VARCHAR(100) DEFAULT 'Mtanzania';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS religion     VARCHAR(100);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blood_group  VARCHAR(5);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS notes        TEXT;
