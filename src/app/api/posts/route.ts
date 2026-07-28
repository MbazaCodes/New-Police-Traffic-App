// Posts API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const stationId = url.searchParams.get("stationId");
    const status    = url.searchParams.get("status");
    const type      = url.searchParams.get("type");
    const search    = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [], total: 0 });

    const where: string[] = [];
    const params: unknown[] = [];

    if (stationId && stationId !== "all") { params.push(stationId); where.push(`p.station_id = $${params.length}`); }
    if (status && status !== "all") { params.push(status); where.push(`p.status = $${params.length}`); }
    if (type && type !== "all") { params.push(type); where.push(`p.type = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`LOWER(p.name) LIKE $${params.length}`); }

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

    return NextResponse.json({ ok: true, data, total: data.length });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { name, stationId, location, type, status, shift } = body;
    if (!name || !stationId) return NextResponse.json({ error: "Jina na kituo vinahitajika" }, { status: 400 });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("posts").insert({
      name, station_id: stationId,
      location: location || null,
      type: type || "checkpoint",
      status: status || "active",
      shift: shift || null,
      officers_count: 0,
    }).select().single();

    if (error) throw error;
    await logAction(session, "CREATE", "posts", data.id, { name });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
