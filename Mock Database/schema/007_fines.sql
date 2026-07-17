CREATE TABLE IF NOT EXISTS fines (
    id BIGSERIAL PRIMARY KEY,
    fine_number VARCHAR(20) NOT NULL UNIQUE CHECK (fine_number ~ '^FN-[0-9]{4}-[0-9]{6}$'),
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    officer_id BIGINT NOT NULL REFERENCES officers(id),
    vehicle_id BIGINT REFERENCES vehicles(id),
    violation_type VARCHAR(30) NOT NULL CHECK (violation_type IN ('SPEEDING','DRUNK_DRIVING','PARKING','SEAT_BELT','RED_LIGHT','OTHER')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    issued_at TIMESTAMPTZ NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','PAID','FAILED','WAIVED')),
    quality_status VARCHAR(10) NOT NULL DEFAULT 'VALID' CHECK (quality_status IN ('VALID','WARNING','CORRUPTED'))
);
