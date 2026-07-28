// src/app/api/citizen-portal/[id]/vehicles/route.ts
// GET: list citizen's vehicles | POST: add vehicle
import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/db/client";

async function getCitizenId(admin: any, accountId: string): Promise<string | null> {
  const { data } = await admin
    .from("citizen_accounts")
    .select("citizen_id, phone")
    .eq("id", accountId)
    .maybeSingle();
  return data?.citizen_id ?? null;
}

// ── GET /api/citizen-portal/[id]/vehicles ────────────────────────────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: false, error: "DB haijawezeshwa" }, { status: 503 });

    const citizenId = await getCitizenId(admin, (await params).id);
    if (!citizenId) return NextResponse.json({ ok: true, data: [] });

    // Also get account phone to match owner_phone
    const { data: account } = await admin
      .from("citizen_accounts")
      .select("phone")
      .eq("id", (await params).id)
      .maybeSingle();

    const phone = account?.phone ?? "";
    const altPhone = phone.replace(/^\+/, ""); // without +

    // Fetch by citizen_id OR phone (cover both cases)
    const orConditions = [`owner_citizen_id.eq.${citizenId}`];
    if (phone) orConditions.push(`owner_phone.eq.${phone}`);
    if (altPhone && altPhone !== phone) orConditions.push(`owner_phone.eq.${altPhone}`);

    const { data: vehicles, error } = await admin
      .from("vehicles")
      .select("*")
      .or(orConditions.join(","))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[VEHICLES GET]", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Deduplicate by id
    const seen = new Set();
    const unique = (vehicles ?? []).filter((v: any) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });

    return NextResponse.json({ ok: true, data: unique });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// ── POST /api/citizen-portal/[id]/vehicles ───────────────────────────────────
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: false, error: "DB haijawezeshwa" }, { status: 503 });

    const body = await req.json().catch(() => ({}));
    const { plate, make, model, color, year, chassis } = body;

    if (!plate?.trim()) {
      return NextResponse.json({ ok: false, error: "Namba ya usajili inahitajika" }, { status: 400 });
    }

    // Get citizen details
    const { data: account } = await admin
      .from("citizen_accounts")
      .select("citizen_id, phone, cached_name")
      .eq("id", (await params).id)
      .maybeSingle();

    if (!account) return NextResponse.json({ ok: false, error: "Akaunti haipatikani" }, { status: 404 });

    let citizenId = account.citizen_id;
    let ownerName = account.cached_name ?? "";
    let ownerNida = "";

    // Get citizen name/nida if available
    if (citizenId) {
      const { data: citizen } = await admin
        .from("citizens")
        .select("name, nida, first_name, last_name")
        .eq("id", citizenId)
        .maybeSingle();
      if (citizen) {
        ownerName = citizen.name || `${citizen.first_name ?? ""} ${citizen.last_name ?? ""}`.trim() || ownerName;
        ownerNida = citizen.nida ?? "";
      }
    }

    // If no citizen_id, create citizen record first
    if (!citizenId) {
      const nameParts = ownerName.split(" ");
      const { data: newCit } = await admin.from("citizens").insert({
        name:       ownerName || null,
        first_name: nameParts[0] || null,
        last_name:  nameParts.slice(1).join(" ") || null,
        mobile:     account.phone || null,
        status:     "active",
        verified:   true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select("id").single();

      if (newCit) {
        citizenId = newCit.id;
        await admin.from("citizen_accounts")
          .update({ citizen_id: citizenId, updated_at: new Date().toISOString() })
          .eq("id", (await params).id);
      }
    }

    const insertData: any = {
      plate:            plate.trim().toUpperCase(),
      make:             make?.trim() || null,
      model:            model?.trim() || null,
      color:            color?.trim() || null,
      year:             year?.trim() || null,
      chassis_no:       chassis?.trim() || null,
      owner_citizen_id: citizenId || null,
      owner_phone:      account.phone || null,
      owner_name:       ownerName || null,
      owner_nida:       ownerNida || null,
      insurance_valid:  false,
      created_at:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    };

    const { data: vehicle, error } = await admin
      .from("vehicles")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[VEHICLES POST]", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Log initial ownership record
    try {
      const { query: dbQuery } = await import("@/lib/db/client");
      await dbQuery(
        `INSERT INTO vehicle_ownership
         (vehicle_id,owner_citizen_id,owner_name,owner_nida,owner_phone,
          status,recorded_by_id,recorded_by_name,recorded_by_role,is_current_owner)
         VALUES($1,$2,$3,$4,$5,'active',$6,$7,$8,TRUE)`,
        [vehicle.id, citizenId ?? null, ownerName, ownerNida ?? null,
         account.phone ?? null, citizenId ?? "citizen-portal",
         ownerName, "citizen"]
      );
    } catch (e) { console.warn("[CITIZEN VEHICLE OWNERSHIP LOG]", e); }

    return NextResponse.json({ ok: true, data: vehicle });
  } catch (err: any) {
    console.error("[VEHICLES POST CATCH]", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
