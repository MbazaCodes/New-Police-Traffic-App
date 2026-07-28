// Posts [id] API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/posts/[id] → fetch single post (with station relation)
export const GET = withAuth("posts", "view", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("posts")
    .select("*, station:stations(id, name, region)")
    .eq("id", id)
    .single();
  if (error) {
    return { ok: false, error: "Posti haipatikani", status: 404 };
  }
  return { ok: true, data };
});

// PATCH /api/posts/[id] → update post (auto-audited)
export const PATCH = withAuth("posts", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { name, stationId, location, type, status, shift } = body;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined)      patch.name        = name;
  if (stationId !== undefined) patch.station_id  = stationId;
  if (location !== undefined)  patch.location    = location;
  if (type !== undefined)      patch.type        = type;
  if (status !== undefined)    patch.status      = status;
  if (shift !== undefined)     patch.shift       = shift;

  const { data, error } = await db.from("posts").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});

// DELETE /api/posts/[id] → delete post (auto-audited)
export const DELETE = withAuth("posts", "delete", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
});
