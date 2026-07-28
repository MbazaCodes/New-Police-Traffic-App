// Officers API — migrated to withAuth() for centralized auth + audit
// NO PostgREST embeds. Role matching is case-insensitive and slug-tolerant.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { applyScopeToQuery } from "@/lib/data-scope";

/** "officer-traffic" | "TRAFFIC_OFFICER" | "traffic officer" -> "trafficofficer" */
const norm = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");

/** URL slug -> accepted DB role values */
const ROLE_ALIASES: Record<string, string[]> = {
  "officer-traffic":        ["TRAFFIC_OFFICER", "officer-traffic"],
  "officer-general":        ["GENERAL_OFFICER", "officer-general"],
  "officer-post":           ["POST_OFFICER", "post-officer"],
  "post-officer":           ["POST_OFFICER", "post-officer"],
  "traffic-officer":        ["TRAFFIC_OFFICER", "officer-traffic"],
  "general-officer":        ["GENERAL_OFFICER", "officer-general"],
  "investigator":           ["INVESTIGATOR", "CID_OFFICER", "CYBER_CRIME", "INVESTIGATION_SUPERVISOR", "investigator", "cid-officer", "cyber-crime", "investigation-supervisor"],
  "cid":                    ["INVESTIGATOR", "CID_OFFICER", "investigator", "cid-officer"],
  "clerk":                  ["CLERK", "NATIONAL_CLERK", "REGIONAL_CLERK", "DISTRICT_CLERK", "clerk", "national-clerk", "regional-clerk", "district-clerk"],
  "national-clerk":         ["NATIONAL_CLERK", "national-clerk"],
  "regional-clerk":         ["REGIONAL_CLERK", "regional-clerk"],
  "district-clerk":         ["DISTRICT_CLERK", "district-clerk"],
  "commander":              ["COMMANDER", "STATION_COMMANDER", "DISTRICT_COMMANDER", "REGIONAL_COMMANDER", "NATIONAL_COMMANDER", "commander", "station-commissioner", "district-commissioner", "regional-commissioner", "national-commissioner"],
  "station-commander":      ["STATION_COMMANDER", "station-commissioner"],
  "district-commander":     ["DISTRICT_COMMANDER", "district-commissioner"],
  "regional-commander":     ["REGIONAL_COMMANDER", "regional-commissioner"],
  "national-commander":     ["NATIONAL_COMMANDER", "national-commissioner"],
  "national-commissioner":  ["NATIONAL_COMMANDER", "national-commissioner", "commander", "SUPER_ADMIN", "DIG", "dig"],
  "admin":                  ["SUPER_ADMIN", "SYSTEM_ADMIN", "admin", "super-admin", "system-admin"],
  "super-admin":            ["SUPER_ADMIN", "super-admin", "admin"],
  "system-admin":           ["SYSTEM_ADMIN", "system-admin"],
  "viewer":                 ["VIEWER", "viewer"],
};

function expandRoles(param: string): string[] {
  const out: string[] = [];
  for (const raw of param.split(",").map(s => s.trim()).filter(Boolean)) {
    const aliases = ROLE_ALIASES[raw.toLowerCase()];
    if (aliases) out.push(...aliases);
    else out.push(raw);
  }
  return [...new Set(out)];
}

async function safeSelect(admin: any, table: string, limit = 500): Promise<any[]> {
  try {
    const { data, error } = await admin.from(table).select("*").limit(limit);
    if (error) { console.error(`[OFFICERS ${table}]`, error.message); return []; }
    return data ?? [];
  } catch (e) {
    console.error(`[OFFICERS ${table}] threw`, e);
    return [];
  }
}

// GET /api/officers → list officers (auto-scoped, role-filtered in JS)
export const GET = withAuth("officers", "view", async ({ db, scope, searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const status = searchParams.get("status") || "";
  const limit  = Math.min(parseInt(searchParams.get("limit") || "200"), 500);
  const roleQ  = [searchParams.get("role") || "", searchParams.get("roles") || ""]
                   .filter(Boolean).join(",");

  const [users, officers, stations] = await Promise.all([
    applyScopeToQuery(db.from("users").select("*").limit(limit), scope),
    applyScopeToQuery(db.from("officers").select("*").limit(500), scope),
    safeSelect(db, "stations", 500),
  ]);

  const officerByUser = new Map<string, any>();
  for (const o of officers) if (o.user_id) officerByUser.set(String(o.user_id), o);
  const stationById = new Map<string, any>();
  for (const s of stations) stationById.set(String(s.id), s);

  let rows = users.map((u: any) => {
    const o  = officerByUser.get(String(u.id));
    const st = stationById.get(String(o?.station_id ?? u.station_id ?? ""));
    return {
      id:             o?.id ?? u.id,
      user_id:        u.id,
      officer_id:     o?.id ?? null,
      name:           u.name ?? o?.name ?? "—",
      short_name:     u.short_name ?? String(u.name ?? "").split(" ")[0] ?? "",
      badge_no:       u.badge_no ?? o?.badge_no ?? o?.officer_number ?? "—",
      officer_number: o?.officer_number ?? u.badge_no ?? "—",
      role:           u.role ?? "—",
      rank:           u.rank ?? o?.rank ?? "—",
      rank_short:     u.rank_short ?? "",
      unit:           u.unit ?? o?.unit ?? "—",
      email:          u.email ?? "—",
      phone:          u.phone ?? o?.phone ?? "—",
      photo_url:      u.photo_url ?? o?.photo_url ?? null,
      region:         u.region ?? o?.region ?? st?.region ?? "—",
      station_id:     o?.station_id ?? u.station_id ?? null,
      station_name:   st?.name ?? "—",
      station:        st ?? null,
      status:         u.status ?? o?.status ?? "active",
      patrols_count:   o?.patrols_count   ?? 0,
      citations_count: o?.citations_count ?? 0,
      incidents_count: o?.incidents_count ?? 0,
      hours_today:     o?.hours_today     ?? 0,
      joined_at:      o?.joined_at ?? u.created_at ?? null,
      created_at:     u.created_at ?? null,
    };
  });

  // Officers with no matching users row — still list them
  const seenUserIds = new Set(users.map((u: any) => String(u.id)));
  for (const o of officers) {
    if (o.user_id && seenUserIds.has(String(o.user_id))) continue;
    const st = stationById.get(String(o.station_id ?? ""));
    rows.push({
      id: o.id, user_id: o.user_id ?? null, officer_id: o.id,
      name: o.name ?? "—", short_name: String(o.name ?? "").split(" ")[0] ?? "",
      badge_no: o.badge_no ?? o.officer_number ?? "—",
      officer_number: o.officer_number ?? "—",
      role: "—", rank: o.rank ?? "—", rank_short: "", unit: o.unit ?? "—",
      email: "—", phone: o.phone ?? "—", photo_url: o.photo_url ?? null,
      region: o.region ?? st?.region ?? "—",
      station_id: o.station_id ?? null, station_name: st?.name ?? "—", station: st ?? null,
      status: o.status ?? "active",
      patrols_count: o.patrols_count ?? 0, citations_count: o.citations_count ?? 0,
      incidents_count: o.incidents_count ?? 0, hours_today: o.hours_today ?? 0,
      joined_at: o.joined_at ?? null, created_at: o.created_at ?? null,
    });
  }

  if (roleQ) {
    const expanded = expandRoles(roleQ);
    const wantedNorm = new Set(expanded.map(norm));
    const wantedRaw  = new Set(expanded.map(r => r.toLowerCase()));
    rows = rows.filter(r => {
      const rNorm = norm(r.role);
      const rRaw  = String(r.role ?? "").toLowerCase();
      return wantedNorm.has(rNorm) || wantedRaw.has(rRaw);
    });
  }
  if (status && status !== "all") {
    rows = rows.filter(r => norm(r.status) === norm(status));
  }
  if (search) {
    rows = rows.filter(r =>
      ["name", "badge_no", "email", "phone", "rank", "station_name"]
        .some(f => String(r[f] ?? "").toLowerCase().includes(search))
    );
  }

  rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
  return { ok: true, data: rows, total: rows.length };
});

// POST /api/officers → create officer (auto-audited)
export const POST = withAuth("officers", "create", async ({ body: b, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  if (!b.name || !b.role) {
    return { ok: false, error: "Jina na jukumu vinahitajika", status: 400 };
  }

  const now = new Date().toISOString();
  // Accept both camelCase (from UI) and snake_case (from API)
  const badge_no   = b.badge_no || b.badgeNo || null;
  const id_number  = b.id_number || b.idNumber || badge_no || `TZP-${Date.now().toString().slice(-8)}`;
  const station_id = b.station_id || b.stationId || null;

  const { data: user, error: userErr } = await db.from("users").insert({
    name:       String(b.name).trim(),
    short_name: b.short_name ?? b.shortName ?? String(b.name).trim().split(" ")[0],
    email:      b.email || null, phone: b.phone || null,
    role:       b.role, rank: b.rank || null, rank_short: b.rank_short || null,
    badge_no,   unit: b.unit || null,
    station_id, region: b.region || null,
    id_number,
    status:     "active", created_at: now,
  }).select("id").single();

  if (userErr) {
    console.error("[OFFICERS POST users]", userErr.message);
    return { ok: false, error: userErr.message, status: 500 };
  }

  const { data: officer, error: offErr } = await db.from("officers").insert({
    user_id:        user.id, name: String(b.name).trim(),
    officer_number: badge_no || null, badge_no: badge_no || null,
    rank:           b.rank || null, unit: b.unit || null,
    station_id:     station_id || null, region: b.region || null,
    phone:          b.phone || null, status: "active",
    patrols_count: 0, citations_count: 0, incidents_count: 0,
    joined_at:      now.split("T")[0], created_at: now,
  }).select().single();

  if (offErr) console.warn("[OFFICERS POST officers]", offErr.message);

  // Best-effort activity log entry
  try {
    await db.from("activity_logs").insert({
      user_id:      session?.user?.id, user_type: "officer",
      user_name:    session?.user?.name ?? "Admin",
      action:       "officer_created", resource: "officers",
      resource_id:  officer?.id ?? user.id,
      description:  `Afisa mpya: ${b.name}`, success: true,
    });
  } catch { /* non-critical */ }

  return { ok: true, data: { ...(officer ?? {}), user_id: user.id }, status: 201 };
});
