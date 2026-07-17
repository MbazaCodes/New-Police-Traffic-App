CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS regions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE CHECK (code ~ '^[A-Z]{3}$'),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO regions (code, name) VALUES
('DAR','Dar es Salaam'),
('ARU','Arusha'),
('DOM','Dodoma'),
('MBY','Mbeya'),
('IRG','Iringa'),
('MWZ','Mwanza'),
('MOR','Morogoro'),
('TNG','Tanga'),
('RUV','Ruvuma'),
('NJM','Njombe'),
('KGM','Kigoma'),
('KGR','Kagera'),
('SGD','Singida'),
('MTW','Mtwara'),
('LND','Lindi'),
('KTV','Katavi'),
('SHY','Shinyanga'),
('SIM','Simiyu'),
('PWN','Pwani')
ON CONFLICT (code) DO NOTHING;
