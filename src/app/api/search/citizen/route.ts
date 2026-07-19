// Citizen search API
// GET /api/search/citizen?query=Juma&type=name -> citizen search result from Supabase
// type can be: name | nida | mobile

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
    const query = url.searchParams.get("query")?.trim();
    const type = (url.searchParams.get("type") ?? "name") as "name" | "nida" | "mobile";

    if (!query) {
      return NextResponse.json(
        { error: "Missing required query param: query" },
        { status: 400 },
      );
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        // Search citizen in Supabase
        const { data, error } = await admin.rpc("search_citizen", {
          p_query: query,
          p_type: type,
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const result = data[0];
          logAction(
            session!.user.id,
            "search_citizen",
            "search",
            null,
            { type, query, found: true },
            session!.user.name,
          );
          return NextResponse.json({ data: result, found: true }, { status: 200 });
        }

        logAction(
          session!.user.id,
          "search_citizen",
          "search",
          null,
          { type, query, found: false },
          session!.user.name,
        );
        return NextResponse.json(
          { data: null, found: false, message: "Citizen not found in registry" },
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
      { error: "Failed to search citizen", detail: String(err) },
      { status: 500 },
    );
  }
}
