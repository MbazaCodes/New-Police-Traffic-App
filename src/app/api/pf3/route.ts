// PF3 (Police Form 3 — Traffic Accident Report) API — migrated to withAuth()
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/pf3 → list PF3 reports
export const GET = withAuth("incidents", "view", async ({ db }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };
  const { data, error } = await db.from("pf3_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/pf3 → create PF3 report (auto-audited)
export const POST = withAuth("incidents", "create", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: true, data: { id: `PF3-${Date.now()}` }, status: 201 };
  }
  const ref = `PF3-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  const { data, error } = await db.from("pf3_reports").insert({
    reference_no:     body.referenceNo    || ref,
    region:           body.region         || null,
    district:         body.district       || null,
    station:          body.station        || session?.user?.station || null,
    accident_type:    body.accidentType   || null,
    severity:         body.severity       || "minor",
    weather:          body.weather        || null,
    road_surface:     body.roadSurface    || null,
    light_condition:  body.lightCondition || null,
    location:         body.location       || null,
    date_time:        body.dateTime       || new Date().toISOString(),
    vehicles_json:    body.vehicles       ? JSON.stringify(body.vehicles)   : null,
    casualties_json:  body.casualties     ? JSON.stringify(body.casualties) : null,
    officer_name:     body.officerName    || session?.user?.name || null,
    officer_id:       body.officerId      || session?.user?.id   || null,
    notes:            body.notes          || null,
    status:           "submitted",
  }).select().single();

  if (error) throw error;
  return { ok: true, data, status: 201 };
});
