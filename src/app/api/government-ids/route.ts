// src/app/api/government-ids/route.ts
// CRUD for citizen_government_ids — search, create, update, delete
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const clean = (s: any) => String(s ?? "").trim();

// GET /api/government-ids?citizen_id=...&id_type=...&id_number=...&search=...
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const { searchParams } = new URL(req.url);
    const citizenId = clean(searchParams.get("citizen_id"));
    const idType = clean(searchParams.get("id_type"));
    const idNumber = clean(searchParams.get("id_number"));
    const search = clean(searchParams.get("search"));

    // If searching by ID number (for officer/CID lookup)
    if (search || idNumber) {
      const q = search || idNumber;
      const qNorm = q.replace(/[^A-Z0-9]/gi, "").toUpperCase();

      // Search across ALL citizen government IDs
      const { data, error } = await admin
        .from("citizen_government_ids")
        .select("*, citizens(id, name, first_name, last_name, mobile, nida, photo_url, gender, dob, status, verified, has_criminal_record)")
        .limit(20);

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

      // Filter: match by normalized number or partial number
      const results = (data ?? []).filter((row: any) => {
        const norm = row.id_number_norm ?? row.id_number?.replace(/[^A-Z0-9]/gi, "").toUpperCase() ?? "";
        return norm.includes(qNorm) || (row.id_number ?? "").toLowerCase().includes(q.toLowerCase());
      });

      return NextResponse.json({ ok: true, data: results, total: results.length });
    }

    // If querying for a specific citizen's IDs
    if (citizenId) {
      const { data, error } = await admin
        .from("citizen_government_ids")
        .select("*")
        .eq("citizen_id", citizenId);

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

      // Also get the ID type metadata
      const { data: types } = await admin.from("government_id_types").select("*").eq("is_active", true);

      const enriched = (data ?? []).map((row: any) => {
        const type = (types ?? []).find((t: any) => t.code === row.id_type_code);
        return {
          ...row,
          name_en: type?.name_en ?? row.id_type_code,
          name_sw: type?.name_sw ?? row.id_type_code,
          description: type?.description ?? null,
          pattern: type?.pattern ?? null,
        };
      });

      return NextResponse.json({ ok: true, data: enriched });
    }

    // Default: return all active ID types catalog
    const { data: types, error } = await admin
      .from("government_id_types")
      .select("*")
      .eq("is_active", true);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data: types ?? [] });
  } catch (err) {
    console.error("[GOV_IDS]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// POST /api/government-ids — Create a new government ID for a citizen
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "edit");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const body = await req.json();
    const { citizen_id, id_type_code, id_number, issuing_country, issue_date, expiry_date, status, verified, document_url, notes } = body;

    if (!citizen_id || !id_type_code || !id_number) {
      return NextResponse.json({ error: "citizen_id, id_type_code, id_number ni lazima" }, { status: 400 });
    }

    // Validate ID type exists
    const { data: typeCheck } = await admin.from("government_id_types").select("code").eq("code", id_type_code).single();
    if (!typeCheck) return NextResponse.json({ error: `Aina ya ID '${id_type_code}' haipo` }, { status: 400 });

    const { data, error } = await admin.from("citizen_government_ids").insert({
      citizen_id,
      id_type_code,
      id_number,
      issuing_country: issuing_country ?? "Tanzania",
      issue_date: issue_date ?? null,
      expiry_date: expiry_date ?? null,
      status: status ?? "active",
      verified: verified ?? false,
      document_url: document_url ?? null,
      notes: notes ?? null,
    }).single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[GOV_IDS POST]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// PATCH /api/government-ids — Update a government ID
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "edit");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const body = await req.json();
    const { id, id_number, expiry_date, status, verified, document_url, notes } = body;

    if (!id) return NextResponse.json({ error: "ID ni lazima" }, { status: 400 });

    const updates: any = {};
    if (id_number) updates.id_number = id_number;
    if (expiry_date) updates.expiry_date = expiry_date;
    if (status) updates.status = status;
    if (verified !== undefined) updates.verified = verified;
    if (document_url) updates.document_url = document_url;
    if (notes) updates.notes = notes;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await admin.from("citizen_government_ids").update(updates).eq("id", id).single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[GOV_IDS PATCH]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// DELETE /api/government-ids?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citizens", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const { searchParams } = new URL(req.url);
    const id = clean(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID ni lazima" }, { status: 400 });

    const { error } = await admin.from("citizen_government_ids").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[GOV_IDS DELETE]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}
