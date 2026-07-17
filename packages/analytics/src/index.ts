// @tz-police/analytics — Event tracking and metrics

export interface AnalyticsEvent {
  name: string;
  category: "auth" | "search" | "citation" | "incident" | "patrol" | "alert" | "report";
  userId?: string;
  role?: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

const eventQueue: AnalyticsEvent[] = [];

export function track(event: Omit<AnalyticsEvent, "timestamp">): void {
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  eventQueue.push(fullEvent);
  if (eventQueue.length > 100) eventQueue.shift();
  console.log("[Analytics]", event.name, event.properties);
}

export function getEvents(): AnalyticsEvent[] {
  return [...eventQueue];
}

export function clearEvents(): void {
  eventQueue.length = 0;
}

// Predefined event trackers
export const analytics = {
  loginSuccess: (userId: string, role: string) =>
    track({ name: "login_success", category: "auth", userId, role }),
  loginFailed: (role: string) =>
    track({ name: "login_failed", category: "auth", role }),
  searchPerformed: (userId: string, type: string, query: string) =>
    track({ name: "search_performed", category: "search", userId, properties: { type, query } }),
  citationIssued: (userId: string, plate: string, offense: string) =>
    track({ name: "citation_issued", category: "citation", userId, properties: { plate, offense } }),
  incidentCreated: (userId: string, type: string, priority: string) =>
    track({ name: "incident_created", category: "incident", userId, properties: { type, priority } }),
  patrolStarted: (userId: string, area: string) =>
    track({ name: "patrol_started", category: "patrol", userId, properties: { area } }),
  alertBroadcast: (userId: string, audience: string, priority: string) =>
    track({ name: "alert_broadcast", category: "alert", userId, properties: { audience, priority } }),
  reportGenerated: (userId: string, reportType: string) =>
    track({ name: "report_generated", category: "report", userId, properties: { reportType } }),
};
