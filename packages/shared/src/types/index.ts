// ===== TZ Police Digital Platform — Shared Types =====
// Used by: PWA (Next.js), Web (Next.js), and mirrored in Flutter (Dart)

// ===== User & Auth =====
export type UserRole = "officer-traffic" | "officer-general" | "admin" | "commander";

export interface User {
  id: string;
  name: string;
  shortName: string;
  rank: string;
  rankShort: string;
  role: UserRole;
  idNumber: string;
  station: string;
  unit: string;
  phone: string;
  email: string;
  status: "active" | "off-duty" | "on-leave" | "suspended";
  avatar?: string | null;
}

// ===== Officer =====
export interface Officer {
  id: string;
  name: string;
  rank: string;
  unit: string;
  station: string;
  status: "active" | "break" | "off-duty";
  patrols: number;
  citations: number;
  incidents: number;
  hoursToday: number;
  phone: string;
}

// ===== Vehicle =====
export interface Vehicle {
  plate: string;
  model: string;
  type: string;
  year: string;
  color: string;
  accidentInvolved?: boolean;
}

// ===== Driver =====
export interface Driver {
  name: string;
  gender: string;
  license: string;
  licenseClass: string;
  nida: string;
  mobile: string;
}

// ===== Insurance =====
export interface Insurance {
  company: string;
  policy: string;
  expires: string;
  valid: boolean;
}

// ===== Violation =====
export interface Violation {
  id: number;
  name: string;
  date: string;
  area: string;
  fine: string;
  paid: boolean;
}

// ===== Search Result (Vehicle) =====
export interface VehicleSearchResult {
  plate: string;
  date: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  alertMessage: string;
  insurance: Insurance;
  driver: Driver;
  vehicle: Vehicle;
  payment: {
    hasOutstanding: boolean;
    totalViolations: number;
  };
  violations: Violation[];
}

// ===== Citizen =====
export interface CitizenDocument {
  type: string;
  number: string;
  status: string;
}

export interface CitizenVehicle {
  plate: string;
  model: string;
  color: string;
  year: string;
}

export interface CitizenHistory {
  date: string;
  type: string;
  caseRef: string;
  station: string;
}

export interface CitizenResult {
  name: string;
  photo: string | null;
  nida: string;
  mobile: string;
  gender: string;
  dob: string;
  age: number;
  address: string;
  occupation: string;
  status: string;
  statusColor: string;
  alerts: string[];
  criminalRecord: {
    hasRecord: boolean;
    cases: number;
    convictions: number;
  };
  documents: CitizenDocument[];
  vehicles: CitizenVehicle[];
  history: CitizenHistory[];
}

// ===== Citation =====
export interface Citation {
  id: string;
  plate: string;
  offense: string;
  driver: string;
  date: string;
  time?: string;
  location?: string;
  amount: string;
  status: "paid" | "unpaid";
  officer: string;
}

export interface CitationPrefill {
  plate: string;
  model: string;
  color: string;
  vehicleType: string;
  driverName: string;
  driverLicense: string;
  driverPhone: string;
  driverNida: string;
}

// ===== Alert =====
export interface Alert {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  time: string;
  message: string;
  source: string;
  sourceBg: string;
  dotColor: string;
  borderColor: string;
  unread: boolean;
  category: "all" | "mine";
  important: boolean;
}

// ===== Incident =====
export type IncidentStatus = "urgent" | "active" | "resolved" | "investigating";
export type Priority = "high" | "medium" | "low";

export interface Incident {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: IncidentStatus;
  priority: Priority;
  assignedTo: string;
  description: string;
  lat?: number;
  lng?: number;
}

// ===== Station =====
export interface Station {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  officersCount: number;
  postsCount: number;
  status: "active" | "maintenance";
  established: string;
}

// ===== Post =====
export interface Post {
  id: string;
  name: string;
  stationId: string;
  stationName: string;
  location: string;
  type: "Traffic" | "Patrol";
  officersCount: number;
  status: "active" | "inactive";
  shift: string;
}

// ===== Assignment =====
export interface Assignment {
  id: string;
  officerId: string;
  officerName: string;
  officerRank: string;
  stationId: string;
  stationName: string;
  postId: string;
  postName: string;
  role: string;
  assignedDate: string;
  status: "active" | "on-leave";
}

// ===== PF3 (Accident Report Form) =====
export interface PF3Form {
  referenceNo: string;
  region: string;
  district: string;
  station: string;
  accidentType: string;
  severity: string;
  weather: string;
  roadSurface: string;
  lightCondition: string;
  vehicles: PF3Vehicle[];
  casualties: PF3Casualty[];
  witnesses: PF3Witness[];
}

export interface PF3Vehicle {
  plate: string;
  make: string;
  year: string;
  color: string;
  driver: string;
  license: string;
  direction: string;
  damage: string;
  insured: boolean;
}

export interface PF3Casualty {
  name: string;
  type: string;
  injury: string;
  hospital: string;
  status: string;
}

export interface PF3Witness {
  name: string;
  phone: string;
  statement: string;
}

// ===== Vehicle Inspection =====
export interface InspectionItem {
  label: string;
  status: string;
  pass: boolean;
}

export interface VehicleInspection {
  plate: string;
  model: string;
  color: string;
  owner: string;
  phone: string;
  location: string;
  datetime: string;
  documents: InspectionItem[];
  mechanical: InspectionItem[];
  photos: { label: string }[];
}

// ===== Patrol =====
export interface PatrolStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface ActivePatrol {
  id: string;
  officer: string;
  area: string;
  start: string;
  distance: string;
  status: "active";
  progress: number;
}

// ===== Dashboard =====
export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: string;
}

export interface TrendPoint {
  day: string;
  incidents: number;
  citations: number;
}

export interface OffenseDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RegionStat {
  region: string;
  officers: number;
  incidents: number;
  citations: number;
  resolved: number;
}
