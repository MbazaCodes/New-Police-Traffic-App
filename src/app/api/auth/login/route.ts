// Login API — PostgreSQL (VPS) ONLY. No mock fallback.
import { NextResponse } from "next/server";
import { generateOtp, isOtpBypassEnabled, resolveDashboardRoute } from "@/lib/auth";
import { findUser, mapRole } from "@/lib/db/auth";
import type { Role } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identifier inahitajika" }, { status: 400 });
    }

    // Database lookup — no fallback
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

    return NextResponse.json({
      ok: true,
      user: {
        id:      sbUser.id,
        name:    sbUser.name,
        badge:   sbUser.badge_no,
        role:    authRole,
        station: sbUser.station?.name ?? "",
        region:  sbUser.region ?? "",
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
