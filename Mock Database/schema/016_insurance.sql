CREATE TABLE IF NOT EXISTS insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    policy_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    provider_name TEXT NOT NULL,
    policy_status VARCHAR(20) NOT NULL CHECK (policy_status IN ('ACTIVE','EXPIRED','CANCELLED','MISSING')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);
