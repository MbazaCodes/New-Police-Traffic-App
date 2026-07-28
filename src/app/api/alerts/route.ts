// Alerts API — PostgreSQL (VPS) backed
// Refactored to use centralized api-guard for auth, audit, and error handling.
import { withAuth } from "@/lib/api-guard";
import { isDbEnabled } from "@/lib/db/client";

// GET /api/alerts — list all alerts
export const GET = withAuth("alerts", "view", async ({ db }) => {
  if (!isDbEnabled()) return { ok: true, data: [], total: 0 };

  const { data, error } = await db.from("alerts")
    .select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return { ok: true, data: data ?? [], total: data?.length ?? 0 };
});

// POST /api/alerts — create alert (auto-audited by api-guard)
export const POST = withAuth("alerts", "create", async ({ body, session, db }) => {
  const { title, message, category, priority } = body as {
    title: string; message: string; category?: string; priority?: string;
  };

  if (!title || !message) {
    return { ok: false, error: "Kichwa na ujumbe vinahitajika", status: 400 };
  }

  if (!isDbEnabled()) {
    return { ok: true, data: { id: `ALT-${Date.now()}` }, status: 201 };
  }

  const { data, error } = await db.from("alerts").insert({
    title,
    message,
    source: session.user.name || "Admin",
    category: category || "all",
    priority: priority || "normal",
    is_read: false,
  }).select().single();
  if (error) throw error;
  return { ok: true, data, status: 201 };
});
