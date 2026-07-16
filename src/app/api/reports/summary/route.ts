// Reports summary API — dashboard KPIs, trends, distribution
// GET /api/reports/summary -> aggregated dashboard data

import { NextResponse } from "next/server";
import {
  DASHBOARD_KPIS,
  INCIDENT_TREND,
  OFFENSE_DISTRIBUTION,
  REGION_STATS,
  LIVE_INCIDENTS,
} from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "reports", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    // Aggregate mock KPIs from existing data
    const totalOfficers = REGION_STATS.reduce((sum, r) => sum + r.officers, 0);
    const totalIncidents = REGION_STATS.reduce((sum, r) => sum + r.incidents, 0);
    const totalCitations = REGION_STATS.reduce((sum, r) => sum + r.citations, 0);
    const totalResolved = REGION_STATS.reduce((sum, r) => sum + r.resolved, 0);
    const resolutionRate = totalIncidents > 0 ? Math.round((totalResolved / totalIncidents) * 100) : 0;

    const summary = {
      kpis: DASHBOARD_KPIS,
      aggregated: {
        totalOfficers,
        totalIncidents,
        totalCitations,
        totalResolved,
        resolutionRate,
        activePatrols: 23,
        todayCitations: 89,
      },
      trends: {
        incidentTrend: INCIDENT_TREND,
        offenseDistribution: OFFENSE_DISTRIBUTION,
      },
      distribution: {
        regionStats: REGION_STATS,
        liveIncidents: LIVE_INCIDENTS.filter((i) => i.status !== "resolved"),
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to build reports summary", detail: String(err) },
      { status: 500 },
    );
  }
}
