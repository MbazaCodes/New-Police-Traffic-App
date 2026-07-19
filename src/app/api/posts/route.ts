// Posts API — Supabase-first
// GET  /api/posts  -> list posts
// POST /api/posts  -> create post

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const stationId = url.searchParams.get("stationId");
    const status    = url.searchParams.get("status");
    const type      = url.searchParams.get("type");
    const search    = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        let q = admin.from("posts").select("*, station:stations(id, name, region)").order("name");
        if (stationId && stationId !== "all") q = q.eq("station_id", stationId);
        if (status && status !== "all") q = q.eq("status", status);
        if (type && type !== "all") q = q.eq("type", type);
        if (search) q = q.ilike("name", `%${search}%`);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data: data ?? [], total: data?.length ?? 0 });
      }
    }

    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "posts", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { name, stationId, location, type, status } = body;
    if (!name || !stationId) {
      return NextResponse.json({ error: "Jina na kituo vinahitajika" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("posts").insert({
          name, station_id: stationId,
          location: location || null,
          type: type || "Traffic",
          status: status || "active",
        }).select().single();
        if (error) throw error;
        await logAction(session, "post_created", "posts", data.id, { name, stationId });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
