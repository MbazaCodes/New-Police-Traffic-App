// src/app/api/admin/stats/route.ts
// Admin Stats — raw SQL COUNT queries via local PostgreSQL
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { query, isDbEnabled } from "@/lib/db/client";
import { errMsg } from "@/lib/api-error";

async function safeCount(sql: string, params: unknown[] = []): Promise<number> {
  try {
    const rows = await query<{ count: string }>(sql, params);
    return parseInt(rows[0]?.count ?? "0", 10);
  } catch { return 0; }
}

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "audit_logs", "view");
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!isDbEnabled()) return NextResponse.json({ ok: true, data: { police: {}, citizen: {} } });

    const [
      citizens, citizenAccounts, approved, pending,
      vehicles, properties, devices, complaints, applications,
      officers, activeOfficers, citations, todayCitations, incidents,
      patrols, stations, posts, arrests, missing, unpaidFines,
    ] = await Promise.all([
      safeCount("SELECT COUNT(*) FROM citizens"),
      safeCount("SELECT COUNT(*) FROM citizen_accounts"),
      safeCount("SELECT COUNT(*) FROM citizen_accounts WHERE approved = true"),
      safeCount("SELECT COUNT(*) FROM citizen_accounts WHERE is_verified = true AND approved = false"),
      safeCount("SELECT COUNT(*) FROM vehicles"),
      safeCount("SELECT COUNT(*) FROM property_owners"),
      safeCount("SELECT COUNT(*) FROM devices"),
      safeCount("SELECT COUNT(*) FROM citizen_complaints"),
      safeCount("SELECT COUNT(*) FROM citizen_applications"),
      safeCount("SELECT COUNT(*) FROM officers"),
      safeCount("SELECT COUNT(*) FROM officers WHERE status = 'active'"),
      safeCount("SELECT COUNT(*) FROM citations"),
      // Today's citations — was previously labeled "Leo" but returned total
      safeCount("SELECT COUNT(*) FROM citations WHERE created_at::date = CURRENT_DATE"),
      safeCount("SELECT COUNT(*) FROM incidents WHERE status != 'resolved'"),
      safeCount("SELECT COUNT(*) FROM patrols WHERE status = 'active'"),
      safeCount("SELECT COUNT(*) FROM stations"),
      safeCount("SELECT COUNT(*) FROM posts"),
      // Detained citizens (status='held')
      safeCount("SELECT COUNT(*) FROM arrests WHERE status = 'held'"),
      // Missing persons/vehicles — separate from arrests (was previously conflated)
      safeCount("SELECT COUNT(*) FROM missing_records WHERE status = 'active'"),
      safeCount("SELECT COUNT(*) FROM citations WHERE status = 'unpaid'"),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        police: {
          officers, activeOfficers,
          citations, todayCitations, incidents, patrols,
          stations, posts, arrests, missing, unpaidFines,
        },
        citizen: {
          citizens, citizenAccounts, approved, pending,
          vehicles, properties, devices, complaints, applications,
        },
      },
    });
  } catch (err) {
    console.error("[ADMIN STATS]", errMsg(err));
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
