# Relationship Model

## Core Relationships

- regions 1->many stations
- stations 1->many officers
- citizens 1->many licenses
- citizens 1->many vehicles
- citizens 1->many fines
- citizens 1->many cases
- citizens 1->many devices
- citizens 1->0..1 wanted_persons
- officers 1->many fines
- officers 1->many cases
- officers 1->many audit_logs
- cases 1->many audit_logs
- cases 1->0..many wanted_persons

## Navigation Paths

- Citizen profile: citizens -> licenses, vehicles, fines, cases, devices, wanted_persons
- Enforcement history: officers -> fines, cases, audit_logs
- Station workload: stations -> officers -> fines/cases

