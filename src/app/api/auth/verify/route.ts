import { NextResponse } from "next/server";
import { findUserByIdentifier, resolveDashboardRoute, verifyOtp } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? body.mobile ?? "").trim();
    const otp = String(body.otp ?? body.code ?? "").trim();

    if (!identifier || !otp) {
      return NextResponse.json({ error: "identifier and otp are required" }, { status: 400 });
    }

    const user = findUserByIdentifier(identifier);
    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Invalid account" }, { status: 404 });
    }

    const ok = verifyOtp(identifier, otp);
    if (!ok) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: true,
        verified: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          station: user.station,
          region: user.region,
          district: user.district,
        },
        redirectTo: resolveDashboardRoute(user.role),
        nextAuthCredentials: {
          username: identifier,
          password: user.password,
          otp,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to verify OTP", detail: String(err) }, { status: 500 });
  }
}
