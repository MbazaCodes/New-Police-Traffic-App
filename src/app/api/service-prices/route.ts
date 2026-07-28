// src/app/api/service-prices/route.ts
// CRUD for service_prices — admin-editable pricing for fines, applications, services
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const clean = (s: any) => String(s ?? "").trim();

// GET /api/service-prices?category=...&code=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = clean(searchParams.get("category"));
    const code = clean(searchParams.get("code"));

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    let query = admin.from("service_prices").select("*").eq("is_active", true);
    if (category) query = query.eq("category", category);
    if (code) query = query.eq("code", code);

    const { data, error } = await query.order("category").order("name_en");
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) {
    console.error("[SERVICE_PRICES]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// POST /api/service-prices — Create a new service price (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "settings", "edit");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const body = await req.json();
    const { code, name_en, name_sw, category, amount, is_rate, unit, description } = body;

    if (!code || !name_en || !name_sw || !category || amount === undefined) {
      return NextResponse.json({ error: "code, name_en, name_sw, category, amount ni lazima" }, { status: 400 });
    }

    const { data, error } = await admin.from("service_prices").insert({
      code,
      name_en,
      name_sw,
      category,
      amount: Number(amount),
      is_rate: is_rate ?? false,
      unit: unit ?? "TZS",
      description: description ?? null,
      updated_by: session?.user?.id ?? null,
    }).single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[SERVICE_PRICES POST]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// PATCH /api/service-prices — Update a service price (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "settings", "edit");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const body = await req.json();
    const { id, code, name_en, name_sw, category, amount, is_rate, unit, description, is_active } = body;

    if (!id && !code) return NextResponse.json({ error: "id au code ni lazima" }, { status: 400 });

    const updates: any = { updated_at: new Date().toISOString(), updated_by: session?.user?.id ?? null };
    if (name_en) updates.name_en = name_en;
    if (name_sw) updates.name_sw = name_sw;
    if (category) updates.category = category;
    if (amount !== undefined) updates.amount = Number(amount);
    if (is_rate !== undefined) updates.is_rate = is_rate;
    if (unit) updates.unit = unit;
    if (description) updates.description = description;
    if (is_active !== undefined) updates.is_active = is_active;

    const filterKey = id ? "id" : "code";
    const filterVal = id ?? code;

    const { data, error } = await admin.from("service_prices").update(updates).eq(filterKey, filterVal).single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[SERVICE_PRICES PATCH]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}

// DELETE /api/service-prices?id=... (soft delete — sets is_active=false)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "settings", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;

    const { searchParams } = new URL(req.url);
    const id = clean(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID ni lazima" }, { status: 400 });

    // Soft delete
    const { data, error } = await admin.from("service_prices").update({
      is_active: false,
      updated_at: new Date().toISOString(),
      updated_by: session?.user?.id ?? null,
    }).eq("id", id).single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[SERVICE_PRICES DELETE]", errMsg(err));
    return NextResponse.json({ ok: false, error: errMsg(err) }, { status: 500 });
  }
}
