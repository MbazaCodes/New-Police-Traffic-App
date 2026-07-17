CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    officer_id BIGINT REFERENCES officers(id),
    device_id VARCHAR(40),
    session_token UUID NOT NULL DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    auth_method VARCHAR(20) NOT NULL CHECK (auth_method IN ('PASSWORD','SSO','TOKEN','MFA')),
    session_status VARCHAR(20) NOT NULL CHECK (session_status IN ('ACTIVE','EXPIRED','LOCKED','TERMINATED')),
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);
