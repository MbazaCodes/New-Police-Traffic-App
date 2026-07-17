# ERD (Textual)

citizens -> licenses
citizens -> vehicles
citizens -> fines
citizens -> cases
citizens -> wanted_persons
stations -> officers
officers -> fines
officers -> cases
officers -> audit_logs
fines -> payments
cases -> evidence -> attachments
cases -> court_records
vehicles -> insurance_policies
vehicles/officers -> gps_logs
stations -> cctv_events
