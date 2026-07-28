// Missing Records API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [] });

    const url    = new URL(request.url);
    const status = url.searchParams.get("status") ?? "";
    const type   = url.searchParams.get("type") ?? "";
    const limit  = parseInt(url.searchParams.get("limit") ?? "100");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

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

    return NextResponse.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea" }, { status: 401 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    const { type, title, identifier, details, last_seen_location, reported_by, station_id } = body;
    if (!type || !identifier) return NextResponse.json({ error: "Aina na jina vinahitajika" }, { status: 400 });

    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("missing_records").insert({
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
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
