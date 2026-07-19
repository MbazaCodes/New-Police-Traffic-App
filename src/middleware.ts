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

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/police") || pathname.startsWith("/api/debug")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!canRoleAccessPath(role, pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
