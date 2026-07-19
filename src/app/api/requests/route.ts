// Requests API — officer requests + commander approvals
// GET    /api/requests          → list requests (scoped by role)
// POST   /api/requests          → create request (officer)
// PATCH  /api/requests/[id]     → approve/reject/reallocate (commander)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

// In-memory store fallback (empty — data from Supabase)
interface OfficerRequest {
  id: string;
  type: string;
  officerId: string;
  officerName: string;
  officerBadge: string;
  station: string;
  region: string;
  details: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "reallocated";
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  newStation?: string;
  createdAt: string;
}
const requestsStore: OfficerRequest[] = [];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "";
    const type   = url.searchParams.get("type") ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        let q = admin.from("officer_requests").select("*").order("created_at", { ascending: false });
        if (status) q = q.eq("status", status);
        if (type)   q = q.eq("type", type);
        // Scope: officers see own; commanders see all in scope
        const userRole = session.user.role ?? "";
        const isOfficer = ["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"].includes(userRole);
        if (isOfficer) q = q.eq("officer_badge", session.user.badgeNo ?? "");
        const { data } = await q;
        return NextResponse.json({ ok: true, data });
      }
    }
    // Supabase required — return empty when not available
    return NextResponse.json({ ok: true, data: [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (!body.type || !body.details) {
      return NextResponse.json({ error: "Aina na maelezo yanahitajika" }, { status: 400 });
    }

    const newReq: OfficerRequest = {
      id:           `REQ-${Date.now()}`,
      type:         body.type,
      officerId:    session.user.id ?? "",
      officerName:  session.user.name ?? "",
      officerBadge: (session.user as {badgeNo?:string}).badgeNo ?? session.user.id ?? "",
      station:      (session.user as {station?:string}).station ?? "",
      region:       (session.user as {region?:string}).region ?? "",
      details:      body.details,
      priority:     body.priority ?? "medium",
      status:       "pending",
      createdAt:    new Date().toISOString(),
    };

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data, error } = await admin.from("officer_requests").insert({
          type:          newReq.type,
          officer_id:    newReq.officerId,
          officer_name:  newReq.officerName,
          officer_badge: newReq.officerBadge,
          station:       newReq.station,
          region:        newReq.region,
          details:       newReq.details,
          priority:      newReq.priority,
          status:        "pending",
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await logAction(session, "CREATE", "officer_requests", data.id, { type: body.type });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }
    // Supabase required for request creation
    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
