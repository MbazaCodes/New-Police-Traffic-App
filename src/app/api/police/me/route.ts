// /api/police/me — fetch current officer's full profile from DB
// Used by ProfileScreen to always show fresh data from creation.

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "tz-police-secret-change-in-production";
    // Try both cookie name variants (HTTPS + HTTP)
    let token = await getToken({ req: request as any, secret, cookieName: "__Secure-next-auth.session-token" });
    if (!token?.id) token = await getToken({ req: request as any, secret, cookieName: "next-auth.session-token" });
    if (!token?.id) token = await getToken({ req: request as any, secret });

    // For police PWA: read badge from custom header set by authFetch, or fall back to token
    const badgeHeader = (request as any).headers?.get?.("x-officer-badge");
    const userId = token?.id ? String(token.id) : null;

    if (!userId && !badgeHeader) {
      return NextResponse.json({ error: "Uthibitishaji umekosea" }, { status: 401 });
    }

    if (!isSupabaseEnabled()) {
      return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    }

    const admin = getSupabaseAdminAny() as any;
    if (!admin) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    // Fetch user row
    const { data: user, error: userErr } = await admin
      .from("users")
      .select("*, station:stations(id, name, region, district, phone)")
      .eq("id", userId)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json({ error: "Afisa hapatikani" }, { status: 404 });
    }

    // Fetch officer row (may not exist for admin-created officers pre-migration)
    const { data: officer } = await admin
      .from("officers")
      .select("id, officer_number, rank, unit, patrols_count, citations_count, incidents_count, hours_today, created_at, photo_url, status")
      .eq("user_id", userId)
      .maybeSingle();

    // Recent activity: last 5 citations + arrests
    const [{ data: recentCitations }, { data: recentArrests }] = await Promise.all([
      admin.from("citations").select("id, citation_number, offense, created_at").eq("officer_id", userId).order("created_at", { ascending: false }).limit(5),
      admin.from("arrests").select("id, suspect_name, charge, created_at").eq("officer_id", userId).order("created_at", { ascending: false }).limit(5),
    ]).catch(() => [{ data: [] }, { data: [] }]);

    return NextResponse.json({
      ok: true,
      data: {
        // Identity
        id:             user.id,
        name:           user.name,
        shortName:      user.short_name ?? user.name?.split(" ").slice(0,2).join(" ") ?? "",
        badgeNo:        user.badge_no ?? officer?.officer_number ?? "",
        idNumber:       user.id_number ?? "",
        rank:           user.rank ?? officer?.rank ?? "",
        rankShort:      user.rank_short ?? "",
        role:           user.role,
        unit:           user.unit ?? officer?.unit ?? "",
        region:         user.region ?? user.station?.region ?? "",
        phone:          user.phone ?? "",
        email:          user.email ?? "",
        photo:          user.photo_url ?? officer?.photo_url ?? "",
        status:         officer?.status ?? user.status ?? "active",
        // Station
        stationId:      user.station_id ?? "",
        station:        user.station?.name ?? "",
        stationPhone:   user.station?.phone ?? "",
        stationRegion:  user.station?.region ?? "",
        stationDistrict:user.station?.district ?? "",
        // Timestamps
        lastLogin:      user.last_login ?? null,
        createdAt:      user.created_at,
        updatedAt:      user.updated_at,
        // Officer stats
        officerId:      officer?.id ?? "",
        officerNumber:  officer?.officer_number ?? "",
        patrolsCount:   officer?.patrols_count ?? 0,
        citationsCount: officer?.citations_count ?? 0,
        incidentsCount: officer?.incidents_count ?? 0,
        hoursToday:     officer?.hours_today ?? 0,
        // Recent activity
        recentCitations: (recentCitations ?? []).map((c: any) => ({
          id: c.id, number: c.citation_number, offense: c.offense, date: c.created_at,
        })),
        recentArrests: (recentArrests ?? []).map((a: any) => ({
          id: a.id, name: a.suspect_name, charge: a.charge, date: a.created_at,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
