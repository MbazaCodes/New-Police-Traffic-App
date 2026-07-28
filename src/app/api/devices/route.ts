// Devices API — list, create, update status
// GET    /api/devices?query=  → search by serial/IMEI
// POST   /api/devices         → report lost/stolen device
// PATCH  /api/devices/[id]   → update status (found, recovered)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "devices", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";

    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        let result;
        if (query) {
          result = await admin.from("devices").select("*")
            .or(`serial_no.ilike.%${query}%,imei.ilike.%${query}%,description.ilike.%${query}%,owner_name.ilike.%${query}%`)
            .order("created_at", { ascending: false }).limit(20);
        } else {
          result = await admin.from("devices").select("*")
            .order("created_at", { ascending: false }).limit(100);
        }
        return NextResponse.json({ ok: true, data: result.data ?? [] });
      }
    }
    return NextResponse.json({ ok: true, data: [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "devices", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    if (!body.description || !body.ownerName) {
      return NextResponse.json({ error: "Maelezo na jina la mmiliki yanahitajika" }, { status: 400 });
    }

    if (isDbEnabled()) {
      const admin = getDbAdmin();
      if (admin) {
        const { data, error } = await admin.from("devices").insert({
          serial_no:   body.serialNo || `SN-${Date.now()}`,
          imei:        body.imei || null,
          description: body.description,
          category:    body.category || "simu",
          owner_name:  body.ownerName,
          owner_phone: body.ownerPhone || null,
          status:      body.status || "stolen",
          report_date: new Date().toISOString().split("T")[0],
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "devices", data.id, { description: body.description, status: data.status });
        // Log initial ownership record
        try {
          const { query: dbQuery } = await import("@/lib/db/client");
          await dbQuery(
            `INSERT INTO device_ownership
             (device_id,owner_citizen_id,owner_name,owner_nida,owner_phone,
              status,recorded_by_id,recorded_by_name,recorded_by_role,is_current_owner)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)`,
            [data.id, body.ownerCitizenId ?? null, body.ownerName,
             body.ownerNida ?? null, body.ownerPhone ?? null,
             data.status ?? "active",
             // R1 (stabilize): session is possibly null per TS18047;
             // use optional chaining + fallback to match the
             // recorded_by_* semantics (empty string when no session).
             session?.user?.id ?? "", session?.user?.name ?? "", session?.user?.role ?? ""]
          );
        } catch (e) { console.warn("[DEVICE OWNERSHIP LOG]", e); }
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Database required for device creation
    return NextResponse.json({ error: "Database haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
