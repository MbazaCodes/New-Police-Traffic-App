-- Check actual data state
SELECT 'citizens total' tbl, COUNT(*) FROM citizens
UNION ALL SELECT 'citizens Raia%', COUNT(*) FROM citizens WHERE name LIKE 'Raia%'
UNION ALL SELECT 'citizens real names', COUNT(*) FROM citizens WHERE name NOT LIKE 'Raia%'
UNION ALL SELECT 'citizens with nida', COUNT(*) FROM citizens WHERE nida IS NOT NULL
UNION ALL SELECT 'citizens with region', COUNT(*) FROM citizens WHERE region IS NOT NULL
UNION ALL SELECT 'vehicles total', COUNT(*) FROM vehicles
UNION ALL SELECT 'vehicles Mmiliki%', COUNT(*) FROM vehicles WHERE owner_name LIKE 'Mmiliki%'
UNION ALL SELECT 'vehicles with chassis', COUNT(*) FROM vehicles WHERE chassis_no IS NOT NULL
UNION ALL SELECT 'devices total', COUNT(*) FROM devices
UNION ALL SELECT 'properties total', COUNT(*) FROM properties
UNION ALL SELECT 'properties with type', COUNT(*) FROM properties WHERE property_type IS NOT NULL AND property_type != ''
UNION ALL SELECT 'properties with value', COUNT(*) FROM properties WHERE value IS NOT NULL;

-- Sample citizens
SELECT name, nida, region, mobile FROM citizens LIMIT 5;
-- Sample vehicles  
SELECT plate, owner_name, chassis_no FROM vehicles LIMIT 5;
-- Sample properties
SELECT name, property_type, region, value FROM properties LIMIT 5;
