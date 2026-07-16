// Posts API — list & create
// GET  /api/posts  -> list posts
// POST /api/posts  -> create post

import { NextResponse } from "next/server";
import { POSTS } from "@/lib/admin-mgmt-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const postsStore: typeof POSTS = [...POSTS];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const stationId = url.searchParams.get("stationId");
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let result = [...postsStore];
    if (stationId && stationId !== "all") {
      result = result.filter((p) => p.stationId === stationId);
    }
    if (status && status !== "all") {
      result = result.filter((p) => p.status === status);
    }
    if (type && type !== "all") {
      result = result.filter((p) => p.type === type);
    }
    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search) ||
          p.location.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({ data: result, total: result.length }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list posts", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["name", "stationId", "stationName", "location", "type"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const newPost = {
      id: body.id ?? `PT-${Math.floor(100 + Math.random() * 900)}`,
      name: String(body.name),
      stationId: String(body.stationId),
      stationName: String(body.stationName),
      location: String(body.location),
      type: String(body.type),
      officersCount: body.officersCount ?? 0,
      status: body.status ?? "active",
      shift: body.shift ?? "24/7",
    };
    postsStore.push(newPost);

    logAction(
      session!.user.id,
      "create",
      "posts",
      newPost.id,
      { post: newPost },
      session!.user.name,
    );

    return NextResponse.json({ data: newPost }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create post", detail: String(err) },
      { status: 500 },
    );
  }
}
