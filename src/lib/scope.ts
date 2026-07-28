import type { Session } from "next-auth";
import type { Role } from "@/lib/auth";
import type { ScopeContext } from "@/lib/rbac";

export function getScopeContext(session: Session | null): ScopeContext {
  const role = (session?.user?.role ?? "VIEWER") as Role;
  const station = session?.user?.station ?? "";

  // Mock-database-first station to district/region mapping.
  let region = "National";
  let district = "National";

  const lowerStation = station.toLowerCase();
  if (lowerStation.includes("oysterbay") || lowerStation.includes("kinondoni")) {
    region = "Dar es Salaam";
    district = "Kinondoni";
  } else if (lowerStation.includes("ilala")) {
    region = "Dar es Salaam";
    district = "Ilala";
  }

  return {
    role,
    station,
    district,
    region,
    ownerId: session?.user?.id,
  };
}

export function annotateRecordScope<T extends Record<string, unknown>>(
  record: T,
  context: ScopeContext,
): T & { region: string; district: string; station: string; ownerId?: string; isPublic: boolean } {
  return {
    ...record,
    region: String(record.region ?? context.region ?? "National"),
    district: String(record.district ?? context.district ?? "National"),
    station: String(record.station ?? context.station ?? ""),
    ownerId: String(record.ownerId ?? context.ownerId ?? ""),
    isPublic: Boolean(record.isPublic ?? false),
  };
}
