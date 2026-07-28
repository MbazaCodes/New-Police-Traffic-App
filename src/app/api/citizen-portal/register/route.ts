// Citizen Portal — Registration + OTP Refresh
import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, email, nida, name, _refreshOtp } = body;

    if (!phone && !email && !nida)
      return NextResponse.json({ error: "Weka simu, barua pepe, au NIDA" }, { status: 400 });

    if (!isDbEnabled())
      return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const admin = getDbAdmin() as any;
    if (!admin)
      return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000).toISOString();

    // ── Check if account already exists ──────────────────────────
    let existingId: string | null = null;
    if (phone) {
      const { data } = await admin.from("citizen_accounts")
        .select("id").eq("phone", phone).maybeSingle();
      if (data) existingId = data.id;
    }
    if (!existingId && email) {
      const { data } = await admin.from("citizen_accounts")
        .select("id").eq("email", email).maybeSingle();
      if (data) existingId = data.id;
    }
    if (!existingId && nida) {
      const { data } = await admin.from("citizen_accounts")
        .select("id").eq("nida", nida.replace(/\D/g, "")).maybeSingle();
      if (data) existingId = data.id;
    }

    // ── Existing account: refresh OTP (login flow or resend) ─────
    if (existingId) {
      if (_refreshOtp) {
        await admin.from("citizen_accounts").update({
          otp_code: otp,
          otp_expires_at: otpExpiry,
        }).eq("id", existingId);
        console.log(`[OTP REFRESH] ${phone || email}: ${otp}`);
        return NextResponse.json({ ok: true, accountId: existingId, otp });
      }
      // Not a refresh request but account exists → tell user to login
      return NextResponse.json({
        error: "Namba hii tayari imesajiliwa. Tumia kichupo cha 'Ingia'.",
      }, { status: 409 });
    }

    // ── New account: create citizen record first (optional) ───────
    let citizenId: string | null = null;
    if (name) {
      try {
        const { data: cit } = await admin.from("citizens").insert({
          name: name.trim(),
          first_name: name.trim().split(" ")[0],
          last_name:  name.trim().split(" ").slice(-1)[0],
          mobile: phone || null,
          email:  email || null,
          nida:   nida?.replace(/\D/g, "") || null,
          status: "Mtu wa Kawaida",
        }).select("id").single();
        citizenId = cit?.id || null;
      } catch {
        // Citizens insert failed — proceed without citizenId
        console.warn("[CITIZEN CREATE WARN] Could not create citizens record");
      }
    }

    // ── Create citizen_accounts record ────────────────────────────
    const { data: account, error } = await admin.from("citizen_accounts").insert({
      citizen_id:      citizenId,
      phone:           phone  || null,
      email:           email  || null,
      nida:            nida?.replace(/\D/g, "") || null,
      otp_code:        otp,
      otp_expires_at:  otpExpiry,
      is_verified:     false,
      status:          "pending",
      cached_name:     name?.trim() || null,
    }).select("id").single();

    if (error) {
      console.error("[CITIZEN_ACCOUNTS INSERT ERROR]", error.code, error.message);
      return NextResponse.json({ error: `DB Error: ${error.message}` }, { status: 500 });
    }

    console.log(`[OTP NEW] ${phone || email}: ${otp}`);
    return NextResponse.json({ ok: true, accountId: account.id, otp });

  } catch (err: any) {
    console.error("[REGISTER CATCH]", err?.message);
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
