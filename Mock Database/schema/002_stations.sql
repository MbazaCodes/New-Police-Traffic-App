CREATE TABLE IF NOT EXISTS stations (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT NOT NULL REFERENCES regions(id),
    station_code VARCHAR(11) NOT NULL UNIQUE CHECK (station_code ~ '^[A-Z]{3}-[A-Z]{3}-[0-9]{3}$'),
    station_name TEXT NOT NULL,
    ward TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO stations (region_id, station_code, station_name, ward)
SELECT r.id, s.station_code, s.station_name, s.ward
FROM (VALUES
('DAR','DAR-CEN-001','Dar Central Traffic Police Station','Kivukoni'),
('DAR','DAR-OST-002','Dar Oysterbay Traffic Outpost','Oysterbay'),
('ARU','ARU-CEN-003','Arusha Central Traffic Police Station','Sekei'),
('DOM','DOM-CEN-004','Dodoma Central Traffic Police Station','Nyerere Square'),
('MBY','MBY-CEN-005','Mbeya Central Traffic Police Station','Iyunga'),
('IRG','IRG-CEN-006','Iringa Central Traffic Police Station','Mlandege'),
('MWZ','MWZ-CEN-007','Mwanza Central Traffic Police Station','Nyamagana'),
('MOR','MOR-CEN-008','Morogoro Central Traffic Police Station','Kichangani'),
('TNG','TNG-CEN-009','Tanga Central Traffic Police Station','Ngamiani'),
('RUV','RUV-CEN-010','Ruvuma Central Traffic Police Station','Songea Urban'),
('NJM','NJM-CEN-011','Njombe Central Traffic Police Station','Ramadhani'),
('KGM','KGM-CEN-012','Kigoma Central Traffic Police Station','Kibirizi'),
('KGR','KGR-CEN-013','Kagera Central Traffic Police Station','Bukoba Urban'),
('SGD','SGD-CEN-014','Singida Central Traffic Police Station','Minga'),
('MTW','MTW-CEN-015','Mtwara Central Traffic Police Station','Mikindani'),
('LND','LND-CEN-016','Lindi Central Traffic Police Station','Rasbura'),
('KTV','KTV-CEN-017','Katavi Central Traffic Police Station','Mpanda Town'),
('SHY','SHY-CEN-018','Shinyanga Central Traffic Police Station','Kizumbi'),
('SIM','SIM-CEN-019','Simiyu Central Traffic Police Station','Bariadi Urban'),
('PWN','PWN-CEN-020','Pwani Central Traffic Police Station','Kibaha Mjini')
) AS s(region_code, station_code, station_name, ward)
JOIN regions r ON r.code = s.region_code
ON CONFLICT (station_code) DO NOTHING;
