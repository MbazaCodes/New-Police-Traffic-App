// Post detail API — get, patch, delete
// GET    /api/posts/[id]  -> fetch single post
// PATCH  /api/posts/[id]  -> update post
// DELETE /api/posts/[id]  -> delete post

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const postsStore: typeof POSTS = [...POSTS];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const post = postsStore.find((p) => p.id === id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ data: post }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch post", detail: String(err) },
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
    const check = requirePermission(session, "posts", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = postsStore.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const updated = { ...postsStore[idx], ...body, id: postsStore[idx].id };
    postsStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "posts",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update post", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = postsStore.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const [removed] = postsStore.splice(idx, 1);

    logAction(
      session!.user.id,
      "delete",
      "posts",
      id,
      { post: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete post", detail: String(err) },
      { status: 500 },
    );
  }
}
