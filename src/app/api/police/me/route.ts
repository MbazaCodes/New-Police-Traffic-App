// /api/police/me — fetch current officer's full profile from DB
// Called by OfficerWebShell on mount to populate sidebar/header with real data.

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Uthibitishaji umekosea" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    }

    const admin = getSupabaseAdminAny() as any;
    if (!admin) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    // Fetch user + station
    const { data: user, error: userErr } = await admin
      .from("users")
      .select("*, station:stations(id, name, region, district, phone)")
      .eq("id", userId)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });
    }

    // Fetch officers row (stats etc.)
    const { data: officer } = await admin
      .from("officers")
      .select("id, officer_number, rank, unit, patrols_count, citations_count, incidents_count, hours_today, created_at, photo_url, status")
      .eq("user_id", userId)
      .maybeSingle();

    // Recent citations + arrests (non-critical — ignore errors)
    let recentCitations: any[] = [];
    let recentArrests: any[]   = [];
    try {
      const [cRes, aRes] = await Promise.all([
        admin.from("citations").select("id, citation_number, offense, created_at")
          .eq("officer_id", userId).order("created_at", { ascending: false }).limit(5),
        admin.from("arrests").select("id, suspect_name, charge, created_at")
          .eq("officer_id", userId).order("created_at", { ascending: false }).limit(5),
      ]);
      recentCitations = cRes.data ?? [];
      recentArrests   = aRes.data ?? [];
    } catch { /* ignore */ }

    return NextResponse.json({
      ok: true,
      data: {
        id:              user.id,
        name:            user.name,
        shortName:       user.short_name ?? user.name?.split(" ").slice(0, 2).join(" ") ?? "",
        badgeNo:         user.badge_no   ?? officer?.officer_number ?? "",
        idNumber:        user.id_number  ?? "",
        rank:            user.rank       ?? officer?.rank ?? "",
        rankShort:       user.rank_short ?? "",
        role:            user.role,
        roleRaw:         user.role,
        unit:            user.unit       ?? officer?.unit ?? "",
        region:          user.region     ?? user.station?.region ?? "",
        phone:           user.phone      ?? "",
        email:           user.email      ?? "",
        photo:           user.photo_url  ?? officer?.photo_url ?? "",
        status:          officer?.status ?? user.status ?? "active",
        // Station
        stationId:       user.station_id ?? "",
        station:         user.station?.name     ?? "",
        stationPhone:    user.station?.phone    ?? "",
        stationRegion:   user.station?.region   ?? "",
        stationDistrict: user.station?.district ?? "",
        // Timestamps
        lastLogin:       user.last_login ?? null,
        createdAt:       user.created_at,
        updatedAt:       user.updated_at,
        // Stats
        officerId:       officer?.id            ?? "",
        officerNumber:   officer?.officer_number ?? "",
        patrolsCount:    officer?.patrols_count  ?? 0,
        citationsCount:  officer?.citations_count ?? 0,
        incidentsCount:  officer?.incidents_count ?? 0,
        hoursToday:      officer?.hours_today    ?? 0,
        // Recent activity
        recentCitations: recentCitations.map((c: any) => ({
          id: c.id, number: c.citation_number, offense: c.offense, date: c.created_at,
        })),
        recentArrests: recentArrests.map((a: any) => ({
          id: a.id, name: a.suspect_name, charge: a.charge, date: a.created_at,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
