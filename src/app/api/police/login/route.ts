// Login API — Supabase ONLY. No mock fallback.
import { NextResponse } from "next/server";
import { generateOtp, isOtpBypassEnabled, resolveDashboardRoute } from "@/lib/auth";
import { findUser, mapRole } from "@/lib/db/auth";
import { getDbAdmin } from "@/lib/db/client";
import type { Role } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identifier inahitajika" }, { status: 400 });
    }

    // DB lookup
    const sbUser = await findUser(identifier);

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

    const authRole = mapRole(sbUser.role) as Role;
    const code = generateOtp(identifier);

    // Fetch officer row for stats
    let officerRow: Record<string, unknown> | null = null;
    try {
      const db = getDbAdmin();
      const { data: oRow } = await db
        .from("officers")
        .select("*")
        .eq("user_id", sbUser.id)
        .maybeSingle();
      officerRow = (oRow as Record<string, unknown>) ?? null;
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
        district:       (sbUser as any).unit ?? (sbUser as any).district ?? "",
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
