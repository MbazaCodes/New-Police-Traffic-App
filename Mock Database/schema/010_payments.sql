CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    payment_ref VARCHAR(24) NOT NULL UNIQUE,
    fine_id BIGINT NOT NULL REFERENCES fines(id),
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_channel VARCHAR(20) NOT NULL CHECK (payment_channel IN ('MOBILE_MONEY','BANK','CARD','CASH')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('SUCCESS','FAILED','PENDING','REVERSED')),
    paid_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
