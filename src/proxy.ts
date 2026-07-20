import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/lib/auth";
import { canRoleAccessPath, getDefaultRouteForRole } from "@/lib/route-access";

const PUBLIC_PATHS = new Set([
  "/unauthorized",
  "/api/auth/login",
  "/api/auth/otp",
  "/api/auth/verify",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/session",
  "/api/auth/logout",
  "/api/police/login",
  "/api/police/verify-otp",
  "/api/debug/auth",
]);

const PUBLIC_LOGIN_ENTRY_PATHS = new Set(["/", "/admin", "/command"]);

function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/police-logo")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/police") || pathname.startsWith("/api/debug")) {
    return NextResponse.next();
  }

  // CRITICAL: secret must use the SAME fallback as authOptions in lib/auth.ts.
  // Previously this passed possibly-undefined NEXTAUTH_SECRET while the cookie
  // was signed with the fallback — decode failed silently → every navigation
  // bounced back to the dashboard as "no session".
  const secret = process.env.NEXTAUTH_SECRET || "tz-police-secret-change-in-production";

  // Try the secure cookie name first (Vercel/HTTPS), then the plain one (local/HTTP).
  let token = await getToken({ req: request, secret, cookieName: "__Secure-next-auth.session-token" });
  if (!token?.id) {
    token = await getToken({ req: request, secret, cookieName: "next-auth.session-token" });
  }
  if (!token?.id) {
    // Final fallback: NextAuth default auto-detection
    token = await getToken({ req: request, secret });
  }
  const role = token?.role as Role | undefined;

  // Root path acts as auth-aware entrypoint.
  // - unauthenticated: show login app on /
  // - authenticated: redirect to role-specific default route
  if (pathname === "/") {
    if (!role) {
      if (hostname.toLowerCase().includes("admin-web")) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!role) {
    if (PUBLIC_LOGIN_ENTRY_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Uthibitishaji umekosea. Tafadhali ingia tena." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/?reason=session_expired", request.url));
  }

  if (!canRoleAccessPath(role, pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Huna ruhusa ya kufikia rasilimali hii." }, { status: 403 });
    }

    const defaultRoute = getDefaultRouteForRole(role);
    if (pathname !== defaultRoute) {
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }

    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|icon|manifest|sw\.js|robots\.txt|police-logo).*)",
  ],
};
