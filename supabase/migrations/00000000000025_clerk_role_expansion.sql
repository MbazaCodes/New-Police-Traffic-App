-- Migration 025: Ensure all role enum values and missing_records columns exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'clerk';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'investigator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'station-commissioner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'district-commissioner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'regional-commissioner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'national-commissioner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cid-officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'post-officer';

ALTER TABLE missing_records ADD COLUMN IF NOT EXISTS case_no           VARCHAR(30);
ALTER TABLE missing_records ADD COLUMN IF NOT EXISTS photo             TEXT;
ALTER TABLE missing_records ADD COLUMN IF NOT EXISTS last_seen_location TEXT;
ALTER TABLE missing_records ADD COLUMN IF NOT EXISTS reported_by       VARCHAR(255);
ALTER TABLE missing_records ADD COLUMN IF NOT EXISTS station           VARCHAR(255);
