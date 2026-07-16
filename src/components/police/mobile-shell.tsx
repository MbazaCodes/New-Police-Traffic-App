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
import { CameraScannerModal } from "./camera-scanner-modal";
import type { ScreenId } from "@/lib/police-data";

// Screens that hide the bottom nav (full-screen forms / auth)
const NO_NAV_SCREENS: ScreenId[] = [
  "login",
  "accident-report",
  "vehicle-inspection",
  "search-results",
  "pf3",
  "citation",
  "history",
  "citizen-search-results",
];

export function MobileShell() {
  const { isAuthenticated, currentScreen, userRole } = usePoliceStore();

  // Not logged in -> always show login
  if (!isAuthenticated) {
    return (
      <PhoneFrame darkStatus>
        <div className="flex h-full flex-col overflow-hidden">
          <StatusBar dark />
          <div className="flex-1 overflow-y-auto">
            <LoginScreen />
          </div>
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
        <main key={currentScreen} className="police-screen-enter flex-1 overflow-y-auto app-scroll">{renderScreen(currentScreen, isGeneral)}</main>
        {showNav && (isGeneral ? <GeneralBottomNav /> : <BottomNav />)}
        <CameraScannerModal />
      </div>
    </PhoneFrame>
  );
}

function renderScreen(screen: ScreenId, isGeneral = false) {
  // General officer screens
  if (isGeneral) {
    switch (screen) {
      case "home":
        return <GeneralHomeScreen />;
      case "traffic":
        return <GeneralPoliceScreen />;
      case "citizen-search-results":
        return <CitizenSearchResultsScreen />;
      case "patrol":
        return <PatrolScreen />;
      case "alerts":
        return <AlertsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <GeneralHomeScreen />;
    }
  }
  // Traffic officer screens
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "search-results":
      return <SearchResultsScreen />;
    case "traffic":
      return <TrafficScreen />;
    case "patrol":
      return <PatrolScreen />;
    case "alerts":
      return <AlertsScreen />;
    case "profile":
      return <ProfileScreen />;
    case "accident-report":
      return <AccidentReportScreen />;
    case "vehicle-inspection":
      return <VehicleInspectionScreen />;
    case "pf3":
      return <Pf3Screen />;
    case "citation":
      return <CitationScreen />;
    case "history":
      return <HistoryScreen />;
    default:
      return <HomeScreen />;
  }
}

function PhoneFrame({
  children,
  darkStatus = false,
}: {
  children: React.ReactNode;
  darkStatus?: boolean;
}) {
  void darkStatus;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-police">
      {children}
    </div>
  );
}
