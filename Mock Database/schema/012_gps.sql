CREATE TABLE IF NOT EXISTS gps_logs (
    id BIGSERIAL PRIMARY KEY,
    device_code VARCHAR(40) NOT NULL,
    vehicle_id BIGINT REFERENCES vehicles(id),
    officer_id BIGINT REFERENCES officers(id),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    speed_kmh NUMERIC(6,2),
    logged_at TIMESTAMPTZ NOT NULL,
    gps_status VARCHAR(20) NOT NULL CHECK (gps_status IN ('OK','SIGNAL_LOST','NO_FIX','OFFLINE')),
    failure_reason TEXT
);
