// Government IDs API — migrated to withAuth() for centralized auth + audit
// CRUD for citizen_government_ids — search, create, update, delete
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

const clean = (s: unknown) => String(s ?? "").trim();

// GET /api/government-ids?citizen_id=...&id_type=...&id_number=...&search=...
export const GET = withAuth("search", "view", async ({ db, searchParams }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const citizenId = clean(searchParams.get("citizen_id"));
  const idType    = clean(searchParams.get("id_type"));
  const idNumber  = clean(searchParams.get("id_number"));
  const search    = clean(searchParams.get("search"));

  // If searching by ID number (for officer/CID lookup)
  if (search || idNumber) {
    const q = search || idNumber;
    const qNorm = q.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    const { data, error } = await db
      .from("citizen_government_ids")
      .select("*, citizens(id, name, first_name, last_name, mobile, nida, photo_url, gender, dob, status, verified, has_criminal_record)")
      .limit(20);

    if (error) return { ok: false, error: error.message, status: 500 };

    const results = (data ?? []).filter((row: any) => {
      const norm = row.id_number_norm ?? row.id_number?.replace(/[^A-Z0-9]/gi, "").toUpperCase() ?? "";
      return norm.includes(qNorm) || (row.id_number ?? "").toLowerCase().includes(q.toLowerCase());
    });

    return { ok: true, data: results, total: results.length };
  }

  // If querying for a specific citizen's IDs
  if (citizenId) {
    const { data, error } = await db
      .from("citizen_government_ids")
      .select("*")
      .eq("citizen_id", citizenId);

    if (error) return { ok: false, error: error.message, status: 500 };

    const { data: types } = await db.from("government_id_types").select("*").eq("is_active", true);

    const enriched = (data ?? []).map((row: any) => {
      const type = (types ?? []).find((t: any) => t.code === row.id_type_code);
      return {
        ...row,
        name_en:    type?.name_en ?? row.id_type_code,
        name_sw:    type?.name_sw ?? row.id_type_code,
        description: type?.description ?? null,
        pattern:    type?.pattern ?? null,
      };
    });

    return { ok: true, data: enriched };
  }

  // Default: return all active ID types catalog
  const { data: types, error } = await db
    .from("government_id_types")
    .select("*")
    .eq("is_active", true);

  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data: types ?? [] };
});

// POST /api/government-ids — create (auto-audited)
export const POST = withAuth("citizens", "edit", async ({ body, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { citizen_id, id_type_code, id_number, issuing_country, issue_date, expiry_date, status, verified, document_url, notes } = body;
  if (!citizen_id || !id_type_code || !id_number) {
    return { ok: false, error: "citizen_id, id_type_code, id_number ni lazima", status: 400 };
  }

  const { data: typeCheck } = await db.from("government_id_types").select("code").eq("code", id_type_code).single();
  if (!typeCheck) {
    return { ok: false, error: `Aina ya ID '${id_type_code}' haipo`, status: 400 };
  }

  const { data, error } = await db.from("citizen_government_ids").insert({
    citizen_id,
    id_type_code,
    id_number,
    issuing_country: issuing_country ?? "Tanzania",
    issue_date:       issue_date ?? null,
    expiry_date:      expiry_date ?? null,
    status:           status ?? "active",
    verified:         verified ?? false,
    document_url:     document_url ?? null,
    notes:            notes ?? null,
  }).single();

  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data };
});

// PATCH /api/government-ids — update (auto-audited)
export const PATCH = withAuth("citizens", "edit", async ({ body, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { id, id_number, expiry_date, status, verified, document_url, notes } = body;
  if (!id) return { ok: false, error: "ID ni lazima", status: 400 };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (id_number)              updates.id_number    = id_number;
  if (expiry_date)            updates.expiry_date  = expiry_date;
  if (status)                 updates.status       = status;
  if (verified !== undefined) updates.verified     = verified;
  if (document_url)           updates.document_url = document_url;
  if (notes)                  updates.notes        = notes;

  const { data, error } = await db.from("citizen_government_ids").update(updates).eq("id", id).single();
  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data };
});

// DELETE /api/government-ids?id=... (auto-audited)
export const DELETE = withAuth("citizens", "delete", async ({ searchParams, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  }
  const id = clean(searchParams.get("id"));
  if (!id) return { ok: false, error: "ID ni lazima", status: 400 };

  const { error } = await db.from("citizen_government_ids").delete().eq("id", id);
  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true };
});
