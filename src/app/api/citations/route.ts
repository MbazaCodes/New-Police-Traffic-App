// Citations API — list & create
// GET  /api/citations   -> list citations (with filters: status, plate, officer, search)
// POST /api/citations   -> create citation

import { NextResponse } from "next/server";
import { ADMIN_CITATIONS } from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { annotateRecordScope, getScopeContext } from "@/lib/scope";

const citationsStore: typeof ADMIN_CITATIONS = [...ADMIN_CITATIONS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const plate = url.searchParams.get("plate");
    const officer = url.searchParams.get("officer");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const scope = getScopeContext(session);

    let result = citationsStore.map((c) =>
      annotateRecordScope({
        ...c,
        ownerId: String(c.officer ?? ""),
        region: "Dar es Salaam",
        district: "Kinondoni",
        station: "Oysterbay Station",
      }, scope),
    );
    result = enforceDataScope(result, scope);
    if (status && status !== "all") {
      result = result.filter((c) => c.status === status);
    }
    if (plate) {
      result = result.filter((c) => c.plate.toLowerCase() === plate.toLowerCase());
    }
    if (officer) {
      result = result.filter((c) => c.officer.toLowerCase().includes(officer.toLowerCase()));
    }
    if (search) {
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(search) ||
          c.plate.toLowerCase().includes(search) ||
          c.driver.toLowerCase().includes(search) ||
          c.offense.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list citations", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["plate", "offense", "driver", "amount"]) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const scope = getScopeContext(session);
    const newCitation = annotateRecordScope({
      id: body.id ?? `CT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      plate: String(body.plate),
      offense: String(body.offense),
      driver: String(body.driver),
      date: body.date ?? new Date().toLocaleDateString("sw-TZ"),
      amount: String(body.amount),
      status: body.status ?? "unpaid",
      officer: body.officer ?? session!.user.name ?? "Unknown",
      type: body.type ?? "traffic",
      ownerId: session!.user.id,
      isPublic: false,
    }, scope);
    citationsStore.unshift(newCitation);

    logAction(
      session!.user.id,
      "create",
      "citations",
      newCitation.id,
      { citation: newCitation },
      session!.user.name,
    );

    return NextResponse.json({ data: newCitation }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create citation", detail: String(err) },
      { status: 500 },
    );
  }
}
