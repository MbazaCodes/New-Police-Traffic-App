import { NextResponse } from "next/server";
import { loadMockDatabase } from "@/services/mock-db.service";

export async function POST() {
  const data = await loadMockDatabase();
  return NextResponse.json({ data }, { status: 200 });
}