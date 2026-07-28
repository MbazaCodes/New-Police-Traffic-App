// Citizen Portal — Applications (Good Conduct, Ownership, PF3, etc.)
import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

const APP_FEES: Record<string, number> = {
  "good-conduct": 10000, "vehicle-inspection": 25000,
  "ownership-cert": 15000, "pf3": 5000, "summary-report": 2000,
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [] });
    const admin = getDbAdmin() as any;
    const { data } = await admin.from("citizen_applications").select("*").eq("account_id", id).order("created_at", { ascending: false });
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (!body.appType) return NextResponse.json({ error: "Aina ya ombi inahitajika" }, { status: 400 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    const { data: account } = await admin.from("citizen_accounts").select("citizen_id").eq("id", id).maybeSingle();
    const fee = APP_FEES[body.appType] || 0;
    const titles: Record<string, string> = {
      "good-conduct": "Cheti cha Tabia Njema", "vehicle-inspection": "Ukaguzi wa Gari",
      "ownership-cert": "Cheti cha Umiliki", "pf3": "Fomu ya PF3 (Ajali)",
      "summary-report": "Ripoti ya Muhtasari",
    };
    const { data, error } = await admin.from("citizen_applications").insert({
      account_id: id, citizen_id: account?.citizen_id || null,
      app_type: body.appType, title: titles[body.appType] || body.appType,
      data: body.data || {}, fee_amount: fee, fee_paid: false, status: "pending",
    }).select().single();
    if (error) throw error;
    await admin.from("activity_logs").insert({
      user_id: id, user_type: "citizen", action: "application_submitted",
      resource: "citizen_applications", resource_id: data.id,
      description: `Ombi: ${titles[body.appType] || body.appType}`,
    });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}
