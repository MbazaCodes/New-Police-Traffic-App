// Post Staff API — migrated to withAuth() for centralized auth + audit
// GET    /api/posts/[id]/staff  → list staff at post
// POST   /api/posts/[id]/staff  → assign officer (rank-enforced, auto-audited)
// DELETE /api/posts/[id]/staff?staff_id=  → remove (auto-audited)
import { withAuth, withAuthAny } from "@/lib/api-guard";
import { query, isDbEnabled } from "@/lib/db/client";

export const POST_ROLES = [
  { id: "OCS",     label: "OCS — Officer Commanding Station", max: 2, commanding: true  },
  { id: "OIC",     label: "OIC — Officer In Charge",          max: 2, commanding: true  },
  { id: "officer", label: "Afisa wa Kawaida",                  max: null, commanding: false },
  { id: "guard",   label: "Mlinzi / Askari",                   max: null, commanding: false },
];

// GET /api/posts/[id]/staff → list staff at post
export const GET = withAuthAny("post_staff", async ({ params }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };
  const id = String(params.id ?? "");

  const rows = await query(
    `SELECT ps.*, u.name, u.badge_no, u.phone, u.photo_url,
            u.rank as user_rank, u.role as user_role
     FROM post_staff ps
     LEFT JOIN users u ON u.id = ps.user_id
     WHERE ps.post_id = $1 AND ps.status = 'active'
     ORDER BY ps.is_commanding DESC, ps.created_at DESC`,
    [id]
  );

  return { ok: true, data: rows };
});

// POST /api/posts/[id]/staff → assign officer (auto-audited)
export const POST = withAuth("posts", "create", async ({ params, body, session }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const postId = String(params.id ?? "");
  const { user_id, station_role, rank, shift, notes } = body;
  if (!user_id || !station_role) {
    return { ok: false, error: "user_id na station_role vinahitajika", status: 400 };
  }

  const constraintRows = await query<{ check_post_rank_constraint: string | null }>(
    `SELECT check_post_rank_constraint($1, $2, $3, NULL)`,
    [postId, user_id, station_role]
  );
  const violation = constraintRows[0]?.check_post_rank_constraint;
  if (violation) {
    return { ok: false, error: violation, status: 409 };
  }

  const isCommanding = ["ocs", "oic", "commanding"].includes(station_role.toLowerCase());

  const rows = await query(
    `INSERT INTO post_staff
     (post_id, user_id, station_role, rank, is_commanding, shift, status, notes,
      assigned_by_id, assigned_by_name)
     VALUES($1,$2,$3,$4,$5,$6,'active',$7,$8,$9)
     RETURNING *`,
    [postId, user_id, station_role.toUpperCase(), rank ?? null,
     isCommanding, shift ?? null, notes ?? null,
     session.user.id, session.user.name ?? ""]
  );

  // Update post officers_count
  await query(
    `UPDATE posts SET officers_count = (
       SELECT COUNT(*) FROM post_staff WHERE post_id=$1 AND status='active'
     ) WHERE id=$1`,
    [postId]
  ).catch(() => {});

  return { ok: true, data: rows[0], status: 201 };
});

// DELETE /api/posts/[id]/staff?staff_id=... → end assignment (auto-audited)
export const DELETE = withAuth("posts", "create", async ({ params, searchParams }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const postId = String(params.id ?? "");
  const staffId = searchParams.get("staff_id");
  if (!staffId) {
    return { ok: false, error: "staff_id inahitajika", status: 400 };
  }

  await query(
    `UPDATE post_staff SET status='ended', assigned_until=CURRENT_DATE
     WHERE id=$1 AND post_id=$2`,
    [staffId, postId]
  );

  await query(
    `UPDATE posts SET officers_count = (
       SELECT COUNT(*) FROM post_staff WHERE post_id=$1 AND status='active'
     ) WHERE id=$1`,
    [postId]
  ).catch(() => {});

  return { ok: true };
});
