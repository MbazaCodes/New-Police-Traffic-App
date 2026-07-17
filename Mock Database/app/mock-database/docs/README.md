# TZ Police Traffic System Mock Database

This project generates a complete synthetic Tanzania Police Traffic dataset for QA, UAT, demos, and performance testing.

## Stack

- PowerShell (Windows-first scripts)
- PostgreSQL-compatible SQL files (used locally by the app)
- SQL seed files and CSV exports

## Record Volumes

- Base profile (100%): Stations 20, Officers 30, Citizens 1000, Vehicles 500, Licenses 300, Fines 2000, Cases 500, Wanted 50, Devices 50, Audit Logs 10000.
- Default generated profile (120%): Stations 20, Officers 36, Citizens 1200, Vehicles 600, Licenses 360, Fines 2400, Cases 600, Wanted 60, Devices 60, Audit Logs 12000.

## Folder Layout

- schema: DDL and indexes
- seeds: generated SQL seed files
- exports: generated CSV files
- scripts: automation scripts
- backups: combined schema + seed snapshot
- docs: standards and usage docs
- tests: test scenarios

## Quick Start (Windows PowerShell)

1. Generate all synthetic data:

```powershell
./scripts/generate_mock_data.ps1
```

Optional: control extension size with growth percentage.

```powershell
./scripts/generate_mock_data.ps1 -GrowthPercent 20
```

2. Publish generated data into your app folder for local lookup:

```powershell
./scripts/publish_to_app_folder.ps1 -AppFolderPath "C:/path/to/your/app/mock-database"
```

Compatibility note: ./scripts/import_to_supabase.ps1 still works and forwards to publish_to_app_folder.ps1.

3. Verify generated file counts (no DB required):

```powershell
./scripts/verify_counts.ps1
```

4. Reset generated local artifacts:

```powershell
./scripts/reset_database.ps1
```

## Script Outputs

- SQL seeds in seeds/*/*.sql
- CSV exports in exports/*.csv
- Combined snapshot in backups/initial_seed.sql
- Generation manifest in backups/generation_manifest.json
- Optional app publish target copied by publish_to_app_folder.ps1 (local folder deploy)

## Notes

- All data is synthetic. No real personal data is used.
- Constraints enforce key number formats (NIDA, license, plate, fine/case refs, IMEI).
- Designed for deterministic generation via script seed value.
- The app reads from local files in the folder you publish to; Supabase is not required.

