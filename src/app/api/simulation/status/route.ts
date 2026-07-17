import { NextResponse } from "next/server";
import { getSimulationState } from "@/lib/simulation-state";

export async function GET() {
  return NextResponse.json({ data: getSimulationState() }, { status: 200 });
}