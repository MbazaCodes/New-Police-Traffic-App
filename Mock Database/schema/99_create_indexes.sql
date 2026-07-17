CREATE INDEX IF NOT EXISTS idx_stations_region_id ON stations(region_id);

CREATE INDEX IF NOT EXISTS idx_officers_station_id ON officers(station_id);
CREATE INDEX IF NOT EXISTS idx_officers_last_name ON officers(last_name);

CREATE INDEX IF NOT EXISTS idx_citizens_last_name ON citizens(last_name);
CREATE INDEX IF NOT EXISTS idx_citizens_region_code ON citizens(region_code);
CREATE INDEX IF NOT EXISTS idx_citizens_dob ON citizens(date_of_birth);

CREATE INDEX IF NOT EXISTS idx_licenses_citizen_id ON licenses(citizen_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

CREATE INDEX IF NOT EXISTS idx_vehicles_citizen_id ON vehicles(citizen_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);

CREATE INDEX IF NOT EXISTS idx_fines_citizen_id ON fines(citizen_id);
CREATE INDEX IF NOT EXISTS idx_fines_officer_id ON fines(officer_id);
CREATE INDEX IF NOT EXISTS idx_fines_vehicle_id ON fines(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_issued_at ON fines(issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_cases_citizen_id ON cases(citizen_id);
CREATE INDEX IF NOT EXISTS idx_cases_officer_id ON cases(officer_id);
CREATE INDEX IF NOT EXISTS idx_cases_station_id ON cases(station_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_opened_at ON cases(opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_wanted_citizen_id ON wanted_persons(citizen_id);
CREATE INDEX IF NOT EXISTS idx_wanted_case_id ON wanted_persons(case_id);
CREATE INDEX IF NOT EXISTS idx_wanted_active ON wanted_persons(active);

CREATE INDEX IF NOT EXISTS idx_devices_citizen_id ON devices(citizen_id);
CREATE INDEX IF NOT EXISTS idx_devices_registered_at ON devices(registered_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_officer_id ON audit_logs(officer_id);
CREATE INDEX IF NOT EXISTS idx_audit_citizen_id ON audit_logs(citizen_id);
CREATE INDEX IF NOT EXISTS idx_audit_case_id ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_table, target_record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logged_at ON audit_logs(logged_at DESC);

