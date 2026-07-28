import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "Haujaingia" }, { status: 401 });
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    const body = await req.json().catch(() => ({}));
    const admin = getDbAdmin();
    const { data, error } = await (admin as any).from("missing_records")
      .update({ status: body.status ?? "found", updated_at: new Date().toISOString() })
      .eq("id", params.id).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
