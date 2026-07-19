// send-otp — delegates to /api/auth/login
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return fetch(new URL("/api/auth/login", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json()).then(d => NextResponse.json(d));
}
