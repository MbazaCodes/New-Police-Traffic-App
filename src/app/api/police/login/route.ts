// Login API — Supabase ONLY. No mock fallback.
import { NextResponse } from "next/server";
import { generateOtp, isOtpBypassEnabled, resolveDashboardRoute } from "@/lib/auth";
import { findSupabaseUser, mapSupabaseRole } from "@/lib/supabase/auth-bridge";
import type { Role } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identifier inahitajika" }, { status: 400 });
    }

    // Supabase lookup — no fallback
    const sbUser = await findSupabaseUser(identifier);

    if (!sbUser) {
      return NextResponse.json(
        { error: "Akaunti haipatikani. Angalia badge number, simu, au barua pepe yako." },
        { status: 404 }
      );
    }

    if (sbUser.status === "suspended") {
      return NextResponse.json(
        { error: "Akaunti yako imesimamishwa. Wasiliana na msimamizi." },
        { status: 403 }
      );
    }

    if (sbUser.status !== "active") {
      return NextResponse.json(
        { error: "Akaunti haina ruhusa ya kuingia sasa hivi." },
        { status: 403 }
      );
    }

    const authRole = mapSupabaseRole(sbUser.role) as Role;
    const code = generateOtp(identifier);

    // Also fetch officers row for stats (patrols_count, citations_count, etc.)
    let officerRow: Record<string, unknown> | null = null;
    try {
      const adminAny = (await import("@/lib/supabase/client")).getSupabaseAdminAny() as any;
      if (adminAny) {
        const { data: oRow } = await adminAny
          .from("officers")
          .select("id, officer_number, rank, unit, patrols_count, citations_count, incidents_count, hours_today, created_at, photo_url")
          .eq("user_id", sbUser.id)
          .maybeSingle();
        officerRow = oRow ?? null;
      }
    } catch { /* non-critical */ }

    return NextResponse.json({
      ok: true,
      user: {
        id:             sbUser.id,
        name:           sbUser.name,
        shortName:      sbUser.short_name ?? sbUser.name?.split(" ").slice(0,2).join(" ") ?? "",
        badge:          sbUser.badge_no ?? officerRow?.officer_number ?? "",
        badgeNo:        sbUser.badge_no ?? officerRow?.officer_number ?? "",
        idNumber:       sbUser.id_number ?? "",
        role:           authRole,
        roleRaw:        sbUser.role,
        rank:           sbUser.rank ?? officerRow?.rank as string ?? "",
        rankShort:      sbUser.rank_short ?? "",
        unit:           sbUser.unit ?? officerRow?.unit as string ?? "",
        station:        sbUser.station?.name ?? "",
        stationId:      sbUser.station_id ?? "",
        region:         sbUser.region ?? "",
        phone:          sbUser.phone ?? "",
        email:          sbUser.email ?? "",
        photo:          sbUser.photo_url ?? officerRow?.photo_url as string ?? "",
        status:         sbUser.status ?? "active",
        lastLogin:      sbUser.last_login ?? null,
        createdAt:      sbUser.created_at ?? null,
        // Officer stats
        officerId:      officerRow?.id as string ?? "",
        patrolsCount:   (officerRow?.patrols_count as number) ?? 0,
        citationsCount: (officerRow?.citations_count as number) ?? 0,
        incidentsCount: (officerRow?.incidents_count as number) ?? 0,
        hoursToday:     (officerRow?.hours_today as number) ?? 0,
      },
      auth: {
        nextStep:  "otp",
        otpBypass: isOtpBypassEnabled(),
        devOtp:    isOtpBypassEnabled() ? code : undefined,
      },
      redirect: resolveDashboardRoute(authRole),
    }, { status: 200 });

  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Hitilafu ya seva. Jaribu tena." }, { status: 500 });
  }
}
