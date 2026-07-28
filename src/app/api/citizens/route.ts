// Citizens API — migrated to withAuth() for centralized auth + audit
// GET  /api/citizens?query=&type=name|nida|mobile|license  → search/list
// POST /api/citizens  → create citizen (officer or admin)
//
// Migration: getServerSession + requirePermission + logAction → withAuth
// (audit logging is now automatic for POST)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/citizens → search/list citizens
export const GET = withAuth("citizens", "view", async ({ db, searchParams }) => {
  const query = searchParams.get("query")?.trim() ?? "";
  const type  = searchParams.get("type") ?? "name";

  if (!isDbEnabled()) {
    return { ok: true, data: [] };
  }

  let data: unknown[];
  if (!query || query === "%") {
    const result = await db
      .from("citizens")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    data = result.data ?? [];
  } else if (type === "nida") {
    const result = await db.from("citizens").select("*").ilike("nida", query).limit(10);
    data = result.data ?? [];
  } else if (type === "mobile") {
    const result = await db.from("citizens").select("*").ilike("mobile", `%${query}%`).limit(10);
    data = result.data ?? [];
  } else {
    const result = await db.from("citizens").select("*").ilike("name", `%${query}%`).limit(20);
    data = result.data ?? [];
  }
  return { ok: true, data };
});

// POST /api/citizens → create citizen (auto-audited)
export const POST = withAuth("citizens", "create", async ({ body, session, db }) => {
  if (!body.name) {
    return { ok: false, error: "Jina linahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

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

  let { data, error } = await db.from("citizens").insert(insertRow).select().single();
  // Schema-variant fallback: drop optional columns that may not exist on older DBs
  if (error && /tribe|photo_url|documents|nationality|religion|marital|blood_group/.test(error.message ?? "")) {
    ["tribe","photo_url","documents","nationality","religion","marital_status","blood_group","notes"].forEach(k => delete insertRow[k]);
    ({ data, error } = await db.from("citizens").insert(insertRow).select().single());
  }
  if (error) {
    return { ok: false, error: error.message, status: 400 };
  }
  return { ok: true, data, status: 201 };
});
