// Logout — clears ALL NextAuth session cookies (secure + non-secure variants)
// so a stale/undecodable session can always be reset by logging out.
import { NextResponse } from "next/server";

const COOKIES_TO_CLEAR = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.callback-url",
  "next-auth.callback-url",
  "__Host-next-auth.csrf-token",
  "next-auth.csrf-token",
];

export async function POST() {
  const res = NextResponse.json({ ok: true, message: "Umetoka. Session imefutwa." });
  for (const name of COOKIES_TO_CLEAR) {
    res.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: name.startsWith("__"),
      sameSite: "lax",
    });
  }
  return res;
}

export async function GET() {
  return POST();
}
