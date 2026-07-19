// Citation detail API
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const { id } = await params;
    if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const admin = getSupabaseAdminAny();
    if (!admin) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const { data, error } = await admin.from("citations").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Citation haipatikani" }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "citations", "update");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (!isSupabaseEnabled()) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const admin = getSupabaseAdminAny();
    if (!admin) return NextResponse.json({ error: "Supabase haijawezeshwa" }, { status: 503 });
    const { data, error } = await admin.from("citations").update(body).eq("id", id).select().single();
    if (error) throw error;
    await logAction(session, "citation_updated", "citations", id, body);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
