// Arrests API — Supabase-first
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        let q = admin.from("arrests").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status);
        const { data, error } = await q;
        if (error) throw error;
        return NextResponse.json({ ok: true, data: data ?? [] });
      }
    }
    return NextResponse.json({ ok: true, data: [] });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "arrests", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.suspectName || !body.offense || !body.location) {
      return NextResponse.json({ error: "Jina, kosa na eneo yanahitajika" }, { status: 400 });
    }
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("arrests").insert({
          suspect_name: body.suspectName, suspect_nida: body.suspectNida || null,
          suspect_phone: body.suspectPhone || null, offense: body.offense,
          location: body.location, cell: body.cell || null,
          next_of_kin: body.nextOfKin || null, lawyer: body.lawyer || null,
          notes: body.notes || null, status: "held",
          officer_id: session?.user?.id || null,
        }).select().single();
        if (error) throw error;
        await logAction(session, "arrest_created", "arrests", data.id, { name: body.suspectName });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
