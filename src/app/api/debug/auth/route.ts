// Debug endpoint — diagnose session/auth state
// GET /api/debug/auth
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { headers as nextHeaders } from "next/headers";
import { getSupabaseAdminAny, isSupabaseEnabled } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const hdrs = await nextHeaders();
  const headerMap = Object.fromEntries(hdrs.entries());

  // Parse cookies
  const cookieHeader = headerMap["cookie"] ?? "";
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    cookies[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }

  const cookieNames = Object.keys(cookies);
  const hasSessionCookie =
    cookieNames.some((k) => k.includes("next-auth.session-token"));

  // Attempt token decode
  let token: Record<string, unknown> | null = null;
  let tokenError: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token = await getToken({
      req: { headers: headerMap, cookies } as any,
      secret: process.env.NEXTAUTH_SECRET ?? "tz-police-secret-change-in-production",
    }) as Record<string, unknown> | null;
  } catch (e) {
    tokenError = String(e);
  }

  // Supabase env check
  const supabaseChecks = {
    isSupabaseEnabled: isSupabaseEnabled(),
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL      ? "SET" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY     ? "SET" : "MISSING",
  };

  // Optional: count users if Supabase is wired
  let totalUsers: number | string = "skipped";
  if (isSupabaseEnabled()) {
    try {
      const admin = getSupabaseAdminAny();
      const { count } = await admin.from("users").select("*", { count: "exact", head: true });
      totalUsers = count ?? 0;
    } catch (e) {
      totalUsers = "error: " + String(e);
    }
  }

  return NextResponse.json({
    // Auth state
    hasSessionCookie,
    cookieNames,
    tokenFound: Boolean(token?.id),
    tokenId:    token?.id    ?? null,
    tokenRole:  token?.role  ?? null,
    tokenName:  token?.name  ?? null,
    tokenError,

    // Env
    NEXTAUTH_SECRET_SET: Boolean(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL:        process.env.NEXTAUTH_URL ?? "NOT SET",
    NODE_ENV:            process.env.NODE_ENV,

    // Supabase
    ...supabaseChecks,
    totalUsers,
  });
}
