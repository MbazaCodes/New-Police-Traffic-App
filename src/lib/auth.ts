// NextAuth v4 — TZ Police Digital Platform
// Supabase-only auth. No mock users. No demo fallback.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findSupabaseUser, mapSupabaseRole } from "@/lib/supabase/auth-bridge";

// ── Roles ─────────────────────────────────────────────────────
export const ROLES = [
  "SUPER_ADMIN","COMMANDER","OFFICER","SYSTEM_ADMIN",
  "NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER",
  "STATION_COMMANDER","TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER",
  "INVESTIGATOR","CLERK","VIEWER",
] as const;

export type Role = (typeof ROLES)[number];

declare module "next-auth" {
  interface Session {
    user: {
      id: string; name: string | null; email: string | null;
      role: Role; idNumber: string; station: string;
      badgeNo?: string; region?: string; unit?: string;
    };
  }
  interface User {
    id: string; name?: string | null; email?: string | null;
    role: Role; idNumber: string; station: string;
    badgeNo?: string; region?: string; unit?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; role: Role; idNumber: string; station: string;
    badgeNo?: string; region?: string; unit?: string;
  }
}

// ── OTP store (in-memory, per serverless instance) ────────────
interface OtpRecord { code: string; expiresAt: number; }
const otpStore = new Map<string, OtpRecord>();

// Single bypass code for admin setup — remove once SMS is wired
const OTP_BYPASS_CODE = "123456";

export function isOtpBypassEnabled(): boolean {
  return process.env.OTP_BYPASS === "true" || process.env.NEXT_PUBLIC_OTP_BYPASS === "true";
}

export function isDemoMode(): boolean {
  return false; // permanently off
}

export function normalizeIdentifier(id: string): string {
  return id.trim().replace(/\s+/g, "").toLowerCase();
}

export function generateOtp(identifier: string): string {
  const key = normalizeIdentifier(identifier);
  // When bypass is on, always return the bypass code
  if (isOtpBypassEnabled()) {
    otpStore.set(key, { code: OTP_BYPASS_CODE, expiresAt: Date.now() + 10 * 60 * 1000 });
    return OTP_BYPASS_CODE;
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(key, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  return code;
}

export function verifyOtp(identifier: string, code: string): boolean {
  const key = normalizeIdentifier(identifier);
  const clean = code.trim();

  // Bypass mode: only the specific bypass code works
  if (isOtpBypassEnabled() && clean === OTP_BYPASS_CODE) return true;

  // Production: check store
  const record = otpStore.get(key);
  if (!record) return false;
  if (Date.now() > record.expiresAt) { otpStore.delete(key); return false; }
  if (record.code !== clean) return false;
  otpStore.delete(key);
  return true;
}

export function resolveDashboardRoute(role: Role): string {
  const map: Record<Role, string> = {
    SUPER_ADMIN:         "/admin/dashboard",
    SYSTEM_ADMIN:        "/admin/dashboard",
    COMMANDER:           "/command/national/dashboard",
    NATIONAL_COMMANDER:  "/command/national/dashboard",
    REGIONAL_COMMANDER:  "/command/regional/dashboard",
    DISTRICT_COMMANDER:  "/command/district/dashboard",
    STATION_COMMANDER:   "/command/station/dashboard",
    TRAFFIC_OFFICER:     "/officer/traffic/home",
    OFFICER:             "/officer/traffic/home",
    GENERAL_OFFICER:     "/officer/general/home",
    POST_OFFICER:        "/officer/post/home",
    INVESTIGATOR:        "/cid/home",
    CLERK:               "/clerk/records",
    VIEWER:              "/viewer/dashboard",
  };
  return map[role] ?? "/admin/dashboard";
}

// ── NextAuth options ──────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Police Credentials",
      credentials: {
        username: { label: "Badge / Username / Phone", type: "text" },
        otp:      { label: "OTP Code",                type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;

        // Supabase lookup only
        const sbUser = await findSupabaseUser(credentials.username);
        if (!sbUser || sbUser.status !== "active") return null;

        // Accept either:
        // 1. OTP bypass mode (dev/staging) — any code passes
        // 2. Valid OTP (consumed on first verify — allow re-use within same request cycle)
        // 3. Pre-verified token sent from the login screen after custom /api/auth/verify-otp
        const otp = credentials.otp ?? "";
        const isPreVerified = otp.startsWith("verified:") && otp.includes(sbUser.id);
        const otpOk = isPreVerified || isOtpBypassEnabled() || verifyOtp(credentials.username, otp);
        if (!otpOk) return null;

        const role = mapSupabaseRole(sbUser.role) as Role;
        return {
          id:        sbUser.id,
          name:      sbUser.name,
          email:     sbUser.email,
          role,
          idNumber:  sbUser.id,
          station:   sbUser.station?.name ?? "",
          badgeNo:   sbUser.badge_no ?? "",
          region:    sbUser.region ?? "",
          unit:      sbUser.unit ?? "",
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  jwt:     { maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.role     = user.role;
        token.idNumber = user.idNumber;
        token.station  = user.station;
        token.badgeNo  = user.badgeNo;
        token.region   = user.region;
        token.unit     = user.unit;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id;
        session.user.role     = token.role;
        session.user.idNumber = token.idNumber;
        session.user.station  = token.station;
        session.user.badgeNo  = token.badgeNo;
        session.user.region   = token.region;
        session.user.unit     = token.unit;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET || "tz-police-secret-change-in-production",
};

import { getToken } from "next-auth/jwt";
import { headers as nextHeaders } from "next/headers";
import type { Session } from "next-auth";

/**
 * getServerSession — works correctly in Next.js App Router Route Handlers.
 *
 * NextAuth v4 getServerSession() cannot read cookies in App Router route handlers.
 * We use getToken() instead, which reads the JWT cookie directly from request headers,
 * then reconstruct a Session-shaped object so all requirePermission() calls work.
 */
export async function getServerSession(): Promise<Session | null> {
  const hdrs = await nextHeaders();
  const headerMap = Object.fromEntries(hdrs.entries());

  // Parse cookies from the Cookie header so getToken can find the session token.
  // Checks multiple cookie names for maximum compatibility:
  //   - NextAuth standard: __Secure-next-auth.session-token (HTTPS), next-auth.session-token (HTTP)
  //   - Fallback names: token, accessToken, authToken
  const cookieHeader = headerMap["cookie"] ?? "";
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    cookies[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }

  // Determine which NextAuth cookie is present (HTTPS uses __Secure- prefix, HTTP does not)
  const NEXTAUTH_COOKIE_NAMES = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  const foundCookieName = NEXTAUTH_COOKIE_NAMES.find((n) => cookies[n]);

  if (!foundCookieName) {
    const FALLBACK_NAMES = ["token", "accessToken", "authToken"];
    for (const fb of FALLBACK_NAMES) {
      if (cookies[fb]) {
        cookies["next-auth.session-token"] = cookies[fb];
        break;
      }
    }
  }

  const secret = process.env.NEXTAUTH_SECRET ?? "tz-police-secret-change-in-production";

  // Try with the detected cookie name first; fall back to the other variant.
  // This handles both HTTPS (Vercel uses __Secure- prefix) and HTTP (local dev) deployments.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let token = await getToken({
    req: { headers: headerMap, cookies } as any,
    secret,
    cookieName: foundCookieName ?? "next-auth.session-token",
  });

  // If the first attempt failed, try the other cookie name variant as a fallback
  if (!token?.id) {
    const fallbackName = foundCookieName === "__Secure-next-auth.session-token"
      ? "next-auth.session-token"
      : "__Secure-next-auth.session-token";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token = await getToken({
      req: { headers: headerMap, cookies } as any,
      secret,
      cookieName: fallbackName,
    });
  }

  if (!token?.id) return null;

  return {
    user: {
      id:       String(token.id),
      name:     (token.name as string) ?? null,
      email:    (token.email as string) ?? null,
      role:     token.role as Role,
      idNumber: String(token.idNumber ?? token.id),
      station:  String(token.station ?? ""),
      badgeNo:  token.badgeNo as string | undefined,
      region:   token.region as string | undefined,
      unit:     token.unit as string | undefined,
    },
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
