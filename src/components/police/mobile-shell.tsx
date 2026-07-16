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
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 py-4 sm:py-8 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Phone frame */}
      <div className="relative mt-2 w-full max-w-[400px] sm:w-[400px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border-[10px] border-gray-900 bg-black shadow-2xl dark:border-slate-700">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-900 dark:bg-slate-800" />
          <div className="h-[760px] w-full overflow-hidden bg-police">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
