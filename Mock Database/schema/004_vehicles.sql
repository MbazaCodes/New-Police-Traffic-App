CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    current_owner_citizen_id BIGINT REFERENCES citizens(id),
    plate_number VARCHAR(12) NOT NULL,
    vin VARCHAR(32) NOT NULL UNIQUE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    manufacture_year INTEGER CHECK (manufacture_year BETWEEN 1980 AND 2035),
    import_date DATE,
    insurance_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (insurance_status IN ('ACTIVE','EXPIRED','MISSING')),
    registration_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (registration_status IN ('ACTIVE','SUSPENDED','STOLEN','IMPOUNDED')),
    quality_status VARCHAR(10) NOT NULL DEFAULT 'VALID' CHECK (quality_status IN ('VALID','WARNING','CORRUPTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_plate_format CHECK (plate_number ~ '^T[0-9]{3}[A-Z]{3}$' OR quality_status <> 'VALID')
);

CREATE TABLE IF NOT EXISTS vehicle_ownership_history (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    owner_citizen_id BIGINT NOT NULL REFERENCES citizens(id),
    from_date DATE NOT NULL,
    to_date DATE,
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('FIRST_REGISTRATION','SALE','INHERITANCE','SEIZURE','CORRECTION')),
    transfer_reference TEXT,
    is_circular_edge_case BOOLEAN NOT NULL DEFAULT FALSE
);
