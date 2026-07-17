CREATE TABLE IF NOT EXISTS court_records (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id),
    court_name TEXT NOT NULL,
    hearing_date DATE NOT NULL,
    verdict_status VARCHAR(30) NOT NULL CHECK (verdict_status IN ('PENDING','DISMISSED','CONVICTED','SETTLED')),
    penalty_amount NUMERIC(12,2),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_timeline_events (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    event_type TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL,
    related_case_id BIGINT REFERENCES cases(id),
    related_fine_id BIGINT REFERENCES fines(id),
    narrative TEXT
);
