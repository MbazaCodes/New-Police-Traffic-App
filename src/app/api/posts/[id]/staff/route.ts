// Post Staff API
// GET  /api/posts/[id]/staff   → list staff at post
// POST /api/posts/[id]/staff   → assign officer to post (max 2 OCS)
// DELETE                       → remove from post

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { query, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

type Params = { params: Promise<{ id: string }> };

export const POST_ROLES = [
  { id: "OCS",     label: "OCS — Officer Commanding Station", max: 2, commanding: true  },
  { id: "OIC",     label: "OIC — Officer In Charge",         max: 2, commanding: true  },
  { id: "officer", label: "Afisa wa Kawaida",                 max: null, commanding: false },
  { id: "guard",   label: "Mlinzi / Askari",                  max: null, commanding: false },
];

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Uthibitishaji umekosea." }, { status: 401 });
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [] });

    const { id } = await params;

    const rows = await query(
      `SELECT ps.*, u.name, u.badge_no, u.phone, u.photo_url,
              u.rank as user_rank, u.role as user_role
       FROM post_staff ps
       LEFT JOIN users u ON u.id = ps.user_id
       WHERE ps.post_id = $1 AND ps.status = 'active'
       ORDER BY ps.is_commanding DESC, ps.created_at DESC`,
      [id]
    );

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id: postId } = await params;
    const body = await request.json().catch(() => ({}));
    const { user_id, station_role, rank, shift, notes } = body;

    if (!user_id || !station_role) {
      return NextResponse.json({ error: "user_id na station_role vinahitajika" }, { status: 400 });
    }

    // Check rank constraints
    const constraintRows = await query<{ check_post_rank_constraint: string | null }>(
      `SELECT check_post_rank_constraint($1, $2, $3, NULL)`,
      [postId, user_id, station_role]
    );
    const violation = constraintRows[0]?.check_post_rank_constraint;
    if (violation) {
      return NextResponse.json({ error: violation }, { status: 409 });
    }

    const isCommanding = ["ocs","oic","commanding"].includes(station_role.toLowerCase());

    const rows = await query(
      `INSERT INTO post_staff
       (post_id, user_id, station_role, rank, is_commanding, shift, status, notes,
        assigned_by_id, assigned_by_name)
       VALUES($1,$2,$3,$4,$5,$6,'active',$7,$8,$9)
       RETURNING *`,
      [postId, user_id, station_role.toUpperCase(), rank ?? null,
       isCommanding, shift ?? null, notes ?? null,
       session!.user.id, session!.user.name ?? ""]
    );

    // Update post officers_count
    await query(
      `UPDATE posts SET officers_count = (
         SELECT COUNT(*) FROM post_staff WHERE post_id=$1 AND status='active'
       ) WHERE id=$1`,
      [postId]
    ).catch(() => {});

    return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST STAFF POST]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const { id: postId } = await params;
    const url = new URL(request.url);
    const staffId = url.searchParams.get("staff_id");

    if (!staffId) return NextResponse.json({ error: "staff_id inahitajika" }, { status: 400 });

    await query(
      `UPDATE post_staff SET status='ended', assigned_until=CURRENT_DATE
       WHERE id=$1 AND post_id=$2`,
      [staffId, postId]
    );

    // Update count
    await query(
      `UPDATE posts SET officers_count = (
         SELECT COUNT(*) FROM post_staff WHERE post_id=$1 AND status='active'
       ) WHERE id=$1`,
      [postId]
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
