// Officers API — Supabase-first, mock fallback
// GET  /api/officers   -> list officers
// POST /api/officers   -> create officer

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg, uniqueViolationMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "officers", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const search  = url.searchParams.get("search")?.toLowerCase() ?? "";
    const status  = url.searchParams.get("status");
    const station = url.searchParams.get("station");

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        let q = admin.from("officers").select(`
          *, user:users(id, name, short_name, rank, rank_short, role, email, phone, photo_url, badge_no, status, region, unit),
          station:stations(id, name, region)
        `).order("created_at", { ascending: false });

        if (status && status !== "all") q = q.eq("status", status);
        if (station && station !== "all") q = q.eq("station_id", station);
        if (search) q = q.or(`name.ilike.%${search}%,officer_number.ilike.%${search}%`);

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
    const check = requirePermission(session, "officers", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { name, rank, rankShort, badgeNo, email, phone, stationId, unit, region, role } = body;

    if (!name || !badgeNo || !stationId) {
      return NextResponse.json({ error: "Jina, badge number, na kituo vinahitajika" }, { status: 400 });
    }

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        // Duplicate pre-checks -> clear 409s instead of raw DB errors
        const { data: dupBadge } = await admin.from("users")
          .select("id").eq("badge_no", badgeNo).maybeSingle();
        if (dupBadge) {
          return NextResponse.json({ error: `Namba ya badge ${badgeNo} tayari ipo kwenye mfumo` }, { status: 409 });
        }
        if (phone) {
          const { data: dupPhone } = await admin.from("users")
            .select("id").eq("phone", phone).maybeSingle();
          if (dupPhone) {
            return NextResponse.json({ error: `Namba ya simu ${phone} tayari imesajiliwa` }, { status: 409 });
          }
        }
        if (email) {
          const { data: dupEmail } = await admin.from("users")
            .select("id").eq("email", email).maybeSingle();
          if (dupEmail) {
            return NextResponse.json({ error: `Barua pepe ${email} tayari imesajiliwa` }, { status: 409 });
          }
        }

        // 1. Create user record - respect the role passed from frontend
        // NOTE: id_number is UNIQUE NOT NULL on users — it was previously
        // omitted, which made EVERY officer creation fail with a 500.
        // The badge number serves as the service ID number.
        const userRole = role || "officer-general";
        const { data: user, error: userErr } = await admin.from("users").insert({
          name, short_name: name.split(" ").slice(0, 2).join(" "),
          rank: rank || "Constable", rank_short: rankShort || "Cst.",
          role: userRole, status: "active",
          station_id: stationId, badge_no: badgeNo,
          id_number: badgeNo,
          username: badgeNo.toLowerCase().replace(/[^a-z0-9]/g, ""),
          email: email || null, phone: phone || null,
          region: region || null, unit: unit || null,
        }).select().single();
        if (userErr) {
          const dup = uniqueViolationMsg(userErr);
          if (dup) return NextResponse.json({ error: dup }, { status: 409 });
          throw userErr;
        }

        // 2. Create officer record
        const { data: officer, error: offErr } = await admin.from("officers").insert({
          user_id: user.id, officer_number: badgeNo,
          name, rank: rank || "Constable", station_id: stationId,
          status: "active",
        }).select().single();
        if (offErr) throw offErr;

        await logAction(session, "officer_created", "officers", officer.id, { name, badgeNo });
        return NextResponse.json({ ok: true, data: { ...officer, user } }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
