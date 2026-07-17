CREATE OR REPLACE VIEW v_citizen_lifecycle AS
SELECT
    c.id AS citizen_id,
    c.nida,
    c.first_name,
    c.last_name,
    COUNT(DISTINCT l.id) AS license_count,
    COUNT(DISTINCT v.id) AS vehicle_count,
    COUNT(DISTINCT f.id) AS fine_count,
    COUNT(DISTINCT cs.id) AS case_count,
    COUNT(DISTINCT cr.id) AS court_count
FROM citizens c
LEFT JOIN licenses l ON l.citizen_id = c.id
LEFT JOIN vehicles v ON v.current_owner_citizen_id = c.id
LEFT JOIN fines f ON f.citizen_id = c.id
LEFT JOIN cases cs ON cs.citizen_id = c.id
LEFT JOIN court_records cr ON cr.case_id = cs.id
GROUP BY c.id, c.nida, c.first_name, c.last_name;

CREATE OR REPLACE VIEW v_system_health AS
SELECT
    NOW() AS generated_at,
    (SELECT COUNT(*) FROM citizens) AS citizens,
    (SELECT COUNT(*) FROM vehicles) AS vehicles,
    (SELECT COUNT(*) FROM fines) AS fines,
    (SELECT COUNT(*) FROM payments WHERE payment_status = 'FAILED') AS failed_payments,
    (SELECT COUNT(*) FROM gps_logs WHERE gps_status <> 'OK') AS gps_failures,
    (SELECT COUNT(*) FROM cctv_events WHERE is_device_offline = TRUE) AS offline_cctv;
