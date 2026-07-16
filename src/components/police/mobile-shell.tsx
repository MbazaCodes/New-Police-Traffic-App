"use client";

import { usePoliceStore } from "@/store/police-store";
import { StatusBar } from "./status-bar";
import { BottomNav } from "./bottom-nav";
import { GeneralBottomNav } from "./general-bottom-nav";
import { LoginScreen } from "./screens/login-screen";
import { HomeScreen } from "./screens/home-screen";
import { GeneralHomeScreen } from "./screens/general-home-screen";
import { GeneralPoliceScreen } from "./screens/general-police-screen";
import { CitizenSearchResultsScreen } from "./screens/citizen-search-results-screen";
import { SearchResultsScreen } from "./screens/search-results-screen";
import { TrafficScreen } from "./screens/traffic-screen";
import { PatrolScreen } from "./screens/patrol-screen";
import { AlertsScreen } from "./screens/alerts-screen";
import { ProfileScreen } from "./screens/profile-screen";
import { AccidentReportScreen } from "./screens/accident-report-screen";
import { VehicleInspectionScreen } from "./screens/vehicle-inspection-screen";
import { Pf3Screen } from "./screens/pf3-screen";
import { CitationScreen } from "./screens/citation-screen";
import { HistoryScreen } from "./screens/history-screen";
import { ArrestFormScreen } from "./screens/arrest-form-screen";
import { WarningFormScreen } from "./screens/warning-form-screen";
import { LostPropertyScreen } from "./screens/lost-property-screen";
import { DriverPointsScreen } from "./screens/driver-points-screen";
import { IncidentDetailScreen } from "./screens/incident-detail-screen";
import { OffenseDetailScreen } from "./screens/offense-detail-screen";
import { CameraScannerModal } from "./camera-scanner-modal";
import { Monitor } from "lucide-react";
import type { ScreenId } from "@/lib/police-data";

const NO_NAV_SCREENS: ScreenId[] = [
  "login", "accident-report", "vehicle-inspection", "search-results",
  "pf3", "citation", "history", "citizen-search-results",
  "arrest-form", "warning-form", "lost-property", "driver-points",
  "incident-detail", "offense-detail",
];

export function MobileShell() {
  const { isAuthenticated, currentScreen, userRole } = usePoliceStore();

  // Not logged in -> always show login (officer mode only)
  if (!isAuthenticated) {
    return (
      <PhoneFrame darkStatus>
        <div className="flex h-full flex-col overflow-hidden">
          <StatusBar dark />
          <div className="flex-1 overflow-y-auto">
            <LoginScreen mode="officer" />
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // If somehow an admin/commander role reaches here, redirect to admin app
  if (userRole === "admin" || userRole === "commander") {
    return (
      <PhoneFrame>
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-police p-6 text-center">
          <Monitor size={48} className="text-police-navy" />
          <p className="text-[14px] font-bold text-police-navy">Admin / Commander</p>
          <p className="text-[12px] text-police-muted">Tafadhali nenda kwenye Admin Web App</p>
          <a href="/admin" className="rounded-xl bg-[#2196F3] px-5 py-2.5 text-[13px] font-bold text-white">Fungua Admin App</a>
        </div>
      </PhoneFrame>
    );
  }

  const isGeneral = userRole === "officer-general";
  const showNav = !NO_NAV_SCREENS.includes(currentScreen);

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col overflow-hidden bg-police">
        <StatusBar />
        <main key={currentScreen} className="police-screen-enter flex-1 overflow-y-auto app-scroll">
          {renderScreen(currentScreen, isGeneral)}
        </main>
        {showNav && (isGeneral ? <GeneralBottomNav /> : <BottomNav />)}
        <CameraScannerModal />
      </div>
    </PhoneFrame>
  );
}

function renderScreen(screen: ScreenId, isGeneral = false) {
  // Shared screens (all roles)
  switch (screen) {
    case "arrest-form": return <ArrestFormScreen />;
    case "warning-form": return <WarningFormScreen />;
    case "lost-property": return <LostPropertyScreen />;
    case "driver-points": return <DriverPointsScreen />;
    case "incident-detail": return <IncidentDetailScreen />;
    case "offense-detail": return <OffenseDetailScreen />;
    case "patrol": return <PatrolScreen />;
    case "alerts": return <AlertsScreen />;
    case "profile": return <ProfileScreen />;
  }

  if (isGeneral) {
    switch (screen) {
      case "home": return <GeneralHomeScreen />;
      case "traffic": return <GeneralPoliceScreen />;
      case "citizen-search-results": return <CitizenSearchResultsScreen />;
      default: return <GeneralHomeScreen />;
    }
  }

  switch (screen) {
    case "home": return <HomeScreen />;
    case "search-results": return <SearchResultsScreen />;
    case "traffic": return <TrafficScreen />;
    case "accident-report": return <AccidentReportScreen />;
    case "vehicle-inspection": return <VehicleInspectionScreen />;
    case "pf3": return <Pf3Screen />;
    case "citation": return <CitationScreen />;
    case "history": return <HistoryScreen />;
    case "citizen-search-results": return <CitizenSearchResultsScreen />;
    default: return <HomeScreen />;
  }
}

function PhoneFrame({ children, darkStatus = false }: { children: React.ReactNode; darkStatus?: boolean }) {
  void darkStatus;
  return <div className="min-h-screen w-full overflow-hidden bg-police">{children}</div>;
}
