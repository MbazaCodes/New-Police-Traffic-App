// Alerts API — list & create (send broadcast alert)
// GET  /api/alerts  -> list alerts
// POST /api/alerts  -> send a broadcast alert

import { NextResponse } from "next/server";
import { ALERTS } from "@/lib/police-data";
import { ADMIN_ALERTS_HISTORY } from "@/lib/admin-data";
import { getServerSession } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";

const alertsStore: typeof ALERTS = [...ALERTS];
const alertHistoryStore: typeof ADMIN_ALERTS_HISTORY = [...ADMIN_ALERTS_HISTORY];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "alerts", "view");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get("category"); // all | mine | important
    const audience = url.searchParams.get("audience");
    const history = url.searchParams.get("history") === "true";

    if (history) {
      let hist = [...alertHistoryStore];
      if (audience && audience !== "all") {
        hist = hist.filter((h) => h.audience === audience);
      }
      return NextResponse.json({ data: hist, total: hist.length }, { status: 200 });
    }

    let result = [...alertsStore];
    if (category && category !== "all") {
      if (category === "important") {
        result = result.filter((a) => a.important);
      } else {
        result = result.filter((a) => a.category === category);
      }
    }

    return NextResponse.json(
      { data: result, total: result.length },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list alerts", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const check = requirePermission(session, "alerts", "create");
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json().catch(() => ({}));
    for (const field of ["title", "message", "audience"]) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const newAlert = {
      id: alertsStore.length + 1,
      icon: body.icon ?? "alert-triangle",
      iconColor: body.priority === "high" ? "#F44336" : "#2196F3",
      title: String(body.title),
      time: "just now",
      message: String(body.message),
      source: body.source ?? session!.user.name ?? "System",
      sourceBg: body.priority === "high" ? "#FFEBEE" : "#E3F2FD",
      dotColor: body.priority === "high" ? "#F44336" : "#2196F3",
      borderColor: body.priority === "high" ? "#F44336" : "#2196F3",
      unread: true,
      category: "all" as const,
      important: body.priority === "high",
    };
    alertsStore.unshift(newAlert);

    const historyEntry = {
      id: `AL-${Math.floor(100 + Math.random() * 900)}`,
      title: String(body.title),
      audience: String(body.audience),
      priority: body.priority ?? "normal",
      sentBy: session!.user.name ?? "System",
      date: now.toLocaleDateString("sw-TZ"),
      time: now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
      recipients: body.recipients ?? 0,
    };
    alertHistoryStore.unshift(historyEntry);

    logAction(
      session!.user.id,
      "send_alert",
      "alerts",
      String(newAlert.id),
      { alert: newAlert, history: historyEntry },
      session!.user.name,
    );

    return NextResponse.json(
      { data: newAlert, history: historyEntry },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send alert", detail: String(err) },
      { status: 500 },
    );
  }
}
