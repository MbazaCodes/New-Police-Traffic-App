// Citation detail API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/citations/[id] → fetch single citation
export const GET = withAuth("citations", "view", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("citations").select("*").eq("id", id).single();
  if (error || !data) {
    return { ok: false, error: "Citation haipatikani", status: 404 };
  }
  return { ok: true, data };
});

// PATCH /api/citations/[id] → update citation (auto-audited)
export const PATCH = withAuth("citations", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("citations").update(body).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});
