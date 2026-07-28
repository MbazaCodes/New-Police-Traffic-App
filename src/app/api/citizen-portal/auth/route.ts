// Citizen portal auth — combines login + register
// FIX: When no citizen_accounts exists but a matching citizen
//      is found in the citizens table, auto-create an account
//      linked to that citizen via citizen_id.
// FIX: citizens table has 'mobile' column, NOT 'phone'.
import { NextResponse } from "next/server";
import { isDbEnabled, getDbAdmin } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

function generateOtp(): string {
  if (process.env.NODE_ENV !== "production" || process.env.OTP_BYPASS === "true") return "123456";
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    if (!isDbEnabled()) return NextResponse.json({ ok: true, devOtp: "123456" });
    const body = await req.json().catch(() => ({}));
    const { identifier, idType, name, mode } = body;
    if (!identifier) return NextResponse.json({ error: "Taarifa ya utambulisho inahitajika" }, { status: 400 });

    const admin = getDbAdmin();
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Determine lookup field
    const field = idType === "email" ? "email" : idType === "nida" ? "nida" : "phone";
    let phone = identifier;
    if (idType === "phone") {
      const d = identifier.replace(/\D/g, "");
      const core = d.startsWith("255") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
      phone = `+255${core}`;
    }
    const lookupVal = idType === "phone" ? phone : identifier;

    // ── Step 1: Find existing citizen_account ────────────────────────────
    let { data: acc } = await (admin as any)
      .from("citizen_accounts")
      .select("id,status,citizen_id,cached_name,phone,email,nida")
      .eq(field, lookupVal)
      .maybeSingle();

    // ── Step 2: If no account found, try linking from citizens table ────
    if (!acc) {
      // Look for a matching citizen record
      // NOTE: citizens table uses 'mobile' column, NOT 'phone'
      const citizenField = idType === "phone" ? "mobile" : idType === "nida" ? "nida" : "email";
      const { data: existingCitizen } = await (admin as any)
        .from("citizens")
        .select("id,name,nida,mobile,email,dob,region")
        .eq(citizenField, lookupVal)
        .maybeSingle();

      // Fallback: try ilike on mobile if exact match failed (format differences)
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
        // First check if this citizen already has a linked account
        // (e.g., account created by phone but now logging in by NIDA)
        const { data: existingLinkedAcc } = await (admin as any)
          .from("citizen_accounts")
          .select("id,status,citizen_id,cached_name,phone,email,nida")
          .eq("citizen_id", matchedCitizen.id)
          .maybeSingle();

        if (existingLinkedAcc) {
          // Update the existing linked account with the missing identifier + OTP
          const updateData: Record<string, any> = {
            otp_code: otp,
            otp_expires_at: otpExpiry,
          };
          if (idType === "phone" && !existingLinkedAcc.phone) updateData.phone = phone;
          if (idType === "email" && !existingLinkedAcc.email) updateData.email = identifier;
          if (idType === "nida"  && !existingLinkedAcc.nida)  updateData.nida  = identifier;

          await (admin as any).from("citizen_accounts")
            .update(updateData)
            .eq("id", existingLinkedAcc.id);
          acc = existingLinkedAcc;
        } else {
          // No existing linked account — auto-create one
          const insertData: Record<string, any> = {
            citizen_id: matchedCitizen.id,
            cached_name: matchedCitizen.name || name || null,
            status: "active",
            otp_code: otp,
            otp_expires_at: otpExpiry,
            created_at: new Date().toISOString(),
          };
          if (idType === "phone") insertData.phone = phone;
          if (idType === "email") insertData.email = identifier;
          if (idType === "nida")  insertData.nida  = identifier;

          const { data: newAcc, error: createErr } = await (admin as any)
            .from("citizen_accounts")
            .insert(insertData)
            .select()
            .single();

          if (createErr) {
            // If the error is a unique constraint violation, it means
            // another account already uses this phone/email/nida.
            if (String(createErr.message || "").includes("duplicate") ||
                String(createErr.message || "").includes("23505") ||
                String(createErr.message || "").includes("unique")) {
              // Try looking up by citizen_id instead
              const { data: linkedAcc } = await (admin as any)
                .from("citizen_accounts")
                .select("id,status,citizen_id,cached_name")
                .eq("citizen_id", matchedCitizen.id)
                .maybeSingle();
              if (linkedAcc) {
                // Update OTP on the existing linked account
                await (admin as any).from("citizen_accounts")
                  .update({ otp_code: otp, otp_expires_at: otpExpiry })
                  .eq("id", linkedAcc.id);
                acc = linkedAcc;
              } else {
                // Unique violation but no linked account found —
                // likely another account already uses this phone/email/nida.
                return NextResponse.json(
                  { error: "Akaunti namba hii tayari imesajiliwa. Tumia njia nyingine ya kuingia au jisajili kwa njia tofauti." },
                  { status: 409 }
                );
              }
            } else {
              throw createErr;
            }
          } else {
            acc = newAcc;
          }
        }
      } else if (mode === "login") {
        // No matching citizen or account found — truly new user
        return NextResponse.json({ error: "Akaunti haipatikani. Jisajili kwanza." }, { status: 404 });
      }
    }

    // ── Step 3: If still no account (new registration) ───────────────
    if (!acc && mode === "register") {
      const { data: newAcc, error: createErr } = await (admin as any)
        .from("citizen_accounts")
        .insert({
          [field]: lookupVal,
          phone: idType === "phone" ? phone : null,
          email: idType === "email" ? identifier : null,
          nida:  idType === "nida"  ? identifier : null,
          cached_name: name || null,
          status: "active",
          otp_code: otp, otp_expires_at: otpExpiry,
          created_at: new Date().toISOString(),
        }).select().single();
      if (createErr) throw createErr;
      acc = newAcc;
    }

    // ── Step 4: Update OTP on existing account ──────────────────────
    if (acc) {
      await (admin as any).from("citizen_accounts")
        .update({ otp_code: otp, otp_expires_at: otpExpiry })
        .eq("id", acc.id);
    }

    return NextResponse.json({ ok: true, devOtp: otp, accountId: acc?.id });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
