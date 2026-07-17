// NextAuth v4 configuration for TZ Police Digital Platform
// Strategy: Credentials provider with username/mobile + OTP verification, JWT sessions (7-day expiry)

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = [
  "SUPER_ADMIN",
  "COMMANDER",
  "OFFICER",
  "SYSTEM_ADMIN",
  "NATIONAL_COMMANDER",
  "REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER",
  "STATION_COMMANDER",
  "TRAFFIC_OFFICER",
  "GENERAL_OFFICER",
  "INVESTIGATOR",
  "CLERK",
  "VIEWER",
] as const;

export type Role = (typeof ROLES)[number];

// ---------------------------------------------------------------------------
// Augmented session user
// ---------------------------------------------------------------------------

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
      idNumber: string;
      station: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: Role;
    idNumber: string;
    station: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    idNumber: string;
    station: string;
  }
}

// ---------------------------------------------------------------------------
// Mock users table (would be Supabase `users` table in production)
// ---------------------------------------------------------------------------

export interface MockUser {
  id: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  phone?: string;
  idNumber: string;
  station: string;
  region?: string;
  district?: string;
  role: Role;
  // In production this would be hashed and managed by IAM/IdP.
  password: string;
  status: "active" | "suspended";
}

const DEFAULT_PASSWORD = "demo123";

export const MOCK_USERS: MockUser[] = [
  {
    id: "USR-SUPER-001",
    username: "superadmin",
    name: "Super Admin",
    email: "superadmin@mock.local",
    mobile: "255700000001",
    idNumber: "TP-SUP-001",
    station: "HQ",
    region: "National",
    district: "National",
    role: "SUPER_ADMIN",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-SYSTEM-002",
    username: "sysadmin",
    name: "System Admin",
    email: "sysadmin@mock.local",
    mobile: "255700000002",
    idNumber: "TP-SYS-002",
    station: "HQ",
    region: "National",
    district: "National",
    role: "SYSTEM_ADMIN",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-NATIONAL-003",
    username: "national.command",
    name: "National Commander",
    email: "national.command@mock.local",
    mobile: "255700000003",
    idNumber: "TP-NC-003",
    station: "National Command",
    region: "National",
    district: "National",
    role: "NATIONAL_COMMANDER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-REGIONAL-004",
    username: "rc.dar",
    name: "Regional Commander Dar",
    email: "rc.dar@mock.local",
    mobile: "255700000004",
    idNumber: "TP-RC-004",
    station: "Regional HQ Dar",
    region: "Dar es Salaam",
    district: "Ilala",
    role: "REGIONAL_COMMANDER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-DISTRICT-005",
    username: "dc.ilala",
    name: "District Commander Ilala",
    email: "dc.ilala@mock.local",
    mobile: "255700000005",
    idNumber: "TP-DC-005",
    station: "District HQ Ilala",
    region: "Dar es Salaam",
    district: "Ilala",
    role: "DISTRICT_COMMANDER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-STATION-006",
    username: "sc.oysterbay",
    name: "Station Commander Oysterbay",
    email: "sc.oysterbay@mock.local",
    mobile: "255700000006",
    idNumber: "TP-SC-006",
    station: "Oysterbay Station",
    region: "Dar es Salaam",
    district: "Kinondoni",
    role: "STATION_COMMANDER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-TRAFFIC-101",
    username: "traffic.officer01",
    name: "Traffic Officer 01",
    email: "traffic.officer01@mock.local",
    mobile: "255700000101",
    idNumber: "TP-TR-101",
    station: "Oysterbay Station",
    region: "Dar es Salaam",
    district: "Kinondoni",
    role: "TRAFFIC_OFFICER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-GENERAL-201",
    username: "general.officer01",
    name: "General Officer 01",
    email: "general.officer01@mock.local",
    mobile: "255700000201",
    idNumber: "TP-GO-201",
    station: "Oysterbay Station",
    region: "Dar es Salaam",
    district: "Kinondoni",
    role: "GENERAL_OFFICER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-INV-301",
    username: "investigator01",
    name: "Investigator 01",
    email: "investigator01@mock.local",
    mobile: "255700000301",
    idNumber: "TP-INV-301",
    station: "Oysterbay Station",
    region: "Dar es Salaam",
    district: "Kinondoni",
    role: "INVESTIGATOR",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-CLERK-401",
    username: "clerk01",
    name: "Clerk 01",
    email: "clerk01@mock.local",
    mobile: "255700000401",
    idNumber: "TP-CLK-401",
    station: "Records Center",
    region: "Dar es Salaam",
    district: "Ilala",
    role: "CLERK",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
  {
    id: "USR-VIEWER-501",
    username: "viewer01",
    name: "Viewer 01",
    email: "viewer01@mock.local",
    mobile: "255700000501",
    idNumber: "TP-VW-501",
    station: "HQ",
    region: "National",
    district: "National",
    role: "VIEWER",
    password: DEFAULT_PASSWORD,
    status: "active",
  },
];

// ---------------------------------------------------------------------------
// In-memory OTP store (production: Redis / Supabase otp_codes table)
// ---------------------------------------------------------------------------

export interface OtpRecord {
  identifier: string; // username/email/phone
  code: string;
  expiresAt: number; // epoch ms
}

const otpStore = new Map<string, OtpRecord>();
const OTP_BYPASS_CODES = new Set(["000000", "111111", "123456", "654321", "999999"]);

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function isOtpBypassEnabled(): boolean {
  return process.env.OTP_BYPASS === "true" || process.env.NEXT_PUBLIC_OTP_BYPASS === "true";
}

export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().replace(/\s+/g, "");
}

// ---------------------------------------------------------------------------
// Bridge: TZ Police ROLE_USERS from mock-engine — same source of truth
// These are the rich officer/commander users with Swahili names and real data.
// Any identifier from TESTING_GUIDE.md must resolve to one of these users.
// ---------------------------------------------------------------------------
const MOCK_USERS_BRIDGE: MockUser[] = [
  // 5 TRAFFIC OFFICERS
  { id:"TP001", username:"juma.mwinyi",     name:"Cprl. Juma Khamis Mwinyi",     email:"juma.mwinyi@polisi.go.tz",   mobile:"0712345678", idNumber:"TP123456", station:"Kituo Kikuu cha Polisi DSM", region:"Dar es Salaam", district:"Ilala",      role:"TRAFFIC_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"TP002", username:"ali.hassan",      name:"Sgt. Ali Hassan Salum",         email:"ali.hassan@polisi.go.tz",    mobile:"0788123456", idNumber:"TP234567", station:"Kituo cha Polisi Ilala",     region:"Dar es Salaam", district:"Ilala",      role:"TRAFFIC_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"TP003", username:"fatuma.hassan",   name:"Sgt. Fatuma Hassan Komba",      email:"fatuma.hassan@polisi.go.tz", mobile:"0722777888", idNumber:"TP345678", station:"Kituo cha Polisi Kinondoni", region:"Dar es Salaam", district:"Kinondoni",  role:"TRAFFIC_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"TP004", username:"saidi.juma",      name:"Cprl. Saidi Juma Bakari",       email:"saidi.juma@polisi.go.tz",    mobile:"0755111222", idNumber:"TP456789", station:"Kituo cha Polisi Temeke",    region:"Dar es Salaam", district:"Temeke",     role:"TRAFFIC_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"TP005", username:"mariamu.ally",    name:"Cpl. Mariamu Ally Komba",       email:"mariamu.ally@polisi.go.tz",  mobile:"0744333444", idNumber:"TP567890", station:"Kituo cha Polisi Ubungo",    region:"Dar es Salaam", district:"Kinondoni",  role:"TRAFFIC_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  // 5 GENERAL OFFICERS
  { id:"GO001", username:"grace.mushi",     name:"Insp. Grace Amina Mushi",       email:"grace.mushi@polisi.go.tz",   mobile:"0766987654", idNumber:"GO123456", station:"Kituo cha Polisi Kinondoni", region:"Dar es Salaam", district:"Kinondoni",  role:"GENERAL_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"GO002", username:"hamisi.rashid",   name:"Insp. Hamisi Rashid Omar",      email:"hamisi.rashid@polisi.go.tz", mobile:"0733555666", idNumber:"GO234567", station:"Kituo cha Polisi Ubungo",    region:"Dar es Salaam", district:"Kinondoni",  role:"GENERAL_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"GO003", username:"emmanuel.joseph", name:"Cprl. Emmanuel Joseph Mapunda", email:"emmanuel.joseph@polisi.go.tz",mobile:"0711999000",idNumber:"GO345678", station:"Kituo cha Polisi Ilala",     region:"Dar es Salaam", district:"Ilala",      role:"GENERAL_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"GO004", username:"zawadi.kimani",   name:"Cprl. Zawadi Kimani Ochieng",   email:"zawadi.kimani@polisi.go.tz", mobile:"0712111333", idNumber:"GO456789", station:"Kituo Kikuu cha Polisi DSM", region:"Dar es Salaam", district:"Ilala",      role:"GENERAL_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"GO005", username:"baraka.john",     name:"Cst. Baraka John Mwanga",       email:"baraka.john@polisi.go.tz",   mobile:"0788654321", idNumber:"GO567890", station:"Kituo cha Polisi Temeke",    region:"Dar es Salaam", district:"Temeke",     role:"GENERAL_OFFICER", password:DEFAULT_PASSWORD, status:"active" },
  // 1 ADMIN
  { id:"ADM001",username:"mariam.juma",     name:"ACP. Mariam Juma Ally",         email:"mariam.juma@polisi.go.tz",   mobile:"0766100200", idNumber:"ADM-002",  station:"Makao Makuu - DSM",           region:"National",      district:"National",   role:"SYSTEM_ADMIN",    password:DEFAULT_PASSWORD, status:"active" },
  // COMMAND HIERARCHY (5 Regional + 2 District + 2 Station + 2 Post)
  { id:"NC001", username:"igp.waziri",      name:"IGP. Saidi Hassan Waziri",      email:"igp@polisi.go.tz",           mobile:"0766000001", idNumber:"IGP-001",  station:"Makao Makuu ya Polisi DSM",  region:"National",      district:"National",   role:"NATIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"RC001", username:"cp.dsm",          name:"CP. Omari Hassan Kitwana",      email:"cp.dsm@polisi.go.tz",        mobile:"0766001001", idNumber:"CP-DSM",   station:"Makao Makuu - DSM",           region:"Dar es Salaam", district:"Ilala",      role:"REGIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"RC002", username:"cp.arusha",       name:"CP. Pendo Mkwawa Haji",         email:"cp.arusha@polisi.go.tz",     mobile:"0766002001", idNumber:"CP-ARU",   station:"Makao Makuu - Arusha",        region:"Arusha",        district:"Arusha",     role:"REGIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"RC003", username:"cp.mwanza",       name:"CP. Masoud Ally Mapunda",       email:"cp.mwanza@polisi.go.tz",     mobile:"0766003001", idNumber:"CP-MWZ",   station:"Makao Makuu - Mwanza",        region:"Mwanza",        district:"Nyamagana",  role:"REGIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"RC004", username:"cp.dodoma",       name:"CP. Nassoro Kombo Mataka",      email:"cp.dodoma@polisi.go.tz",     mobile:"0766004001", idNumber:"CP-DOD",   station:"Makao Makuu - Dodoma",        region:"Dodoma",        district:"Dodoma",     role:"REGIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"RC005", username:"cp.iringa",       name:"CP. Hidaya Ramadhani Chiku",    email:"cp.iringa@polisi.go.tz",     mobile:"0766005001", idNumber:"CP-IRI",   station:"Makao Makuu - Iringa",        region:"Iringa",        district:"Iringa",     role:"REGIONAL_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"DC001", username:"sp.ilala",        name:"SP. Twaha Mrisho Lukindo",      email:"sp.ilala@polisi.go.tz",      mobile:"0755010001", idNumber:"SP-ILA",   station:"Wilaya ya Ilala",             region:"Dar es Salaam", district:"Ilala",      role:"DISTRICT_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"DC002", username:"sp.kinondoni",    name:"SP. Zainab Hemed Singida",      email:"sp.kinondoni@polisi.go.tz",  mobile:"0766020001", idNumber:"SP-KIN",   station:"Wilaya ya Kinondoni",         region:"Dar es Salaam", district:"Kinondoni",  role:"DISTRICT_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"SC001", username:"csp.kikuu",       name:"CSP. Yusuph Issa Majaliwa",     email:"csp.kikuu@polisi.go.tz",     mobile:"0712030001", idNumber:"CSP-001",  station:"Kituo Kikuu cha Polisi DSM",  region:"Dar es Salaam", district:"Ilala",      role:"STATION_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"SC002", username:"csp.ilala",       name:"CSP. Sikudhani Mwema Nyota",    email:"csp.ilala@polisi.go.tz",     mobile:"0755030002", idNumber:"CSP-002",  station:"Kituo cha Polisi Ilala",      region:"Dar es Salaam", district:"Ilala",      role:"STATION_COMMANDER", password:DEFAULT_PASSWORD, status:"active" },
  { id:"PO001", username:"insp.mwenge",     name:"Insp. Rashid Omari Said",       email:"rashid.mwenge@polisi.go.tz", mobile:"0755040001", idNumber:"PO-001",   station:"Posti ya Mwenge",             region:"Dar es Salaam", district:"Kinondoni",  role:"TRAFFIC_OFFICER",   password:DEFAULT_PASSWORD, status:"active" },
  { id:"PO002", username:"sgt.ubungo",      name:"Sgt. Amina Said Juma",          email:"amina.ubungo@polisi.go.tz",  mobile:"0755040002", idNumber:"PO-002",   station:"Posti ya Ubungo",             region:"Dar es Salaam", district:"Kinondoni",  role:"TRAFFIC_OFFICER",   password:DEFAULT_PASSWORD, status:"active" },
];

// Merge: MOCK_USERS_BRIDGE entries override nothing — they extend the lookup pool
export const ALL_USERS: MockUser[] = [...MOCK_USERS, ...MOCK_USERS_BRIDGE];

export function findUserByIdentifier(identifier: string): MockUser | null {
  const raw = identifier.trim();
  const normalized = normalizeIdentifier(identifier);
  const lower = raw.toLowerCase();

  const user = ALL_USERS.find((u) => {
    const mobileNoSpace = normalizeIdentifier(u.mobile);
    const phoneNoSpace = normalizeIdentifier(u.phone ?? "");
    const localMobile = mobileNoSpace.startsWith("255") ? `0${mobileNoSpace.slice(3)}` : mobileNoSpace;
    const localPhone = phoneNoSpace.startsWith("255") ? `0${phoneNoSpace.slice(3)}` : phoneNoSpace;
    return (
      u.username.toLowerCase() === lower ||
      u.email.toLowerCase() === lower ||
      u.id.toLowerCase() === lower ||
      u.idNumber.toLowerCase() === lower ||
      mobileNoSpace === normalized ||
      localMobile === normalized ||
      phoneNoSpace === normalized ||
      localPhone === normalized
    );
  });

  return user ?? null;
}

export function resolveDashboardRoute(role: Role): string {
  const redirects: Record<Role, string> = {
    SUPER_ADMIN: "/admin/dashboard",
    COMMANDER: "/command/national/dashboard",
    OFFICER: "/officer/traffic/home",
    SYSTEM_ADMIN: "/system/dashboard",
    NATIONAL_COMMANDER: "/command/national/dashboard",
    REGIONAL_COMMANDER: "/command/regional/dashboard",
    DISTRICT_COMMANDER: "/command/district/dashboard",
    STATION_COMMANDER: "/command/station/dashboard",
    TRAFFIC_OFFICER: "/officer/traffic/home",
    GENERAL_OFFICER: "/officer/general/home",
    INVESTIGATOR: "/cid/home",
    CLERK: "/clerk/records",
    VIEWER: "/viewer/dashboard",
  };
  return redirects[role];
}

export function generateOtp(identifier: string): string {
  const normalized = normalizeIdentifier(identifier);

  if (isOtpBypassEnabled() && isDemoMode()) {
    const code = "123456";
    otpStore.set(normalized, {
      identifier: normalized,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return code;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(normalized, {
    identifier: normalized,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
  return code;
}

export function verifyOtp(identifier: string, code: string): boolean {
  const normalized = normalizeIdentifier(identifier);
  const cleanCode = code.trim();

  if (isOtpBypassEnabled() && OTP_BYPASS_CODES.has(cleanCode)) {
    return true;
  }

  const record = otpStore.get(normalized);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized);
    return false;
  }
  if (record.code !== cleanCode) return false;
  otpStore.delete(normalized);
  return true;
}

export function createAuthPayload(user: MockUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    idNumber: user.idNumber,
    station: user.station,
  };
}

// ---------------------------------------------------------------------------
// NextAuth options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Police Credentials",
      credentials: {
        username: { label: "Username / Mobile / ID Number", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          return null;
        }

        const user = findUserByIdentifier(credentials.username);

        if (!user) return null;
        if (user.status === "suspended") return null;

        const hasPassword = Boolean(credentials.password?.trim());
        const hasOtp = Boolean(credentials.otp?.trim());

        // Backward compatibility: allow password-based auth for legacy clients.
        if (hasPassword && user.password !== credentials.password) {
          return null;
        }

        // Primary flow: OTP is required unless in explicit demo bypass mode.
        if (hasOtp) {
          const otpOk = verifyOtp(credentials.username, credentials.otp ?? "");
          if (!otpOk) return null;
        } else if (!isOtpBypassEnabled()) {
          return null;
        }

        return createAuthPayload(user);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.idNumber = user.idNumber;
        token.station = user.station;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.idNumber = token.idNumber;
        session.user.station = token.station;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "tz-police-dev-secret-change-in-production-2026",
};

// ---------------------------------------------------------------------------
// getServerSession wrapper for App Router route handlers
// ---------------------------------------------------------------------------

import { getServerSession as getNextAuthServerSession } from "next-auth";

export async function getServerSession() {
  return getNextAuthServerSession(authOptions);
}
