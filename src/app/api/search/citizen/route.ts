// Citizen search — direct SQL, no stored procedure needed
// GET /api/search/citizen?query=Juma&type=name|nida|mobile|license

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url   = new URL(request.url);
    const q     = url.searchParams.get("query")?.trim() ?? "";
    const type  = url.searchParams.get("type") ?? "name";

    if (!q) return NextResponse.json({ error: "Query inahitajika" }, { status: 400 });
    if (!isDbEnabled()) return NextResponse.json({ found: false, data: null }, { status: 503 });

    let sql: string;
    let params: unknown[];

    switch (type) {
      case "nida":
        sql = `SELECT * FROM citizens WHERE LOWER(REPLACE(nida,' ','')) = LOWER(REPLACE($1,' ','')) LIMIT 1`;
        params = [q];
        break;
      case "mobile":
        // Normalize TZ phone
        const digits = q.replace(/\D/g, "");
        const core = digits.startsWith("255") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
        sql = `SELECT * FROM citizens WHERE mobile IN ($1,$2,$3,$4) LIMIT 1`;
        params = [`0${core}`, `+255${core}`, `255${core}`, core];
        break;
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
      return NextResponse.json({ found: false, data: null, message: "Raia huyu hajapatikana" }, { status: 404 });
    }

    return NextResponse.json({ found: true, data: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
