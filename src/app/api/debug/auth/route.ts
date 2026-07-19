// Debug endpoint — remove after confirming Supabase works
// GET /api/debug/auth?email=admin@tpfs.go.tz
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";

  const checks: Record<string, unknown> = {
    isSupabaseEnabled: isSupabaseEnabled(),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
    SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
  };

  const admin = getSupabaseAdmin();
  checks.adminClientCreated = Boolean(admin);

  if (admin && email) {
    // Test the query
    const { data, error } = await admin
      .from("users")
      .select("id, name, email, badge_no, status, role")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    checks.queryResult = data ?? null;
    checks.queryError = error?.message ?? null;

    // Also count total users
    const { count } = await admin
      .from("users")
      .select("*", { count: "exact", head: true });
    checks.totalUsers = count;
  }

  return NextResponse.json(checks);
}
