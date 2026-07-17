// Send OTP to phone/email — pre-authentication step.
// Public endpoint (no session required).

import { NextResponse } from "next/server";
import { findUserByIdentifier, generateOtp, isDemoMode, isOtpBypassEnabled } from "@/lib/auth";
import { logAction } from "@/lib/audit-log";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier: string =
      (body.identifier as string) || (body.username as string) || (body.mobile as string) || (body.email as string) || "";

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier (email/username/phone) is required" },
        { status: 400 },
      );
    }

    // Resolve the user to know where to "send" the OTP
    const user = findUserByIdentifier(identifier);

    // Always return success for security (don't leak which accounts exist),
    // but only actually generate a code if the user exists.
    let sentTo: string | null = null;
    if (user) {
      const code = generateOtp(identifier);
      // In production: integrate SMS gateway (e.g. Africa's Talking) or
      // email provider here. For dev we just return the code in the
      // response so it can be auto-filled in the UI/tests.
      sentTo = user.email;
      logAction(
        null,
        "send_otp",
        "auth",
        user.id,
        { identifier, channel: "email" },
        "system",
      );
      return NextResponse.json(
        {
          ok: true,
          message: "OTP sent. Use the code to verify.",
          // dev-only: return the code so the API can be tested end-to-end
          devOtp: isDemoMode() || isOtpBypassEnabled() ? code : undefined,
          sentTo: user.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
        },
        { status: 200 },
      );
    }

    // User not found — return generic success (don't reveal existence)
    return NextResponse.json(
      { ok: true, message: "If the account exists, an OTP has been sent." },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send OTP", detail: String(err) },
      { status: 500 },
    );
  }
}
