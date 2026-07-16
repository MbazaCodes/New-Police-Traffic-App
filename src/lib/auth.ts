// NextAuth v4 configuration for TZ Police Digital Platform
// Strategy: Credentials provider with OTP verification, JWT sessions (7-day expiry)

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = [
  "SUPER_ADMIN",
  "COMMANDER",
  "REGIONAL_COMMANDER",
  "DISTRICT_COMMANDER",
  "OFFICER",
  "TRAFFIC_OFFICER",
  "INVESTIGATOR",
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
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  station: string;
  role: Role;
  // In production this would be a hashed password or OTP secret. Mock only.
  password: string;
  status: "active" | "suspended";
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "ADM-001",
    name: "CP. Saidi Waziri",
    email: "saidi.waziri@polisi.go.tz",
    phone: "0712 345 678",
    idNumber: "TP-SUP-001",
    station: "Makao Makuu - Dar es Salaam",
    role: "SUPER_ADMIN",
    password: "admin123",
    status: "active",
  },
  {
    id: "ADM-002",
    name: "ACP. Mariam Juma",
    email: "mariam.juma@polisi.go.tz",
    phone: "0788 123 456",
    idNumber: "TP-CMD-002",
    station: "Makao Makuu - Dar es Salaam",
    role: "COMMANDER",
    password: "commander123",
    status: "active",
  },
  {
    id: "ADM-003",
    name: "SP. Hamisi Ally",
    email: "hamisi.ally@polisi.go.tz",
    phone: "0755 111 222",
    idNumber: "TP-RC-003",
    station: "Mkoa wa Dar es Salaam",
    role: "REGIONAL_COMMANDER",
    password: "regional123",
    status: "active",
  },
  {
    id: "ADM-004",
    name: "CSP. Grace Mushi",
    email: "grace.mushi@polisi.go.tz",
    phone: "0766 987 654",
    idNumber: "TP-DC-004",
    station: "Mkoa wa Arusha",
    role: "DISTRICT_COMMANDER",
    password: "district123",
    status: "active",
  },
  {
    id: "TP123456",
    name: "Insp. Juma Mwinyi",
    email: "juma.mwinyi@polisi.go.tz",
    phone: "0712 345 678",
    idNumber: "TP123456",
    station: "Kituo Kikuu cha Polisi Dar es Salaam",
    role: "TRAFFIC_OFFICER",
    password: "officer123",
    status: "active",
  },
  {
    id: "TP345678",
    name: "Insp. Grace Mushi",
    email: "grace.mushi@polisi.go.tz",
    phone: "0766 987 654",
    idNumber: "TP345678",
    station: "Kituo cha Kinondoni",
    role: "INVESTIGATOR",
    password: "investigator123",
    status: "active",
  },
  {
    id: "TP678901",
    name: "Insp. Hamisi Rashid",
    email: "hamisi.rashid@polisi.go.tz",
    phone: "0733 555 666",
    idNumber: "TP678901",
    station: "Kituo cha Ubungo",
    role: "OFFICER",
    password: "officer123",
    status: "active",
  },
  {
    id: "ADM-005",
    name: "SP. Emmanuel Joseph",
    email: "emmanuel.joseph@polisi.go.tz",
    phone: "0711 999 000",
    idNumber: "TP-VW-005",
    station: "Mkoa wa Mwanza",
    role: "VIEWER",
    password: "viewer123",
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

export function generateOtp(identifier: string): string {
  // Generate a deterministic 6-digit code for testing; in prod use random
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(identifier, {
    identifier,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
  return code;
}

export function verifyOtp(identifier: string, code: string): boolean {
  const record = otpStore.get(identifier);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    return false;
  }
  if (record.code !== code) return false;
  otpStore.delete(identifier);
  return true;
}

// ---------------------------------------------------------------------------
// NextAuth options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Police Credentials",
      credentials: {
        username: { label: "Username / ID Number", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // 1. Lookup user by email, id, or idNumber
        const user = MOCK_USERS.find(
          (u) =>
            u.email.toLowerCase() === credentials.username.toLowerCase() ||
            u.idNumber === credentials.username ||
            u.id === credentials.username,
        );

        if (!user) return null;
        if (user.status === "suspended") return null;
        if (user.password !== credentials.password) return null;

        // 2. OTP verification — if OTP is provided, validate it.
        // If OTP not provided, still allow (for development convenience);
        // in production OTP would be required.
        if (credentials.otp && credentials.otp.trim() !== "") {
          const ok = verifyOtp(user.email, credentials.otp);
          if (!ok) return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          idNumber: user.idNumber,
          station: user.station,
        };
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
