// Officers [id] API — Supabase-backed (was in-memory mock)
// PATCH supports role change (e.g. traffic → general): updates BOTH the
// officers row and the linked users row so login role stays in sync.

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg, uniqueViolationMsg } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("officers")
          .select("*, user:users(id, name, role, status, phone, email, region, unit, badge_no), station:stations(id, name, region), post:posts(id, name)")
          .eq("id", id).single();
        if (error) return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });
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
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name, rank, role, stationId, postId, status, phone, email, unit } = body;

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        // Fetch the officer to get the linked user_id
        const { data: officer, error: findErr } = await admin.from("officers")
          .select("id, user_id").eq("id", id).single();
        if (findErr || !officer) {
          return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });
        }

        // 1. Update officers row
        const offPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (name !== undefined)      offPatch.name = name;
        if (rank !== undefined)      offPatch.rank = rank;
        if (stationId !== undefined) offPatch.station_id = stationId || null;
        if (postId !== undefined)    offPatch.post_id = postId || null;
        if (status !== undefined)    offPatch.status = status;
        if (phone !== undefined)     offPatch.phone = phone || null;
        if (unit !== undefined)      offPatch.unit = unit || null;

        const { error: offErr } = await admin.from("officers").update(offPatch).eq("id", id);
        if (offErr) {
          const dup = uniqueViolationMsg(offErr);
          if (dup) return NextResponse.json({ error: dup }, { status: 409 });
          throw offErr;
        }

        // 2. Mirror to users row — CRITICAL for login: role/status/station
        //    live on users; without this sync a role change would never
        //    affect which panel/PWA the officer lands in.
        const usrPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (name !== undefined)      usrPatch.name = name;
        if (rank !== undefined)      usrPatch.rank = rank;
        if (role !== undefined)      usrPatch.role = role;
        if (stationId !== undefined) usrPatch.station_id = stationId || null;
        if (status !== undefined)    usrPatch.status = status === "active" ? "active" : status;
        if (phone !== undefined)     usrPatch.phone = phone || null;
        if (email !== undefined)     usrPatch.email = email || null;
        if (unit !== undefined)      usrPatch.unit = unit || null;

        const { error: usrErr } = await admin.from("users").update(usrPatch).eq("id", officer.user_id);
        if (usrErr) {
          const dup = uniqueViolationMsg(usrErr);
          if (dup) return NextResponse.json({ error: dup }, { status: 409 });
          throw usrErr;
        }

        await logAction(session, "officer_updated", "officers", id, { changes: body });

        const { data: fresh } = await admin.from("officers")
          .select("*, user:users(id, name, role, status), station:stations(id, name)")
          .eq("id", id).single();
        return NextResponse.json({ ok: true, data: fresh });
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
    const check = requirePermission(session, "officers", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { id } = await params;
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data: officer } = await admin.from("officers")
          .select("id, user_id").eq("id", id).single();
        if (!officer) return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });

        // Delete users row; officers row cascades (ON DELETE CASCADE)
        const { error } = await admin.from("users").delete().eq("id", officer.user_id);
        if (error) throw error;
        await logAction(session, "officer_deleted", "officers", id, {});
        return NextResponse.json({ ok: true });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
