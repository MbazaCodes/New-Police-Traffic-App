"use client";

/**
 * Client-side token utilities.
 *
 * Checks multiple cookie names AND falls back to localStorage / sessionStorage
 * so the token is always found regardless of how it was stored.
 *
 * Also provides an `authFetch` wrapper that attaches the token to both
 * `Authorization` and `x-auth-token` headers on every request.
 */

// ── Token discovery ────────────────────────────────────────────

const COOKIE_NAMES = [
  "__Secure-next-auth.session-token",  // Vercel / HTTPS
  "next-auth.session-token",           // localhost / HTTP
  "token",
  "accessToken",
  "authToken",
];

/** Read a cookie by name from document.cookie */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * getClientToken — returns the first non-empty token found, checking:
 * 1. Multiple cookie names
 * 2. localStorage keys
 * 3. sessionStorage keys
 */
export function getClientToken(): string | null {
  // 1. Cookies
  for (const name of COOKIE_NAMES) {
    const val = getCookie(name);
    if (val) return val;
  }

  // 2. localStorage
  if (typeof window !== "undefined") {
    for (const key of ["token", "accessToken", "authToken", "next-auth.session-token"]) {
      try {
        const val = localStorage.getItem(key);
        if (val) return val;
      } catch { /* storage may be disabled */ }
    }
  }

  // 3. sessionStorage
  if (typeof window !== "undefined") {
    for (const key of ["token", "accessToken", "authToken", "next-auth.session-token"]) {
      try {
        const val = sessionStorage.getItem(key);
        if (val) return val;
      } catch { /* storage may be disabled */ }
    }
  }

  return null;
}

/**
 * Clear all client-side tokens (used after logout / 401).
 */
export function clearClientToken(): void {
  if (typeof document === "undefined") return;
  for (const name of COOKIE_NAMES) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    for (const key of ["token", "accessToken", "authToken", "next-auth.session-token"]) {
      try { localStorage.removeItem(key); } catch { /* noop */ }
      try { sessionStorage.removeItem(key); } catch { /* noop */ }
    }
  }
}

// ── authFetch ──────────────────────────────────────────────────

/**
 * Enhanced fetch that:
 * - Attaches token to both `Authorization: Bearer <token>` AND `x-auth-token` headers
 * - Intercepts 401 responses and redirects to login
 * - Returns typed JSON
 */
export async function authFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = getClientToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-auth-token"] = token;
  }

  try {
    const res = await fetch(input, { ...init, headers });

    // 401 — session expired / not authenticated
    if (res.status === 401) {
      clearClientToken();
      if (typeof window !== "undefined") {
        window.location.href = "/?reason=session_expired";
      }
      return { data: null, error: "Kikao chako kimekwisha. Tafadhali ingia tena.", status: 401 };
    }

    // 403 — forbidden
    if (res.status === 403) {
      return { data: null, error: "Huna ruhusa ya kufanya hivyo.", status: 403 };
    }

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error ?? "Hitilafu ya seva", status: res.status };
    }

    return { data: json as T, error: null, status: res.status };
  } catch (err) {
    return { data: null, error: "Hitilafu ya mtandao. Hakikisha una muunganisho wa intaneti.", status: 0 };
  }
}