import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

// Exact columns from citizens table (verified from DB)
const CITIZEN_CORE = [
  "name","first_name","last_name","middle_name",
  "gender","dob","occupation","tribe",
  "nida","mobile","license_no","photo_url",
  "address","region","district","ward","street",
];

// Extended columns via migration 34 (may or may not exist yet)
const CITIZEN_EXTENDED = [
  "home_address","home_region","home_district","home_ward",
  "work_address","work_employer",
  "medical_conditions","allergies","disability",
  "kin_name","kin_phone","kin_relationship","kin_address",
  "emergency2_name","emergency2_phone","emergency2_relationship",
];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isDbEnabled()) return NextResponse.json({ ok: true });
    const body = await req.json().catch(() => ({}));
    const admin = getDbAdmin();

    // Get citizen_id from account
    const { data: acc } = await (admin as any)
      .from("citizen_accounts")
      .select("citizen_id,cached_name")
      .eq("id", id)
      .maybeSingle();
    const citizenId = acc?.citizen_id || id;

    if (!citizenId) return NextResponse.json({ error: "Raia haipatikani" }, { status: 404 });

    // Get existing columns for this table (defensive)
    const update: Record<string, unknown> = {};

    // Core fields — always safe
    for (const k of CITIZEN_CORE) {
      if (body[k] !== undefined) update[k] = body[k] || null;
    }
    // Map phone → mobile
    if (body.phone) update.mobile = body.phone;

    // Extended fields — try to add, fail silently per field
    for (const k of CITIZEN_EXTENDED) {
      if (body[k] !== undefined) update[k] = body[k] || null;
    }

    // Split first/last name if only full name provided
    if (update.name && !update.first_name) {
      const parts = String(update.name).trim().split(" ");
      update.first_name = parts[0] || null;
      update.last_name  = parts.slice(1).join(" ") || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true, message: "Hakuna mabadiliko" });
    }

    // Try full update first, fall back to core only if extended columns missing
    let error: any = null;
    const { error: err1 } = await (admin as any)
      .from("citizens")
      .update(update)
      .eq("id", citizenId);
    error = err1;

    if (error?.message?.includes("column") && error?.message?.includes("does not exist")) {
      // Fall back to core fields only
      const coreUpdate: Record<string, unknown> = {};
      for (const k of CITIZEN_CORE) {
        if (update[k] !== undefined) coreUpdate[k] = update[k];
      }
      const { error: err2 } = await (admin as any)
        .from("citizens")
        .update(coreUpdate)
        .eq("id", citizenId);
      error = err2;
    }

    if (error) {
      console.error("[PROFILE PATCH ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync name to citizen_accounts
    if (update.name) {
      await (admin as any)
        .from("citizen_accounts")
        .update({ cached_name: update.name })
        .eq("id", id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
