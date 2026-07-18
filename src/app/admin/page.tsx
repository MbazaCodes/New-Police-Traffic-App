"use client";

import dynamic from "next/dynamic";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/police/screens/login-screen";
import { StatusBar } from "@/components/police/status-bar";
import { usePoliceStore } from "@/store/police-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CidShell       = dynamic(() => import("@/components/role/cid-shell").then(m=>({default:m.CidShell})),       {ssr:false});
const ClerkShell     = dynamic(() => import("@/components/role/clerk-shell").then(m=>({default:m.ClerkShell})),     {ssr:false});
const ViewerShell    = dynamic(() => import("@/components/role/viewer-shell").then(m=>({default:m.ViewerShell})),   {ssr:false});
const SystemShell    = dynamic(() => import("@/components/role/system-shell").then(m=>({default:m.SystemShell})),   {ssr:false});

// Roles that go to each shell
const COMMANDER_ROLES = [
  "NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER",
  "STATION_COMMANDER","SUPER_ADMIN","DIG",
];
const CID_ROLES    = ["INVESTIGATOR","CID_OFFICER","INVESTIGATION_SUPERVISOR","CYBER_CRIME"];
const CLERK_ROLES  = ["CLERK","EVIDENCE_OFFICER"];
const VIEWER_ROLES = ["VIEWER","IMMIGRATION_LIAISON","PRISON_LIAISON"];
const SYSTEM_ROLES = ["SYSTEM_ADMIN","EMERGENCY_DISPATCHER","AUDIT_OFFICER"];
const OFFICER_ROLES_WEB = ["TRAFFIC_OFFICER","GENERAL_OFFICER","POST_OFFICER"];

function ShellRouter({ authRole }: { authRole: string | null }) {
  const router = useRouter();
  useEffect(() => {
    // Officer roles on web → redirect to PWA
    if (authRole && OFFICER_ROLES_WEB.includes(authRole)) {
      router.replace("/");
    }
  }, [authRole, router]);

  if (!authRole) return <AdminShell />;
  if (OFFICER_ROLES_WEB.includes(authRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-police">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
          <p className="mt-3 text-[13px] text-police-muted">Inaelekeza kwenye Officer PWA...</p>
        </div>
      </div>
    );
  }
  if (CID_ROLES.includes(authRole))    return <CidShell />;
  if (CLERK_ROLES.includes(authRole))  return <ClerkShell />;
  if (VIEWER_ROLES.includes(authRole)) return <ViewerShell />;
  if (SYSTEM_ROLES.includes(authRole)) return <SystemShell />;
  if (COMMANDER_ROLES.includes(authRole)) return <AdminShell />;
  return <AdminShell />; // fallback
}

export default function AdminPage() {
  const { isAuthenticated, userRole, authRole } = usePoliceStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-police">
        <div className="flex h-full min-h-screen flex-col overflow-hidden">
          <StatusBar dark />
          <div className="flex-1 overflow-y-auto">
            <LoginScreen mode="admin" />
          </div>
        </div>
      </div>
    );
  }

  return <ShellRouter authRole={authRole} />;
}
