// Reports summary API — dashboard KPIs, trends, distribution
// GET /api/reports/summary -> aggregated dashboard data

import { NextResponse } from "next/server";
import {
  DASHBOARD_KPIS,
  INCIDENT_TREND,
  OFFENSE_DISTRIBUTION,
  REGION_STATS,
  LIVE_INCIDENTS,
import { getServerSession } from "@/lib/auth";
import { enforceDataScope, requirePermission } from "@/lib/rbac";
import { annotateRecordScope, getScopeContext } from "@/lib/scope";

export async function GET() {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "reports", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const scope = getScopeContext(session);
    const scopedRegions = enforceDataScope(
      REGION_STATS.map((r) =>
        annotateRecordScope(
          {
            ...r,
            region: r.region,
            district: r.region === "Dar es Salaam" ? "Kinondoni" : "Regional",
            station: r.region === "Dar es Salaam" ? "Oysterbay Station" : `${r.region} Station`,
            isPublic: true,
          },
          scope,
        ),
      ),
      scope,
    );

    const scopedLiveIncidents = enforceDataScope(
      LIVE_INCIDENTS.filter((i) => i.status !== "resolved").map((i) =>
        annotateRecordScope(
          {
            ...i,
            ownerId: String(i.officer ?? ""),
            region: "Dar es Salaam",
            district: "Kinondoni",
            station: "Oysterbay Station",
            isPublic: false,
          },
          scope,
        ),
      ),
      scope,
    );

    // Aggregate mock KPIs from existing data
    const totalOfficers = scopedRegions.reduce((sum, r) => sum + Number(r.officers ?? 0), 0);
    const totalIncidents = scopedRegions.reduce((sum, r) => sum + Number(r.incidents ?? 0), 0);
    const totalCitations = scopedRegions.reduce((sum, r) => sum + Number(r.citations ?? 0), 0);
    const totalResolved = scopedRegions.reduce((sum, r) => sum + Number(r.resolved ?? 0), 0);
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
        regionStats: scopedRegions,
        liveIncidents: scopedLiveIncidents,
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
