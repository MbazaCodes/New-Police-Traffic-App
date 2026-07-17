// ===== TZ Police — TypeScript Seed Runner =====
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     bun run supabase/seed/seed.ts
//
// Connects to Supabase with the service-role key (bypasses RLS) and inserts
// the same sample data defined in 00000000000004_seed_data.sql. Useful for
// re-seeding an environment that already has the schema applied but lost its
// data (e.g. after a destructive db push). All inserts are idempotent.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "[seed] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ============================================================
// Type-safe helpers
// ============================================================
type InsertResult = { error: unknown };

async function upsert<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
): Promise<number> {
  // Cast through `unknown` because the typed supabase-js generic for
  // `.upsert()` is overly strict about row shapes when T is generic.
  const { error } = (await supabase
    .from(table)
    .upsert(rows as unknown as Record<string, unknown>[], {
      onConflict: "id",
      ignoreDuplicates: true,
    })) as InsertResult;
  if (error) {
    console.error(`[seed] Error inserting into ${table}:`, error);
    return 0;
  }
  console.log(`[seed] ${table}: ${rows.length} rows upserted`);
  return rows.length;
}

// ============================================================
// Static seed data — mirrors 00000000000004_seed_data.sql
// ============================================================
const stations = [
  { id: "11111111-0000-0000-0000-000000000001", name: "Kituo Kikuu cha Polisi Dar es Salaam", region: "Dar es Salaam", district: "Ilala",     address: "Sokoine Drive, Dar es Salaam", phone: "022 211 0001", status: "active",      established: "1961" },
  { id: "11111111-0000-0000-0000-000000000002", name: "Kituo cha Polisi Kariakoo",           region: "Dar es Salaam", district: "Ilala",     address: "Mwembe Chai, Kariakoo",         phone: "022 218 5544", status: "active",      established: "1972" },
  { id: "11111111-0000-0000-0000-000000000003", name: "Kituo cha Polisi Kinondoni",          region: "Dar es Salaam", district: "Kinondoni", address: "Mwenge, Kinondoni",             phone: "022 277 3311", status: "active",      established: "1975" },
  { id: "11111111-0000-0000-0000-000000000004", name: "Kituo cha Polisi Temeke",             region: "Dar es Salaam", district: "Temeke",    address: "Temeke St, Temeke",             phone: "022 285 9922", status: "active",      established: "1978" },
  { id: "11111111-0000-0000-0000-000000000005", name: "Kituo cha Polisi Ubungo",             region: "Dar es Salaam", district: "Kinondoni", address: "Ubungo Terminal, DSM",          phone: "022 243 7788", status: "maintenance", established: "1985" },
  { id: "11111111-0000-0000-0000-000000000006", name: "Kituo cha Polisi Arusha Mkoani",      region: "Arusha",        district: "Arusha",    address: "Fire Road, Arusha",             phone: "027 250 1100", status: "active",      established: "1963" },
  { id: "11111111-0000-0000-0000-000000000007", name: "Kituo cha Polisi Mwanza",             region: "Mwanza",        district: "Nyamagana", address: "Kenyatta Road, Mwanza",         phone: "028 250 2200", status: "active",      established: "1965" },
];

const users = [
  { id: "22222222-0000-0000-0000-000000000001", name: "Insp. Juma Mwinyi", short_name: "Juma Mwinyi",  rank: "Police Inspector",       rank_short: "Insp.", role: "officer-traffic", id_number: "TP123456", station_id: "11111111-0000-0000-0000-000000000001", unit: "Trafiki - Mkoa wa Dar es Salaam", phone: "0712 345 678", email: "juma.mwinyi@polisi.go.tz",  status: "active" },
  { id: "22222222-0000-0000-0000-000000000002", name: "Insp. Grace Mushi", short_name: "Grace Mushi",  rank: "Police Inspector",       rank_short: "Insp.", role: "officer-general", id_number: "TP345678", station_id: "11111111-0000-0000-0000-000000000003", unit: "Uhalifu - Mkoa wa Dar es Salaam", phone: "0766 987 654", email: "grace.mushi@polisi.go.tz",  status: "active" },
  { id: "22222222-0000-0000-0000-000000000003", name: "ACP. Mariam Juma",  short_name: "Mariam Juma",  rank: "Assistant Commissioner", rank_short: "ACP.",  role: "admin",           id_number: "ADM-002",  station_id: "11111111-0000-0000-0000-000000000001", unit: "Idara ya Utawala",                phone: "0714 222 333", email: "mariam.juma@polisi.go.tz",  status: "active" },
  { id: "22222222-0000-0000-0000-000000000004", name: "CP. Saidi Waziri",  short_name: "Saidi Waziri", rank: "Commissioner of Police", rank_short: "CP.",   role: "commander",       id_number: "ADM-001",  station_id: "11111111-0000-0000-0000-000000000001", unit: "Makao Makuu - Dar es Salaam",     phone: "0716 555 777", email: "saidi.waziri@polisi.go.tz", status: "active" },
];

const officers = [
  { id: "33333333-0000-0000-0000-000000000001", user_id: "22222222-0000-0000-0000-000000000001", officer_number: "TP123456", name: "Insp. Juma Mwinyi",    rank: "Inspector", unit: "Trafiki - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000001", post_id: "44444444-0000-0000-0000-000000000004", status: "active",   phone: "0712 345 678", patrols_count: 3, citations_count: 12, incidents_count: 18, hours_today: 8.5 },
  { id: "33333333-0000-0000-0000-000000000002", user_id: null,                                       officer_number: "TP234567", name: "Sgt. Ali Hassan",      rank: "Sergeant",  unit: "Trafiki - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000002", post_id: "44444444-0000-0000-0000-000000000003", status: "active",   phone: "0788 123 456", patrols_count: 2, citations_count: 8,  incidents_count: 5,  hours_today: 6.0 },
  { id: "33333333-0000-0000-0000-000000000003", user_id: "22222222-0000-0000-0000-000000000002", officer_number: "TP345678", name: "Insp. Grace Mushi",    rank: "Inspector", unit: "Uhalifu - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000003", post_id: "44444444-0000-0000-0000-000000000001", status: "active",   phone: "0766 987 654", patrols_count: 1, citations_count: 0,  incidents_count: 9,  hours_today: 7.5 },
  { id: "33333333-0000-0000-0000-000000000004", user_id: null,                                       officer_number: "TP456789", name: "Sgt. Saidi Juma",      rank: "Sergeant",  unit: "Trafiki - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000004", post_id: "44444444-0000-0000-0000-000000000006", status: "break",    phone: "0755 111 222", patrols_count: 2, citations_count: 5,  incidents_count: 3,  hours_today: 5.0 },
  { id: "33333333-0000-0000-0000-000000000005", user_id: null,                                       officer_number: "TP567890", name: "Cpl. Mariam Ally",     rank: "Corporal",  unit: "Patrol - Dar es Salaam",  station_id: "11111111-0000-0000-0000-000000000002", post_id: "44444444-0000-0000-0000-000000000003", status: "active",   phone: "0744 333 444", patrols_count: 4, citations_count: 7,  incidents_count: 2,  hours_today: 9.0 },
  { id: "33333333-0000-0000-0000-000000000006", user_id: null,                                       officer_number: "TP678901", name: "Insp. Hamisi Rashid",  rank: "Inspector", unit: "Uhalifu - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000005", post_id: "44444444-0000-0000-0000-000000000002", status: "off-duty", phone: "0733 555 666", patrols_count: 0, citations_count: 0,  incidents_count: 0,  hours_today: 0.0 },
  { id: "33333333-0000-0000-0000-000000000007", user_id: null,                                       officer_number: "TP789012", name: "Sgt. Fatuma Hassan",   rank: "Sergeant",  unit: "Trafiki - Dar es Salaam", station_id: "11111111-0000-0000-0000-000000000003", post_id: "44444444-0000-0000-0000-000000000005", status: "active",   phone: "0722 777 888", patrols_count: 2, citations_count: 15, incidents_count: 7,  hours_today: 7.0 },
  { id: "33333333-0000-0000-0000-000000000008", user_id: null,                                       officer_number: "TP890123", name: "Cpl. Emmanuel Joseph", rank: "Corporal",  unit: "Patrol - Dar es Salaam",  station_id: "11111111-0000-0000-0000-000000000001", post_id: null,                                    status: "active",   phone: "0711 999 000", patrols_count: 3, citations_count: 4,  incidents_count: 1,  hours_today: 8.0 },
];

const posts = [
  { id: "44444444-0000-0000-0000-000000000001", name: "Posti ya Mwenge",           station_id: "11111111-0000-0000-0000-000000000003", location: "Mwenge Bus Terminal",  type: "Traffic", status: "active",   shift: "24/7" },
  { id: "44444444-0000-0000-0000-000000000002", name: "Posti ya Ubungo",           station_id: "11111111-0000-0000-0000-000000000005", location: "Ubungo Terminal",      type: "Traffic", status: "active",   shift: "24/7" },
  { id: "44444444-0000-0000-0000-000000000003", name: "Posti ya Kariakoo Market",  station_id: "11111111-0000-0000-0000-000000000002", location: "Kariakoo Market",      type: "Patrol",  status: "active",   shift: "06:00 - 22:00" },
  { id: "44444444-0000-0000-0000-000000000004", name: "Posti ya Samora Avenue",    station_id: "11111111-0000-0000-0000-000000000001", location: "Samora Avenue CBD",    type: "Traffic", status: "active",   shift: "24/7" },
  { id: "44444444-0000-0000-0000-000000000005", name: "Posti ya Mbezi Beach",      station_id: "11111111-0000-0000-0000-000000000003", location: "Mbezi Beach Junction", type: "Patrol",  status: "active",   shift: "18:00 - 06:00" },
  { id: "44444444-0000-0000-0000-000000000006", name: "Posti ya Temeke St",        station_id: "11111111-0000-0000-0000-000000000004", location: "Temeke Road",          type: "Traffic", status: "inactive", shift: "06:00 - 18:00" },
  { id: "44444444-0000-0000-0000-000000000007", name: "Posti ya Mandela Road",     station_id: "11111111-0000-0000-0000-000000000001", location: "Mandela Expressway",   type: "Traffic", status: "active",   shift: "24/7" },
];

const assignments = [
  { id: "55555555-0000-0000-0000-000000000001", officer_id: "33333333-0000-0000-0000-000000000001", station_id: "11111111-0000-0000-0000-000000000001", post_id: "44444444-0000-0000-0000-000000000004", role: "Traffic Officer", assigned_date: "2026-01-01", status: "active" },
  { id: "55555555-0000-0000-0000-000000000002", officer_id: "33333333-0000-0000-0000-000000000002", station_id: "11111111-0000-0000-0000-000000000002", post_id: "44444444-0000-0000-0000-000000000003", role: "Patrol Officer",  assigned_date: "2026-02-15", status: "active" },
  { id: "55555555-0000-0000-0000-000000000003", officer_id: "33333333-0000-0000-0000-000000000003", station_id: "11111111-0000-0000-0000-000000000003", post_id: "44444444-0000-0000-0000-000000000001", role: "General Duty",    assigned_date: "2026-03-10", status: "active" },
  { id: "55555555-0000-0000-0000-000000000004", officer_id: "33333333-0000-0000-0000-000000000004", station_id: "11111111-0000-0000-0000-000000000004", post_id: "44444444-0000-0000-0000-000000000006", role: "Traffic Officer", assigned_date: "2026-03-20", status: "active" },
  { id: "55555555-0000-0000-0000-000000000005", officer_id: "33333333-0000-0000-0000-000000000005", station_id: "11111111-0000-0000-0000-000000000002", post_id: "44444444-0000-0000-0000-000000000003", role: "Patrol Officer",  assigned_date: "2026-04-05", status: "active" },
  { id: "55555555-0000-0000-0000-000000000006", officer_id: "33333333-0000-0000-0000-000000000007", station_id: "11111111-0000-0000-0000-000000000003", post_id: "44444444-0000-0000-0000-000000000005", role: "Patrol Officer",  assigned_date: "2026-04-12", status: "active" },
  { id: "55555555-0000-0000-0000-000000000007", officer_id: "33333333-0000-0000-0000-000000000006", station_id: "11111111-0000-0000-0000-000000000005", post_id: "44444444-0000-0000-0000-000000000002", role: "General Duty",    assigned_date: "2026-05-01", status: "on-leave" },
];

// ============================================================
// Main runner
// ============================================================
async function main() {
  console.log(`[seed] Connecting to ${SUPABASE_URL}`);

  await upsert("stations",    stations);
  await upsert("users",       users);
  await upsert("officers",    officers);
  await upsert("posts",       posts);
  await upsert("assignments", assignments);

  console.log("[seed] Done. Sample citations, incidents, patrols, alerts, pf3_forms, and inspections are seeded by the SQL migration 00000000000004_seed_data.sql — run `psql -f supabase/migrations/00000000000004_seed_data.sql` to insert them.");
}

main().catch((err) => {
  console.error("[seed] Fatal:", err);
  process.exit(1);
});
