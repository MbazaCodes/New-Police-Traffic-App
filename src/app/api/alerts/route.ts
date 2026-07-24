// Alerts API — Supabase-backed (was in-memory)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "alerts", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const { data, error } = await admin.from("alerts")
          .select("*").order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        return NextResponse.json({ ok: true, data: data ?? [], total: data?.length ?? 0 });
      }
    }
    return NextResponse.json({ ok: true, data: [], total: 0 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "alerts", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.title || !body.message) {
      return NextResponse.json({ error: "Kichwa na ujumbe vinahitajika" }, { status: 400 });
    }
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const { data, error } = await admin.from("alerts").insert({
          title:    body.title,
          message:  body.message,
          source:   session?.user?.name || "Admin",
          category: body.category || "all",
          priority: body.priority || "normal",
          is_read:  false,
        }).select().single();
        if (error) throw error;
        await logAction(session, "alert_sent", "alerts", data.id, { title: body.title });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `ALT-${Date.now()}` } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
