"use client";

import { usePoliceStore } from "@/store/police-store";
import { StatusBar } from "./status-bar";
import { BottomNav } from "./bottom-nav";
import { LoginScreen } from "./screens/login-screen";
import { HomeScreen } from "./screens/home-screen";
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
];

export function MobileShell() {
  const { isAuthenticated, currentScreen } = usePoliceStore();

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

  const showNav = !NO_NAV_SCREENS.includes(currentScreen);

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col overflow-hidden bg-[#F5F5F5]">
        <StatusBar />
        <main className="flex-1 overflow-y-auto">{renderScreen(currentScreen)}</main>
        {showNav && <BottomNav />}
      </div>
    </PhoneFrame>
  );
}

function renderScreen(screen: ScreenId) {
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
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 py-4 sm:py-8">
      {/* App title for desktop context */}
      <div className="mb-4 hidden text-center sm:block">
        <h1 className="text-xl font-bold text-[#1A237E]">TZ Police Digital Platform</h1>
        <p className="text-xs text-gray-500">Officer PWA — Next.js</p>
      </div>

      {/* Phone frame */}
      <div className="relative w-full max-w-[400px] sm:w-[400px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border-[10px] border-gray-900 bg-black shadow-2xl">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
          <div className="h-[760px] w-full overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500 sm:hidden">
        TZ Police Digital Platform — Officer PWA
      </p>
    </div>
  );
}
