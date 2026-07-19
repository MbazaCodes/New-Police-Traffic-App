// Verify OTP — Supabase-backed, strict validation
import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth";
import { findSupabaseUser } from "@/lib/supabase/auth-bridge";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier ?? body.username ?? "").trim();
    const otp        = String(body.otp ?? body.code ?? "").trim();

    if (!identifier || !otp) {
      return NextResponse.json({ error: "identifier na otp zinahitajika" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "OTP lazima iwe tarakimu 6" }, { status: 400 });
    }

    // Must exist in Supabase
    const sbUser = await findSupabaseUser(identifier);
    if (!sbUser) {
      return NextResponse.json({ error: "Akaunti haipatikani" }, { status: 404 });
    }

    if (sbUser.status !== "active") {
      return NextResponse.json({ error: "Akaunti haipo hai" }, { status: 403 });
    }

    // Verify OTP
    const valid = verifyOtp(identifier, otp);
    if (!valid) {
      return NextResponse.json({ error: "OTP si sahihi au imekwisha muda wake" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      userId:      sbUser.id,
      verifiedAt:  new Date().toISOString(),
      verifyToken: `vt-${sbUser.id}-${Date.now()}`,
    }, { status: 200 });

  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Hitilafu ya seva" }, { status: 500 });
  }
}
