// Verify OTP — pre-authentication step.
// Returns a verification token the client can include in the NextAuth
// credentials call. In the mock flow we simply confirm the OTP is valid
// so the UI can then call /api/auth/callback/credentials with the OTP.

import { NextResponse } from "next/server";
import { findUserByIdentifier, verifyOtp } from "@/lib/auth";
import { logAction } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier: string =
      (body.identifier as string) || (body.username as string) || (body.mobile as string) || (body.email as string) || "";
    const otp: string = (body.otp as string) || (body.code as string) || "";

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: "identifier and otp are required" },
        { status: 400 },
      );
    }

    const user = findUserByIdentifier(identifier);

    if (!user) {
      return NextResponse.json({ error: "Invalid identifier or OTP" }, { status: 404 });
    }

    const ok = verifyOtp(identifier, otp);
    if (!ok) {
      logAction(
        null,
        "verify_otp_failed",
        "auth",
        user.id,
        { identifier },
        "system",
      );
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    logAction(user.id, "verify_otp", "auth", user.id, { identifier }, user.name);

    // The actual session is created by NextAuth's credentials provider
    // when the client calls /api/auth/callback/credentials. We return
    // a short-lived verification token here as a hint that the OTP step
    // has been cleared.
    return NextResponse.json(
      {
        ok: true,
        userId: user.id,
        verifiedAt: new Date().toISOString(),
        // Mock verification token (in production: sign a JWT with short TTL)
        verifyToken: `vt-${user.id}-${Date.now()}`,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to verify OTP", detail: String(err) },
      { status: 500 },
    );
  }
}
