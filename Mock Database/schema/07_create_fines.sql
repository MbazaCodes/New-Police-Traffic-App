CREATE TABLE IF NOT EXISTS fines (
	id BIGSERIAL PRIMARY KEY,
	fine_number VARCHAR(14) NOT NULL UNIQUE CHECK (fine_number ~ '^FN-2026-[0-9]{6}$'),
	citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
	officer_id BIGINT NOT NULL REFERENCES officers(id) ON UPDATE CASCADE,
	vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
	offense_type TEXT NOT NULL,
	amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
	location TEXT NOT NULL,
	issued_at TIMESTAMPTZ NOT NULL,
	due_date DATE NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'VOID')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CHECK (due_date >= DATE(issued_at))
);

