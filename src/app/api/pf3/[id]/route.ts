// PF3 detail API — migrated to withAuth() for centralized auth + audit
// Uses in-memory store for legacy mock path; the list endpoint at /api/pf3
// reads from PostgreSQL. To be unified in a future task.
import { withAuth } from "@/lib/api-guard";

interface Pf3Form {
  referenceNo: string;
  region: string;
  district: string;
  station: string;
  accidentType: string;
  severity: string;
  weather: string;
  roadSurface: string;
  lightCondition: string;
  vehicles: Array<Record<string, unknown>>;
  casualties: Array<Record<string, unknown>>;
  witnesses: Array<Record<string, unknown>>;
  createdAt?: string;
  status?: string;
}

const pf3Store: Pf3Form[] = [];

// GET /api/pf3/[id] → fetch single PF3 form
export const GET = withAuth("pf3", "view", async ({ params }) => {
  const id = String(params.id ?? "");
  const form = pf3Store.find((p) => p.referenceNo === id);
  if (!form) {
    return { ok: false, error: "PF3 form not found", status: 404 };
  }
  return { ok: true, data: form };
});

// PATCH /api/pf3/[id] → update PF3 form (auto-audited)
export const PATCH = withAuth("pf3", "update", async ({ params, body }) => {
  const id = String(params.id ?? "");
  const idx = pf3Store.findIndex((p) => p.referenceNo === id);
  if (idx === -1) {
    return { ok: false, error: "PF3 form not found", status: 404 };
  }
  const updated = { ...pf3Store[idx], ...body, referenceNo: pf3Store[idx].referenceNo };
  pf3Store[idx] = updated;
  return { ok: true, data: updated };
});
