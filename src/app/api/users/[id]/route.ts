// Users [id] API — Supabase-only
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(_: Request, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const admin = getSupabaseAdminAny();
    if (!admin) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const { data, error } = await admin.from("users").select("*, station:stations(id,name,region)").eq("id", (await _params).id).single();
    if (error || !data) return NextResponse.json({ error: "Mtumiaji hapatikani" }, { status: 404 });
    return NextResponse.json({ ok: true, data });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(request: Request, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const admin = getSupabaseAdminAny();
    if (!admin) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const updates: Record<string, unknown> = {};
    if (body.name)       updates.name       = body.name;
    if (body.email)      updates.email      = body.email;
    if (body.phone)      updates.phone      = body.phone;
    if (body.role)       updates.role       = body.role;
    if (body.status)     updates.status     = body.status;
    if (body.station)    updates.station_id = body.station;
    if (body.unit)       updates.unit       = body.unit;
    if (body.rank)       updates.rank       = body.rank;
    const { data, error } = await admin.from("users").update(updates).eq("id", (await _params).id).select().single();
    if (error) throw error;
    await logAction(session, "user_updated", "users", (await _params).id, updates);
    return NextResponse.json({ ok: true, data });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(_: Request, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "users", "delete");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const admin = getSupabaseAdminAny();
    if (!admin) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const { error } = await admin.from("users").delete().eq("id", (await _params).id);
    if (error) throw error;
    await logAction(session, "user_deleted", "users", (await _params).id, {});
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
