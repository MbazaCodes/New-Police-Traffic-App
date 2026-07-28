// Vehicle search — direct SQL, no stored procedure needed
// GET /api/search/vehicle?plate=T001ABC

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { isDbEnabled, query } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url   = new URL(request.url);
    const plate = url.searchParams.get("plate")?.trim().toUpperCase().replace(/\s+/g, " ") ?? "";

    if (!plate) return NextResponse.json({ error: "Plate inahitajika" }, { status: 400 });
    if (!isDbEnabled()) return NextResponse.json({ found: false, data: null }, { status: 503 });

    // Search by exact plate or plate without spaces
    const rows = await query(
      `SELECT * FROM vehicles
       WHERE UPPER(REPLACE(plate,' ','')) = UPPER(REPLACE($1,' ',''))
       ORDER BY created_at DESC LIMIT 1`,
      [plate]
    );

    if (!rows.length) {
      return NextResponse.json({ found: false, data: null, message: "Gari halijapatikana" }, { status: 404 });
    }

    return NextResponse.json({ found: true, data: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
