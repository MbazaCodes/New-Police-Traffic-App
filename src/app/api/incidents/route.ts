// Incidents API — Supabase-first
// GET  /api/incidents   -> list incidents
// POST /api/incidents   -> create incident

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdmin, getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";
import { errMsg } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "incidents", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const url = new URL(request.url);
    const status   = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const search   = url.searchParams.get("search")?.toLowerCase() ?? "";

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        let q = admin.from("incidents").select("*").order("created_at", { ascending: false });
        if (status && status !== "all") q = q.eq("status", status);
        if (priority && priority !== "all") q = q.eq("priority", priority);
        if (search) q = q.or(`type.ilike.%${search}%,location.ilike.%${search}%,incident_number.ilike.%${search}%`);
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
    const check = requirePermission(session, "incidents", "create");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await request.json().catch(() => ({}));
    const { type, location, description, priority, citizenName, citizenPhone, citizenNida } = body;

    if (!type || !location) {
      return NextResponse.json({ error: "Aina ya tukio na eneo vinahitajika" }, { status: 400 });
    }

    const incidentNumber = `INC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    if (isSupabaseEnabled()) {
      const admin = getSupabaseAdminAny();
      if (admin) {
        const { data, error } = await admin.from("incidents").insert({
          incident_number: incidentNumber,
          type, location, description: description || null,
          priority: priority || "medium", status: "active",
          citizen_name: citizenName || null,
          citizen_phone: citizenPhone || null,
          citizen_nida: citizenNida || null,
          officer_id: session?.user?.id || null,
        }).select().single();
        if (error) throw error;
        await logAction(session, "incident_created", "incidents", data.id, { type, location });
        return NextResponse.json({ ok: true, data }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
