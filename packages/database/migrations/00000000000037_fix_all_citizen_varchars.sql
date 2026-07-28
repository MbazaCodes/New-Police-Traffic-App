-- Extend ALL remaining varchar columns on citizens to TEXT
DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN 
    SELECT column_name FROM information_schema.columns 
    WHERE table_name='citizens' AND data_type='character varying'
  LOOP
    EXECUTE format('ALTER TABLE citizens ALTER COLUMN %I TYPE TEXT', col.column_name);
    RAISE NOTICE 'Extended: %', col.column_name;
  END LOOP;
END $$;

-- Update existing "Raia N" citizens with proper NIDA format
UPDATE citizens SET
  nida = to_char(COALESCE(dob, CURRENT_DATE - (ROW_NUMBER() OVER (ORDER BY id) * 20 + 6000)::int), 'YYYYMMDD') ||
         '-' || lpad((ROW_NUMBER() OVER (ORDER BY id) * 7 % 99999)::text, 5, '0') ||
         '-' || lpad((ROW_NUMBER() OVER (ORDER BY id) * 13 % 99999)::text, 5, '0') ||
         '-' || lpad((ROW_NUMBER() OVER (ORDER BY id) % 99)::text, 2, '0')
WHERE nida IS NULL OR nida = '';

SELECT COUNT(*) as citizens_with_nida FROM citizens WHERE nida IS NOT NULL AND nida != '';
