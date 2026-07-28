-- Add ward (Kata/Mtaa) column to stations.
-- create-station-page was already sending `ward` but the API dropped it
-- and no column existed. This makes the full location chain persist:
-- region -> district -> ward -> address.
ALTER TABLE stations ADD COLUMN IF NOT EXISTS ward VARCHAR(150);
