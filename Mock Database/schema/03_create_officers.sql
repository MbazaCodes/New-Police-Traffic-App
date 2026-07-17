CREATE TABLE IF NOT EXISTS officers (
	id BIGSERIAL PRIMARY KEY,
	station_id BIGINT NOT NULL REFERENCES stations(id) ON UPDATE CASCADE,
	mmic_number VARCHAR(5) NOT NULL UNIQUE CHECK (mmic_number ~ '^[FGHJK][0-9]{4}$'),
	badge_number VARCHAR(16) NOT NULL UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	rank_title TEXT NOT NULL,
	phone_number VARCHAR(15),
	email TEXT,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

