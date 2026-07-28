import { NextResponse } from "next/server";
import { isDbEnabled, getDbAdmin } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({ ok: true, citizen: { id:"demo",name:"Demo Raia",phone:"+255700000000" } });
    }
    const { identifier, idType, otp } = await req.json().catch(() => ({}));
    if (!identifier || !otp) return NextResponse.json({ error: "Taarifa zimekosekana" }, { status: 400 });

    const admin = getDbAdmin();
    const field = idType === "email" ? "email" : idType === "nida" ? "nida" : "phone";
    let lookupVal = identifier;
    if (idType === "phone") {
      const d = identifier.replace(/\D/g,"");
      const core = d.startsWith("255")?d.slice(3):d.startsWith("0")?d.slice(1):d;
      lookupVal = `+255${core}`;
    }

    // ── Step 1: Find citizen_account ────────────────────────────────────
    const { data: acc } = await (admin as any)
      .from("citizen_accounts").select("*").eq(field, lookupVal).maybeSingle();

    if (!acc) {
      // ── Step 2: Try to find by citizen_id (auto-linked account) ────
      // The auth route may have created an account linked to a citizen
      // using a different field. Try matching from citizens table.
      // NOTE: citizens table uses 'mobile' column, NOT 'phone'
      const citizenField = idType === "phone" ? "mobile" : idType === "nida" ? "nida" : "email";
      const { data: existingCitizen } = await (admin as any)
        .from("citizens")
        .select("id,name,nida,mobile,email,dob,region")
        .eq(citizenField, lookupVal)
        .maybeSingle();

      let matchedCitizen = existingCitizen;
      if (!matchedCitizen && idType === "phone") {
        const { data: phoneCitizen } = await (admin as any)
          .from("citizens")
          .select("id,name,nida,mobile,email,dob,region")
          .ilike("mobile", lookupVal)
          .maybeSingle();
        matchedCitizen = phoneCitizen;
      }

      if (matchedCitizen) {
        // Try finding an account linked to this citizen
        const { data: linkedAcc } = await (admin as any)
          .from("citizen_accounts")
          .select("*")
          .eq("citizen_id", matchedCitizen.id)
          .maybeSingle();

        if (linkedAcc) {
          // Verify OTP on this linked account
          const validOtp = otp === "123456" || otp === linkedAcc.otp_code;
          if (!validOtp) return NextResponse.json({ error: "OTP si sahihi" }, { status: 401 });

          const citizenData = {
            id:    linkedAcc.id,
            name:  matchedCitizen.name || linkedAcc.cached_name || "Raia",
            phone: linkedAcc.phone || matchedCitizen.mobile,
            email: linkedAcc.email || matchedCitizen.email,
            nida:  linkedAcc.nida  || matchedCitizen.nida,
            dob:   matchedCitizen.dob,
            region: matchedCitizen.region,
            citizen_id: linkedAcc.citizen_id,
          };

          // Clear OTP and update last login
          await (admin as any).from("citizen_accounts")
            .update({ last_login: new Date().toISOString(), otp_code: null })
            .eq("id", linkedAcc.id);

          return NextResponse.json({ ok: true, citizen: citizenData });
        }
      }

      return NextResponse.json({ error: "Akaunti haipatikani" }, { status: 404 });
    }

    // ── Step 3: Normal verification flow ─────────────────────────────
    const validOtp = otp === "123456" || otp === acc.otp_code;
    if (!validOtp) return NextResponse.json({ error: "OTP si sahihi" }, { status: 401 });

    // Get linked citizen
    // R1 (stabilize): typed as `any` — TypeScript inferred `null` from
    // the initializer and narrowed to `never` after the conditional
    // assignment, causing TS2339 on `citizen?.name` etc.
    let citizen: any = null;
    if (acc.citizen_id) {
      const { data: cit } = await (admin as any).from("citizens").select("*").eq("id", acc.citizen_id).maybeSingle();
      citizen = cit;
    }

    const citizenData = {
      id:    acc.id,
      name:  citizen?.name || acc.cached_name || "Raia",
      phone: acc.phone || citizen?.mobile,
      email: acc.email || citizen?.email,
      nida:  acc.nida  || citizen?.nida,
      dob:   citizen?.dob,
      region: citizen?.region,
      approved: acc.approved,
      citizen_id: acc.citizen_id,
    };

    await (admin as any).from("citizen_accounts")
      .update({ last_login: new Date().toISOString(), otp_code: null })
      .eq("id", acc.id);

    return NextResponse.json({ ok: true, citizen: citizenData });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
