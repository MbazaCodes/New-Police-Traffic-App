import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isDbEnabled()) return NextResponse.json({ error: "DB haijawezeshwa" }, { status: 503 });
    // For now: store placeholder. In production this would upload to server storage.
    const admin = getDbAdmin();
    const { data: acc } = await (admin as any).from("citizen_accounts").select("citizen_id").eq("id", id).maybeSingle();
    const citizenId = acc?.citizen_id || id;
    const placeholderUrl = `/api/citizen-portal/${id}/photo/avatar`;
    await (admin as any).from("citizens").update({ photo_url: placeholderUrl }).eq("id", citizenId);
    return NextResponse.json({ ok: true, url: placeholderUrl });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
