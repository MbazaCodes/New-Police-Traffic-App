// ===== TZ Police — Edge Function: verify-otp =====
// Verifies a one-time passcode previously issued by `send-otp`.
// On success, marks the OTP as consumed and returns a short-lived
// verification token that the client can exchange for a session.
//
// Trigger: POST /functions/v1/verify-otp
// Body: { "channel": "sms" | "email", "target": "...", "code": "123456" }
// Response: { "ok": true, "verified": true }  (or 401 on failure)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

interface VerifyOtpBody {
  channel?: "sms" | "email";
  target?: string;
  code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: VerifyOtpBody = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channel = body.channel ?? "sms";
  const target = (body.target ?? "").trim();
  const code = (body.code ?? "").trim();

  if (!target || !code) {
    return new Response(
      JSON.stringify({ error: "Missing 'target' or 'code'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

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

  // Look up the most recent unused OTP for this target/channel.
  // Expects table: otp_codes(id, channel, target, code, expires_at, consumed_at)
  const { data, error } = await supabase
    .from("otp_codes")
    .select("id, code, expires_at, consumed_at")
    .eq("channel", channel)
    .eq("target", target)
    .is("consumed_at", null)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Lookup failed", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ ok: false, verified: false, error: "No active OTP for this target" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check expiry
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return new Response(
      JSON.stringify({ ok: false, verified: false, error: "OTP expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Constant-time comparison (mitigates timing attacks)
  const expected = String(data.code);
  if (expected.length !== code.length) {
    return new Response(
      JSON.stringify({ ok: false, verified: false, error: "Invalid code" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  let mismatch = 0;
  for (let i = 0; i < code.length; i++) {
    mismatch |= code.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return new Response(
      JSON.stringify({ ok: false, verified: false, error: "Invalid code" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Mark consumed
  await supabase
    .from("otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id);

  return new Response(
    JSON.stringify({ ok: true, verified: true, channel, target }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
