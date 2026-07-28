// Inspections API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "inspections", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [], total: 0 });

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const status = url.searchParams.get("status") ?? "";

    const where: string[] = [];
    const params: unknown[] = [];
    if (status && status !== "all") { params.push(status); where.push(`vi.status = $${params.length}`); }
    if (search) { params.push(`%${search}%`); where.push(`(LOWER(vi.plate) LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length})`); }

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

    return NextResponse.json({ ok: true, data, total: data.length });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "inspections", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    if (!body.plate) return NextResponse.json({ error: "Plate inahitajika" }, { status: 400 });

    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("vehicle_inspections").insert({
      plate: body.plate?.toUpperCase(),
      officer_id: session?.user?.id || null,
      status: body.status || "passed",
      notes: body.notes || null,
      inspection_date: new Date().toISOString().split("T")[0],
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
