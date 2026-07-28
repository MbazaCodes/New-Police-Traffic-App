import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: [] });
    const admin = getDbAdmin() as any;
    const { data } = await admin.from("citizen_payments").select("*").eq("account_id", id).order("created_at", { ascending: false });
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const admin = getDbAdmin() as any;
    const { data, error } = await admin.from("citizen_payments").insert({
      account_id: id, amount: body.amount, description: body.description,
      payment_method: body.paymentMethod || "mobile_money",
      application_id: body.applicationId || null, citation_id: body.citationId || null,
      control_number: `CN-${Date.now()}`, status: "pending",
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) { return NextResponse.json({ error: errMsg(err) }, { status: 500 }); }
}
