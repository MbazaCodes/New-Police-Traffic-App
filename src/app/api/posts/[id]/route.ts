// Posts [id] API — Supabase-backed (was in-memory mock)
// GET    /api/posts/:id  -> single post
// PATCH  /api/posts/:id  -> update post
// DELETE /api/posts/:id  -> delete post

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("posts")
          .select("*, station:stations(id, name, region)").eq("id", id).single();
        if (error) return NextResponse.json({ error: "Posti haipatikani" }, { status: 404 });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name, stationId, location, type, status, shift } = body;

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (stationId !== undefined) patch.station_id = stationId;
    if (location !== undefined) patch.location = location;
    if (type !== undefined) patch.type = type;
    if (status !== undefined) patch.status = status;
    if (shift !== undefined) patch.shift = shift;
    patch.updated_at = new Date().toISOString();

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("posts")
          .update(patch).eq("id", id).select().single();
        if (error) throw error;
        await logAction(session, "post_updated", "posts", id, { changes: patch });
        return NextResponse.json({ ok: true, data });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { error } = await admin.from("posts").delete().eq("id", id);
        if (error) throw error;
        await logAction(session, "post_deleted", "posts", id, {});
        return NextResponse.json({ ok: true });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
