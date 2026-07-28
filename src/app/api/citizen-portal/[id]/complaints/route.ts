// Citizen Portal — Complaints, Missing Persons, Incidents
import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [] });
    const admin = getDbAdmin() as any;
    const { data } = await admin.from("citizen_complaints").select("*").eq("account_id", id).order("created_at", { ascending: false });
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (!body.title || !body.description) return NextResponse.json({ error: "Kichwa na maelezo vinahitajika" }, { status: 400 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    const { data: account } = await admin.from("citizen_accounts").select("citizen_id").eq("id", id).maybeSingle();
    const { data, error } = await admin.from("citizen_complaints").insert({
      account_id: id, citizen_id: account?.citizen_id || null,
      complaint_type: body.type || "general", title: body.title,
      description: body.description, location: body.location || null,
      incident_date: body.incidentDate || null, suspects: body.suspects || null,
      witnesses: body.witnesses || null, priority: body.priority || "normal",
    }).select().single();
    if (error) throw error;
    await admin.from("activity_logs").insert({
      user_id: id, user_type: "citizen", action: "complaint_submitted",
      resource: "citizen_complaints", resource_id: data.id,
      description: `Malalamiko: ${body.title}`,
    });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}
