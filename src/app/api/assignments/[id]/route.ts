// Assignment [id] API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// PATCH /api/assignments/[id] → update assignment (auto-audited)
export const PATCH = withAuth("assignments", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const patch: Record<string, unknown> = {};
  if (body.status)  patch.status   = body.status;
  if (body.endDate) patch.end_date = body.endDate;
  if (body.notes)   patch.notes    = body.notes;

  const { data, error } = await db.from("assignments").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});

// DELETE /api/assignments/[id] → delete assignment (auto-audited)
export const DELETE = withAuth("assignments", "delete", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { error } = await db.from("assignments").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
});
