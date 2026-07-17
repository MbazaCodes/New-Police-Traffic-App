// Incidents API — list & create
// GET  /api/incidents  -> list incidents (with filters: status, priority, type, search)
// POST /api/incidents  -> create incident

import { NextResponse } from "next/server";
import { ADMIN_INCIDENTS } from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { annotateRecordScope, getScopeContext } from "@/lib/scope";

const incidentsStore: typeof ADMIN_INCIDENTS = [...ADMIN_INCIDENTS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const scope = getScopeContext(session);

    let result = incidentsStore.map((i) =>
      annotateRecordScope({
        ...i,
        ownerId: String(i.assignedTo ?? ""),
        region: "Dar es Salaam",
        district: "Kinondoni",
        station: "Oysterbay Station",
      }, scope),
    );
    result = enforceDataScope(result, scope);
    if (status && status !== "all") {
      result = result.filter((i) => i.status === status);
    }
    if (priority && priority !== "all") {
      result = result.filter((i) => i.priority === priority);
    }
    if (type && type !== "all") {
      result = result.filter((i) => i.type.toLowerCase().includes(type.toLowerCase()));
    }
    if (search) {
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(search) ||
          i.type.toLowerCase().includes(search) ||
          i.location.toLowerCase().includes(search) ||
          i.assignedTo.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list incidents", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["type", "location", "description"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const scope = getScopeContext(session);
    const newIncident = annotateRecordScope({
      id: body.id ?? `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type: String(body.type),
      location: String(body.location),
      date: body.date ?? now.toLocaleDateString("sw-TZ"),
      time: body.time ?? now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
      status: body.status ?? "active",
      priority: body.priority ?? "medium",
      assignedTo: body.assignedTo ?? session!.user.name ?? "Unassigned",
      description: String(body.description),
      ownerId: session!.user.id,
      isPublic: false,
    }, scope);
    incidentsStore.unshift(newIncident);

    logAction(
      session!.user.id,
      "create",
      "incidents",
      newIncident.id,
      { incident: newIncident },
      session!.user.name,
    );

    return NextResponse.json({ data: newIncident }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create incident", detail: String(err) },
      { status: 500 },
    );
  }
}
