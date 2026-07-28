// Missing Records [id] API — migrated to withAuth() for centralized auth + audit
import { withAuthAny } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

export const PATCH = withAuthAny("missing_records", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("missing_records")
    .update({ status: body.status ?? "found", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { ok: true, data };
});
