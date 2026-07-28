// Station Staff API — migrated to withAuth() for centralized auth + audit
// GET    /api/stations/[id]/staff        → list staff at station
// POST   /api/stations/[id]/staff        → assign officer (rank-enforced, auto-audited)
// DELETE /api/stations/[id]/staff?staff_id=  → remove from station (auto-audited)
import { withAuth, withAuthAny } from "@/lib/api-guard";
import { query, isDbEnabled } from "@/lib/db/client";

// Station role display config (kept exported for screen consumers)
export const STATION_ROLES = [
  { id: "OCD",    label: "OCD — Officer Commanding District",    max: 1, commanding: true  },
  { id: "OCS",    label: "OCS — Officer Commanding Station",     max: 2, commanding: true  },
  { id: "OCPD",   label: "OCPD — Officer Commanding Police Div", max: 2, commanding: true  },
  { id: "officer",label: "Afisa wa Kawaida",                     max: null, commanding: false },
  { id: "clerk",  label: "Karani",                               max: null, commanding: false },
  { id: "driver", label: "Dereva",                               max: null, commanding: false },
  { id: "guard",  label: "Mlinzi",                               max: null, commanding: false },
];

// GET /api/stations/[id]/staff → list staff at station
export const GET = withAuthAny("station_staff", async ({ params }) => {
  if (!isDbEnabled()) return { ok: true, data: [] };
  const id = String(params.id ?? "");

  const rows = await query(
    `SELECT ss.*, u.name, u.badge_no, u.email, u.phone, u.photo_url,
            u.rank as user_rank, u.role as user_role
     FROM station_staff ss
     LEFT JOIN users u ON u.id = ss.user_id
     WHERE ss.station_id = $1
     ORDER BY
       CASE LOWER(ss.station_role)
         WHEN 'ocd'  THEN 1 WHEN 'ocs' THEN 2 WHEN 'ocpd' THEN 3
         ELSE 4
       END,
       ss.created_at DESC`,
    [id]
  );

  return { ok: true, data: rows };
});

// POST /api/stations/[id]/staff → assign officer (auto-audited)
export const POST = withAuth("stations", "create", async ({ params, body, session }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const stationId = String(params.id ?? "");
  const { user_id, station_role, rank, shift, notes } = body;
  if (!user_id || !station_role) {
    return { ok: false, error: "user_id na station_role vinahitajika", status: 400 };
  }

  // Check rank constraints
  const constraintRows = await query<{ check_station_rank_constraint: string | null }>(
    `SELECT check_station_rank_constraint($1, $2, $3, NULL)`,
    [stationId, user_id, station_role]
  );
  const violation = constraintRows[0]?.check_station_rank_constraint;
  if (violation) {
    return { ok: false, error: violation, status: 409 };
  }

  // End any existing active assignment for this user at this station
  await query(
    `UPDATE station_staff SET status='ended', assigned_until=CURRENT_DATE
     WHERE station_id=$1 AND user_id=$2 AND status='active'`,
    [stationId, user_id]
  );

  const isCommanding = ["ocd", "ocs", "ocpd"].includes(station_role.toLowerCase());

  const rows = await query(
    `INSERT INTO station_staff
     (station_id, user_id, station_role, rank, is_commanding, status, notes,
      assigned_by_id, assigned_by_name)
     VALUES($1,$2,$3,$4,$5,'active',$6,$7,$8)
     RETURNING *`,
    [stationId, user_id, station_role.toUpperCase(), rank ?? null,
     isCommanding, notes ?? null,
     session.user.id, session.user.name ?? ""]
  );

  // Update station commissioner if OCD/OCS
  if (isCommanding) {
    await query(
      `UPDATE stations SET commissioner_user_id=$1 WHERE id=$2`,
      [user_id, stationId]
    ).catch(() => {}); // non-critical
  }

  return { ok: true, data: rows[0], status: 201 };
});

// DELETE /api/stations/[id]/staff?staff_id=... → end assignment (auto-audited)
export const DELETE = withAuth("stations", "create", async ({ params, searchParams }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const stationId = String(params.id ?? "");
  const staffId   = searchParams.get("staff_id");
  if (!staffId) {
    return { ok: false, error: "staff_id inahitajika", status: 400 };
  }

  await query(
    `UPDATE station_staff SET status='ended', assigned_until=CURRENT_DATE
     WHERE id=$1 AND station_id=$2`,
    [staffId, stationId]
  );
  return { ok: true };
});
