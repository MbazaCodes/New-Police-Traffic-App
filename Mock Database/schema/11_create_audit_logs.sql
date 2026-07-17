CREATE TABLE IF NOT EXISTS audit_logs (
	id BIGSERIAL PRIMARY KEY,
	officer_id BIGINT REFERENCES officers(id) ON DELETE SET NULL,
	citizen_id BIGINT REFERENCES citizens(id) ON DELETE SET NULL,
	case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
	action TEXT NOT NULL,
	target_table TEXT NOT NULL,
	target_record_id BIGINT,
	ip_address INET,
	metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
	logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

