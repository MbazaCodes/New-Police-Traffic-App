// Missing persons / items / vehicles — /api/missing (Supabase-backed)
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "search", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const url = new URL(request.url);
    const type   = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        let q = admin.from("missing_records")
          .select("*").order("created_at", { ascending: false }).limit(200);
        if (type   && type   !== "all") q = q.eq("type",   type);
        if (status && status !== "all") q = q.eq("status", status);
        const { data, error } = await q;
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
    const check = requirePermission(session, "search", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const body = await request.json().catch(() => ({}));
    if (!body.title) return NextResponse.json({ error: "Kichwa kinahitajika" }, { status: 400 });
    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny() as any;
      if (admin) {
        const caseNo = `MS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const { data, error } = await admin.from("missing_records").insert({
          case_no:           caseNo,
          type:              body.type            || "person",
          title:             body.title,
          identifier:        body.identifier      || null,
          details:           body.details         || null,
          last_seen:         body.lastSeen        || null,
          last_seen_location:body.lastSeenLocation|| null,
          reported_by:       body.reportedBy      || session?.user?.name || null,
          station:           body.station         || session?.user?.station || null,
          photo:             body.photo           || null,
          status:            "active",
        }).select().single();
        if (error) throw error;
        await logAction(session, "missing_reported", "missing_records", data.id, { type: body.type, title: body.title });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ ok: true, data: { id: `MS-${Date.now()}` } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
