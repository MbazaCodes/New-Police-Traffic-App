CREATE TABLE IF NOT EXISTS licenses (
	id BIGSERIAL PRIMARY KEY,
	citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
	license_number VARCHAR(10) NOT NULL UNIQUE CHECK (license_number ~ '^4[0-9]{9}$'),
	class_code VARCHAR(2) NOT NULL,
	issue_date DATE NOT NULL,
	expiry_date DATE NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'EXPIRED')),
	issued_by_station_id BIGINT REFERENCES stations(id) ON UPDATE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CHECK (expiry_date > issue_date)
);

