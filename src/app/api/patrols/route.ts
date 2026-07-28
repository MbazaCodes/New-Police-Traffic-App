// Patrols API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { getScope, buildScopeWhere } from "@/lib/data-scope";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const scope = getScope(session);
    const check = requirePermission(session, "patrols", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [], total: 0 });

    const url    = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    const where: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "all") { params.push(status); where.push(`pa.status = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`(LOWER(u.name) LIKE $${params.length} OR LOWER(s.name) LIKE $${params.length})`); }

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

    return NextResponse.json({ ok: true, data, total: data.length });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "patrols", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    const { area, startTime, officerId, stationId, vehicleId, notes } = body;
    if (!area) return NextResponse.json({ error: "Eneo la doria linahitajika" }, { status: 400 });

    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("patrols").insert({
      area, start_time: startTime || new Date().toISOString(),
      officer_id: officerId || session?.user?.id || null,
      station_id: stationId || null,
      vehicle_id: vehicleId || null,
      notes: notes || null,
      status: "active",
    }).select().single();

    if (error) throw error;
    await logAction(session, "CREATE", "patrols", data.id, { area });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
