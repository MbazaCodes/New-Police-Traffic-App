// Unified Search API — searches vehicles and citizens via Supabase
// GET /api/search?q=T 001 ABC&type=plate|nida|license|citizen

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") ?? "plate";

    if (!q) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        // Search based on type
        if (type === "plate") {
          const { data } = await admin.rpc("search_vehicle", { p_plate: q.toUpperCase() });
          if (data && data.length > 0) {
            return NextResponse.json({
              found: true,
              type,
              query: q,
              data: data[0],
            });
          }
        } else if (type === "nida" || type === "name" || type === "mobile" || type === "citizen") {
          const { data } = await admin.rpc("search_citizen", { p_query: q, p_type: type });
          if (data && data.length > 0) {
            return NextResponse.json({
              found: true,
              type,
              query: q,
              data: data[0],
            });
          }
        }
      }
    }

    return NextResponse.json({ found: false, query: q, type });
  } catch (err) {
    return NextResponse.json(
      { error: "Search failed", detail: String(err) },
      { status: 500 },
    );
  }
}
