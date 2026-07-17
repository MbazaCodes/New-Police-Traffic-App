CREATE TABLE IF NOT EXISTS wanted_persons (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    case_id BIGINT REFERENCES cases(id),
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    last_seen_location TEXT,
    listed_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (resolved_at IS NULL OR resolved_at >= listed_at)
);
