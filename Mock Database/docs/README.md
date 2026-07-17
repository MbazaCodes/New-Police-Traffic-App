# Tanzania Police Traffic System - Full Simulation Environment

This repository provides a 10-year synthetic ecosystem for Tanzania Police Traffic Management workflows.

## Simulation Scope

Modules covered:
- Citizens, family relationships, and address history
- Vehicles and ownership transfer history
- Driver licenses and renewals
- Officers, promotions, and suspensions
- Fines and cases
- Wanted persons
- Insurance policies
- Payments
- CCTV events
- GPS logs
- Court records
- Notifications
- Audit logs
- Device logs
- User sessions
- Evidence and attachments
- Citizen lifecycle timeline events

Distribution target:
- 85% valid
- 10% warning
- 5% corrupted

## Dataset Profiles

- QA: 5,000 citizens
- UAT: 50,000 citizens
- Performance: 500,000 citizens
- Stress: 5,000,000 citizens

Derived entities scale proportionally using multipliers in scripts/lib/simulation_common.ps1.

## Folder Outputs

- schema: SQL DDL and views
- seeds: SQL insert files per module
- exports/csv: CSV exports per module
- exports/json: JSON exports per module
- docs/reports: ERD, seed report, QA report, coverage report
- backups: generation manifest and logs

## Run Commands

1. Generate QA dataset (5K)

```powershell
./scripts/generate_mock_data.ps1 -Profile QA -Years 10 -Clean
```

2. Generate UAT dataset (50K)

```powershell
./scripts/generate_mock_data.ps1 -Profile UAT -Years 10 -Clean
```

3. Generate Performance dataset (500K)

```powershell
./scripts/generate_mock_data.ps1 -Profile Performance -Years 10 -EnableParallel -Clean
```

4. Generate Stress dataset (5M)

```powershell
./scripts/generate_mock_data.ps1 -Profile Stress -Years 10 -EnableParallel -Clean
```

5. Generate exact 1,000,000 citizens (override mode)

```powershell
./scripts/generate_mock_data.ps1 -Profile Performance -CitizensOverride 1000000 -Years 10 -EnableParallel -Clean
```

For large runs (500K, 1M, 5M), ensure enough disk space for seeds/exports and prefer running on SSD.

## Validation and QA

```powershell
./scripts/verify_counts.ps1
./scripts/verify_relationships.ps1
```

Generated reports:
- docs/reports/seed_report.md
- docs/reports/qa_report.md
- docs/reports/coverage_report.md
- docs/reports/ERD.md

## Publish to Supabase

```powershell
$env:SUPABASE_DB_URL = "postgresql://postgres:password@host:5432/postgres"
./scripts/publish_to_supabase.ps1
```

## Local App-Folder Publish

```powershell
./scripts/publish_to_app_folder.ps1 -AppFolderPath "C:/path/to/app/mock-database"
```

## Reset Generated Artifacts

```powershell
./scripts/reset_database.ps1
```

## Notes

- All data is synthetic and designed for QA, UAT, demos, AI experimentation, and government presentations.
- For very large profiles, export files are sampled for practicality while SQL seeds remain full-size.
- The generation manifest at backups/generation_manifest.json is the source of truth for counts.
