import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    /*
     * Match all API routes except auth and public endpoints
     */
    "/api/officers/:path*",
    "/api/citations/:path*",
    "/api/incidents/:path*",
    "/api/stations/:path*",
    "/api/posts/:path*",
    "/api/assignments/:path*",
    "/api/alerts/:path*",
    "/api/patrols/:path*",
    "/api/users/:path*",
    "/api/pf3/:path*",
    "/api/inspections/:path*",
    "/api/reports/:path*",
    "/api/audit-logs/:path*",
    "/api/search/:path*",
  ],
};
