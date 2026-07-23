// Assignments (Mgao) API — Supabase-backed (was in-memory mock)
// Assigning an officer to a station/post also updates officers.station_id,
// officers.post_id and users.station_id so the whole system stays in sync.

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const stationId = url.searchParams.get("stationId");
    const status = url.searchParams.get("status");

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        let q = admin.from("assignments")
          .select("*, officer:officers(id, name, officer_number, rank), station:stations(id, name, region), post:posts(id, name)")
          .order("created_at", { ascending: false });
        if (stationId && stationId !== "all") q = q.eq("station_id", stationId);
        if (status && status !== "all") q = q.eq("status", status);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data: data ?? [], total: data?.length ?? 0 });
      }
    }
    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { officerId, stationId, postId, role } = body;
    if (!officerId || !stationId) {
      return NextResponse.json({ error: "Afisa na kituo vinahitajika" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data: officer, error: offFindErr } = await admin.from("officers")
          .select("id, user_id, name").eq("id", officerId).single();
        if (offFindErr || !officer) {
          return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });
        }

        // Close any previous active assignment for this officer
        await admin.from("assignments")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("officer_id", officerId).eq("status", "active");

        // Create the new assignment
        const { data: assignment, error } = await admin.from("assignments").insert({
          officer_id: officerId,
          station_id: stationId,
          post_id: postId || null,
          role: role || null,
          status: "active",
        }).select().single();
        if (error) throw error;

        // Sync officers + users so login/routing/lists reflect the move
        await admin.from("officers")
          .update({ station_id: stationId, post_id: postId || null, updated_at: new Date().toISOString() })
          .eq("id", officerId);
        await admin.from("users")
          .update({ station_id: stationId, updated_at: new Date().toISOString() })
          .eq("id", officer.user_id);

        await logAction(session, "officer_assigned", "assignments", assignment.id,
          { officerId, stationId, postId: postId ?? null });
        return NextResponse.json({ ok: true, data: assignment }, { status: 201 });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
