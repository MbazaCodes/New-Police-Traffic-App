-- Check citizens status column type
SELECT column_name, data_type, udt_name FROM information_schema.columns 
WHERE table_name='citizens' AND column_name='status';

-- Check if it's an enum and what values are valid
SELECT t.typname, e.enumlabel FROM pg_enum e 
JOIN pg_type t ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%citizen%' OR t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- Check citizen_accounts columns
SELECT column_name FROM information_schema.columns 
WHERE table_name='citizen_accounts' ORDER BY ordinal_position;
