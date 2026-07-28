// src/app/api/citizen-portal/[id]/devices/route.ts
// GET: list citizen's devices | POST: register device
import { NextResponse } from "next/server";
import { getDbAdmin } from "@/lib/db/client";

async function getAccountInfo(admin: any, accountId: string) {
  const { data } = await admin
    .from("citizen_accounts")
    .select("citizen_id, phone, cached_name")
    .eq("id", accountId)
    .maybeSingle();
  return data;
}

// ── GET /api/citizen-portal/[id]/devices ──────────────────────────────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: false, error: "DB haijawezeshwa" }, { status: 503 });

    const account = await getAccountInfo(admin, (await params).id);
    if (!account) return NextResponse.json({ ok: true, data: [] });

    const orConditions: string[] = [];
    if (account.citizen_id) orConditions.push(`owner_citizen_id.eq.${account.citizen_id}`);
    if (account.phone) {
      orConditions.push(`owner_phone.eq.${account.phone}`);
      const alt = account.phone.replace(/^\+/, "");
      if (alt !== account.phone) orConditions.push(`owner_phone.eq.${alt}`);
    }

    if (orConditions.length === 0) return NextResponse.json({ ok: true, data: [] });

    const { data: devices, error } = await admin
      .from("devices")
      .select("*")
      .or(orConditions.join(","))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[DEVICES GET]", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Map to frontend-friendly shape
    const data = (devices ?? []).map((d: any) => ({
      id:            d.id,
      device_type:   d.category || "other",
      brand:         d.description?.split(" ")[0] || "",
      model:         d.description || "",
      serial_no:     d.serial_no || d.imei || "",
      imei:          d.imei || "",
      color:         d.color || "",
      purchase_date: d.purchase_date || null,
      purchase_price: d.purchase_price || null,
      status:        d.status || "active",
      blacklisted:   d.blacklisted || false,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// ── POST /api/citizen-portal/[id]/devices ─────────────────────────────────────
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: false, error: "DB haijawezeshwa" }, { status: 503 });

    const body = await req.json().catch(() => ({}));
    const { deviceType, brand, model, serialNo, imei, color, purchaseDate, purchasePrice } = body;

    if (!deviceType) {
      return NextResponse.json({ ok: false, error: "Aina ya kifaa inahitajika" }, { status: 400 });
    }

    const account = await getAccountInfo(admin, (await params).id);
    if (!account) return NextResponse.json({ ok: false, error: "Akaunti haipatikani" }, { status: 404 });

    let citizenId = account.citizen_id;

    // Create citizen if needed
    if (!citizenId) {
      const nameParts = (account.cached_name ?? "").split(" ");
      const { data: newCit } = await admin.from("citizens").insert({
        name:       account.cached_name || null,
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

    const description = [brand, model].filter(Boolean).join(" ") || deviceType;

    const insertData: any = {
      category:         deviceType,
      description:      description,
      serial_no:        serialNo?.trim() || null,
      imei:             imei?.trim() || serialNo?.trim() || null,
      color:            color?.trim() || null,
      owner_citizen_id: citizenId || null,
      owner_phone:      account.phone || null,
      owner_name:       account.cached_name || null,
      status:           "active", // valid after migration 033
      blacklisted:      false,
      purchase_date:    purchaseDate || null,
      purchase_price:   purchasePrice ? parseFloat(String(purchasePrice).replace(/,/g, "")) : null,
      report_date:      new Date().toISOString().split("T")[0],
      created_at:       new Date().toISOString(),
    };

    const { data: device, error } = await admin
      .from("devices")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[DEVICES POST]", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id:            device.id,
        device_type:   deviceType,
        brand:         brand || "",
        model:         model || "",
        serial_no:     device.serial_no || device.imei || "",
        color:         device.color || "",
        purchase_date: device.purchase_date || null,
        status:        "active",
      },
    });
  } catch (err: any) {
    console.error("[DEVICES POST CATCH]", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
