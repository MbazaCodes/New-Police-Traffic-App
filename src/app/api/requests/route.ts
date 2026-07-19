// Requests API — officer requests + commander approvals
// GET    /api/requests          → list requests (scoped by role)
// POST   /api/requests          → create request (officer)
// PATCH  /api/requests/[id]     → approve/reject/reallocate (commander)

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

// In-memory store fallback
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
const requestsStore: OfficerRequest[] = [
  {
    id:"REQ-001",type:"Uhamisho",officerId:"TP123456",officerName:"Cprl. Juma Mwinyi",officerBadge:"TP123456",station:"Kituo Kikuu DSM",region:"Dar es Salaam",details:"Omba kuhamishwa Kinondoni kwa sababu za familia",priority:"medium",status:"pending",createdAt:"2026-07-10T08:00:00Z"
  },
  {
    id:"REQ-002",type:"Zana za Kazi",officerId:"TP234567",officerName:"Sgt. Ali Hassan",officerBadge:"TP234567",station:"Kituo cha Ilala",region:"Dar es Salaam",details:"Omba kipanga kipya — cha zamani kimevunjika",priority:"high",status:"pending",createdAt:"2026-07-12T10:30:00Z"
  },
  {
    id:"REQ-003",type:"Likizo",officerId:"GO123456",officerName:"Insp. Grace Mushi",officerBadge:"GO123456",station:"Kituo Kinondoni",region:"Dar es Salaam",details:"Omba likizo ya siku 7 — hali ya familia",priority:"low",status:"approved",response:"Imeidhinishwa. Likizo 18–25 Julai 2026.",respondedBy:"CSP. Yusuph Majaliwa",respondedAt:"2026-07-13T09:00:00Z",createdAt:"2026-07-11T14:00:00Z"
  },
  {
    id:"REQ-004",type:"Matibabu",officerId:"TP345678",officerName:"Sgt. Fatuma Hassan",officerBadge:"TP345678",station:"Kituo Kinondoni",region:"Dar es Salaam",details:"Omba msaada wa matibabu — mguu ulioumia kazini",priority:"high",status:"pending",createdAt:"2026-07-14T07:45:00Z"
  },
  {
    id:"REQ-005",type:"Mafunzo",officerId:"GO234567",officerName:"Insp. Hamisi Rashid",officerBadge:"GO234567",station:"Kituo cha Ubungo",region:"Dar es Salaam",details:"Omba mafunzo ya advanced CID investigation",priority:"medium",status:"rejected",response:"Mafunzo hayapatikani quarter hii. Omba tena Q4.",respondedBy:"CSP. Yusuph Majaliwa",respondedAt:"2026-07-13T11:00:00Z",createdAt:"2026-07-09T16:00:00Z"
  },
];

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
    // Mock fallback — scope by role
    const isOfficer = ["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"].includes(session.user?.role ?? "");
    let results = isOfficer
      ? requestsStore.filter(r => r.officerBadge === (session.user as {badgeNo?:string}).badgeNo)
      : requestsStore;
    if (status) results = results.filter(r => r.status === status);
    if (type)   results = results.filter(r => r.type === type);
    return NextResponse.json({ ok: true, data: results });
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
    requestsStore.unshift(newReq);
    return NextResponse.json({ ok: true, data: newReq }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
