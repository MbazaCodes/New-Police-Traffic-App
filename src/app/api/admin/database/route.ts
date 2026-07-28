// src/app/api/admin/database/route.ts
// NO PostgREST embeds — manual joins in JS so missing FKs can't cause 500s.
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const ok = (data: any[], warn?: string) =>
  NextResponse.json({ ok: true, data, total: data.length, ...(warn ? { warn } : {}) });

/** Never throws. Returns [] on any failure. */
async function safeSelect(admin: any, table: string, limit = 500): Promise<any[]> {
  try {
    const { data, error } = await admin.from(table).select("*").limit(limit);
    if (error) { console.error(`[DB ${table}]`, error.message); return []; }
    return data ?? [];
  } catch (e) {
    console.error(`[DB ${table}] threw`, e);
    return [];
  }
}

const byId = (rows: any[], key = "id") => {
  const m = new Map<string, any>();
  for (const r of rows) if (r?.[key]) m.set(String(r[key]), r);
  return m;
};

const nameOf = (c: any) =>
  c?.name || [c?.first_name, c?.last_name].filter(Boolean).join(" ") || null;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "audit_logs", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return ok([]);
    const admin = getDbAdmin() as any;
    if (!admin) return ok([]);

    const url    = new URL(request.url);
    const tab    = url.searchParams.get("tab") || "citizens";
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();
    const limit  = Math.min(parseInt(url.searchParams.get("limit") || "500"), 2000);

    const match = (row: any, fields: string[]) =>
      !search || fields.some(f => String(row[f] ?? "").toLowerCase().includes(search));

    // ── CITIZENS ────────────────────────────────────────────────────────────
    if (tab === "citizens" || tab === "accounts") {
      const [accounts, citizens, vehicles, devices, owners] = await Promise.all([
        safeSelect(admin, "citizen_accounts", limit),
        safeSelect(admin, "citizens", 2000),
        safeSelect(admin, "vehicles", 2000),
        safeSelect(admin, "devices", 2000),
        safeSelect(admin, "property_owners", 2000),
      ]);

      const citById = byId(citizens);
      const countBy = (rows: any[], key: string) => {
        const m = new Map<string, number>();
        for (const r of rows) {
          const k = r?.[key];
          if (k) m.set(String(k), (m.get(String(k)) ?? 0) + 1);
        }
        return m;
      };
      const vCount = countBy(vehicles, "owner_citizen_id");
      const dCount = countBy(devices, "owner_citizen_id");
      const pCount = countBy(owners, "citizen_id");

      // Start from accounts (portal users), then append citizens with no account
      const usedCitizenIds = new Set<string>();
      const rows = accounts.map((a: any) => {
        const c = a.citizen_id ? citById.get(String(a.citizen_id)) : null;
        if (c) usedCitizenIds.add(String(c.id));
        const cid = c?.id ?? null;
        return {
          id:          a.id,
          account_id:  a.id,
          citizen_id:  cid,
          name:        nameOf(c) || a.cached_name || a.phone || "—",
          phone:       a.phone || c?.mobile || "—",
          email:       a.email || "—",
          nida:        a.nida || c?.nida || "—",
          gender:      c?.gender || "—",
          dob:         c?.dob || null,
          occupation:  c?.occupation || "—",
          address:     c?.address || "—",
          region:      c?.region || "—",
          district:    c?.district || "—",
          tribe:       c?.tribe || "—",
          license_no:  c?.license_no || a.driving_license || "—",
          is_verified: !!a.is_verified,
          is_driver:   !!a.is_driver,
          good_conduct_points: a.good_conduct_points ?? 100,
          driver_points:       a.driver_points ?? 12,
          profile_complete:    !!a.profile_complete,
          approved:    !!a.approved,
          approved_at: a.approved_at ?? null,
          approved_by: a.approved_by ?? null,
          status:      a.status || "pending",
          last_login:  a.last_login ?? null,
          created_at:  a.created_at ?? null,
          vehicles_count:   cid ? (vCount.get(String(cid)) ?? 0) : 0,
          devices_count:    cid ? (dCount.get(String(cid)) ?? 0) : 0,
          properties_count: cid ? (pCount.get(String(cid)) ?? 0) : 0,
          source: "portal",
        };
      });

      // Citizens registered by officers (no portal account)
      for (const c of citizens) {
        if (usedCitizenIds.has(String(c.id))) continue;
        rows.push({
          id:          c.id,
          account_id:  null,
          citizen_id:  c.id,
          name:        nameOf(c) || "—",
          phone:       c.mobile || "—",
          email:       "—",
          nida:        c.nida || "—",
          gender:      c.gender || "—",
          dob:         c.dob || null,
          occupation:  c.occupation || "—",
          address:     c.address || "—",
          // R1 (stabilize): add region + district — the row type
          // requires them but they were missing from the object
          // literal, causing TS2345.
          region:      c.region || null,
          district:    c.district || null,
          tribe:       c.tribe || "—",
          license_no:  c.license_no || "—",
          is_verified: !!c.verified,
          is_driver:   false,
          good_conduct_points: 100,
          driver_points:       12,
          profile_complete:    false,
          approved:    !!c.verified,
          approved_at: null,
          approved_by: null,
          status:      c.status || "active",
          last_login:  null,
          created_at:  c.created_at ?? null,
          vehicles_count:   vCount.get(String(c.id)) ?? 0,
          devices_count:    dCount.get(String(c.id)) ?? 0,
          properties_count: pCount.get(String(c.id)) ?? 0,
          source: "officer",
        });
      }

      rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
      return ok(rows.filter(r => match(r, ["name", "phone", "nida", "email"])));
    }

    // ── VEHICLES ────────────────────────────────────────────────────────────
    if (tab === "vehicles") {
      const [vehicles, citizens] = await Promise.all([
        safeSelect(admin, "vehicles", 2000),
        safeSelect(admin, "citizens", 2000),
      ]);
      const citById = byId(citizens);
      const rows = vehicles.map((v: any) => {
        const c = v.owner_citizen_id ? citById.get(String(v.owner_citizen_id)) : null;
        return {
          ...v,
          chassis_no:  v.chassis_no || v.chassis_number || "—",
          owner_name:  v.owner_name || nameOf(c) || "—",
          owner_phone: v.owner_phone || c?.mobile || "—",
          owner_nida:  v.owner_nida || c?.nida || "—",
        };
      });
      rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
      return ok(rows.filter(r => match(r, ["plate", "make", "model", "owner_name", "owner_phone"])));
    }

    // ── PROPERTIES ──────────────────────────────────────────────────────────
    if (tab === "properties") {
      const [owners, properties, citizens] = await Promise.all([
        safeSelect(admin, "property_owners", 2000),
        safeSelect(admin, "properties", 2000),
        safeSelect(admin, "citizens", 2000),
      ]);
      const propById = byId(properties);
      const citById  = byId(citizens);

      let rows: any[] = [];

      if (owners.length > 0) {
        rows = owners.map((o: any) => {
          const p = o.property_id ? propById.get(String(o.property_id)) : null;
          const c = o.citizen_id  ? citById.get(String(o.citizen_id))   : null;
          return {
            id:            o.id,
            property_id:   p?.id ?? o.property_id ?? null,
            title:         p?.description || p?.address || p?.property_number || "Mali",
            property_type: p?.land_use || "—",
            region:        p?.region || "—",
            district:      p?.district || "—",
            ward:          p?.ward || "—",
            title_deed_no: p?.title_deed_no || p?.title_deed || p?.survey_number || "—",
            area_sqm:      p?.area_sqm ?? null,
            status:        p?.status || "active",
            owner_name:    nameOf(c) || "—",
            owner_phone:   c?.mobile || "—",
            ownership_type: o.ownership_type || "sole",
            acquired_date: o.acquired_date || "—",
            created_at:    o.created_at ?? p?.created_at ?? null,
          };
        });
      } else {
        // No ownership rows yet — still show raw properties so the tab isn't empty
        rows = properties.map((p: any) => ({
          id:            p.id,
          property_id:   p.id,
          title:         p.name || p.description || p.address || p.property_number || "Mali",
          property_type: p.property_type || p.land_use || "—",
          value:         p.value || null,
          region:        p.region || "—",
          district:      p.district || "—",
          ward:          p.ward || "—",
          title_deed_no: p.title_deed_no || p.title_deed || p.survey_number || "—",
          area_sqm:      p.area_sqm ?? null,
          status:        p.status || "active",
          owner_name:    "—",
          owner_phone:   "—",
          ownership_type: "—",
          acquired_date: "—",
          created_at:    p.created_at ?? null,
        }));
      }

      rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
      return ok(rows.filter(r => match(r, ["title", "region", "district", "owner_name"])));
    }

    // ── DEVICES ─────────────────────────────────────────────────────────────
    if (tab === "devices") {
      const [devices, citizens] = await Promise.all([
        safeSelect(admin, "devices", limit),
        safeSelect(admin, "citizens", 500),
      ]);
      const citById = byId(citizens);
      const rows = devices.map((d: any) => {
        const c = d.owner_citizen_id ? citById.get(String(d.owner_citizen_id)) : null;
        return {
          ...d,
          serial_no:   d.serial_no || d.imei || "—",
          owner_name:  d.owner_name || nameOf(c) || "—",
          owner_phone: d.owner_phone || c?.mobile || "—",
        };
      });
      rows.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
      return ok(rows.filter(r => match(r, ["serial_no", "imei", "owner_name", "description"])));
    }

    return ok([]);
  } catch (err) {
    console.error("[ADMIN DATABASE]", errMsg(err));
    // Never 500 the dashboard — return empty with the reason attached
    return NextResponse.json({ ok: true, data: [], total: 0, warn: errMsg(err) });
  }
}

// ── PATCH — approve / reject / suspend ────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "audit_logs", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { citizenId, accountId, action } = await request.json().catch(() => ({} as any));
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const officerName = session?.user?.name || "Admin";
    const now = new Date().toISOString();
    const status = action === "approve" ? "active" : action === "reject" ? "rejected" : "suspended";

    if (accountId) {
      const { error } = await admin.from("citizen_accounts").update({
        status, approved: action === "approve",
        approved_at: action === "approve" ? now : null,
        approved_by: action === "approve" ? officerName : null,
        updated_at: now,
      }).eq("id", accountId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (citizenId) {
      await admin.from("citizens").update({
        status, verified: action === "approve", updated_at: now,
      }).eq("id", citizenId);
    }

    try {
      await admin.from("activity_logs").insert({
        user_id: session?.user?.id, user_type: "officer", user_name: officerName,
        action: `citizen_${action}`, resource: "citizen_accounts",
        resource_id: accountId || citizenId,
        description: `Raia ${action === "approve" ? "ameidhinishwa" : action === "reject" ? "amekataliwa" : "amesimamishwa"}`,
        success: true,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
