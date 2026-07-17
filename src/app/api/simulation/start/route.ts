import { NextResponse } from "next/server";
import { startSimulation } from "@/lib/simulation-state";

export async function POST() {
  return NextResponse.json({ data: startSimulation() }, { status: 200 });
}