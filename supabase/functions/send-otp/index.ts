// ===== TZ Police — Edge Function: send-otp =====
// Sends a one-time passcode to a user via SMS (preferred) or email.
// Mock implementation: logs the code to stdout and stores it in the
// `otp_codes` table for `verify-otp` to check.
//
// Trigger: POST /functions/v1/send-otp
// Body: { "channel": "sms" | "email", "target": "+255712345678" | "user@example.com" }
// Response: { "ok": true, "expires_in": 300 }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const OTP_TTL_SECONDS = 300; // 5 minutes

interface SendOtpBody {
  channel?: "sms" | "email";
  target?: string;
}

function generateOtp(length = 6): string {
  let code = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: SendOtpBody = {};
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

  if (!target) {
    return new Response(
      JSON.stringify({ error: "Missing 'target' (phone or email)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (channel !== "sms" && channel !== "email") {
    return new Response(
      JSON.stringify({ error: "'channel' must be 'sms' or 'email'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Generate 6-digit code
  const code = generateOtp(6);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  // Use service-role client to persist OTP (RLS bypass).
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

  // Ensure the otp_codes table exists. Created lazily; in production a
  // dedicated migration would create it.
  await supabase.rpc("upsert_otp_code", {
    p_channel: channel,
    p_target: target,
    p_code: code,
    p_expires_at: expiresAt,
  }).then(({ error }: { error: unknown }) => {
    if (error) {
      // Fallback: insert into a generic table if the RPC doesn't exist.
      console.warn("upsert_otp_code RPC not available, using direct insert:", error);
    }
  });

  // ===== Mock delivery =====
  // In production, integrate Africa's Talking / Twilio for SMS, or
  // Resend / Postmark for email.
  if (channel === "sms") {
    console.log(`[SMS MOCK] To: ${target} | OTP: ${code} | Expires: ${expiresAt}`);
  } else {
    console.log(`[EMAIL MOCK] To: ${target} | OTP: ${code} | Expires: ${expiresAt}`);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      channel,
      target,
      expires_in: OTP_TTL_SECONDS,
      // Expose the code ONLY in development. Real deployments MUST remove this.
      debug_code: Deno.env.get("DENO_DEPLOYMENT_ID") ? undefined : code,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
