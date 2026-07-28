// Arrests API — migrated to withAuth() for centralized auth + audit
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { applyScopeToQuery } from "@/lib/data-scope";

// GET /api/arrests → list arrests (auto-scoped)
export const GET = withAuth("arrests", "view", async ({ db, scope, searchParams }) => {
  const status = searchParams.get("status");
  if (!isDbEnabled()) {
    return { ok: true, data: [] };
  }
  let q = applyScopeToQuery(db.from("arrests"), scope)
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [] };
});

// POST /api/arrests → create arrest (auto-audited)
export const POST = withAuth("arrests", "create", async ({ body, session, db }) => {
  if (!body.suspectName || !body.offense || !body.location) {
    return { ok: false, error: "Jina, kosa na eneo yanahitajika", status: 400 };
  }
  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }
  const { data, error } = await db.from("arrests").insert({
    suspect_name:  body.suspectName,
    suspect_nida:  body.suspectNida  || null,
    suspect_phone: body.suspectPhone || null,
    offense:       body.offense,
    location:      body.location,
    cell:          body.cell       || null,
    next_of_kin:   body.nextOfKin  || null,
    lawyer:        body.lawyer     || null,
    notes:         body.notes      || null,
    status:        "held",
    officer_id:    session?.user?.id || null,
  }).select().single();
  if (error) throw error;
  return { ok: true, data, status: 201 };
});
