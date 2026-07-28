// Patrols [id] API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

export const PATCH = withAuth("patrols", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) return { ok: true };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status)   patch.status   = body.status;
  if (body.end_time) patch.end_time = body.end_time;
  if (body.notes)    patch.notes    = body.notes;

  const { data, error } = await db.from("patrols").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});
