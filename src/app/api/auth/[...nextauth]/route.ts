// NextAuth handler — handles /api/auth/* paths
//
// NOTE: Static routes (login/, verify-otp/, etc.) automatically take precedence
// over this catch-all in the App Router, so no manual guard is needed here.
// The previous guard returned NextResponse.next() (middleware-only API, invalid
// in route handlers) and blocked "session" — which, combined with a custom
// /api/auth/session route, made useSession() report a fake session shape.
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
