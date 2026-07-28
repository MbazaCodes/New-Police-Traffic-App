// src/app/api/users/route.ts
// NO embeds. Role filtering done in JS with slug aliases so unknown roles return [] not 500.
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const norm = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");

const ROLE_ALIASES: Record<string, string[]> = {
  "national-commissioner": ["SUPER_ADMIN", "NATIONAL_COMMANDER", "COMMANDER", "DIG"],
  "commissioner":          ["SUPER_ADMIN", "NATIONAL_COMMANDER", "COMMANDER"],
  "national-clerk":        ["NATIONAL_CLERK"],
  "regional-clerk":        ["REGIONAL_CLERK"],
  "district-clerk":        ["DISTRICT_CLERK"],
  "clerk":                 ["CLERK", "NATIONAL_CLERK", "REGIONAL_CLERK", "DISTRICT_CLERK"],
  "admin":                 ["SUPER_ADMIN", "SYSTEM_ADMIN"],
  "super-admin":           ["SUPER_ADMIN"],
  "system-admin":          ["SYSTEM_ADMIN"],
  "commander":             ["COMMANDER", "STATION_COMMANDER", "DISTRICT_COMMANDER", "REGIONAL_COMMANDER", "NATIONAL_COMMANDER"],
  "regional-commander":    ["REGIONAL_COMMANDER"],
  "district-commander":    ["DISTRICT_COMMANDER"],
  "station-commander":     ["STATION_COMMANDER"],
  "investigator":          ["INVESTIGATOR", "CID_OFFICER", "CYBER_CRIME"],
  "officer-traffic":       ["TRAFFIC_OFFICER"],
  "officer-general":       ["GENERAL_OFFICER"],
  "officer-post":          ["POST_OFFICER"],
  "viewer":                ["VIEWER"],
};

function expandRoles(param: string): string[] {
  const out: string[] = [];
  for (const raw of param.split(",").map(s => s.trim()).filter(Boolean)) {
    const a = ROLE_ALIASES[raw.toLowerCase()];
    if (a) out.push(...a); else out.push(raw);
  }
  return [...new Set(out)];
}

async function safeSelect(admin: any, table: string, limit = 500): Promise<any[]> {
  try {
    const { data, error } = await admin.from(table).select("*").limit(limit);
    if (error) { console.error(`[USERS ${table}]`, error.message); return []; }
    return data ?? [];
  } catch { return []; }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [], total: 0 });
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: true, data: [], total: 0 });

    const url    = new URL(request.url);
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();
    const status = url.searchParams.get("status") || "";
    const limit  = Math.min(parseInt(url.searchParams.get("limit") || "200"), 500);
    const roleQ  = [url.searchParams.get("role") || "", url.searchParams.get("roles") || ""]
                     .filter(Boolean).join(",");

    const [users, stations, officers] = await Promise.all([
      safeSelect(admin, "users", limit),
      safeSelect(admin, "stations", 500),
      safeSelect(admin, "officers", 500),
    ]);

    const stationById = new Map(stations.map((s: any) => [String(s.id), s]));
    const officerByUser = new Map<string, any>();
    for (const o of officers) if (o.user_id) officerByUser.set(String(o.user_id), o);

    let rows = users.map((u: any) => {
      const o  = officerByUser.get(String(u.id));
      const st = stationById.get(String(u.station_id ?? o?.station_id ?? ""));
      return {
        id:         u.id,
        name:       u.name ?? "—",
        short_name: u.short_name ?? "",
        role:       u.role ?? "—",
        rank:       u.rank ?? o?.rank ?? "—",
        rank_short: u.rank_short ?? "",
        badge_no:   u.badge_no ?? o?.officer_number ?? "—",
        email:      u.email ?? "—",
        phone:      u.phone ?? "—",
        photo_url:  u.photo_url ?? null,
        unit:       u.unit ?? o?.unit ?? "—",
        region:     u.region ?? (st as any)?.region ?? "—",
        station_id: u.station_id ?? o?.station_id ?? null,
        station_name: (st as any)?.name ?? "—",
        status:     u.status ?? "active",
        last_login: u.last_login ?? null,
        created_at: u.created_at ?? null,
      };
    });

    if (roleQ) {
      const wanted = new Set(expandRoles(roleQ).map(norm));
      rows = rows.filter(r => wanted.has(norm(r.role)));
    }
    if (status && status !== "all") rows = rows.filter(r => norm(r.status) === norm(status));
    if (search) {
      rows = rows.filter(r =>
        ["name", "badge_no", "email", "phone", "role", "station_name"]
          .some(f => String(r[f] ?? "").toLowerCase().includes(search))
      );
    }

    rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
    return NextResponse.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("[USERS GET]", errMsg(err));
    return NextResponse.json({ ok: true, data: [], total: 0, warn: errMsg(err) });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const b = await request.json().catch(() => ({} as any));
    if (!b.name || !b.role) return NextResponse.json({ error: "Jina na jukumu vinahitajika" }, { status: 400 });

    const { data, error } = await admin.from("users").insert({
      name: String(b.name).trim(),
      short_name: b.short_name ?? b.shortName ?? String(b.name).trim().split(" ")[0],
      role: b.role, rank: b.rank || null, rank_short: b.rank_short || null,
      badge_no: b.badge_no || b.badgeNo || null,
      email: b.email || null, phone: b.phone || null,
      unit: b.unit || null, region: b.region || null,
      station_id: b.station_id || b.stationId || null,
      id_number: b.id_number || b.idNumber || b.badge_no || b.badgeNo || `TZP-${Date.now().toString().slice(-8)}`,
      status: "active", created_at: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
