// Login API — Supabase-first, mock fallback for dev
import { NextResponse } from "next/server";
import { findUserByIdentifier, generateOtp, isDemoMode, isOtpBypassEnabled, resolveDashboardRoute } from "@/lib/auth";
import { findSupabaseUser, mapSupabaseRole } from "@/lib/supabase/auth-bridge";
import { isSupabaseEnabled } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();

    if (!identifier) {
      return NextResponse.json({ error: "Identifier inahitajika" }, { status: 400 });
    }

    // ── Supabase-first lookup ─────────────────────────────────
    if (isSupabaseEnabled()) {
      const sbUser = await findSupabaseUser(identifier);
      if (!sbUser) {
        return NextResponse.json(
          { error: "Akaunti haipatikani. Angalia badge number au jina la mtumiaji." },
          { status: 404 }
        );
      }
      if (sbUser.status === "suspended") {
        return NextResponse.json({ error: "Akaunti imesimamishwa. Wasiliana na msimamizi." }, { status: 403 });
      }

      const authRole = mapSupabaseRole(sbUser.role);
      const code = generateOtp(identifier);

      return NextResponse.json({
        ok: true,
        user: {
          id: sbUser.id,
          name: sbUser.name,
          username: sbUser.username ?? sbUser.badge_no,
          mobile: sbUser.phone,
          role: authRole,
          station: sbUser.station?.name ?? "",
          badgeNo: sbUser.badge_no,
          region: sbUser.region,
          photo: sbUser.photo_url,
        },
        auth: {
          nextStep: "otp",
          otpBypass: isOtpBypassEnabled(),
          demoMode: false,
          devOtp: isOtpBypassEnabled() ? code : undefined,
        },
        redirectAfterVerify: resolveDashboardRoute(authRole as Parameters<typeof resolveDashboardRoute>[0]),
      }, { status: 200 });
    }

    // ── Fallback: mock engine (dev / offline only) ────────────
    const user = findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { error: "Akaunti haipatikani. Angalia jina la mtumiaji au namba ya simu." },
        { status: 404 }
      );
    }
    if (user.status === "suspended") {
      return NextResponse.json({ error: "Akaunti imesimamishwa. Wasiliana na msimamizi." }, { status: 403 });
    }

    const code = generateOtp(identifier);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, mobile: user.mobile, role: user.role, station: user.station },
      auth: { nextStep: "otp", otpBypass: isOtpBypassEnabled(), demoMode: isDemoMode(), devOtp: isDemoMode() || isOtpBypassEnabled() ? code : undefined },
      redirectAfterVerify: resolveDashboardRoute(user.role),
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Hitilafu ya seva", detail: String(err) }, { status: 500 });
  }
}
