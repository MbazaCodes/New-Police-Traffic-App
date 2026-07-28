// Posts API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/posts → list posts (raw SQL with station JOIN)
export const GET = withAuth("posts", "view", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const stationId = searchParams.get("stationId");
  const status    = searchParams.get("status");
  const type      = searchParams.get("type");
  const search    = searchParams.get("search")?.toLowerCase() ?? "";

  const where: string[] = [];
  const params: unknown[] = [];

  if (stationId && stationId !== "all") {
    params.push(stationId);
    where.push(`p.station_id = $${params.length}`);
  }
  if (status && status !== "all") {
    params.push(status);
    where.push(`p.status = $${params.length}`);
  }
  if (type && type !== "all") {
    params.push(type);
    where.push(`p.type = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`LOWER(p.name) LIKE $${params.length}`);
  }

  const sql = `
    SELECT p.*,
           s.id as station_id_ref, s.name as station_name, s.region as station_region
    FROM posts p
    LEFT JOIN stations s ON s.id = p.station_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY p.name
  `;

  const rows = await query(sql, params);
  const data = rows.map((r: any) => ({
    ...r,
    station: r.station_name ? { id: r.station_id_ref, name: r.station_name, region: r.station_region } : null,
  }));

  return { ok: true, data, total: data.length };
});

// POST /api/posts → create post (auto-audited)
export const POST = withAuth("posts", "create", async ({ body, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { name, stationId, location, type, status, shift } = body;
  if (!name || !stationId) {
    return { ok: false, error: "Jina na kituo vinahitajika", status: 400 };
  }

  const { data, error } = await db.from("posts").insert({
    name, station_id: stationId,
    location:        location || null,
    type:            type || "checkpoint",
    status:          status || "active",
    shift:           shift || null,
    officers_count:  0,
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
