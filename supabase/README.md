# TZ Police Digital Platform — Supabase Database

## 📊 Database Summary

| Object | Count |
|--------|-------|
| **Tables** | **87** |
| **Functions (RPCs)** | **65** |
| **Triggers** | **63** |
| **Enums** | **34** |
| **Indexes** | **176** |
| **Migrations** | **18 files (0000–0017)** |
| **SQL Lines** | **6,074** |

---

## 📋 All 18 Migrations — Run in Order

| # | File | What It Does |
|---|------|-------------|
| 0000 | `initial_schema.sql` | 15 core tables, enums, indexes, RLS enable |
| 0001 | `rls_policies.sql` | RLS policies for original 4 roles |
| 0002 | `rbac_functions.sql` | `has_role()`, `can_access_resource()` |
| 0003 | `triggers.sql` | `update_updated_at`, `create_audit_log`, auto-numbering |
| 0004 | `seed_data.sql` | 7 stations, 4 users, 8 officers, 7 posts |
| 0005 | `complete_schema.sql` | Extended schema (regions, devices, missing) |
| 0006 | `db_functions.sql` | `search_citizen`, `search_vehicle`, `get_dashboard_stats` |
| 0007 | `seed_role_users.sql` | 21 original role users |
| **0008** | `v2_complete.sql` | All 20 role enums; otp_codes, licenses, devices, arrests, warnings, criminal_records, wanted, missing_records, patrol_track_points, dashboard_cache, alert_reads, officer_requests |
| **0009** | `rls_v2.sql` | RLS for all 20 roles + new tables; `is_commander()`, `is_officer()`, `is_investigator()` |
| **0010** | `db_functions_v2.sql` | `upsert_otp_code`, `verify_otp_code`, `search_citizen/vehicle/device`, `get_dashboard_stats`, `end_patrol`, `release_detainee`, `mark_found`, `send_broadcast_alert`, `get_officer_performance`, `get_weekly_trend`, `refresh_dashboard_cache` |
| **0011** | `seed_full.sql` | 20 citizens, 20 vehicles, 20 devices, 20 licenses, 8 missing records, 1 wanted, 5 criminal records |
| **0012** | `device_management.sql` | device_manufacturers, device_categories, device_models, device_ownership, device_assignments, device_maintenance, device_locations, device_theft_reports, serial_number_registry, serial_number_ownership, serial_number_lookups, device_blacklist, imei_ranges, anti_theft_verification |
| **0013** | `evidence_case_management.sql` | cases, case_assignments, case_notes, case_timeline, case_witnesses, case_status_history, case_documents, case_tags, case_suspects, case_evidence, evidence, evidence_categories, evidence_types, evidence_storage, evidence_files, evidence_analysis, evidence_disposal, evidence_requests, chain_of_custody |
| **0014** | `property_management.sql` | properties, property_categories, property_types, property_owners, property_ownership_history, property_valuations, property_documents, property_transactions, property_tax_records, property_disputes, property_lookups |
| **0015** | `driver_points_system.sql` | points_rules (23 offenses), driver_points, citizen_conduct_points, points_deductions, conduct_reports; `deduct_points()`, `reset_annual_points()`, `get_points_summary()`, auto-deduct triggers on citations+warnings |
| **0016** | `communications_orders.sql` | message_threads, thread_participants, messages, command_orders, sos_events, duty_roster, shift_swaps, officer_status_logs, notifications; `send_command_order()`, `acknowledge_order()`, `complete_order()` |
| **0017** | `seed_complete.sql` | 2026 driver/citizen points records, 5 cases, 5 command orders, evidence types/storage, property types |

---

## 🗄️ All 87 Tables by Domain

### Core (8 tables)
`users` · `officers` · `stations` · `posts` · `assignments` · `regions` · `audit_logs` · `otp_codes`

### Citizens & Identity (4 tables)
`citizens` · `licenses` · `drivers` · `criminal_records`

### Vehicles & Transport (2 tables)
`vehicles` · `vehicle_inspections`

### Officer Operations (6 tables)
`citations` · `patrols` · `patrol_track_points` · `incidents` · `arrests` · `warnings`

### Accident & Inspection (2 tables)
`pf3_forms` · `pf3_reports`

### Alerts & Communications (9 tables)
`alerts` · `alert_reads` · `messages` · `message_threads` · `thread_participants` · `notifications` · `command_orders` · `sos_events` · `officer_requests`

### Duty & Scheduling (3 tables)
`duty_roster` · `shift_swaps` · `officer_status_logs`

### Points System (5 tables)
`points_rules` · `driver_points` · `citizen_conduct_points` · `points_deductions` · `conduct_reports`

### Missing & Wanted (2 tables)
`missing_records` · `wanted`

### Device Management (14 tables)
`devices` · `device_manufacturers` · `device_categories` · `device_models` · `device_ownership` · `device_assignments` · `device_maintenance` · `device_locations` · `device_theft_reports` · `serial_number_registry` · `serial_number_ownership` · `serial_number_lookups` · `device_blacklist` · `imei_ranges` · `anti_theft_verification`

### Case Management (9 tables)
`cases` · `case_assignments` · `case_notes` · `case_timeline` · `case_witnesses` · `case_status_history` · `case_documents` · `case_tags` · `case_suspects`

### Evidence Management (9 tables)
`evidence` · `evidence_categories` · `evidence_types` · `evidence_storage` · `evidence_files` · `evidence_analysis` · `evidence_disposal` · `evidence_requests` · `chain_of_custody` · `case_evidence`

### Property Management (11 tables)
`properties` · `property_categories` · `property_types` · `property_owners` · `property_ownership_history` · `property_valuations` · `property_documents` · `property_transactions` · `property_tax_records` · `property_disputes` · `property_lookups`

### Dashboard (1 table)
`dashboard_cache`

---

## ⚡ Key RPC Functions (call via `.rpc()`)

### Auth
| Function | Purpose |
|----------|---------|
| `upsert_otp_code(identifier, code, expires_at)` | Store OTP for login |
| `verify_otp_code(identifier, code)` | Verify OTP + demo bypass |
| `resolve_user(identifier)` | Find user by username/phone/badge |

### Search
| Function | Purpose |
|----------|---------|
| `search_citizen(p_query, p_type)` | Search by name/NIDA/mobile/license |
| `search_vehicle(p_plate)` | Search plate → owner + citations |
| `search_device(p_query)` | Search serial/IMEI → status + owner |

### Dashboard
| Function | Purpose |
|----------|---------|
| `get_dashboard_stats(role, region, station_id)` | KPIs scoped by level |
| `get_citations_summary(station_id, region, ...)` | Citations breakdown |
| `get_officer_performance(officer_id, from, to)` | Officer KPIs |
| `get_weekly_trend(region, station_id)` | 7-day chart data |
| `refresh_dashboard_cache()` | Refresh all cached stats |

### Operations
| Function | Purpose |
|----------|---------|
| `end_patrol(patrol_id, distance, notes)` | End active patrol |
| `release_detainee(arrest_id, reason)` | Release from custody |
| `mark_found(case_no, notes)` | Mark missing record found |
| `send_broadcast_alert(title, message, ...)` | Broadcast to all officers |

### Points System
| Function | Purpose |
|----------|---------|
| `deduct_points(citizen_id, offense, source, ...)` | Deduct points + log |
| `get_points_summary(citizen_id, year)` | Full points + history |
| `reset_annual_points()` | Jan 1 reset to 100 for all |

### Communications & Orders
| Function | Purpose |
|----------|---------|
| `send_command_order(from, to, text, priority, ...)` | Send order to officer |
| `acknowledge_order(order_id, note)` | Officer acknowledges |
| `complete_order(order_id, note)` | Officer completes |
| `get_notification_count(user_id)` | Unread notification count |

---

## 🔐 RLS Role Matrix

| Role Group | Tables Accessible |
|------------|-------------------|
| **All Authenticated** | citizens (read), vehicles (read), devices (read), licenses (read), wanted, missing_records, points_rules |
| **Officers** (Traffic/General/Post) | citations (write), patrols (write), arrests (write), warnings (write), citizens (write), vehicles (write), devices (write) |
| **Investigators** (CID/Cyber/etc.) | cases, evidence, criminal_records, case_witnesses, chain_of_custody |
| **Commanders** (Station→National) | All tables; approve officer_requests; send command_orders; manage duty_roster |
| **Evidence Officer** | evidence (read/update), evidence_storage, chain_of_custody |
| **Audit Officer** | evidence (read), audit_logs |
| **Own records only** | messages (own), duty_roster (own), officer_requests (own) |

---

## 🚀 How to Apply

### Option A: Supabase SQL Editor (recommended)
Run files **in order 0000 → 0017** in the Supabase dashboard SQL Editor.
Each file is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).

### Option B: Supabase CLI
```bash
npx supabase db push
```

### Option C: psql
```bash
for f in supabase/migrations/*.sql; do
  echo "Applying $f..."
  psql $DATABASE_URL -f "$f"
done
```

---

## 🌐 Edge Functions (deploy separately)

```bash
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
npx supabase functions deploy track-patrol
npx supabase functions deploy generate-report
npx supabase functions deploy send-broadcast
```

---

## ⚙️ Activation — Flip to Live Mode

Add to Vercel Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY     = eyJ...
```

When `NEXT_PUBLIC_SUPABASE_URL` is set, `isSupabaseEnabled()` flips `true`
and every `data-service.ts` function uses live Supabase. No code changes needed.

---

## ⏰ Scheduled Jobs (pg_cron — set up in Supabase)

```sql
-- OTP cleanup — every hour
SELECT cron.schedule('cleanup-otps', '0 * * * *', 'SELECT cleanup_expired_otps()');

-- Dashboard cache — every 5 minutes
SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_cache()');

-- Annual points reset — Jan 1 at midnight
SELECT cron.schedule('reset-points', '0 0 1 1 *', 'SELECT reset_annual_points()');
```

---

## 📁 Storage Buckets (create in Supabase Dashboard)

| Bucket | Purpose | Public |
|--------|---------|--------|
| `officers` | Officer photos | No |
| `citizens` | Citizen photos | No |
| `vehicles` | Vehicle photos | No |
| `evidence` | Evidence files + photos | No |
| `pf3` | Accident report attachments | No |
| `wanted` | Wanted person photos | Yes |
| `missing` | Missing person photos | Yes |
| `court` | Court documents | No |
| `reports` | Generated PDF reports | No |

---

## 🧪 Test Credentials

**All users — OTP: `123456`** (any 6 digits accepted in demo mode)

| Username | Mobile | Role |
|----------|--------|------|
| `juma.mwinyi` | 0712 345 678 | Traffic Officer |
| `grace.mushi` | 0766 987 654 | General Officer |
| `insp.mwenge` | 0755 040 001 | Post Officer |
| `igp.waziri` | 0766 000 001 | National Commander (IGP) |
| `cp.dsm` | 0766 001 001 | Regional Commissioner DSM |
| `sp.ilala` | 0755 010 001 | District Commander |
| `csp.kikuu` | 0712 030 001 | Station Commissioner |
| `mariam.juma` | 0766 100 200 | System Admin |
| `det.omar` | 0755 060 001 | CID Officer |
| `cyber.hassan` | 0755 070 001 | Cyber Crime |
| `evidence.amani` | 0755 110 001 | Evidence Officer |
| `audit.daudi` | 0755 130 001 | Audit Officer |

Full list: **34 users across all 20 roles** in `src/lib/auth.ts`

---

## 🔎 Test Data (seeded)

| Data | Count | Notes |
|------|-------|-------|
| Citizens | 20 | With NIDA, mobile, risk scores |
| Vehicles | 20 | T 001 ABC – T 020 FGH; 4 with expired insurance + fines |
| Devices | 20 | 4 stolen (IMEI in serial_number_registry) |
| Licenses | 20 | Mix of valid/expired/suspended |
| Missing Records | 8 | 2 persons, 2 cars, 3 devices, 1 found |
| Wanted | 1 | Nassoro Kombo Mataka — TZS 1M reward |
| Criminal Records | 5 | Hamisi (2), Nassoro (2), Saidi (1) |
| Cases | 5 | CS-2026-0001 to CS-2026-0005 |
| Driver Points | 20 | 2026 records per citizen |
| Citizen Points | 20 | 2026 conduct records |
| Command Orders | 2+ | Sample orders seeded |
| Evidence Storage | 5 | DSM kituo locations |

### Vehicles with Issues (for testing citations)
- **T 003 GHI** — Bima imekwisha, TZS 150,000 fines
- **T 005 MNO** — Bima imekwisha, TZS 300,000 fines
- **T 009 YZA** — Bajaji, Bima imekwisha, TZS 250,000 fines
- **T 018 ZAB** — Bima imekwisha, TZS 200,000 fines *(Nassoro — wanted)*

### Stolen Devices (for IMEI lookup testing)
- `DNPXK-TZ-002` — iPhone 15 Pro (IMEI: 352098103456002)
- `CNF-HP-TZ-005` — HP Laptop (no IMEI)
- `DNPXK-TZ-009` — iPhone 14 (IMEI: 352098103456009)
- `VIVO-TZ-018` — Vivo V29 (IMEI: 864523012345018)

### Points Status 2026
| Citizen | Driver Pts | Citizen Pts | Status |
|---------|-----------|-------------|--------|
| Nassoro Kombo Mataka | 35 | 25 | 🚫 Suspended |
| Hamisi Rashid Omar | 48 | 60 | ⚠️ Critical / Warning |
| Juma Khamis Mwinyi | 87 | 95 | ✅ Good |
| Sikudhani Mwema Nyota | 100 | 100 | ✅ Clean |
