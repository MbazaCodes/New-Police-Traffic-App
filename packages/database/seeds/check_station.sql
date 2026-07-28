-- Check station IDs and data linkage
SELECT 'stations' as tbl, id, name, region FROM stations ORDER BY name LIMIT 10;
SELECT 'users with station' as tbl, name, badge_no, station_id FROM users WHERE station_id IS NOT NULL LIMIT 10;
SELECT 'arrests station_id' as tbl, station_id, COUNT(*) FROM arrests GROUP BY station_id LIMIT 5;
SELECT 'posts station_id' as tbl, station_id, COUNT(*) FROM posts GROUP BY station_id LIMIT 5;
