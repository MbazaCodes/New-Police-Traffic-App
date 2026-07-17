CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT REFERENCES citizens(id),
    officer_id BIGINT REFERENCES officers(id),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('SMS','EMAIL','APP','PRINT')),
    notification_type VARCHAR(30) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_status VARCHAR(20) NOT NULL CHECK (delivery_status IN ('SENT','FAILED','QUEUED','READ')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
