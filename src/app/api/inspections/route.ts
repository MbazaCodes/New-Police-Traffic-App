// Inspections API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

// GET /api/inspections → list inspections (raw SQL with officer JOIN)
export const GET = withAuth("inspections", "view", async ({ searchParams }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const status = searchParams.get("status") ?? "";

  const where: string[] = [];
  const params: unknown[] = [];
  if (status && status !== "all") {
    params.push(status);
    where.push(`vi.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(LOWER(vi.plate) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length})`);
  }

  const sql = `
    SELECT vi.*, u.name as officer_name, u.badge_no as officer_badge
    FROM vehicle_inspections vi
    LEFT JOIN users u ON u.id = vi.officer_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY vi.created_at DESC LIMIT 200
  `;

  const rows = await query(sql, params);
  const data = rows.map((r: any) => ({
    ...r,
    officer: r.officer_name ? { id: r.officer_id, name: r.officer_name, badge_no: r.officer_badge } : null,
  }));

  return { ok: true, data, total: data.length };
});

// POST /api/inspections → create inspection (auto-audited)
export const POST = withAuth("inspections", "create", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  if (!body.plate) {
    return { ok: false, error: "Plate inahitajika", status: 400 };
  }

  const { data, error } = await db.from("vehicle_inspections").insert({
    plate:            body.plate?.toUpperCase(),
    officer_id:       session?.user?.id || null,
    status:           body.status || "passed",
    notes:            body.notes || null,
    inspection_date:  new Date().toISOString().split("T")[0],
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
