// Devices API — list, create, update status
// GET    /api/devices?query=  → search by serial/IMEI
// POST   /api/devices         → report lost/stolen device
// PATCH  /api/devices/[id]   → update status (found, recovered)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "devices", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data } = query
          ? await admin.rpc("search_device", { p_query: query })
          : await admin.from("devices").select("*").order("created_at", { ascending: false }).limit(100);
        return NextResponse.json({ ok: true, data });
      }
    }
    const results = []; // use Supabase
    return NextResponse.json({ ok: true, data: results });
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

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
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
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Supabase required for device creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
