// Service Prices API — migrated to withAuth() for centralized auth + audit
// CRUD for service_prices — admin-editable pricing for fines, applications, services
//
// Migration notes:
// - GET was previously public (no auth); now requires "settings:view" via
//   withAuthAny to ensure only authenticated users see pricing. If public
//   read is required later, split into a separate /public route.
// - POST/PATCH/DELETE use withAuth("settings", ...) — auto-audited.
import { withAuth, withAuthAny } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

const clean = (s: unknown) => String(s ?? "").trim();

// GET /api/service-prices?category=...&code=... (any authenticated user)
export const GET = withAuthAny("service_prices", async ({ db, searchParams }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const category = clean(searchParams.get("category"));
  const code     = clean(searchParams.get("code"));

  let query = db.from("service_prices").select("*").eq("is_active", true);
  if (category) query = query.eq("category", category);
  if (code)     query = query.eq("code", code);

  const { data, error } = await query.order("category").order("name_en");
  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }
  return { ok: true, data: data ?? [] };
});

// POST /api/service-prices — create (admin only, auto-audited)
export const POST = withAuth("settings", "edit", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { code, name_en, name_sw, category, amount, is_rate, unit, description } = body;
  if (!code || !name_en || !name_sw || !category || amount === undefined) {
    return {
      ok: false,
      error: "code, name_en, name_sw, category, amount ni lazima",
      status: 400,
    };
  }

  const { data, error } = await db.from("service_prices").insert({
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

  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data };
});

// PATCH /api/service-prices — update (admin only, auto-audited)
export const PATCH = withAuth("settings", "edit", async ({ body, session, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const { id, code, name_en, name_sw, category, amount, is_rate, unit, description, is_active } = body;
  if (!id && !code) {
    return { ok: false, error: "id au code ni lazima", status: 400 };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: session?.user?.id ?? null,
  };
  if (name_en)         updates.name_en     = name_en;
  if (name_sw)         updates.name_sw     = name_sw;
  if (category)        updates.category    = category;
  if (amount !== undefined) updates.amount = Number(amount);
  if (is_rate !== undefined) updates.is_rate = is_rate;
  if (unit)            updates.unit        = unit;
  if (description)     updates.description = description;
  if (is_active !== undefined) updates.is_active = is_active;

  const filterKey = id ? "id" : "code";
  const filterVal = id ?? code;

  const { data, error } = await db
    .from("service_prices")
    .update(updates)
    .eq(filterKey, filterVal)
    .single();
  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data };
});

// DELETE /api/service-prices?id=... (soft delete, auto-audited)
export const DELETE = withAuth("settings", "delete", async ({ session, searchParams, db }) => {
  if (!isDbEnabled()) {
    return { ok: false, error: "DB haijawezeshwa", status: 503 };
  }
  const id = clean(searchParams.get("id"));
  if (!id) return { ok: false, error: "ID ni lazima", status: 400 };

  const { data, error } = await db.from("service_prices").update({
    is_active:  false,
    updated_at: new Date().toISOString(),
    updated_by: session?.user?.id ?? null,
  }).eq("id", id).single();

  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, data };
});
