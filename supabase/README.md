# TZ Police Digital Platform — Supabase

## Migrations — Run in order

| # | File | What it does |
|---|------|-------------|
| 0000 | `initial_schema.sql` | 15 core tables, enums, indexes, RLS enable |
| 0001 | `rls_policies.sql` | RLS policies for original 4 roles |
| 0002 | `rbac_functions.sql` | `has_role()`, `can_access_resource()` |
| 0003 | `triggers.sql` | `update_updated_at`, `create_audit_log`, auto-numbering |
| 0004 | `seed_data.sql` | 7 stations, 4 users, 8 officers, 7 posts |
| 0005 | `complete_schema.sql` | Extended schema (regions, devices, missing) |
| 0006 | `db_functions.sql` | `search_citizen`, `search_vehicle`, `get_dashboard_stats` |
| 0007 | `seed_role_users.sql` | 21 original role users |
| **0008** | `v2_complete.sql` | **Extends enums for all 20 roles; adds otp_codes, licenses, devices, arrests, warnings, criminal_records, wanted, missing_records, patrol_track_points, dashboard_cache, alert_reads; extends existing tables** |
| **0009** | `rls_v2.sql` | **RLS for all 20 roles + new tables; helper functions is_commander(), is_officer(), is_investigator()** |
| **0010** | `db_functions_v2.sql` | **upsert_otp_code(), verify_otp_code(), cleanup_expired_otps(), resolve_user(), search_citizen(), search_vehicle(), search_device(), get_dashboard_stats(), get_citations_summary(), end_patrol(), release_detainee(), mark_found(), send_broadcast_alert(), get_unread_alert_count(), get_officer_performance(), get_weekly_trend(), refresh_dashboard_cache(); auto-numbering triggers** |
| **0011** | `seed_full.sql` | **All 20 citizens, 20 vehicles, 20 devices, 20 licenses, 8 missing records, 1 wanted, 5 criminal records** |

## How to apply

### Option A: Supabase SQL Editor (recommended for first setup)
Run each migration file in order (0000 → 0011) in the Supabase dashboard SQL Editor.

### Option B: Supabase CLI
```bash
npx supabase db push
```

### Option C: Direct psql
```bash
psql $DATABASE_URL -f supabase/migrations/00000000000000_initial_schema.sql
# ... repeat for each file
```

## Edge Functions

Deploy all 5 functions:
```bash
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
npx supabase functions deploy track-patrol
npx supabase functions deploy generate-report
npx supabase functions deploy send-broadcast
```

## Activation (flip to live mode)

Add these to Vercel Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

When `NEXT_PUBLIC_SUPABASE_URL` is set, `isSupabaseEnabled()` returns `true`
and all `data-service.ts` functions use live Supabase instead of mock data.

## Database Architecture

```
users (34 seeded — all 20 roles)
  ├── officers (field officers + CID)
  │     ├── citations
  │     ├── incidents
  │     ├── patrols → patrol_track_points
  │     ├── arrests
  │     └── warnings
  ├── stations (7 seeded)
  │     └── posts (7 seeded)
  └── assignments

citizens (20 seeded)
  ├── vehicles (20 seeded, T 001 ABC – T 020 FGH)
  ├── licenses (20 seeded)
  ├── devices (20 seeded)
  └── criminal_records (5 seeded)

missing_records (8 seeded)
wanted (1 active — Nassoro Kombo Mataka)
otp_codes (managed by edge functions)
alerts → alert_reads
pf3_forms
vehicle_inspections
audit_logs (auto-populated by triggers)
dashboard_cache (populated by refresh_dashboard_cache())
```

## Key RPC Calls (from app)

| Function | Called by |
|----------|-----------|
| `search_citizen(p_query, p_type)` | `/api/search/citizen`, officer search screens |
| `search_vehicle(p_plate)` | `/api/search/vehicle`, traffic officer screen |
| `search_device(p_query)` | `/api/search`, lost-property screen |
| `get_dashboard_stats(role, region, station_id)` | Commissioner Dashboard |
| `get_citations_summary(...)` | Admin Reports |
| `get_officer_performance(officer_id, ...)` | Officer Profile |
| `get_weekly_trend(region, station_id)` | Dashboard chart |
| `upsert_otp_code(identifier, code, expires_at)` | `send-otp` edge function |
| `verify_otp_code(identifier, code)` | `verify-otp` edge function |
| `end_patrol(patrol_id, ...)` | Patrol Screen |
| `release_detainee(arrest_id, reason)` | Detained Citizens Screen |
| `mark_found(case_no, notes)` | Missing Records Screen |
| `send_broadcast_alert(title, message, ...)` | `send-broadcast` edge function |
| `get_unread_alert_count(user_id)` | Alert bell badge |
| `refresh_dashboard_cache()` | Scheduled cron (every 5 min) |
