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
import { CameraScannerModal } from "./camera-scanner-modal";
import { AdminShell } from "../admin/admin-shell";
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

  // Admin / Commander -> full desktop Command Center (no phone frame)
  if (userRole === "admin" || userRole === "commander") {
    return <AdminShell />;
  }

  const showNav = !NO_NAV_SCREENS.includes(currentScreen);

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col overflow-hidden bg-police">
        <StatusBar />
        <main key={currentScreen} className="police-screen-enter flex-1 overflow-y-auto app-scroll">{renderScreen(currentScreen)}</main>
        {showNav && <BottomNav />}
        <CameraScannerModal />
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
    <div className="flex min-h-screen w-full flex-col items-center justify-start bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 py-4 sm:py-8 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Top bar with title + download button */}
      <div className="mb-4 flex w-full max-w-[600px] flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-0">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-[#1A237E] dark:text-slate-100">TZ Police Digital Platform</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Officer PWA — Next.js + Flutter</p>
        </div>
        <a
          href="/api/download"
          download
          className="flex items-center gap-2 rounded-xl bg-[#1A237E] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-[#1A237E]/30 transition hover:bg-[#0d1f5e] active:scale-95 dark:bg-[#2196F3] dark:shadow-[#2196F3]/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Project (ZIP)
        </a>
      </div>

      {/* Phone frame */}
      <div className="relative w-full max-w-[400px] sm:w-[400px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border-[10px] border-gray-900 bg-black shadow-2xl dark:border-slate-700">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-900 dark:bg-slate-800" />
          <div className="h-[760px] w-full overflow-hidden bg-police">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile download link (below phone) */}
      <a
        href="/api/download"
        download
        className="mt-5 flex items-center gap-2 rounded-xl bg-[#1A237E] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg active:scale-95 dark:bg-[#2196F3]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Project (ZIP)
      </a>
    </div>
  );
}
