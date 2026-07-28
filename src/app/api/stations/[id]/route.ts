// Station detail API — migrated to withAuth() for centralized auth + audit
// GET    /api/stations/[id]  → fetch single station (mock store; DB list lives in /api/stations)
// PATCH  /api/stations/[id]  → update station (auto-audited)
// DELETE /api/stations/[id]  → delete station (auto-audited)
//
// NOTE: This route uses an in-memory store for the legacy mock path.
// The list endpoint at /api/stations reads from PostgreSQL. When the
// detail endpoint is migrated to DB in a future task, replace the
// stationsStore with db.from("stations").select(...).eq("id", id).
import { withAuth } from "@/lib/api-guard";

const stationsStore: { id: string; name: string; region: string; status: string }[] = [];

// GET /api/stations/[id] → fetch single station
export const GET = withAuth("stations", "view", async ({ params }) => {
  const id = String(params.id ?? "");
  const station = stationsStore.find((s) => s.id === id);
  if (!station) {
    return { ok: false, error: "Station not found", status: 404 };
  }
  return { ok: true, data: station };
});

// PATCH /api/stations/[id] → update station (auto-audited)
export const PATCH = withAuth("stations", "update", async ({ params, body }) => {
  const id = String(params.id ?? "");
  const idx = stationsStore.findIndex((s) => s.id === id);
  if (idx === -1) {
    return { ok: false, error: "Station not found", status: 404 };
  }
  const updated = { ...stationsStore[idx], ...body, id: stationsStore[idx].id };
  stationsStore[idx] = updated;
  return { ok: true, data: updated };
});

// DELETE /api/stations/[id] → delete station (auto-audited)
export const DELETE = withAuth("stations", "delete", async ({ params }) => {
  const id = String(params.id ?? "");
  const idx = stationsStore.findIndex((s) => s.id === id);
  if (idx === -1) {
    return { ok: false, error: "Station not found", status: 404 };
  }
  const [removed] = stationsStore.splice(idx, 1);
  return { ok: true, data: { id, deleted: true, name: removed.name } };
});
