// Audit logs API — list audit logs
// GET /api/audit-logs -> list audit log entries (newest first)

import { NextResponse } from "next/server";
import { listAuditLogs } from "@/lib/audit-log";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "audit_logs", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const resource = url.searchParams.get("resource") ?? undefined;
    const userId = url.searchParams.get("userId") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;

    const entries = listAuditLogs({ limit, offset, resource, userId, action });

    return NextResponse.json(
      { data: entries, total: entries.length },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list audit logs", detail: String(err) },
      { status: 500 },
    );
  }
}
