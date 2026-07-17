CREATE TABLE IF NOT EXISTS licenses (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    license_number VARCHAR(12) NOT NULL,
    class_code VARCHAR(4) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','EXPIRED','SUSPENDED','REVOKED','FAKE')),
    issuing_station_id BIGINT REFERENCES stations(id),
    quality_status VARCHAR(10) NOT NULL DEFAULT 'VALID' CHECK (quality_status IN ('VALID','WARNING','CORRUPTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_license_number CHECK (license_number ~ '^4[0-9]{9}$' OR status = 'FAKE')
);

CREATE TABLE IF NOT EXISTS license_renewals (
    id BIGSERIAL PRIMARY KEY,
    license_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    renewal_date DATE NOT NULL,
    previous_expiry DATE NOT NULL,
    new_expiry DATE NOT NULL,
    processed_by_officer_id BIGINT,
    notes TEXT
);
