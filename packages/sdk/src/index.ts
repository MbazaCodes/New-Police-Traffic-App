// @tz-police/sdk — API client SDK for all apps (PWA, Web, Flutter bridge)

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });
    const data = await res.json();
    return { data, status: res.status, error: !res.ok ? data.error : undefined };
  } catch {
    return { status: 500, error: "Network error" };
  }
}

// ===== Auth =====
export const authApi = {
  sendOtp: (identifier: string) =>
    request("/auth/send-otp", { method: "POST", body: JSON.stringify({ identifier }) }),
  verifyOtp: (identifier: string, code: string) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ identifier, code }) }),
  session: () => request("/auth/session"),
  signOut: () => request("/auth/signout", { method: "POST" }),
};

// ===== Officers =====
export const officersApi = {
  list: () => request("/officers"),
  get: (id: string) => request(`/officers/${id}`),
  create: (data: unknown) => request("/officers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/officers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/officers/${id}`, { method: "DELETE" }),
};

// ===== Citations =====
export const citationsApi = {
  list: (params?: { status?: string; officerId?: string }) =>
    request(`/citations${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""}`),
  get: (id: string) => request(`/citations/${id}`),
  create: (data: unknown) => request("/citations", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/citations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ===== Incidents =====
export const incidentsApi = {
  list: (params?: { status?: string }) =>
    request(`/incidents${params ? `?${new URLSearchParams(params)}` : ""}`),
  get: (id: string) => request(`/incidents/${id}`),
  create: (data: unknown) => request("/incidents", { method: "POST", body: JSON.stringify(data) }),
  assign: (id: string, officerId: string) =>
    request(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify({ assignedTo: officerId }) }),
  updateStatus: (id: string, status: string) =>
    request(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ===== Stations =====
export const stationsApi = {
  list: () => request("/stations"),
  get: (id: string) => request(`/stations/${id}`),
  create: (data: unknown) => request("/stations", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/stations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/stations/${id}`, { method: "DELETE" }),
};

// ===== Posts =====
export const postsApi = {
  list: (stationId?: string) =>
    request(`/posts${stationId ? `?stationId=${stationId}` : ""}`),
  create: (data: unknown) => request("/posts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/posts/${id}`, { method: "DELETE" }),
};

// ===== Assignments =====
export const assignmentsApi = {
  list: () => request("/assignments"),
  create: (data: unknown) => request("/assignments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: unknown) => request(`/assignments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/assignments/${id}`, { method: "DELETE" }),
};

// ===== Alerts =====
export const alertsApi = {
  list: () => request("/alerts"),
  broadcast: (data: { title: string; message: string; audience: string; priority: string }) =>
    request("/alerts", { method: "POST", body: JSON.stringify(data) }),
};

// ===== Patrols =====
export const patrolsApi = {
  list: () => request("/patrols"),
  start: (data: { officerId: string; area: string }) =>
    request("/patrols", { method: "POST", body: JSON.stringify(data) }),
  end: (id: string) => request(`/patrols/${id}`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) }),
};

// ===== Search =====
export const searchApi = {
  vehicle: (plate: string) => request(`/search/vehicle?plate=${encodeURIComponent(plate)}`),
  citizen: (query: string, type: "name" | "nida" | "mobile") =>
    request(`/search/citizen?query=${encodeURIComponent(query)}&type=${type}`),
};

// ===== Reports =====
export const reportsApi = {
  summary: () => request("/reports/summary"),
  auditLogs: () => request("/audit-logs"),
};
