"use client";

// Root page — Universal Login Gateway
// When unauthenticated → shows the LoginScreen (the full login form with OTP).
// When authenticated → shows the role-specific shell (AdminShell, OfficerWebShell, etc.)
// This is the primary entry point for ALL roles after logout.
// Also checks for tz-force-clear cookie (set by /api/auth/logout) to wipe
// stale localStorage/session state after logout.

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { usePoliceStore } from "@/store/police-store";
import type { AuthRole } from "@/store/police-store";

const OfficerWebShell = dynamic(() => import("@/components/police/officer-web-shell").then(m=>({default:m.OfficerWebShell})), {ssr:false});
const CidShell    = dynamic(() => import("@/components/role/cid-shell").then(m=>({default:m.CidShell})),    {ssr:false});
const ClerkShell  = dynamic(() => import("@/components/role/clerk-shell").then(m=>({default:m.ClerkShell})),  {ssr:false});
const ViewerShell = dynamic(() => import("@/components/role/viewer-shell").then(m=>({default:m.ViewerShell})),{ssr:false});
const SystemShell = dynamic(() => import("@/components/role/system-shell").then(m=>({default:m.SystemShell})),{ssr:false});
const AdminShell  = dynamic(() => import("@/components/admin/admin-shell").then(m=>({default:m.AdminShell})),  {ssr:false});

const OFFICER_ROLES = ["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"];
const CID_ROLES    = ["INVESTIGATOR","CID_OFFICER","INVESTIGATION_SUPERVISOR","CYBER_CRIME"];
const CLERK_ROLES  = ["CLERK","EVIDENCE_OFFICER","NATIONAL_CLERK","REGIONAL_CLERK","DISTRICT_CLERK"];
const VIEWER_ROLES = ["VIEWER","IMMIGRATION_LIAISON","PRISON_LIAISON"];
const SYSTEM_ROLES = ["SYSTEM_ADMIN","EMERGENCY_DISPATCHER","AUDIT_OFFICER"];

export default function RootPage() {
  const { isAuthenticated, authRole, loginAsRole, logout } = usePoliceStore();
  const { data: session, status } = useSession();

  // After logout, /api/auth/logout sets a tz-force-clear cookie.
  // When the root page loads, check for that cookie and wipe ALL
  // localStorage + sessionStorage so stale session state never leaks
  // into the next login.
  useEffect(() => {
    const hasForceClear = document.cookie.includes("tz-force-clear=1");
    if (hasForceClear) {
      // Wipe all relevant stores
      localStorage.removeItem("tz-police-auth");
      localStorage.removeItem("tpf-citizen-store");
      localStorage.removeItem("citizen-token");
      localStorage.removeItem("citizen-session");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("tpf-login-id");
      sessionStorage.removeItem("tpf-officer-uid");
      sessionStorage.removeItem("pwa-install-dismissed");
      // Delete the cookie itself so it only fires once
      document.cookie = "tz-force-clear=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }, []);

  // On page reload: Zustand state is lost (in-memory).
  // Restore authRole from NextAuth session so the correct nav renders.
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && !isAuthenticated) {
      loginAsRole(session.user.role as AuthRole);
    }
    if (status === "unauthenticated" && isAuthenticated) {
      logout();
    }
  }, [status, session, isAuthenticated, loginAsRole, logout]);

  // Session still loading → show nothing to avoid flash
  if (status === "loading") return (
    <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
    </div>
  );

  // Not authenticated → show login
  if (!isAuthenticated && status !== "authenticated") {
    return <LoginScreen />;
  }

  // Route by role (use session role as source of truth if Zustand is stale)
  const r = authRole ?? (session?.user?.role as string) ?? "";

  if (OFFICER_ROLES.includes(r)) return <OfficerWebShell />;
  if (CID_ROLES.includes(r))    return <CidShell />;
  if (CLERK_ROLES.includes(r))  return <ClerkShell />;
  if (VIEWER_ROLES.includes(r)) return <ViewerShell />;
  if (SYSTEM_ROLES.includes(r)) return <SystemShell />;

  // Admin, Super Admin, Commanders → AdminShell
  return <AdminShell />;
}
