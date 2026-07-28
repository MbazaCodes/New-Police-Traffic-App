// Citizen Portal — Login (OTP verification)
import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";
import { SignJWT } from "jose";

const JWT_SECRET = () =>
  new TextEncoder().encode(process.env.CITIZEN_JWT_SECRET || "citizen-secret-tpf-2026");

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, email, nida, otp } = body;

    if (!otp) return NextResponse.json({ error: "OTP inahitajika" }, { status: 400 });
    if (!phone && !email && !nida)
      return NextResponse.json({ error: "Simu, barua pepe, au NIDA inahitajika" }, { status: 400 });

    // 123456 universal bypass (dev/testing)
    const isBypass = otp === "123456";

    if (!isDbEnabled())
      return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    const admin = getDbAdmin() as any;
    if (!admin)
      return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });

    // ── Find account ──────────────────────────────────────────────
    let q = admin.from("citizen_accounts").select("*");
    if (phone)      q = q.eq("phone", phone);
    else if (email) q = q.eq("email", email);
    else            q = q.eq("nida", nida.replace(/\D/g, ""));

    const { data: account, error: findErr } = await q.maybeSingle();

    if (findErr) {
      console.error("[LOGIN FIND ERROR]", findErr.code, findErr.message);
      return NextResponse.json({ error: `Hitilafu ya DB: ${findErr.message}` }, { status: 500 });
    }

    if (!account)
      return NextResponse.json({
        error: "Akaunti haipatikani. Jisajili kwanza kwa kichupo cha Jisajili.",
      }, { status: 404 });

    // ── Verify OTP ────────────────────────────────────────────────
    if (!isBypass) {
      if (account.otp_code !== otp)
        return NextResponse.json({ error: "OTP si sahihi. Jaribu tena au omba OTP mpya." }, { status: 401 });

      if (account.otp_expires_at && new Date(account.otp_expires_at) < new Date())
        return NextResponse.json({ error: "OTP imeisha muda. Bonyeza 'Tuma tena' kupata OTP mpya." }, { status: 401 });
    }

    // ── Mark verified ─────────────────────────────────────────────
    await admin.from("citizen_accounts").update({
      is_verified:    true,
      otp_code:       null,
      otp_expires_at: null,
      last_login:     new Date().toISOString(),
      status:         "active",
    }).eq("id", account.id);

    // ── Issue JWT ─────────────────────────────────────────────────
    const token = await new SignJWT({
      sub:       account.id,
      role:      "citizen",
      citizenId: account.citizen_id,
    }).setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(await JWT_SECRET());

    // ── Fetch/create citizen profile ──────────────────────────────
    let citizenName = account.cached_name || phone || email || nida || "Raia";
    let citizenId = account.citizen_id;

    if (!citizenId) {
      // Create citizen record now if missing
      try {
        const { data: newCit } = await admin.from("citizens").insert({
          name:       citizenName,
          first_name: citizenName.split(" ")[0] || null,
          last_name:  citizenName.split(" ").slice(-1)[0] || null,
          mobile:     account.phone || null,
          email:      account.email || null,
          nida:       account.nida || null,
          status:     "Mtu wa Kawaida",
        }).select("id").single();
        if (newCit?.id) {
          citizenId = newCit.id;
          await admin.from("citizen_accounts").update({ citizen_id: citizenId }).eq("id", account.id);
        }
      } catch (e) { console.warn("[LOGIN CITIZEN CREATE]", e); }
    } else {
      try {
        const { data: cit } = await admin.from("citizens").select("name").eq("id", citizenId).maybeSingle();
        if (cit?.name) citizenName = cit.name;
      } catch { /* non-critical */ }
    }

    // ── Log activity ──────────────────────────────────────────────
    try {
      await admin.from("activity_logs").insert({
        user_id:     account.id,
        user_type:   "citizen",
        user_name:   citizenName,
        action:      "citizen_login",
        resource:    "citizen_accounts",
        resource_id: account.id,
        description: "Raia ameingia kwenye mfumo",
        success:     true,
      });
    } catch { /* logging is non-critical */ }

    const resolvedName = citizenName;

    const citizenData = {
      id:                 account.id,
      citizenId:          citizenId,
      name:               resolvedName,
      phone:              account.phone  || "",
      email:              account.email  || "",
      nida:               account.nida   || "",
      isDriver:           account.is_driver           ?? false,
      driverPoints:       account.driver_points        ?? 12,
      goodConductPoints:  account.good_conduct_points  ?? 100,
      profileComplete:    account.profile_complete     ?? false,
    };

    const res = NextResponse.json({ ok: true, token, citizen: citizenData });
    res.cookies.set("citizen-token", token, {
      httpOnly: true, secure: true, sameSite: "lax",
      maxAge: 7 * 86400, path: "/",
    });
    return res;

  } catch (err: any) {
    console.error("[LOGIN CATCH]", err?.message);
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
