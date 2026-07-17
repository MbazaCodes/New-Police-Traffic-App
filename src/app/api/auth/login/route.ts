import { NextResponse } from "next/server";
import { findUserByIdentifier, generateOtp, isDemoMode, isOtpBypassEnabled, resolveDashboardRoute } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();

    if (!identifier) {
      return NextResponse.json({ error: "identifier is required" }, { status: 400 });
    }

    const user = findUserByIdentifier(identifier);
    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Invalid account" }, { status: 404 });
    }

    const code = generateOtp(identifier);

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          mobile: user.mobile,
          role: user.role,
          station: user.station,
        },
        auth: {
          nextStep: "otp",
          otpBypass: isOtpBypassEnabled(),
          demoMode: isDemoMode(),
          devOtp: isDemoMode() || isOtpBypassEnabled() ? code : undefined,
        },
        redirectAfterVerify: resolveDashboardRoute(user.role),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to process login", detail: String(err) }, { status: 500 });
  }
}
