CREATE TABLE IF NOT EXISTS officers (
    id BIGSERIAL PRIMARY KEY,
    mmic_number VARCHAR(8) NOT NULL UNIQUE CHECK (mmic_number ~ '^[FGHJK][0-9]{4}$'),
    station_id BIGINT NOT NULL REFERENCES stations(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    rank_title TEXT NOT NULL,
    shift_code VARCHAR(12) NOT NULL,
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE','SUSPENDED','TERMINATED')),
    is_corrupt_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officer_promotions (
    id BIGSERIAL PRIMARY KEY,
    officer_id BIGINT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
    old_rank TEXT NOT NULL,
    new_rank TEXT NOT NULL,
    promoted_at TIMESTAMPTZ NOT NULL,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS officer_suspensions (
    id BIGSERIAL PRIMARY KEY,
    officer_id BIGINT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
    suspended_from DATE NOT NULL,
    suspended_to DATE,
    reason TEXT NOT NULL,
    is_corruption_related BOOLEAN NOT NULL DEFAULT FALSE
);
