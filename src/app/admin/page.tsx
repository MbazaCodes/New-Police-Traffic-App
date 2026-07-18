"use client";

import dynamic from "next/dynamic";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { usePoliceStore } from "@/store/police-store";

const CidShell    = dynamic(() => import("@/components/role/cid-shell").then(m=>({default:m.CidShell})),    {ssr:false});
const ClerkShell  = dynamic(() => import("@/components/role/clerk-shell").then(m=>({default:m.ClerkShell})),  {ssr:false});
const ViewerShell = dynamic(() => import("@/components/role/viewer-shell").then(m=>({default:m.ViewerShell})),{ssr:false});
const SystemShell = dynamic(() => import("@/components/role/system-shell").then(m=>({default:m.SystemShell})),{ssr:false});

const CID_ROLES    = ["INVESTIGATOR","CID_OFFICER","INVESTIGATION_SUPERVISOR","CYBER_CRIME"];
const CLERK_ROLES  = ["CLERK","EVIDENCE_OFFICER"];
const VIEWER_ROLES = ["VIEWER","IMMIGRATION_LIAISON","PRISON_LIAISON"];
const SYSTEM_ROLES = ["SYSTEM_ADMIN","EMERGENCY_DISPATCHER","AUDIT_OFFICER"];

export default function AdminPage() {
  const { isAuthenticated, authRole } = usePoliceStore();

  if (!isAuthenticated) {
    return <LoginScreen mode="admin" />;
  }

  const r = authRole ?? "";
  if (CID_ROLES.includes(r))    return <CidShell />;
  if (CLERK_ROLES.includes(r))  return <ClerkShell />;
  if (VIEWER_ROLES.includes(r)) return <ViewerShell />;
  if (SYSTEM_ROLES.includes(r)) return <SystemShell />;
  // Everything else — officers, commanders, admin, DIG — all go to AdminShell
  return <AdminShell />;
}
