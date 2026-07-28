// Missing Records API — migrated to withAuth() for centralized auth + audit
import { withAuth, withAuthAny } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/missing-records → list missing records (raw SQL)
export const GET = withAuth("search", "view", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };

  const status = searchParams.get("status") ?? "";
  const type   = searchParams.get("type") ?? "";
  const limit  = parseInt(searchParams.get("limit") ?? "100");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (type)   { params.push(type);   where.push(`type = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(LOWER(identifier) LIKE $${params.length} OR LOWER(title) LIKE $${params.length})`);
  }
  params.push(limit);

  const rows = await query(
    `SELECT * FROM missing_records ${where.length ? "WHERE "+where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT $${params.length}`,
    params
  );

  return { ok: true, data: rows, total: rows.length };
});

// POST /api/missing-records → create missing record (auto-audited)
export const POST = withAuthAny("missing_records", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { type, title, identifier, details, last_seen_location, reported_by, station_id } = body;
  if (!type || !identifier) {
    return { ok: false, error: "Aina na jina vinahitajika", status: 400 };
  }

  const { data, error } = await db.from("missing_records").insert({
    case_no: `MSN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
    type, title: title || identifier, identifier,
    details: details || null,
    last_seen_location: last_seen_location || null,
    reported_by: reported_by || session.user.name || null,
    reported_date: new Date().toISOString().split("T")[0],
    status: "active",
    station_id: station_id || (session.user as any).stationId || null,
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
