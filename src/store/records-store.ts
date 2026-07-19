"use client";

import { create } from "zustand";

// ===== Admin Shared Types =====
export interface AdminUserRecord {
  id: string;
  name: string;
  role: "commander" | "admin" | "regional" | "district-admin" | "commissioner" | "all-staffs";
  rank: string;
  email: string;
  station: string;
  status: "active" | "suspended";
  lastLogin: string;
}

export interface AdminStationRecord {
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

export interface AdminPostRecord {
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

export interface AdminAssignmentRecord {
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

export interface AdminUnassignedOfficer {
  id: string;
  name: string;
  rank: string;
}

export interface AdminAlertHistoryRecord {
  id: string;
  title: string;
  audience: string;
  priority: "normal" | "high";
  sentBy: string;
  date: string;
  time: string;
  recipients: number;
}

export interface AdminIncidentRecord {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: "urgent" | "active" | "resolved" | "investigating";
  priority: "high" | "medium" | "low";
  assignedTo: string;
  description: string;
}

export interface AdminCitationRecord {
  id: string;
  plate: string;
  offense: string;
  driver: string;
  date: string;
  amount: string;
  status: "paid" | "unpaid";
  officer: string;
}

export interface AdminPatrolRecord {
  id: string;
  officer: string;
  area: string;
  start: string;
  distance: string;
  status: "active" | "completed";
  progress: number;
}

// ===== Record Types =====
export interface CitationRecord {
  id: string;
  citationNumber: string;
  plate: string;
  offense: string;
  driverName: string;
  driverLicense: string;
  driverPhone: string;
  date: string;
  time: string;
  location: string;
  amount: string;
  status: "paid" | "unpaid";
  officer: string;
  notes?: string;
  createdAt: string;
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: "urgent" | "active" | "resolved" | "investigating";
  priority: "high" | "medium" | "low";
  assignedTo: string;
  description: string;
  createdAt: string;
}

export interface PatrolRecord {
  id: string;
  patrolNumber: string;
  officer: string;
  area: string;
  startTime: string;
  endTime?: string;
  distance: string;
  status: "active" | "completed";
  progress: number;
  notes?: string;
  createdAt: string;
}

export interface AccidentRecord {
  id: string;
  accidentNumber: string;
  date: string;
  time: string;
  location: string;
  severity: string;
  vehicles: { plate: string; model: string; color: string; damage: string }[];
  people: { name: string; role: string; phone: string; condition: string }[];
  description: string;
  evidence: { name: string; size: string; type: string }[];
  status: "draft" | "submitted";
  createdAt: string;
}

export interface InspectionRecord {
  id: string;
  inspectionNumber: string;
  plate: string;
  model: string;
  color: string;
  owner: string;
  officer: string;
  date: string;
  result: "pass" | "fail";
  documentsChecked: number;
  mechanicalChecked: number;
  notes?: string;
  createdAt: string;
}

export interface PF3Record {
  id: string;
  referenceNo: string;
  region: string;
  district: string;
  station: string;
  accidentType: string;
  severity: string;
  date: string;
  vehicles: number;
  casualties: number;
  witnesses: number;
  status: "draft" | "submitted";
  createdAt: string;
}

export interface WarningRecord {
  id: string;
  warningNumber: string;
  citizenName: string;
  citizenNida: string;
  citizenPhone: string;
  reason: string;
  location: string;
  date: string;
  officer: string;
  notes?: string;
  createdAt: string;
}

export interface ArrestRecord {
  id: string;
  arrestNumber: string;
  suspectName: string;
  suspectNida: string;
  suspectPhone: string;
  reason: string;
  location: string;
  date: string;
  time: string;
  officer: string;
  station: string;
  status: "detained" | "released" | "transferred";
  notes?: string;
  createdAt: string;
}

interface RecordsState {
  // Records
  citations: CitationRecord[];
  incidents: IncidentRecord[];
  patrols: PatrolRecord[];
  accidents: AccidentRecord[];
  inspections: InspectionRecord[];
  pf3Forms: PF3Record[];
  warnings: WarningRecord[];
  arrests: ArrestRecord[];

  // Admin shared entities (cross-route: create-user-page / create-post-page)
  adminUsers: AdminUserRecord[];
  adminStations: AdminStationRecord[];
  adminPosts: AdminPostRecord[];
  adminAssignments: AdminAssignmentRecord[];
  adminUnassigned: AdminUnassignedOfficer[];
  adminAlertsHistory: AdminAlertHistoryRecord[];
  adminIncidents: AdminIncidentRecord[];
  adminCitations: AdminCitationRecord[];
  adminPatrols: AdminPatrolRecord[];

  // Create actions
  addCitation: (data: Omit<CitationRecord, "id" | "createdAt" | "citationNumber" | "status">) => string;
  addIncident: (data: Omit<IncidentRecord, "id" | "createdAt" | "incidentNumber">) => string;
  addPatrol: (data: Omit<PatrolRecord, "id" | "createdAt" | "patrolNumber" | "status" | "progress">) => string;
  addAccident: (data: Omit<AccidentRecord, "id" | "createdAt" | "accidentNumber" | "status">) => string;
  addInspection: (data: Omit<InspectionRecord, "id" | "createdAt" | "inspectionNumber">) => string;
  addPF3: (data: Omit<PF3Record, "id" | "createdAt" | "referenceNo" | "status">) => string;
  addWarning: (data: Omit<WarningRecord, "id" | "createdAt" | "warningNumber">) => string;
  addArrest: (data: Omit<ArrestRecord, "id" | "createdAt" | "arrestNumber" | "status">) => string;

  // Update actions
  updateCitation: (id: string, data: Partial<CitationRecord>) => void;
  updateIncident: (id: string, data: Partial<IncidentRecord>) => void;
  endPatrol: (id: string) => void;
  submitAccident: (id: string) => void;
  submitPF3: (id: string) => void;

  // Delete
  deleteRecord: (type: keyof RecordsState, id: string) => void;

  // Admin entity actions
  addAdminUser: (data: Omit<AdminUserRecord, "id" | "lastLogin" | "status">) => string;
  updateAdminUser: (id: string, data: Partial<AdminUserRecord>) => void;
  setAdminUserStatus: (id: string, status: "active" | "suspended") => void;

  addAdminStation: (data: Omit<AdminStationRecord, "id" | "officersCount" | "postsCount" | "established">) => string;
  updateAdminStation: (id: string, data: Partial<AdminStationRecord>) => void;

  addAdminPost: (data: Omit<AdminPostRecord, "id" | "officersCount" | "status">) => string;
  updateAdminPost: (id: string, data: Partial<AdminPostRecord>) => void;

  addAdminAssignment: (data: Omit<AdminAssignmentRecord, "id" | "assignedDate" | "status">) => string;
  removeAdminAssignment: (id: string) => void;
  removeAdminUnassigned: (officerId: string) => void;

  addAdminAlertHistory: (data: Omit<AdminAlertHistoryRecord, "id" | "date" | "time">) => void;

  updateAdminIncident: (id: string, data: Partial<AdminIncidentRecord>) => void;

  endAdminPatrol: (id: string) => void;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  citations: [],
  incidents: [],
  patrols: [],
  accidents: [],
  inspections: [],
  pf3Forms: [],
  warnings: [],
  arrests: [],

  // Admin shared entities — start EMPTY, populated from API
  adminUsers: [],
  adminStations: [],
  adminPosts: [],
  adminAssignments: [],
  adminUnassigned: [],
  adminAlertsHistory: [],
  adminIncidents: [],
  adminCitations: [],
  adminPatrols: [],

  addCitation: (data) => {
    const id = genId();
    const count = get().citations.length + 1;
    const record: CitationRecord = {
      ...data,
      id,
      citationNumber: `CT-2026-${String(count).padStart(4, "0")}`,
      status: "unpaid",
      createdAt: now(),
    };
    set((s) => ({ citations: [record, ...s.citations] }));
    return id;
  },

  addIncident: (data) => {
    const id = genId();
    const count = get().incidents.length + 342;
    const record: IncidentRecord = {
      ...data,
      id,
      incidentNumber: `INC-2026-${String(count).padStart(4, "0")}`,
      createdAt: now(),
    };
    set((s) => ({ incidents: [record, ...s.incidents] }));
    return id;
  },

  addPatrol: (data) => {
    const id = genId();
    const count = get().patrols.length + 1;
    const record: PatrolRecord = {
      ...data,
      id,
      patrolNumber: `PT-2026-${String(count).padStart(3, "0")}`,
      status: "active",
      progress: 0,
      createdAt: now(),
    };
    set((s) => ({ patrols: [record, ...s.patrols] }));
    return id;
  },

  addAccident: (data) => {
    const id = genId();
    const count = get().accidents.length + 1;
    const record: AccidentRecord = {
      ...data,
      id,
      accidentNumber: `ACC-2026-${String(count).padStart(4, "0")}`,
      status: "draft",
      createdAt: now(),
    };
    set((s) => ({ accidents: [record, ...s.accidents] }));
    return id;
  },

  addInspection: (data) => {
    const id = genId();
    const count = get().inspections.length + 1;
    const record: InspectionRecord = {
      ...data,
      id,
      inspectionNumber: `INS-2026-${String(count).padStart(4, "0")}`,
      createdAt: now(),
    };
    set((s) => ({ inspections: [record, ...s.inspections] }));
    return id;
  },

  addPF3: (data) => {
    const id = genId();
    const count = get().pf3Forms.length + 1;
    const record: PF3Record = {
      ...data,
      id,
      referenceNo: `PF3/DSM/2026/${String(count).padStart(5, "0")}`,
      status: "draft",
      createdAt: now(),
    };
    set((s) => ({ pf3Forms: [record, ...s.pf3Forms] }));
    return id;
  },

  addWarning: (data) => {
    const id = genId();
    const count = get().warnings.length + 1;
    const record: WarningRecord = {
      ...data,
      id,
      warningNumber: `WRN-2026-${String(count).padStart(4, "0")}`,
      createdAt: now(),
    };
    set((s) => ({ warnings: [record, ...s.warnings] }));
    return id;
  },

  addArrest: (data) => {
    const id = genId();
    const count = get().arrests.length + 1;
    const record: ArrestRecord = {
      ...data,
      id,
      arrestNumber: `ARR-2026-${String(count).padStart(4, "0")}`,
      status: "detained",
      createdAt: now(),
    };
    set((s) => ({ arrests: [record, ...s.arrests] }));
    return id;
  },

  updateCitation: (id, data) =>
    set((s) => ({
      citations: s.citations.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  updateIncident: (id, data) =>
    set((s) => ({
      incidents: s.incidents.map((i) => (i.id === id ? { ...i, ...data } : i)),
    })),

  endPatrol: (id) =>
    set((s) => ({
      patrols: s.patrols.map((p) =>
        p.id === id ? { ...p, status: "completed", endTime: now(), progress: 100 } : p
      ),
    })),

  submitAccident: (id) =>
    set((s) => ({
      accidents: s.accidents.map((a) => (a.id === id ? { ...a, status: "submitted" } : a)),
    })),

  submitPF3: (id) =>
    set((s) => ({
      pf3Forms: s.pf3Forms.map((p) => (p.id === id ? { ...p, status: "submitted" } : p)),
    })),

  deleteRecord: (type, id) =>
    set((s) => {
      const records = s[type] as { id: string }[];
      if (Array.isArray(records)) {
        return { [type]: records.filter((r) => r.id !== id) } as Partial<RecordsState>;
      }
      return {};
    }),

  // ── Admin entity actions ────────────────────────────────────────────────
  addAdminUser: (data) => {
    const id = `ADM-${String(get().adminUsers.length + 6).padStart(3, "0")}`;
    const record: AdminUserRecord = {
      ...data,
      id,
      status: "active",
      lastLogin: "—",
    };
    set((s) => ({ adminUsers: [record, ...s.adminUsers] }));
    return id;
  },
  updateAdminUser: (id, data) =>
    set((s) => ({
      adminUsers: s.adminUsers.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),
  setAdminUserStatus: (id, status) =>
    set((s) => ({
      adminUsers: s.adminUsers.map((u) => (u.id === id ? { ...u, status } : u)),
    })),

  addAdminStation: (data) => {
    const id = `ST-${String(get().adminStations.length + 8).padStart(3, "0")}`;
    const record: AdminStationRecord = {
      ...data,
      id,
      officersCount: 0,
      postsCount: 0,
      established: new Date().getFullYear().toString(),
    };
    set((s) => ({ adminStations: [record, ...s.adminStations] }));
    return id;
  },
  updateAdminStation: (id, data) =>
    set((s) => ({
      adminStations: s.adminStations.map((st) => (st.id === id ? { ...st, ...data } : st)),
    })),

  addAdminPost: (data) => {
    const id = `PT-${String(get().adminPosts.length + 8).padStart(3, "0")}`;
    const record: AdminPostRecord = {
      ...data,
      id,
      officersCount: 0,
      status: "active",
    };
    set((s) => ({ adminPosts: [record, ...s.adminPosts] }));
    return id;
  },
  updateAdminPost: (id, data) =>
    set((s) => ({
      adminPosts: s.adminPosts.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  addAdminAssignment: (data) => {
    const id = `ASG-${String(get().adminAssignments.length + 8).padStart(3, "0")}`;
    const today = new Date();
    const record: AdminAssignmentRecord = {
      ...data,
      id,
      assignedDate: today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "active",
    };
    set((s) => ({
      adminAssignments: [record, ...s.adminAssignments],
      adminUnassigned: s.adminUnassigned.filter((o) => o.id !== data.officerId),
    }));
    return id;
  },
  removeAdminAssignment: (id) =>
    set((s) => ({
      adminAssignments: s.adminAssignments.filter((a) => a.id !== id),
    })),
  removeAdminUnassigned: (officerId) =>
    set((s) => ({
      adminUnassigned: s.adminUnassigned.filter((o) => o.id !== officerId),
    })),

  addAdminAlertHistory: (data) => {
    const id = `AL-${String(get().adminAlertsHistory.length + 5).padStart(3, "0")}`;
    const d = new Date();
    const record: AdminAlertHistoryRecord = {
      ...data,
      id,
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
    };
    set((s) => ({ adminAlertsHistory: [record, ...s.adminAlertsHistory] }));
  },

  updateAdminIncident: (id, data) =>
    set((s) => ({
      adminIncidents: s.adminIncidents.map((i) => (i.id === id ? { ...i, ...data } : i)),
    })),

  endAdminPatrol: (id) =>
    set((s) => ({
      adminPatrols: s.adminPatrols.map((p) =>
        p.id === id ? { ...p, status: "completed", progress: 100 } : p
      ),
    })),
}));
