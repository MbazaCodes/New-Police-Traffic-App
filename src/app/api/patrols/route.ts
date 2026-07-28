// Patrols API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/patrols → list patrols (raw SQL with JOINs; scope passed through ctx)
export const GET = withAuth("patrols", "view", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status && status !== "all") {
    params.push(status);
    where.push(`pa.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(LOWER(u.name) LIKE $${params.length} OR LOWER(s.name) LIKE $${params.length})`);
  }

  const sql = `
    SELECT pa.*, u.name as officer_name, u.badge_no as officer_badge,
           s.name as station_name
    FROM patrols pa
    LEFT JOIN users u ON u.id = pa.officer_id
    LEFT JOIN stations s ON s.id = pa.station_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY pa.created_at DESC LIMIT 200
  `;

  const rows = await query(sql, params);
  const data = rows.map((r: any) => ({
    ...r,
    officer: r.officer_name ? { id: r.officer_id, name: r.officer_name, badge_no: r.officer_badge } : null,
    station: r.station_name ? { id: r.station_id, name: r.station_name } : null,
  }));

  return { ok: true, data, total: data.length };
});

// POST /api/patrols → create patrol (auto-audited)
export const POST = withAuth("patrols", "create", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { area, startTime, officerId, stationId, vehicleId, notes } = body;
  if (!area) {
    return { ok: false, error: "Eneo la doria linahitajika", status: 400 };
  }

  const { data, error } = await db.from("patrols").insert({
    area,
    start_time: startTime || new Date().toISOString(),
    officer_id: officerId || session?.user?.id || null,
    station_id: stationId || null,
    vehicle_id: vehicleId || null,
    notes:      notes || null,
    status:     "active",
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
