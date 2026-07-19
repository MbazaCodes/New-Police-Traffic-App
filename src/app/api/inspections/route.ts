// Vehicle inspections API — list & create
// GET  /api/inspections  -> list inspections
// POST /api/inspections  -> create inspection

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

interface Inspection {
  id: string;
  plate: string;
  model: string;
  color: string;
  owner: string;
  phone: string;
  location: string;
  datetime: string;
  documents: Array<{ label: string; status: string; pass: boolean }>;
  mechanical: Array<{ label: string; status: string; pass: boolean }>;
  photos: Array<{ label: string }>;
  overallStatus?: string;
  officer?: string;
}

const inspectionsStore: Inspection[] = [];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "inspections", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const plate = url.searchParams.get("plate");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...inspectionsStore];
    if (plate) {
      result = result.filter((i) => i.plate.toLowerCase() === plate.toLowerCase());
    }
    if (status && status !== "all") {
      result = result.filter((i) => i.overallStatus === status);
    }
    if (search) {
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(search) ||
          i.plate.toLowerCase().includes(search) ||
          i.owner.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list inspections", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "inspections", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["plate", "model", "owner", "location"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const documents = body.documents ?? [];
    const mechanical = body.mechanical ?? [];

    // Derive overall status: pass only if all checks pass
    const allChecks = [...documents, ...mechanical] as Array<{ pass?: boolean }>;
    const allPass = allChecks.length > 0 && allChecks.every((c) => c.pass === true);
    const overallStatus = body.overallStatus ?? (allPass ? "pass" : "fail");

    const newInspection: Inspection = {
      id: body.id ?? `INS-2026-${Math.floor(100 + Math.random() * 900)}`,
      plate: String(body.plate),
      model: String(body.model),
      color: body.color ?? "",
      owner: String(body.owner),
      phone: body.phone ?? "",
      location: String(body.location),
      datetime: body.datetime ?? new Date().toLocaleString("sw-TZ"),
      documents,
      mechanical,
      photos: body.photos ?? [],
      overallStatus,
      officer: body.officer ?? session!.user.name ?? "Unknown",
    };
    inspectionsStore.unshift(newInspection);

    logAction(
      session!.user.id,
      "create",
      "inspections",
      newInspection.id,
      { inspection: newInspection },
      session!.user.name,
    );

    return NextResponse.json({ data: newInspection }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create inspection", detail: String(err) },
      { status: 500 },
    );
  }
}
