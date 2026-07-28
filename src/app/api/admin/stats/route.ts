// Admin Stats — migrated to withAuth() for centralized auth
// Raw SQL COUNT queries via local PostgreSQL
import { withAuth } from "@/lib/api-guard";
import { query, isDbEnabled } from "@/lib/db/client";

async function safeCount(sql: string, params: unknown[] = []): Promise<number> {
  try {
    const rows = await query<{ count: string }>(sql, params);
    return parseInt(rows[0]?.count ?? "0", 10);
  } catch { return 0; }
}

// GET /api/admin/stats → aggregated police + citizen counts (admin only)
export const GET = withAuth("audit_logs", "view", async () => {
  if (!isDbEnabled()) {
    return { ok: true, data: { police: {}, citizen: {} } };
  }

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

  return {
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
  };
});
