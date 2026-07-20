// PF3 (Police Form 3 — Traffic Accident Report) API — list & create
// GET  /api/pf3  -> list PF3 forms
// POST /api/pf3  -> create PF3 form

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { errMsg } from "@/lib/api-error";

interface Pf3Form {
  referenceNo: string;
  region: string;
  district: string;
  station: string;
  accidentType: string;
  severity: string;
  weather: string;
  roadSurface: string;
  lightCondition: string;
  vehicles: Array<Record<string, unknown>>;
  casualties: Array<Record<string, unknown>>;
  witnesses: Array<Record<string, unknown>>;
  createdAt?: string;
  status?: string;
}

const pf3Store: Pf3Form[] = [];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "pf3", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const region = url.searchParams.get("region");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...pf3Store];
    if (region && region !== "all") {
      result = result.filter((p) => p.region === region);
    }
    if (search) {
      result = result.filter(
        (p) =>
          p.referenceNo.toLowerCase().includes(search) ||
          p.station.toLowerCase().includes(search) ||
          p.accidentType.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list PF3 forms", detail: errMsg(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "pf3", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["region", "district", "station", "accidentType"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const newForm: Pf3Form = {
      referenceNo:
        body.referenceNo ?? `PF3/${String(body.region).slice(0, 3).toUpperCase()}/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      region: String(body.region),
      district: String(body.district),
      station: String(body.station),
      accidentType: String(body.accidentType),
      severity: body.severity ?? "Mdogo",
      weather: body.weather ?? "Wazi",
      roadSurface: body.roadSurface ?? "Lami",
      lightCondition: body.lightCondition ?? "Mchana",
      vehicles: body.vehicles ?? [],
      casualties: body.casualties ?? [],
      witnesses: body.witnesses ?? [],
      createdAt: new Date().toISOString(),
      status: body.status ?? "submitted",
    };
    pf3Store.unshift(newForm);

    logAction(
      session!.user.id,
      "create",
      "pf3",
      newForm.referenceNo,
      { form: newForm },
      session!.user.name,
    );

    return NextResponse.json({ data: newForm }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create PF3 form", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
