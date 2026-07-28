// Incidents API — migrated to withAuth() for centralized auth + audit
// GET  /api/incidents   → list incidents (scope-aware)
// POST /api/incidents   → create incident (auto-audited)
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";
import { applyScopeToQuery } from "@/lib/data-scope";

// GET /api/incidents → list incidents (auto-scoped via getScope)
export const GET = withAuth("incidents", "view", async ({ db, scope, searchParams }) => {
  const status   = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search   = searchParams.get("search")?.toLowerCase() ?? "";

  if (!isDbEnabled()) {
    return { ok: true, data: [], total: 0 };
  }

  let q = applyScopeToQuery(db.from("incidents"), scope)
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all")         q = q.eq("status", status);
  if (priority && priority !== "all")     q = q.eq("priority", priority);
  if (search) {
    q = q.or(`type.ilike.%${search}%,location.ilike.%${search}%,incident_number.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/incidents → create incident (auto-audited)
export const POST = withAuth("incidents", "create", async ({ body, session, db }) => {
  const { type, location, description, priority, citizenName, citizenPhone, citizenNida } = body;
  if (!type || !location) {
    return { ok: false, error: "Aina ya tukio na eneo vinahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: false, error: "Database haijawezeshwa", status: 503 };
  }

  const incidentNumber = `INC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const { data, error } = await db.from("incidents").insert({
    incident_number: incidentNumber,
    type, location, description: description || null,
    priority: priority || "medium", status: "active",
    citizen_name:  citizenName  || null,
    citizen_phone: citizenPhone || null,
    citizen_nida:  citizenNida  || null,
    officer_id:    session?.user?.id || null,
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
