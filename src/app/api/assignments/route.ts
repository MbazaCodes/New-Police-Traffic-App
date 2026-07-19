// @ts-nocheck
// Assignments API — list & create (assign officer to station/post)
// GET  /api/assignments  -> list assignments
// POST /api/assignments  -> create assignment

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const assignmentsStore: {id:string;officerId:string;stationId:string;postId?:string;role:string;status:string}[] = [];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "assignments", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const officerId = url.searchParams.get("officerId");
    const stationId = url.searchParams.get("stationId");
    const postId = url.searchParams.get("postId");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...assignmentsStore];
    if (officerId) {
      result = result.filter((a) => a.officerId === officerId);
    }
    if (stationId) {
      result = result.filter((a) => a.stationId === stationId);
    }
    if (postId) {
      result = result.filter((a) => a.postId === postId);
    }
    if (status && status !== "all") {
      result = result.filter((a) => a.status === status);
    }
    if (search) {
      result = result.filter(
        (a) =>
          a.officerName.toLowerCase().includes(search) ||
          a.stationName.toLowerCase().includes(search) ||
          a.postName.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list assignments", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "assignments", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of [
      "officerId",
      "officerName",
      "officerRank",
      "stationId",
      "stationName",
      "role",
    ]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const newAssignment = {
      id: body.id ?? `ASG-${Math.floor(1000 + Math.random() * 9000)}`,
      officerId: String(body.officerId),
      officerName: String(body.officerName),
      officerRank: String(body.officerRank),
      stationId: String(body.stationId),
      stationName: String(body.stationName),
      postId: body.postId ?? "",
      postName: body.postName ?? "",
      role: String(body.role),
      assignedDate: body.assignedDate ?? new Date().toLocaleDateString("sw-TZ"),
      status: body.status ?? "active",
    };
    assignmentsStore.push(newAssignment);

    logAction(
      session!.user.id,
      "create",
      "assignments",
      newAssignment.id,
      { assignment: newAssignment },
      session!.user.name,
    );

    return NextResponse.json({ data: newAssignment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create assignment", detail: String(err) },
      { status: 500 },
    );
  }
}
