// ===== TZ Police — Edge Function: send-broadcast =====
// Sends a broadcast alert to officers. Steps:
//   1. Verifies the caller's JWT and role (commander or admin only).
//   2. Inserts the alert into the `alerts` table.
//   3. Fan-outs an FCM push notification to all subscribed officer devices.
//      (Mock: logs to stdout. Real impl: calls Firebase Admin SDK.)
//
// Trigger: POST /functions/v1/send-broadcast
// Body: {
//   title: string,
//   message: string,
//   priority?: "normal" | "important" | "urgent",
//   audience?: "all" | "mine" | string (station id, role, etc.),
//   icon?: string, icon_color?: string, border_color?: string
// }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { jwtVerify, createRemoteJWKSet } from "https://esm.sh/jose@5.6.3";

interface BroadcastBody {
  title?: string;
  message?: string;
  priority?: "normal" | "important" | "urgent";
  audience?: string;
  icon?: string;
  icon_color?: string;
  border_color?: string;
  source?: string;
}

const JWKS = createRemoteJWKSet(
  new URL(`${Deno.env.get("SUPABASE_URL")}/auth/v1/.well-known/jwks.json`),
);

async function getUserIdFromReq(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      audience: "authenticated",
      issuer: `${Deno.env.get("SUPABASE_URL")}/auth/v1`,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = await getUserIdFromReq(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: BroadcastBody = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.title || !body.message) {
    return new Response(
      JSON.stringify({ error: "Missing 'title' or 'message'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Service-role client for inserts/lookups (bypasses RLS)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Server missing Supabase credentials" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Resolve sender's role
  const { data: sender, error: senderErr } = await supabase
    .from("users")
    .select("id, role, name")
    .eq("id", userId)
    .maybeSingle();

  if (senderErr || !sender) {
    return new Response(JSON.stringify({ error: "Sender not found" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (sender.role !== "commander" && sender.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Only commanders/admins may broadcast" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  // Insert alert row
  const { data: alert, error: insertErr } = await supabase
    .from("alerts")
    .insert({
      title: body.title,
      message: body.message,
      source: body.source ?? sender.name,
      category: body.audience === "mine" ? "mine" : "all",
      priority: body.priority ?? "normal",
      icon: body.icon ?? "alert-triangle",
      icon_color: body.icon_color ?? "#2196F3",
      border_color: body.border_color ?? "#2196F3",
      is_read: false,
      sent_by: userId,
      audience: body.audience ?? "all",
    })
    .select("id, created_at")
    .single();

  if (insertErr || !alert) {
    return new Response(
      JSON.stringify({ error: "Failed to insert alert", details: String(insertErr) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ===== Mock FCM fan-out =====
  // In production: query `device_tokens` table and call Firebase Admin SDK:
  //   admin.messaging().sendEachForMulticast({ tokens, notification, data })
  const audience = body.audience ?? "all";
  const deviceCount = Math.floor(Math.random() * 50) + 50; // mock
  console.log(
    `[FCM MOCK] Alert ${alert.id} | audience=${audience} | ` +
    `priority=${body.priority ?? "normal"} | recipients=${deviceCount}`,
  );

  // Realtime fan-out via Postgres LISTEN/NOTIFY could also be triggered here.

  return new Response(
    JSON.stringify({
      ok: true,
      alert_id: alert.id,
      created_at: alert.created_at,
      recipients: deviceCount,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
