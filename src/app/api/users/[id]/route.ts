// Users [id] API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/users/[id] → fetch single user (with station relation)
export const GET = withAuth("users", "view", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("users")
    .select("*, station:stations(id,name,region)")
    .eq("id", id)
    .single();
  if (error || !data) {
    return { ok: false, error: "Mtumiaji hapatikani", status: 404 };
  }
  return { ok: true, data };
});

// PATCH /api/users/[id] → update user (auto-audited)
export const PATCH = withAuth("users", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const updates: Record<string, unknown> = {};
  if (body.name)    updates.name       = body.name;
  if (body.email)   updates.email      = body.email;
  if (body.phone)   updates.phone      = body.phone;
  if (body.role)    updates.role       = body.role;
  if (body.status)  updates.status     = body.status;
  if (body.station) updates.station_id = body.station;
  if (body.unit)    updates.unit       = body.unit;
  if (body.rank)    updates.rank       = body.rank;

  const { data, error } = await db.from("users").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});

// DELETE /api/users/[id] → delete user (auto-audited)
export const DELETE = withAuth("users", "delete", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { error } = await db.from("users").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
});
