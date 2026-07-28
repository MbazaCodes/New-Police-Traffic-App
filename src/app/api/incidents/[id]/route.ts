// Incident detail API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/incidents/[id] → fetch single incident
export const GET = withAuth("incidents", "view", async ({ params, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("incidents").select("*").eq("id", id).single();
  if (error || !data) {
    return { ok: false, error: "Tukio halipatikani", status: 404 };
  }
  // Preserve legacy response shape: { data } (no ok flag)
  return { ok: true, data };
});

// PATCH /api/incidents/[id] → update incident (auto-audited)
export const PATCH = withAuth("incidents", "update", async ({ params, body, db }) => {
  const id = String(params.id ?? "");
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("incidents").update(body).eq("id", id).select().single();
  if (error) throw error;
  return { ok: true, data };
});
