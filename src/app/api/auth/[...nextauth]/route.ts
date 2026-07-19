// NextAuth handler — only handles NextAuth-specific paths:
// /api/auth/callback/*, /api/auth/session, /api/auth/csrf, /api/auth/signin, /api/auth/signout
// Our custom routes (login, verify-otp, otp) are handled by their own route.ts files

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

// Only intercept actual NextAuth paths, pass through our custom routes
async function guardedHandler(request: Request, context: { params: { nextauth: string[] } }) {
  const segments = context.params.nextauth ?? [];
  const path = segments.join("/");

  // Our custom routes — let them 404 through NextAuth (they have their own handlers)
  const customRoutes = ["login", "verify-otp", "verify", "send-otp", "otp", "logout", "session"];
  if (customRoutes.includes(path)) {
    return NextResponse.next();
  }

  return handler(request, context as Parameters<typeof handler>[1]);
}

export { guardedHandler as GET, guardedHandler as POST };
