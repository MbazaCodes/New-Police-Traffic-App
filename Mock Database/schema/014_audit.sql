CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_officer_id BIGINT REFERENCES officers(id),
    actor_user_session_id BIGINT,
    action_name VARCHAR(40) NOT NULL,
    target_table VARCHAR(40) NOT NULL,
    target_id BIGINT,
    action_status VARCHAR(20) NOT NULL CHECK (action_status IN ('SUCCESS','FAILED','WARNING')),
    ip_address INET,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    event_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS device_logs (
    id BIGSERIAL PRIMARY KEY,
    device_code VARCHAR(40) NOT NULL,
    station_id BIGINT REFERENCES stations(id),
    officer_id BIGINT REFERENCES officers(id),
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('INFO','WARN','ERROR')),
    log_message TEXT NOT NULL,
    is_offline BOOLEAN NOT NULL DEFAULT FALSE,
    logged_at TIMESTAMPTZ NOT NULL
);
