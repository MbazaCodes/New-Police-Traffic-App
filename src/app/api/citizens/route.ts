// Citizens API — list, create
// GET  /api/citizens?query=&type=name|nida|mobile|license  → search/list
// POST /api/citizens  → create citizen (officer or admin)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";
    const type  = url.searchParams.get("type") ?? "name";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
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
    if (!body.name) return NextResponse.json({ error: "Jina linahitajika" }, { status: 400 });

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const insertRow: Record<string, unknown> = {
          name:           body.name,
          first_name:     body.name.split(" ")[0] || null,
          last_name:      body.name.split(" ").slice(-1)[0] || null,
          nida:           body.nida?.trim().toUpperCase() || null,
          mobile:         body.mobile || null,
          gender:         body.gender || null,
          dob:            body.dob || null,
          address:        body.address || null,
          occupation:     body.occupation || null,
          status:         "Mtu wa Kawaida",
          region:         body.region || null,
          district:       body.district || null,
          ward:           body.ward || null,
          street:         body.street || null,
          nationality:    body.nationality || "Mtanzania",
          religion:       body.religion || null,
          marital_status: body.maritalStatus || null,
          blood_group:    body.bloodGroup || null,
          notes:          body.notes || null,
        };
        if (body.tribe)     insertRow.tribe     = body.tribe;
        if (body.photoUrl)  insertRow.photo_url = body.photoUrl;
        if (body.documents) insertRow.documents = body.documents;

        let { data, error } = await admin.from("citizens").insert(insertRow).select().single();
        if (error && /tribe|photo_url|documents|nationality|religion|marital|blood_group/.test(error.message ?? "")) {
          ["tribe","photo_url","documents","nationality","religion","marital_status","blood_group","notes"].forEach(k => delete insertRow[k]);
          ({ data, error } = await admin.from("citizens").insert(insertRow).select().single());
        }
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "citizens", data.id, { name: body.name });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Supabase required for citizen creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
