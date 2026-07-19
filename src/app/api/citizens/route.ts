// Citizens API — list, create
// GET  /api/citizens?query=&type=name|nida|mobile|license  → search/list
// POST /api/citizens  → create citizen (officer or admin)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";
    const type  = url.searchParams.get("type") ?? "name";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data } = await admin.rpc("search_citizen", { p_query: query || "%", p_type: type });
        return NextResponse.json({ ok: true, data });
      }
    }
    // Mock fallback
    const results = []; // use Supabase
    return NextResponse.json({ ok: true, data: results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const required = ["name", "nida", "mobile", "gender"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `Sehemu inayohitajika: ${f}` }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("citizens").insert({
          name:       body.name,
          nida:       body.nida?.trim().toUpperCase(),
          mobile:     body.mobile,
          gender:     body.gender,
          dob:        body.dob || null,
          address:    body.address || null,
          occupation: body.occupation || null,
          status:     "Mtu wa Kawaida",
          first_name: body.name.split(" ")[0] || null,
          last_name:  body.name.split(" ").slice(-1)[0] || null,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "citizens", data.id, { name: body.name });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Mock fallback
    const mock = { id: `CIT-${Date.now()}`, ...body, addedAt: new Date().toISOString() };
    return NextResponse.json({ ok: true, data: mock }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
