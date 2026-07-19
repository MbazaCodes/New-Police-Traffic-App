// Vehicle search API
// GET /api/search/vehicle?plate=T 001 ABC -> vehicle search result from Supabase

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

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

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        // Search vehicle by plate number in Supabase
        const { data, error } = await admin.rpc("search_vehicle", { p_plate: plate });

        if (error) throw error;

        if (data && data.length > 0) {
          const result = data[0];
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
      }
    }

    // Supabase not available
    return NextResponse.json(
      { error: "Search service unavailable", message: "Supabase haijawezeshwa" },
      { status: 503 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search vehicle", detail: String(err) },
      { status: 500 },
    );
  }
}
