// Missing persons / items / vehicles — migrated to withAuth()
// (audit logging is now automatic for POST)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/missing → list missing records (filter: type, status)
export const GET = withAuth("search", "view", async ({ db, searchParams }) => {
  const type   = searchParams.get("type");
  const status = searchParams.get("status");

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = db
    .from("missing_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (type   && type   !== "all") q = q.eq("type",   type);
  if (status && status !== "all") q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/missing → create a missing record (auto-audited)
export const POST = withAuth("search", "create", async ({ body, session, db }) => {
  if (!body.title) {
    return { ok: false, error: "Kichwa kinahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: true, data: { id: `MS-${Date.now()}` }, status: 201 };
  }

  const caseNo = `MS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const { data, error } = await db.from("missing_records").insert({
    case_no:            caseNo,
    type:               body.type            || "person",
    title:              body.title,
    identifier:         body.identifier      || null,
    details:            body.details         || null,
    last_seen:          body.lastSeen        || null,
    last_seen_location: body.lastSeenLocation|| null,
    reported_by:        body.reportedBy      || session?.user?.name || null,
    station:            body.station         || session?.user?.station || null,
    photo:              body.photo           || null,
    status:             "active",
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
