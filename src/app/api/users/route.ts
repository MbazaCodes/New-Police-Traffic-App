// Users API — Supabase-first
// GET  /api/users  -> list users
// POST /api/users  -> create user

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const role   = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        let q = admin.from("users").select("*, station:stations(id, name, region)").order("name");
        if (role && role !== "all") q = q.eq("role", role);
        if (status && status !== "all") q = q.eq("status", status);
        if (search) q = q.or(`name.ilike.%${search}%,badge_no.ilike.%${search}%,email.ilike.%${search}%`);
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
    const check = requirePermission(session, "users", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { name, rank, rankShort, role, badgeNo, email, phone, stationId, unit, region, status } = body;

    if (!name || !badgeNo || !role) {
      return NextResponse.json({ error: "Jina, badge number, na jukumu vinahitajika" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        // Check badge_no uniqueness
        const { data: existing } = await admin.from("users").select("id").eq("badge_no", badgeNo).maybeSingle();
        if (existing) return NextResponse.json({ error: `Badge number ${badgeNo} tayari ipo` }, { status: 409 });

        const { data, error } = await admin.from("users").insert({
          name,
          short_name: name.split(" ").slice(0, 2).join(" "),
          rank: rank || null, rank_short: rankShort || null,
          role, status: status || "active",
          station_id: stationId || null,
          badge_no: badgeNo,
          username: badgeNo.toLowerCase().replace(/[^a-z0-9]/g, ""),
          email: email || null, phone: phone || null,
          region: region || null, unit: unit || null,
        }).select().single();
        if (error) throw error;
        await logAction(session, "user_created", "users", data.id, { name, role, badgeNo });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
