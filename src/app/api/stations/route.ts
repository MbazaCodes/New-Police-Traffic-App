// Stations API — migrated to withAuth() for centralized auth + audit
// GET  /api/stations  → list stations (auto-scoped)
// POST /api/stations  → create station (auto-audited)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { applyScopeToQuery } from "@/lib/data-scope";

// GET /api/stations → list stations (auto-scoped via getScope)
export const GET = withAuth("stations", "view", async ({ db, scope, searchParams }) => {
  const region = searchParams.get("region");
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = applyScopeToQuery(db.from("stations"), scope)
    .select(`*, officers_count:officers(count), posts_count:posts(count)`)
    .order("name");
  if (region && region !== "all") q = q.eq("region", region);
  if (status && status !== "all") q = q.eq("status", status);
  if (search)                     q = q.ilike("name", `%${search}%`);

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/stations → create station (auto-audited)
export const POST = withAuth("stations", "create", async ({ body, db }) => {
  const { name, region, district, ward, address, phone, status } = body;
  if (!name || !region) {
    return { ok: false, error: "Jina na mkoa vinahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const insertRow: Record<string, unknown> = {
    name, region, district: district || null,
    address: address || null, phone: phone || null,
    status: status || "active",
  };
  if (ward) insertRow.ward = ward; // column added in migration 022

  let { data, error } = await db.from("stations").insert(insertRow).select().single();
  // Graceful fallback if migration 022 not yet applied: retry without ward,
  // folding it into address so the information is never lost.
  if (error && ward && /ward/i.test(error.message ?? "")) {
    delete insertRow.ward;
    insertRow.address = [`Kata ${ward}`, address].filter(Boolean).join(", ");
    ({ data, error } = await db.from("stations").insert(insertRow).select().single());
  }
  if (error) throw error;
  return { ok: true, data, status: 201 };
});
