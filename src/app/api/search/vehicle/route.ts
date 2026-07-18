// Vehicle search API
// GET /api/search/vehicle?plate=T 001 ABC -> vehicle search result

import { NextResponse } from "next/server";
import { SEARCH_RESULT } from "@/lib/police-data";
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
    const plate = url.searchParams.get("plate")?.trim().toUpperCase();
    if (!plate) {
      return NextResponse.json(
        { error: "Missing required query param: plate" },
        { status: 400 },
      );
    }

    // In production: lookup vehicle by plate in vehicle registry.
    // Mock: return the SEARCH_RESULT (overriding the plate) if it starts with "T".
    if (plate.startsWith("T")) {
      const result = { ...SEARCH_RESULT, plate };
      logAction(
        session!.user.id,
        "search_vehicle",
        "search",
        null,
        { plate, found: true },
        session!.user.name,
      );
      return NextResponse.json({ data: result, found: true }, { status: 200 });
    }

    logAction(
      session!.user.id,
      "search_vehicle",
      "search",
      null,
      { plate, found: false },
      session!.user.name,
    );
    return NextResponse.json(
      { data: null, found: false, message: "Vehicle not found in registry" },
      { status: 404 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search vehicle", detail: String(err) },
      { status: 500 },
    );
  }
}
