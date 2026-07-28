// Citizen Portal Auth — client-side session management
"use client";

export type CitizenSession = {
  id: string;
  citizenId: string | null;
  name: string;
  phone: string;
  email: string;
  nida: string;
  isDriver: boolean;
  driverPoints: number;
  goodConductPoints: number;
  profileComplete: boolean;
};

const KEY = "citizen-session";

export function saveCitizenSession(data: CitizenSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(data));
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getCitizenSession(): CitizenSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearCitizenSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
  localStorage.removeItem("citizen-token");
}

export function getCitizenToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("citizen-token") || "";
}

export async function citizenFetch(url: string, opts: RequestInit = {}) {
  const token = getCitizenToken();
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { data: json, error: res.ok ? null : json.error || "Hitilafu ya seva" };
}
