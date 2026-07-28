// Assignments API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/assignments → list assignments (raw SQL with JOINs)
export const GET = withAuth("assignments", "view", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status && status !== "all") {
    params.push(status);
    where.push(`a.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(LOWER(o.name) LIKE $${params.length} OR LOWER(s.name) LIKE $${params.length})`);
  }

  const sql = `
    SELECT a.*,
           o.id as off_id, o.name as off_name, o.officer_number as off_number, o.rank as off_rank,
           s.id as st_id, s.name as st_name, s.region as st_region,
           p.id as post_id_ref, p.name as post_name
    FROM assignments a
    LEFT JOIN officers o ON o.id = a.officer_id
    LEFT JOIN stations s ON s.id = a.station_id
    LEFT JOIN posts p ON p.id = a.post_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY a.created_at DESC LIMIT 200
  `;

  const rows = await query(sql, params);
  const data = rows.map((r: any) => ({
    ...r,
    officer: r.off_id ? { id: r.off_id, name: r.off_name, officer_number: r.off_number, rank: r.off_rank } : null,
    station: r.st_id ? { id: r.st_id, name: r.st_name, region: r.st_region } : null,
    post:    r.post_id_ref ? { id: r.post_id_ref, name: r.post_name } : null,
  }));

  return { ok: true, data, total: data.length };
});

// POST /api/assignments → create assignment (auto-audited)
export const POST = withAuth("assignments", "create", async ({ body, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { officerId, stationId, postId, startDate, endDate, notes, type } = body;
  if (!officerId || !stationId) {
    return { ok: false, error: "Afisa na kituo vinahitajika", status: 400 };
  }

  const { data, error } = await db.from("assignments").insert({
    officer_id: officerId,
    station_id: stationId,
    post_id:    postId || null,
    start_date: startDate || new Date().toISOString().split("T")[0],
    end_date:   endDate || null,
    notes:      notes || null,
    type:       type || "regular",
    status:     "active",
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
