CREATE TABLE IF NOT EXISTS citizens (
    id BIGSERIAL PRIMARY KEY,
    nida VARCHAR(20) NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(1) NOT NULL CHECK (gender IN ('M','F')),
    phone_number VARCHAR(20),
    current_address TEXT NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id),
    biometrics_id UUID NOT NULL DEFAULT gen_random_uuid(),
    quality_status VARCHAR(10) NOT NULL DEFAULT 'VALID' CHECK (quality_status IN ('VALID','WARNING','CORRUPTED')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_citizen_nida_format CHECK (nida ~ '^[0-9]{20}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_citizens_nida_not_deleted
ON citizens(nida)
WHERE is_deleted = FALSE;

CREATE TABLE IF NOT EXISTS citizen_relationships (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    related_citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('PARENT','CHILD','SPOUSE','SIBLING','GUARDIAN')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (citizen_id <> related_citizen_id)
);

CREATE TABLE IF NOT EXISTS citizen_address_history (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    address_text TEXT NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id),
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE
);
