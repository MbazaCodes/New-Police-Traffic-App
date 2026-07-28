// Officers [id] API — migrated to withAuth() for centralized auth + audit
// PATCH supports role change (e.g. traffic → general): updates BOTH the
// officers row and the linked users row so login role stays in sync.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { uniqueViolationMsg } from "@/lib/api-error";

// GET /api/officers/[id] → fetch officer (with user + station + post relations)
export const GET = withAuth("officers", "view", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("officers")
    .select("*, user:users(id, name, role, status, phone, email, region, unit, badge_no), station:stations(id, name, region), post:posts(id, name)")
    .eq("id", id)
    .single();
  if (error) {
    return { ok: false, error: "Afisa hapatikani", status: 404 };
  }
  return { ok: true, data };
});

// PATCH /api/officers/[id] → update officer + mirror to users row (auto-audited)
export const PATCH = withAuth("officers", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { name, rank, role, stationId, postId, status, phone, email, unit } = body;

  // Fetch the officer to get the linked user_id
  const { data: officer, error: findErr } = await db.from("officers")
    .select("id, user_id").eq("id", id).single();
  if (findErr || !officer) {
    return { ok: false, error: "Afisa hapatikani", status: 404 };
  }

  // 1. Update officers row
  const offPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined)      offPatch.name        = name;
  if (rank !== undefined)      offPatch.rank        = rank;
  if (stationId !== undefined) offPatch.station_id  = stationId || null;
  if (postId !== undefined)    offPatch.post_id     = postId || null;
  if (status !== undefined)    offPatch.status      = status;
  if (phone !== undefined)     offPatch.phone       = phone || null;
  if (unit !== undefined)      offPatch.unit        = unit || null;

  const { error: offErr } = await db.from("officers").update(offPatch).eq("id", id);
  if (offErr) {
    const dup = uniqueViolationMsg(offErr);
    if (dup) return { ok: false, error: dup, status: 409 };
    throw offErr;
  }

  // 2. Mirror to users row — CRITICAL for login: role/status/station
  //    live on users; without this sync a role change would never
  //    affect which panel/PWA the officer lands in.
  const usrPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined)      usrPatch.name        = name;
  if (rank !== undefined)      usrPatch.rank        = rank;
  if (role !== undefined)      usrPatch.role        = role;
  if (stationId !== undefined) usrPatch.station_id  = stationId || null;
  if (status !== undefined)    usrPatch.status      = status === "active" ? "active" : status;
  if (phone !== undefined)     usrPatch.phone       = phone || null;
  if (email !== undefined)     usrPatch.email       = email || null;
  if (unit !== undefined)      usrPatch.unit        = unit || null;

  const { error: usrErr } = await db.from("users").update(usrPatch).eq("id", officer.user_id);
  if (usrErr) {
    const dup = uniqueViolationMsg(usrErr);
    if (dup) return { ok: false, error: dup, status: 409 };
    throw usrErr;
  }

  const { data: fresh } = await db.from("officers")
    .select("*, user:users(id, name, role, status), station:stations(id, name)")
    .eq("id", id)
    .single();
  return { ok: true, data: fresh };
});

// DELETE /api/officers/[id] → delete officer + linked user (auto-audited)
export const DELETE = withAuth("officers", "delete", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data: officer } = await db.from("officers")
    .select("id, user_id").eq("id", id).single();
  if (!officer) {
    return { ok: false, error: "Afisa hapatikani", status: 404 };
  }
  // Delete users row; officers row cascades (ON DELETE CASCADE)
  const { error } = await db.from("users").delete().eq("id", officer.user_id);
  if (error) throw error;
  return { ok: true };
});
