// Officer detail API — get, patch, delete
// GET    /api/officers/[id]   -> fetch single officer
// PATCH  /api/officers/[id]   -> update officer
// DELETE /api/officers/[id]   -> delete officer

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { errMsg } from "@/lib/api-error";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

const officersStore: {id:string;name:string;rank:string;status:string;badgeNo:string}[] = [];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("officers").select(`
          *, user:users(id, role, email, phone, unit, station_id),
          station:stations(id, name, region), post:posts(id, name)
        `).eq("id", id).single();
        if (error) throw error;
        return NextResponse.json({ data });
      }
    }

    const officer = officersStore.find((o) => o.id === id);
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }
    return NextResponse.json({ data: officer }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch officer", detail: errMsg(err) },
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
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data: current, error: currentErr } = await admin.from("officers")
          .select("id, user_id, station_id, post_id, user:users(role)").eq("id", id).single();
        if (currentErr || !current) return NextResponse.json({ error: "Officer not found" }, { status: 404 });

        const stationId = body.stationId === undefined ? current.station_id : body.stationId;
        const postId = body.postId === undefined ? current.post_id : body.postId || null;
        if (!stationId) return NextResponse.json({ error: "Kituo kinahitajika" }, { status: 400 });
        if (postId) {
          const { data: post, error: postErr } = await admin.from("posts").select("id")
            .eq("id", postId).eq("station_id", stationId).maybeSingle();
          if (postErr) throw postErr;
          if (!post) return NextResponse.json({ error: "Posti iliyochaguliwa haipo kwenye kituo hiki" }, { status: 400 });
        }

        const officerPatch: Record<string, unknown> = {};
        if (body.stationId !== undefined) officerPatch.station_id = stationId;
        if (body.postId !== undefined) officerPatch.post_id = postId;
        if (body.status !== undefined) officerPatch.status = body.status;
        if (Object.keys(officerPatch).length) {
          const { error } = await admin.from("officers").update(officerPatch).eq("id", id);
          if (error) throw error;
        }

        const userPatch: Record<string, unknown> = {};
        if (body.role !== undefined) userPatch.role = body.role;
        if (body.stationId !== undefined) userPatch.station_id = stationId;
        if (Object.keys(userPatch).length) {
          const { error } = await admin.from("users").update(userPatch).eq("id", current.user_id);
          if (error) throw error;
        }

        // Keep assignment history accurate while ensuring one current posting.
        if (body.stationId !== undefined || body.postId !== undefined || body.role !== undefined) {
          const { error: endError } = await admin.from("assignments").update({ status: "inactive" })
            .eq("officer_id", id).eq("status", "active");
          if (endError) throw endError;
          const currentRole = Array.isArray(current.user) ? current.user[0]?.role : current.user?.role;
          const { error: assignmentError } = await admin.from("assignments").insert({
            officer_id: id, station_id: stationId, post_id: postId,
            role: body.role ?? currentRole ?? "Officer", status: "active",
          });
          if (assignmentError) throw assignmentError;
        }

        const { data, error } = await admin.from("officers").select(`
          *, user:users(id, role, email, phone, unit, station_id),
          station:stations(id, name, region), post:posts(id, name)
        `).eq("id", id).single();
        if (error) throw error;
        await logAction(session, "officer_updated", "officers", id, { changes: body });
        return NextResponse.json({ ok: true, data });
      }
    }

    const idx = officersStore.findIndex((o) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    const updated = { ...officersStore[idx], ...body, id: officersStore[idx].id };
    officersStore[idx] = updated;

    logAction(
      session!.user.id,
      "update",
      "officers",
      id,
      { changes: body },
      session!.user.name,
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update officer", detail: errMsg(err) },
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
    const check = requirePermission(session, "officers", "delete");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = await params;
    const idx = officersStore.findIndex((o) => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }
    const [removed] = officersStore.splice(idx, 1);

    logAction(
      session!.user.id,
      "delete",
      "officers",
      id,
      { officer: removed },
      session!.user.name,
    );

    return NextResponse.json({ data: { id, deleted: true } }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete officer", detail: errMsg(err) },
      { status: 500 },
    );
  }
}
