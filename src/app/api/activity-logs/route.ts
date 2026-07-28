// Activity Logs API — /api/activity-logs
// Records all user actions: login, create, update, delete + timestamps
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "audit_logs", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url      = new URL(request.url);
    const userId   = url.searchParams.get("userId");
    const action   = url.searchParams.get("action");
    const userType = url.searchParams.get("userType");
    const from     = url.searchParams.get("from");
    const to       = url.searchParams.get("to");
    const limit    = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);

    if (isDbEnabled()) {
      const admin = getDbAdmin() as any;
      if (admin) {
        let q = admin.from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (userId)   q = q.eq("user_id", userId);
        if (action)   q = q.ilike("action", `%${action}%`);
        if (userType) q = q.eq("user_type", userType);
        if (from)     q = q.gte("created_at", from);
        if (to)       q = q.lte("created_at", to);
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
    const body = await request.json().catch(() => ({}));
    if (!isDbEnabled()) return NextResponse.json({ ok: true });
    const admin = getDbAdmin() as any;
    if (!admin) return NextResponse.json({ ok: true });
    await admin.from("activity_logs").insert({
      user_id:      body.userId      || null,
      user_type:    body.userType    || "officer",
      user_name:    body.userName    || null,
      user_role:    body.userRole    || null,
      action:       body.action      || "unknown",
      resource:     body.resource    || null,
      resource_id:  body.resourceId  || null,
      description:  body.description || null,
      changes:      body.changes     || null,
      ip_address:   body.ipAddress   || null,
      success:      body.success     ?? true,
      error_message:body.errorMessage|| null,
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); } // non-critical
}
