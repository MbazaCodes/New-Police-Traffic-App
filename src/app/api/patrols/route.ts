// Patrols API — list & create (start patrol)
// GET  /api/patrols  -> list active patrols
// POST /api/patrols  -> start patrol

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { annotateRecordScope, getScopeContext } from "@/lib/scope";

const patrolsStore: {id:string;officer:string;area:string;status:string;start:string}[] = [];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "patrols", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const officer = url.searchParams.get("officer");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const scope = getScopeContext(session);

    let result = patrolsStore.map((p) =>
      annotateRecordScope({
        ...p,
        ownerId: String(p.officer ?? ""),
        region: "Dar es Salaam",
        district: "Kinondoni",
        station: "Oysterbay Station",
      }, scope),
    );
    result = enforceDataScope(result, scope);
    if (status && status !== "all") {
      result = result.filter((p) => p.status === status);
    }
    if (officer) {
      result = result.filter((p) => p.officer.toLowerCase().includes(officer.toLowerCase()));
    }
    if (search) {
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(search) ||
          p.officer.toLowerCase().includes(search) ||
          p.area.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list patrols", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "patrols", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.area) {
      return NextResponse.json({ error: "Missing required field: area" }, { status: 400 });
    }

    const now = new Date();
    const scope = getScopeContext(session);
    const newPatrol = annotateRecordScope({
      id: body.id ?? `PT-${Math.floor(100 + Math.random() * 900)}`,
      officer: body.officer ?? session!.user.name ?? "Unknown",
      area: String(body.area),
      start: body.start ?? now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
      distance: "0 km",
      status: "active",
      progress: 0,
      ownerId: session!.user.id,
      isPublic: false,
    }, scope);
    patrolsStore.unshift(newPatrol);

    logAction(
      session!.user.id,
      "start_patrol",
      "patrols",
      newPatrol.id,
      { patrol: newPatrol },
      session!.user.name,
    );

    return NextResponse.json({ data: newPatrol }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to start patrol", detail: String(err) },
      { status: 500 },
    );
  }
}
