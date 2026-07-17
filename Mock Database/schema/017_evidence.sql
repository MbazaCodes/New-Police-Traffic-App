CREATE TABLE IF NOT EXISTS evidence (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id),
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('CCTV','GPS','PHOTO','DOCUMENT','WITNESS','DEVICE_LOG')),
    collected_by_officer_id BIGINT REFERENCES officers(id),
    collected_at TIMESTAMPTZ NOT NULL,
    chain_of_custody_ref VARCHAR(50),
    integrity_hash VARCHAR(128),
    is_missing BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    evidence_id BIGINT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    content_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
