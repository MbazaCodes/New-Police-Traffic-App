CREATE TABLE IF NOT EXISTS stations (
	id BIGSERIAL PRIMARY KEY,
	region_id BIGINT NOT NULL REFERENCES regions(id) ON UPDATE CASCADE,
	station_code VARCHAR(11) NOT NULL UNIQUE CHECK (station_code ~ '^[A-Z]{3}-[A-Z]{3}-[0-9]{3}$'),
	station_name TEXT NOT NULL,
	ward TEXT,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO stations (region_id, station_code, station_name, ward)
VALUES
	((SELECT id FROM regions WHERE code = 'DAR'), 'DAR-CEN-001', 'Dar Central Traffic Police Station', 'Kivukoni'),
	((SELECT id FROM regions WHERE code = 'DAR'), 'DAR-OST-002', 'Dar Oysterbay Traffic Outpost', 'Oysterbay'),
	((SELECT id FROM regions WHERE code = 'ARU'), 'ARU-CEN-003', 'Arusha Central Traffic Police Station', 'Sekei'),
	((SELECT id FROM regions WHERE code = 'DOM'), 'DOM-CEN-004', 'Dodoma Central Traffic Police Station', 'Nyerere Square'),
	((SELECT id FROM regions WHERE code = 'MBY'), 'MBY-CEN-005', 'Mbeya Central Traffic Police Station', 'Iyunga'),
	((SELECT id FROM regions WHERE code = 'IRG'), 'IRG-CEN-006', 'Iringa Central Traffic Police Station', 'Mlandege'),
	((SELECT id FROM regions WHERE code = 'MWZ'), 'MWZ-CEN-007', 'Mwanza Central Traffic Police Station', 'Nyamagana'),
	((SELECT id FROM regions WHERE code = 'MOR'), 'MOR-CEN-008', 'Morogoro Central Traffic Police Station', 'Kichangani'),
	((SELECT id FROM regions WHERE code = 'TNG'), 'TNG-CEN-009', 'Tanga Central Traffic Police Station', 'Ngamiani'),
	((SELECT id FROM regions WHERE code = 'RUV'), 'RUV-CEN-010', 'Ruvuma Central Traffic Police Station', 'Songea Urban'),
	((SELECT id FROM regions WHERE code = 'NJM'), 'NJM-CEN-011', 'Njombe Central Traffic Police Station', 'Ramadhani'),
	((SELECT id FROM regions WHERE code = 'KGM'), 'KGM-CEN-012', 'Kigoma Central Traffic Police Station', 'Kibirizi'),
	((SELECT id FROM regions WHERE code = 'KGR'), 'KGR-CEN-013', 'Kagera Central Traffic Police Station', 'Bukoba Urban'),
	((SELECT id FROM regions WHERE code = 'SGD'), 'SGD-CEN-014', 'Singida Central Traffic Police Station', 'Minga'),
	((SELECT id FROM regions WHERE code = 'MTW'), 'MTW-CEN-015', 'Mtwara Central Traffic Police Station', 'Mikindani'),
	((SELECT id FROM regions WHERE code = 'LND'), 'LND-CEN-016', 'Lindi Central Traffic Police Station', 'Rasbura'),
	((SELECT id FROM regions WHERE code = 'KTV'), 'KTV-CEN-017', 'Katavi Central Traffic Police Station', 'Mpanda Town'),
	((SELECT id FROM regions WHERE code = 'SHY'), 'SHY-CEN-018', 'Shinyanga Central Traffic Police Station', 'Kizumbi'),
	((SELECT id FROM regions WHERE code = 'SIM'), 'SIM-CEN-019', 'Simiyu Central Traffic Police Station', 'Bariadi Urban'),
	((SELECT id FROM regions WHERE code = 'PWN'), 'PWN-CEN-020', 'Pwani Central Traffic Police Station', 'Kibaha Mjini')
ON CONFLICT (station_code) DO NOTHING;

