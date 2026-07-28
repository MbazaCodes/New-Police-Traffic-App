// Logout — clears ALL NextAuth session cookies then redirects to root login page.
// All police roles land on / (the unified login page) after logout.
// Citizens can pass ?redirect=/citizen to go back to the citizen portal.
import { NextRequest, NextResponse } from "next/server";

const COOKIES_TO_CLEAR = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.callback-url",
  "next-auth.callback-url",
  "__Host-next-auth.csrf-token",
  "next-auth.csrf-token",
];

function clearCookiesAndRedirect(redirectTo: string) {
  const res = NextResponse.redirect(new URL(redirectTo, process.env.NEXTAUTH_URL || "http://localhost:3000"));
  for (const name of COOKIES_TO_CLEAR) {
    res.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: name.startsWith("__"),
      sameSite: "lax",
    });
  }
  // Also clear any Zustand-related localStorage markers (not possible server-side,
  // but we set a special cookie so the client knows to wipe localStorage on load)
  res.cookies.set("tz-force-clear", "1", {
    path: "/",
    maxAge: 30,  // short-lived: client reads it once then it auto-expires
    sameSite: "lax",
  });
  return res;
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const redirect = searchParams.get("redirect") || "/";
  return clearCookiesAndRedirect(redirect);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const redirect = searchParams.get("redirect") || "/";
  return clearCookiesAndRedirect(redirect);
}
