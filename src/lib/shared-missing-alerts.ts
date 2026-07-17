export type MissingAlertType = "person" | "car" | "device";

export interface MissingAlertRecord {
  id: string;
  type: MissingAlertType;
  title: string;
  identifier: string;
  details: string;
  imageUrl?: string;
  lastSeen?: string;
  createdAt: string;
  createdBy: string;
  station: string;
  active: boolean;
}

const STORAGE_KEY = "tpf-shared-missing-alerts";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export function getMissingAlerts(): MissingAlertRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MissingAlertRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMissingAlerts(items: MissingAlertRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addMissingAlert(
  item: Omit<MissingAlertRecord, "id" | "createdAt" | "active">
): MissingAlertRecord {
  const next: MissingAlertRecord = {
    ...item,
    id: `MS-${Date.now()}`,
    createdAt: new Date().toISOString(),
    active: true,
  };
  const current = getMissingAlerts();
  saveMissingAlerts([next, ...current]);
  return next;
}

export function findMatchingMissingAlerts(
  query: string,
  type?: MissingAlertType
): MissingAlertRecord[] {
  const q = normalize(query);
  if (!q) return [];
  return getMissingAlerts().filter((item) => {
    if (!item.active) return false;
    if (type && item.type !== type) return false;
    const haystack = normalize(
      `${item.title} ${item.identifier} ${item.details} ${item.lastSeen ?? ""} ${item.station}`
    );
    return haystack.includes(q);
  });
}
