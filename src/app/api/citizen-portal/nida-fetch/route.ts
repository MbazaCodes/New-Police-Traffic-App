// NIDA Mock Fetch — simulates Tanzania NIDA database lookup
import { NextResponse } from "next/server";
import { getDbAdmin, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

async function fetchFromNIDA(nida: string) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));
  // Parse NIDA structure: YYYYMMDDGGGGGGSSSCC (20 digits)
  const year  = nida.slice(0, 4);
  const month = nida.slice(4, 6);
  const day   = nida.slice(6, 8);
  const dob   = `${year}-${month}-${day}`;
  const genderDigit = parseInt(nida[8] || "1");
  return {
    found: true,
    data: {
      nida,
      firstName: "Raia", middleName: "", lastName: "Mtanzania",
      fullName: "Raia Mtanzania",
      dob, gender: genderDigit % 2 === 0 ? "Female" : "Male",
      birthPlace: "Tanzania", region: "Dar es Salaam",
      district: "", ward: "", address: "", occupation: "",
      maritalStatus: "Haijajulikana", nationality: "Mtanzania",
      photoUrl: null, verified: true,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { nida, accountId } = body;
    if (!nida) return NextResponse.json({ error: "NIDA inahitajika" }, { status: 400 });
    const cleanNida = nida.replace(/\D/g, "");
    if (cleanNida.length !== 20) return NextResponse.json({ error: "NIDA lazima iwe tarakimu 20" }, { status: 400 });

    const result = await fetchFromNIDA(cleanNida);
    if (!result.found) return NextResponse.json({ error: "NIDA haipatikani" }, { status: 404 });

    if (accountId && isDbEnabled()) {
      const admin = getDbAdmin() as any;
      if (admin) {
        const { data: account } = await admin.from("citizen_accounts")
          .select("citizen_id").eq("id", accountId).maybeSingle();
        if (account?.citizen_id) {
          await admin.from("citizens").update({
            nida: cleanNida, name: result.data.fullName,
            first_name: result.data.firstName, last_name: result.data.lastName,
            dob: result.data.dob || null, gender: result.data.gender || null,
            region: result.data.region || null,
          }).eq("id", account.citizen_id);
        }
        await admin.from("citizen_accounts").update({
          nida: cleanNida, cached_name: result.data.fullName,
        }).eq("id", accountId);
      }
    }
    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
