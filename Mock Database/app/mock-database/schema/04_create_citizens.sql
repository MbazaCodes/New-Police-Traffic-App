CREATE TABLE IF NOT EXISTS citizens (
	id BIGSERIAL PRIMARY KEY,
	nida VARCHAR(20) NOT NULL UNIQUE CHECK (nida ~ '^[0-9]{20}$'),
	first_name TEXT NOT NULL,
	middle_name TEXT,
	last_name TEXT NOT NULL,
	date_of_birth DATE NOT NULL,
	gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
	phone_number VARCHAR(15),
	email TEXT,
	address TEXT,
	region_code VARCHAR(3) REFERENCES regions(code) ON UPDATE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

