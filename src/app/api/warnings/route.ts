// Warnings API — migrated to withAuth() for centralized auth + audit
// Migration: getServerSession + requirePermission + logAction → withAuth
// (audit logging is now automatic for POST)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/warnings → list warnings (newest first)
export const GET = withAuth("warnings", "view", async ({ db }) => {
  if (!isDbEnabled()) {
    return { ok: true, data: [] as { id: string; [k: string]: unknown }[] };
  }
  const { data } = await db
    .from("warnings")
    .select("*")
    .order("created_at", { ascending: false });
  return { ok: true, data: data ?? [] };
});

// POST /api/warnings → create a warning (auto-audited)
export const POST = withAuth("warnings", "create", async ({ body, db }) => {
  if (!body.citizenName || !body.offense) {
    return { ok: false, error: "Jina na kosa yanahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    // Stub response when DB is not configured (e.g. preview envs)
    return {
      ok: true,
      data: {
        id: `WN-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      },
      status: 201,
    };
  }

  const { data, error } = await db
    .from("warnings")
    .insert({
      citizen_name:  body.citizenName,
      citizen_nida:  body.citizenNida || null,
      citizen_phone: body.citizenPhone || null,
      reason:        body.offense,
      location:      body.location || null,
      notes:         body.notes || null,
      warning_date:  new Date().toISOString().split("T")[0],
      warning_time:  new Date().toLocaleTimeString("en-US", { hour12: false }),
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message, status: 400 };
  }
  return { ok: true, data, status: 201 };
});
