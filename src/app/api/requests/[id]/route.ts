// PATCH /api/requests/[id]  → approve | reject | reallocate (auto-audited)
// Migrated to withAuth(): auth + audit handled centrally.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

export const PATCH = withAuth("requests", "manage", async ({ params, body, session, db }) => {
  const id = String(params.id ?? "");
  const { action, response, newStation } = body;

  if (!["approve", "reject", "reallocate"].includes(action)) {
    return {
      ok: false,
      error: "action lazima iwe: approve | reject | reallocate",
      status: 400,
    };
  }

  const statusMap: Record<string, string> = {
    approve: "approved", reject: "rejected", reallocate: "reallocated",
  };

  if (!isDbEnabled()) {
    // Mock: just return success
    return {
      ok: true,
      data: {
        id,
        status:      statusMap[action],
        action,
        response,
        respondedBy: session?.user?.name,
        respondedAt: new Date().toISOString(),
      },
    };
  }

  const { data, error } = await db.from("officer_requests").update({
    status:       statusMap[action],
    response:     response || null,
    new_station:  newStation || null,
    responded_by: session?.user?.name,
    responded_at: new Date().toISOString(),
  }).eq("id", id).select().single();

  if (error) {
    return { ok: false, error: error.message, status: 400 };
  }
  return { ok: true, data };
});
