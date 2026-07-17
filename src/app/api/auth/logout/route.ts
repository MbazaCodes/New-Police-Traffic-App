import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      message: "Use /api/auth/signout (NextAuth) to clear session cookies.",
      nextAuthSignOutPath: "/api/auth/signout",
    },
    { status: 200 },
  );
}
