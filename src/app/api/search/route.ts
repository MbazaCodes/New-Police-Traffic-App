import { NextRequest, NextResponse } from "next/server";
import { SEARCH_RESULT } from "@/lib/police-data";

// GET /api/search?q=T123ABC&type=plate|nida|license|citizen
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "plate";

  if (!q) return NextResponse.json({ error: "Query required" }, { status: 400 });

  // Simulate 800ms lookup delay
  await new Promise((r) => setTimeout(r, 800));

  // Mock: any non-empty query returns the mock result
  if (q.length > 0) {
    return NextResponse.json({
      found: true,
      type,
      query: q,
      data: { ...SEARCH_RESULT, plate: type === "plate" ? q.toUpperCase() : SEARCH_RESULT.plate },
    });
  }

  return NextResponse.json({ found: false, query: q });
}
