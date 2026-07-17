import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/lib/auth";
import { canRoleAccessPath, getDefaultRouteForRole } from "@/lib/route-access";

const PUBLIC_PATHS = new Set([
  "/",
  "/unauthorized",
  "/api/auth/login",
  "/api/auth/otp",
  "/api/auth/verify",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/session",
  "/api/auth/logout",
]);

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
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname) || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api") && pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as Role | undefined;

  if (!role) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect root to role-specific dashboard when authenticated.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (!canRoleAccessPath(role, pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
