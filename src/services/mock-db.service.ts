import { readFile } from "fs/promises";
import path from "path";

type JsonRecord = Record<string, unknown>;

async function readJsonArray<T extends JsonRecord>(fileName: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), "Mock Database", "exports", "json", fileName);
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

async function readStationsFallback(): Promise<JsonRecord[]> {
  const filePath = path.join(process.cwd(), "Mock Database", "app", "mock-database", "seeds", "stations", "stations.sql");
  const raw = await readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().toUpperCase().startsWith("INSERT INTO STATIONS"))
    .map((line) => {
      const valuesMatch = line.match(/VALUES\s*\((.*)\)\s*ON CONFLICT/i);
      if (!valuesMatch) {
        return { raw: line };
      }

      const fields = valuesMatch[1].split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map((field) => field.trim());
      return {
        regionId: fields[0],
        stationCode: fields[1]?.replace(/^'|'$/g, ""),
        stationName: fields[2]?.replace(/^'|'$/g, ""),
        ward: fields[3]?.replace(/^'|'$/g, ""),
        active: fields[4]?.toLowerCase() === "true",
      };
    });
}

export async function loadCitizens() {
  return readJsonArray("citizens.json");
}

export async function loadVehicles() {
  return readJsonArray("vehicles.json");
}

export async function loadOfficers() {
  return readJsonArray("officers.json");
}

export async function loadStations() {
  try {
    return await readJsonArray("stations.json");
  } catch {
    return readStationsFallback();
  }
}

export async function loadCases() {
  return readJsonArray("cases.json");
}

export async function loadMockDatabase() {
  const [citizens, vehicles, officers, stations, cases] = await Promise.all([
    loadCitizens(),
    loadVehicles(),
    loadOfficers(),
    loadStations(),
    loadCases(),
  ]);

  const onlineOfficers = officers.filter((officer: JsonRecord) => {
    const status = String(officer.status ?? officer.state ?? "").toLowerCase();
    return status ? ["online", "active", "duty", "on-duty"].includes(status) : true;
  }).length;

  const openCases = cases.filter((item: JsonRecord) => {
    const status = String(item.status ?? item.caseStatus ?? item.state ?? "").toLowerCase();
    return !status || ["open", "active", "pending", "investigating"].includes(status);
  }).length;

  const todayFines = vehicles.reduce((sum, vehicle: JsonRecord) => {
    const fines = Array.isArray(vehicle.fines) ? vehicle.fines : [];
    return sum + fines.length;
  }, 0);

  return {
    citizens,
    vehicles,
    officers,
    stations,
    cases,
    summary: {
      totalRecords: citizens.length + vehicles.length + officers.length + stations.length + cases.length,
      onlineOfficers,
      openCases,
      todayFines,
      syncEnabled: process.env.NEXT_PUBLIC_SYNC === "true",
      offlineEnabled: process.env.NEXT_PUBLIC_OFFLINE === "true",
    },
  };
}