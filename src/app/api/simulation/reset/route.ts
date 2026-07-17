import { NextResponse } from "next/server";
import { stopSimulation } from "@/lib/simulation-state";

export async function POST() {
  return NextResponse.json({ data: stopSimulation() }, { status: 200 });
}