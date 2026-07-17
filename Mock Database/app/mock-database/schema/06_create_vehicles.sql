CREATE TABLE IF NOT EXISTS vehicles (
	id BIGSERIAL PRIMARY KEY,
	citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
	plate_number VARCHAR(7) NOT NULL UNIQUE CHECK (plate_number ~ '^T[0-9]{3}[A-Z]{3}$'),
	make TEXT NOT NULL,
	model TEXT NOT NULL,
	color TEXT,
	manufacture_year INTEGER CHECK (manufacture_year BETWEEN 1980 AND 2035),
	chassis_number VARCHAR(32) NOT NULL UNIQUE,
	engine_number VARCHAR(32) NOT NULL UNIQUE,
	registration_date DATE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

