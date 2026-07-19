"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { usePoliceStore } from "@/store/police-store";

const OfficerWebShell = dynamic(() => import("@/components/police/officer-web-shell").then(m=>({default:m.OfficerWebShell})), {ssr:false});
const CidShell    = dynamic(() => import("@/components/role/cid-shell").then(m=>({default:m.CidShell})),    {ssr:false});
const ClerkShell  = dynamic(() => import("@/components/role/clerk-shell").then(m=>({default:m.ClerkShell})),  {ssr:false});
const ViewerShell = dynamic(() => import("@/components/role/viewer-shell").then(m=>({default:m.ViewerShell})),{ssr:false});
const SystemShell = dynamic(() => import("@/components/role/system-shell").then(m=>({default:m.SystemShell})),{ssr:false});

const OFFICER_ROLES = ["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"];
const CID_ROLES    = ["INVESTIGATOR","CID_OFFICER","INVESTIGATION_SUPERVISOR","CYBER_CRIME"];
const CLERK_ROLES  = ["CLERK","EVIDENCE_OFFICER"];
const VIEWER_ROLES = ["VIEWER","IMMIGRATION_LIAISON","PRISON_LIAISON"];
const SYSTEM_ROLES = ["SYSTEM_ADMIN","EMERGENCY_DISPATCHER","AUDIT_OFFICER"];

export default function AdminPage() {
  const { isAuthenticated, authRole, logout } = usePoliceStore();
  const { status } = useSession();

  // The admin shell must not render on a stale Zustand flag alone — it also
  // needs a real NextAuth session cookie, otherwise every /api/* call 401s
  // (the "Unauthorized" red banner on Citations etc.). If the server reports
  // no session, clear the stale client flag so the user is sent back to login.
  useEffect(() => {
    if (status === "unauthenticated" && isAuthenticated) logout();
  }, [status, isAuthenticated, logout]);

  if (!isAuthenticated || status === "unauthenticated") {
    return <LoginScreen mode="admin" />;
  }

  // While the session is still being resolved, render nothing rather than
  // flashing the dashboard (and firing 401s) for one frame.
  if (status === "loading") return null;

  const r = authRole ?? "";
  if (OFFICER_ROLES.includes(r)) return <OfficerWebShell />;
  if (CID_ROLES.includes(r))    return <CidShell />;
  if (CLERK_ROLES.includes(r))  return <ClerkShell />;
  if (VIEWER_ROLES.includes(r)) return <ViewerShell />;
  if (SYSTEM_ROLES.includes(r)) return <SystemShell />;
  // Everything else — officers, commanders, admin, DIG — all go to AdminShell
  return <AdminShell />;
}
