// Citizen search — migrated to withAuth() for centralized auth + audit
// GET /api/search/citizen?query=Juma&type=name|nida|mobile|license
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled, query } from "@/lib/db/client";

export const GET = withAuth("search", "view", async ({ searchParams }) => {
  const q    = searchParams.get("query")?.trim() ?? "";
  const type = searchParams.get("type") ?? "name";

  if (!q) return { ok: false, error: "Query inahitajika", status: 400 };
  if (!isDbEnabled()) {
    return { found: false, data: null, status: 503 } as any;
  }

  let sql: string;
  let params: unknown[];

  switch (type) {
    case "nida":
      sql = `SELECT * FROM citizens WHERE LOWER(REPLACE(nida,' ','')) = LOWER(REPLACE($1,' ','')) LIMIT 1`;
      params = [q];
      break;
    case "mobile": {
      // Normalize TZ phone
      const digits = q.replace(/\D/g, "");
      const core = digits.startsWith("255") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
      sql = `SELECT * FROM citizens WHERE mobile IN ($1,$2,$3,$4) LIMIT 1`;
      params = [`0${core}`, `+255${core}`, `255${core}`, core];
      break;
    }
    case "license":
      sql = `SELECT c.* FROM citizens c
             LEFT JOIN licenses l ON l.citizen_id = c.id
             WHERE LOWER(l.license_number) = LOWER($1) LIMIT 1`;
      params = [q];
      break;
    default: // name
      sql = `SELECT * FROM citizens WHERE name ILIKE $1 ORDER BY name LIMIT 5`;
      params = [`%${q}%`];
  }

  const rows = await query(sql, params);
  if (!rows.length) {
    return { found: false, data: null, message: "Raia huyu hajapatikana", status: 404 } as any;
  }
  return { found: true, data: rows[0] } as any;
});
