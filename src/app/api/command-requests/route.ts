// Command Requests API
// GET  /api/command-requests          → list (scoped by role)
// POST /api/command-requests          → create new request

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const COMMANDER_ROLES = [
  "SUPER_ADMIN","NATIONAL_COMMANDER","REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER","STATION_COMMANDER","SYSTEM_ADMIN",
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });

    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [], total: 0 });

    const url    = new URL(request.url);
    const status = url.searchParams.get("status") ?? "";
    const type   = url.searchParams.get("type") ?? "";
    const role   = session.user.role ?? "";
    const userId = session.user.id ?? "";

    const isCommander = COMMANDER_ROLES.includes(role);

    // Build query based on role
    let sql = `SELECT * FROM command_requests`;
    const params: unknown[] = [];
    const where: string[] = [];

    if (!isCommander) {
      // Non-commanders see only their own requests
      params.push(userId);
      where.push(`requester_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
    }

    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    sql += ` ORDER BY created_at DESC LIMIT 200`;

    const rows = await query(sql, params);
    return NextResponse.json({ ok: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("[COMMAND-REQUESTS GET]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    const { type, subject, description, priority, approver_role, approver_name, approver_id, form_data, attachments } = body;

    if (!type || !subject || !description) {
      return NextResponse.json({ error: "Aina, kichwa na maelezo vinahitajika" }, { status: 400 });
    }

    const db = getDbAdmin();
    const refRows = await query<{ ref: string }>(
      `SELECT generate_request_ref($1) AS ref`, [type]
    );
    const ref = refRows[0]?.ref ?? `REQ-${Date.now()}`;

    const { data, error } = await (db.from("command_requests") as any).insert({
      reference_no:      ref,
      type,
      subject:           String(subject).trim(),
      description:       String(description).trim(),
      priority:          priority ?? "normal",
      status:            "pending",
      requester_id:      session.user.id,
      requester_name:    session.user.name ?? "",
      requester_role:    session.user.role ?? "",
      requester_dept:    body.requester_dept ?? null,
      requester_region:  session.user.region ?? null,
      requester_station: session.user.station ?? null,
      approver_id:       approver_id ?? null,
      approver_role:     approver_role ?? "NATIONAL_COMMANDER",
      approver_name:     approver_name ?? null,
      attachments:       JSON.stringify(attachments ?? []),
      form_data:         JSON.stringify(form_data ?? {}),
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    console.error("[COMMAND-REQUESTS POST]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
