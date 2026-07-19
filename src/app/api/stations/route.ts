// Stations API — Supabase-first
// GET  /api/stations  -> list stations
// POST /api/stations  -> create station

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "stations", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const region = url.searchParams.get("region");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        let q = admin.from("stations").select(`
          *, officers_count:officers(count), posts_count:posts(count)
        `).order("name");
        if (region && region !== "all") q = q.eq("region", region);
        if (status && status !== "all") q = q.eq("status", status);
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
    const check = requirePermission(session, "stations", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { name, region, district, address, phone, status } = body;
    if (!name || !region) {
      return NextResponse.json({ error: "Jina na mkoa vinahitajika" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("stations").insert({
          name, region, district: district || null,
          address: address || null, phone: phone || null,
          status: status || "active",
        }).select().single();
        if (error) throw error;
        await logAction(session, "station_created", "stations", data.id, { name, region });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
