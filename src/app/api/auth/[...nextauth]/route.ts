// NextAuth handler — handles /api/auth/* paths
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

async function guardedHandler(
  request: Request,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const params = await context.params;
  const segments = params.nextauth ?? [];
  const path = segments.join("/");

  const customRoutes = ["login", "verify-otp", "verify", "send-otp", "otp", "logout", "session"];
  if (customRoutes.includes(path)) {
    return NextResponse.next();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(request, context as any);
}

export { guardedHandler as GET, guardedHandler as POST };
