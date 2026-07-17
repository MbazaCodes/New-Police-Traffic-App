CREATE INDEX IF NOT EXISTS idx_citizens_nida ON citizens(nida);
CREATE INDEX IF NOT EXISTS idx_citizens_region ON citizens(region_id);
CREATE INDEX IF NOT EXISTS idx_citizens_quality ON citizens(quality_status);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(current_owner_citizen_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_history_vehicle ON vehicle_ownership_history(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_licenses_citizen ON licenses(citizen_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

CREATE INDEX IF NOT EXISTS idx_officers_station ON officers(station_id);
CREATE INDEX IF NOT EXISTS idx_officers_rank ON officers(rank_title);

CREATE INDEX IF NOT EXISTS idx_fines_citizen ON fines(citizen_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_issued_at ON fines(issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_cases_citizen ON cases(citizen_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_opened_at ON cases(opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_wanted_active ON wanted_persons(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_cctv_event_time ON cctv_events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_gps_logged_at ON gps_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_audit_event_time ON audit_logs(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_policies(policy_status);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_court_case ON court_records(case_id);
