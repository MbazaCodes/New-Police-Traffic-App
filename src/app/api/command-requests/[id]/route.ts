// Command Request [id] — approve / decline / hold + comments
// GET   /api/command-requests/[id]   → get single request + comments
// PATCH /api/command-requests/[id]   → update status (approve/decline/hold)
// POST  /api/command-requests/[id]   → add comment

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const COMMANDER_ROLES = [
  "SUPER_ADMIN","NATIONAL_COMMANDER","REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER","STATION_COMMANDER","SYSTEM_ADMIN",
];

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id } = await params;
    const rows = await query(`SELECT * FROM command_requests WHERE id = $1`, [id]);
    if (!rows.length) return NextResponse.json({ error: "Ombi halipatikani" }, { status: 404 });

    const comments = await query(
      `SELECT * FROM request_comments WHERE request_id = $1 ORDER BY created_at ASC`, [id]
    );

    return NextResponse.json({ ok: true, data: rows[0], comments });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });

    const role = session.user.role ?? "";
    if (!COMMANDER_ROLES.includes(role)) {
      return NextResponse.json({ error: "Huna ruhusa ya kuidhinisha maombi" }, { status: 403 });
    }

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, note, hold_reason } = body;

    // action: "approve" | "decline" | "hold" | "review"
    const statusMap: Record<string, string> = {
      approve: "approved",
      decline: "declined",
      hold:    "on_hold",
      review:  "under_review",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: "Hatua batili" }, { status: 400 });

    const db = getDbAdmin();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { status: newStatus };
    if (action === "approve" || action === "decline") {
      updateData.response_note     = note ?? null;
      updateData.responded_by_id   = session.user.id;
      updateData.responded_by_name = session.user.name ?? "";
      updateData.responded_at      = now;
    }
    if (action === "hold") {
      updateData.hold_reason = hold_reason ?? note ?? null;
      updateData.held_by_id  = session.user.id;
      updateData.held_at     = now;
    }

    const { data, error } = await (db.from("command_requests") as any)
      .update(updateData).eq("id", id).select().single();
    if (error) throw error;

    // Auto-add a comment for the action
    if (note || hold_reason) {
      await query(
        `INSERT INTO request_comments (request_id, author_id, author_name, author_role, comment, is_internal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, session.user.id, session.user.name, role,
         note ?? hold_reason ?? action, true]
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[COMMAND-REQUESTS PATCH]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { comment, is_internal } = body;
    if (!comment) return NextResponse.json({ error: "Maoni inahitajika" }, { status: 400 });

    await query(
      `INSERT INTO request_comments (request_id, author_id, author_name, author_role, comment, is_internal)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, session.user.id, session.user.name, session.user.role, comment, is_internal ?? false]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
