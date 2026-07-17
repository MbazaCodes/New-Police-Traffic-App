CREATE TABLE IF NOT EXISTS cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(20) NOT NULL UNIQUE CHECK (case_number ~ '^TZP-[0-9]{4}-[0-9]{6}$'),
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    officer_id BIGINT NOT NULL REFERENCES officers(id),
    station_id BIGINT NOT NULL REFERENCES stations(id),
    related_fine_id BIGINT REFERENCES fines(id),
    case_type TEXT NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('OPEN','CLOSED','UNDER_INVESTIGATION')),
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ,
    summary TEXT,
    CHECK (closed_at IS NULL OR closed_at >= opened_at)
);
