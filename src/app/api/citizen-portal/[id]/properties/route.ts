// Properties — citizen portal
import { NextResponse } from "next/server";
import { getDbAdmin, query } from "@/lib/db/client";

async function getAccountInfo(admin: any, accountId: string) {
  const { data } = await admin.from("citizen_accounts")
    .select("citizen_id, phone, cached_name").eq("id", accountId).maybeSingle();
  return data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    const account = await getAccountInfo(admin, (await params).id);
    if (!account?.citizen_id) return NextResponse.json({ ok: true, data: [] });

    const rows = await query(
      `SELECT p.*, po.ownership_type, po.owned_from, po.is_current
       FROM property_owners po
       JOIN properties p ON p.id = po.property_id
       WHERE po.citizen_id = $1 AND po.is_current = TRUE
       ORDER BY po.owned_from DESC`,
      [account.citizen_id]
    );

    return NextResponse.json({ ok: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = getDbAdmin() as any;
    const accountId = (await params).id;
    const account = await getAccountInfo(admin, accountId);
    if (!account) return NextResponse.json({ ok: false, error: "Akaunti haipatikani" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { name, property_type, address, region, district, ward, title_deed_no, value } = body;

    if (!name) return NextResponse.json({ ok: false, error: "Jina la mali inahitajika" }, { status: 400 });

    let citizenId = account.citizen_id;

    // Auto-create citizen if missing
    if (!citizenId) {
      const cname = account.cached_name || "Raia";
      const { data: newCit } = await admin.from("citizens").insert({
        name: cname, first_name: cname.split(" ")[0] || null,
        mobile: account.phone || null, status: "Mtu wa Kawaida",
      }).select("id").single();
      if (newCit) {
        citizenId = newCit.id;
        await admin.from("citizen_accounts").update({ citizen_id: citizenId }).eq("id", accountId);
      }
    }

    // Insert property
    const { data: prop, error: propErr } = await admin.from("properties").insert({
      name, property_type: property_type || "land",
      address: address || null, region: region || null,
      district: district || null, ward: ward || null,
      title_deed_no: title_deed_no || null,
      value: value ? parseFloat(String(value).replace(/,/g,"")) : null,
      status: "registered",
    }).select().single();

    if (propErr) return NextResponse.json({ ok: false, error: propErr.message }, { status: 500 });

    // Link to owner
    await admin.from("property_owners").insert({
      property_id: prop.id, citizen_id: citizenId,
      owner_name: account.cached_name || null,
      ownership_type: "full", is_current: true,
    });

    // Log to property_ownership_log if exists
    try {
      await query(
        `INSERT INTO property_ownership_log (property_id,owner_citizen_id,owner_name,status,is_current_owner)
         VALUES ($1,$2,$3,'active',TRUE)`,
        [prop.id, citizenId, account.cached_name || null]
      );
    } catch { /* table may not exist yet */ }

    return NextResponse.json({ ok: true, data: prop });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
