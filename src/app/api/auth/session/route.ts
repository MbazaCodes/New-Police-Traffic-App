import { NextResponse } from "next/server";
import { getServerSession, resolveDashboardRoute } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      session,
      redirectTo: resolveDashboardRoute(session.user.role),
    },
    { status: 200 },
  );
}
