# TZ Police Digital Platform — Supabase Wiring Guide

## Current Status: Phase 1 — Mock Database Active

The application runs entirely from the Mock Database. Supabase is wired but inactive.

## Architecture

```
Mock Database (active)
    ↓
src/lib/supabase/data-service.ts  ← dual-mode layer
    ↓
isSupabaseEnabled() = false       ← mock fallback
    ↓
MOCK_CITIZENS, MOCK_VEHICLES, ROLE_USERS...
```

## To Activate Supabase (Phase 2)

### Step 1 — Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Create new project: `tz-police-digital`
3. Copy Project URL and anon key

### Step 2 — Run Migrations
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push
```

Or run manually in SQL Editor in order:
1. `00000000000000_initial_schema.sql`
2. `00000000000001_rls_policies.sql`
3. `00000000000002_rbac_functions.sql`
4. `00000000000003_triggers.sql`
5. `00000000000004_seed_data.sql`
6. `00000000000005_complete_schema.sql` ← new
7. `00000000000006_db_functions.sql`    ← new
8. `00000000000007_seed_role_users.sql` ← new

### Step 3 — Set Environment Variables
Copy `.env.supabase.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4 — Deploy Edge Functions
```bash
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
npx supabase functions deploy get-dashboard
npx supabase functions deploy search-citizen
npx supabase functions deploy search-vehicle
npx supabase functions deploy create-citation
npx supabase functions deploy create-arrest
npx supabase functions deploy create-incident
npx supabase functions deploy create-patrol
```

### Step 5 — Test
The app auto-detects Supabase. `isSupabaseEnabled()` returns `true` when
`NEXT_PUBLIC_SUPABASE_URL` is set. All screens use `data-service.ts` which
transparently switches from Mock to Supabase.

## Tables

| Table                | Records | Source |
|---------------------|---------|--------|
| regions             | 10      | Seeded |
| stations            | 11      | Seeded |
| users               | 21      | Seeded from ROLE_USERS |
| citizens            | 1,200   | From Mock DB CSV exports |
| vehicles            | 600     | From Mock DB CSV exports |
| devices             | 20      | From mock-database.ts |
| citations           | 2,400   | From Mock DB fines CSV |
| incidents           | live    | Officer-created |
| arrests             | live    | Officer-created |
| patrols             | live    | Officer-created |
| missing_records     | 8       | Seeded |
| pf3_reports         | live    | Officer-created |
| vehicle_inspections | live    | Officer-created |
| alerts              | live    | System-generated |
| otp_codes           | live    | Auth flow |

## Mock Database is NOT Removed

The Mock Database (`src/lib/mock-database.ts`, `src/lib/mock-engine.ts`) stays
active as Phase 1 fallback. Do not delete it.
