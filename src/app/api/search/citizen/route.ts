// Citizen search API
// GET /api/search/citizen?query=Juma&type=name -> citizen search result
// type can be: name | nida | mobile

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim();
    const type = (url.searchParams.get("type") ?? "name") as "name" | "nida" | "mobile";

    if (!query) {
      return NextResponse.json(
        { error: "Missing required query param: query" },
        { status: 400 },
      );
    }

    // In production: lookup citizen by name/nida/mobile in NIDA / civil registry.
    // Mock: return CITIZEN_RESULT (overriding the queried field) for any query.
    const result = {
      ...CITIZEN_RESULT,
      name: type === "name" ? query : CITIZEN_RESULT.name,
      nida: type === "nida" ? query : CITIZEN_RESULT.nida,
      mobile: type === "mobile" ? query : CITIZEN_RESULT.mobile,
    };

    logAction(
      session!.user.id,
      "search_citizen",
      "search",
      null,
      { type, query, found: true },
      session!.user.name,
    );

    return NextResponse.json({ data: result, found: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search citizen", detail: String(err) },
      { status: 500 },
    );
  }
}
