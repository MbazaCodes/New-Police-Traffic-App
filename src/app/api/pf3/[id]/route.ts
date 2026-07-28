// PF3 detail API — get, patch
// GET   /api/pf3/[id]  -> fetch single PF3 form (id = referenceNo)
// PATCH /api/pf3/[id]  -> update PF3 form

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "pf3", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const form = pf3Store.find((p) => p.referenceNo === id);
    if (!form) {
      return NextResponse.json({ error: "PF3 form not found" }, { status: 404 });
    }
    return NextResponse.json({ data: form }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch PF3 form", detail: errMsg(err) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "pf3", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = pf3Store.findIndex((p) => p.referenceNo === id);
    if (idx === -1) {
      return NextResponse.json({ error: "PF3 form not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...pf3Store[idx], ...body, referenceNo: pf3Store[idx].referenceNo };
    pf3Store[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "pf3",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update PF3 form", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
