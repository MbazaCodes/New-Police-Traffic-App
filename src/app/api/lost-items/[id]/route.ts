// Lost Item [id] — update status (found, returned, claimed)
// Migrated to withAuth(): auth + audit handled centrally.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

export const PATCH = withAuth("citizens", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!id) return { ok: false, error: "ID inahitajika", status: 400 };

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status)        patch.status         = body.status;
  if (body.foundDate)     patch.found_date     = body.foundDate;
  if (body.foundLocation) patch.found_location = body.foundLocation;
  if (body.notes)         patch.notes          = body.notes;

  const { data, error } = await db
    .from("lost_items")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { ok: true, data };
});
