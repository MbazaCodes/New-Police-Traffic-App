// Vehicle search — migrated to withAuth() for centralized auth + audit
// GET /api/search/vehicle?plate=T001ABC
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

export const GET = withAuth("search", "view", async ({ searchParams }) => {
  const plate = searchParams.get("plate")?.trim().toUpperCase().replace(/\s+/g, " ") ?? "";
  if (!plate) {
    return { ok: false, error: "Plate inahitajika", status: 400 };
  }
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503, data: null } as any;
  }

  const rows = await query(
    `SELECT * FROM vehicles
     WHERE UPPER(REPLACE(plate,' ','')) = UPPER(REPLACE($1,' ',''))
     ORDER BY created_at DESC LIMIT 1`,
    [plate]
  );

  if (!rows.length) {
    return { found: false, data: null, message: "Gari halijapatikana", status: 404 } as any;
  }
  return { found: true, data: rows[0] } as any;
});
