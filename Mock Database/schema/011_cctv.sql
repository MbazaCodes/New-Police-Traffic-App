CREATE TABLE IF NOT EXISTS cctv_events (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT REFERENCES stations(id),
    camera_id VARCHAR(40) NOT NULL,
    citizen_id BIGINT REFERENCES citizens(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('SPEED_TRIGGER','RED_LIGHT','COLLISION','TRACKING','OFFLINE','MANUAL_REVIEW')),
    confidence_score NUMERIC(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    event_time TIMESTAMPTZ NOT NULL,
    image_path TEXT,
    is_device_offline BOOLEAN NOT NULL DEFAULT FALSE
);
