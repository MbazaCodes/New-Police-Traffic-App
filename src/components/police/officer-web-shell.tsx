"use client";

/**
 * OfficerWebShell — wraps all PWA officer screens for web platform
 * Renders the exact same screens as mobile-shell but WITHOUT PhoneFrame/StatusBar
 * Full-width responsive layout with a sidebar navigation
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Home, FileText, Shield, Clock, Bell, User, Car, UserCheck,
  AlertTriangle, Search, Menu, X, LogOut, ChevronRight,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import type { ScreenId } from "@/lib/police-data";

// ── Lazy-load all officer screens ─────────────────────────────────────────
const HomeScreen             = dynamic(() => import("./screens/home-screen").then(m=>({default:m.HomeScreen})),                       {ssr:false});
const GeneralHomeScreen      = dynamic(() => import("./screens/general-home-screen").then(m=>({default:m.GeneralHomeScreen})),         {ssr:false});
const GeneralPoliceScreen    = dynamic(() => import("./screens/general-police-screen").then(m=>({default:m.GeneralPoliceScreen})),     {ssr:false});
const SearchResultsScreen    = dynamic(() => import("./screens/search-results-screen").then(m=>({default:m.SearchResultsScreen})),     {ssr:false});
const CitizenSearchResults   = dynamic(() => import("./screens/citizen-search-results-screen").then(m=>({default:m.CitizenSearchResultsScreen})), {ssr:false});
const CitationScreen         = dynamic(() => import("./screens/citation-screen").then(m=>({default:m.CitationScreen})),               {ssr:false});
const CitationDetailScreen   = dynamic(() => import("./screens/citation-detail-screen").then(m=>({default:m.CitationDetailScreen})),   {ssr:false});
const PF3Screen              = dynamic(() => import("./screens/pf3-screen").then(m=>({default:m.PF3Screen})),                         {ssr:false});
const VehicleInspectionScreen= dynamic(() => import("./screens/vehicle-inspection-screen").then(m=>({default:m.VehicleInspectionScreen})),{ssr:false});
const PatrolScreen           = dynamic(() => import("./screens/patrol-screen").then(m=>({default:m.PatrolScreen})),                   {ssr:false});
const AlertsScreen           = dynamic(() => import("./screens/alerts-screen").then(m=>({default:m.AlertsScreen})),                   {ssr:false});
const HistoryScreen          = dynamic(() => import("./screens/history-screen").then(m=>({default:m.HistoryScreen})),                 {ssr:false});
const ProfileScreen          = dynamic(() => import("./screens/profile-screen").then(m=>({default:m.ProfileScreen})),                 {ssr:false});
const ArrestFormScreen       = dynamic(() => import("./screens/arrest-form-screen").then(m=>({default:m.ArrestFormScreen})),           {ssr:false});
const WarningFormScreen      = dynamic(() => import("./screens/warning-form-screen").then(m=>({default:m.WarningFormScreen})),         {ssr:false});
const IncidentDetailScreen   = dynamic(() => import("./screens/incident-detail-screen").then(m=>({default:m.IncidentDetailScreen})),   {ssr:false});
const IncidentViewScreen     = dynamic(() => import("./screens/incident-view-screen").then(m=>({default:m.IncidentViewScreen})),       {ssr:false});
const OffenseDetailScreen    = dynamic(() => import("./screens/offense-detail-screen").then(m=>({default:m.OffenseDetailScreen})),     {ssr:false});
const DriverPointsScreen     = dynamic(() => import("./screens/driver-points-screen").then(m=>({default:m.DriverPointsScreen})),       {ssr:false});
const LostPropertyScreen     = dynamic(() => import("./screens/lost-property-screen").then(m=>({default:m.LostPropertyScreen})),       {ssr:false});
const AddVehicleScreen       = dynamic(() => import("./screens/add-vehicle-screen").then(m=>({default:m.AddVehicleScreen})),           {ssr:false});
const AddCitizenScreen       = dynamic(() => import("./screens/add-citizen-screen").then(m=>({default:m.AddCitizenScreen})),           {ssr:false});
const AccidentReportScreen   = dynamic(() => import("./screens/accident-report-screen").then(m=>({default:m.AccidentReportScreen})),   {ssr:false});
const TrafficScreen          = dynamic(() => import("./screens/traffic-screen").then(m=>({default:m.TrafficScreen})),                 {ssr:false});
const OfficerRequestScreen = dynamic(() => import("./screens/officer-request-screen").then(m=>({default:m.OfficerRequestScreen})), {ssr:false});
const EditProfileScreen      = dynamic(() => import("./screens/edit-profile-screen").then(m=>({default:m.EditProfileScreen})),         {ssr:false});

// ── Nav definitions ────────────────────────────────────────────────────────
const TRAFFIC_NAV = [
  { screen: "home"    as ScreenId, label: "Nyumbani",    icon: Home },
  { screen: "traffic" as ScreenId, label: "Hatua za Haraka", icon: Car },
  { screen: "patrol"  as ScreenId, label: "Patroli",     icon: Shield },
  { screen: "alerts"  as ScreenId, label: "Arifa",       icon: Bell },
  { screen: "history" as ScreenId, label: "Historia",    icon: Clock },
  { screen: "profile" as ScreenId, label: "Wasifu",      icon: User },
];

const GENERAL_NAV = [
  { screen: "home"    as ScreenId, label: "Nyumbani",    icon: Home },
  { screen: "traffic" as ScreenId, label: "Vitendo",     icon: UserCheck },
  { screen: "patrol"  as ScreenId, label: "Patroli",     icon: Shield },
  { screen: "alerts"  as ScreenId, label: "Arifa",       icon: Bell },
  { screen: "history" as ScreenId, label: "Historia",    icon: Clock },
  { screen: "profile" as ScreenId, label: "Wasifu",      icon: User },
];

// ── Screen renderer ────────────────────────────────────────────────────────
function renderOfficerScreen(screen: ScreenId, isGeneral: boolean) {
  // Shared screens
  switch (screen) {
    case "arrest-form":        return <ArrestFormScreen />;
    case "warning-form":       return <WarningFormScreen />;
    case "lost-property":      return <LostPropertyScreen />;
    case "driver-points":      return <DriverPointsScreen />;
    case "incident-detail":    return <IncidentDetailScreen />;
    case "offense-detail":     return <OffenseDetailScreen />;
    case "citation-detail":    return <CitationDetailScreen />;
    case "officer-request":   return <OfficerRequestScreen />;
    case "edit-profile":       return <EditProfileScreen />;
    case "incident-view":      return <IncidentViewScreen />;
    case "add-vehicle":        return <AddVehicleScreen />;
    case "add-citizen":        return <AddCitizenScreen />;
    case "patrol":             return <PatrolScreen />;
    case "alerts":             return <AlertsScreen />;
    case "profile":            return <ProfileScreen />;
    case "history":            return <HistoryScreen />;
    case "pf3":                return <PF3Screen />;
    case "vehicle-inspection": return <VehicleInspectionScreen />;
    case "accident-report":    return <AccidentReportScreen />;
    case "citation":           return <CitationScreen />;
    case "search-results":     return <SearchResultsScreen />;
  }
  // General officer screens
  if (isGeneral) {
    switch (screen) {
      case "home":                    return <GeneralHomeScreen />;
      case "traffic":                 return <GeneralPoliceScreen />;
      case "citizen-search-results":  return <CitizenSearchResults />;
      default:                        return <GeneralHomeScreen />;
    }
  }
  // Traffic / Post officer screens
  switch (screen) {
    case "home":    return <HomeScreen />;
    case "traffic": return <TrafficScreen />;
    default:        return <HomeScreen />;
  }
}

// ── Shell ─────────────────────────────────────────────────────────────────
export function OfficerWebShell() {
  const { currentScreen, navigate, logout, authRole, unreadAlertCount } = usePoliceStore();
  const OFFICER = useOfficer();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isGeneral = authRole === "GENERAL_OFFICER";
  const navItems  = isGeneral ? GENERAL_NAV : TRAFFIC_NAV;
  const roleLabel = authRole === "GENERAL_OFFICER" ? "Afisa Polisi wa Jumla"
    : authRole === "POST_OFFICER" ? "Afisa wa Posti"
    : "Afisa wa Trafiki";

  return (
    <div className="flex h-screen overflow-hidden bg-police">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 transform bg-[#0d1b3d] transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/police-logo.png" alt="TPF" className="h-8 w-8 rounded-full" />
          <div>
            <p className="text-[12px] font-bold text-white">TPF Digital</p>
            <p className="text-[9px] text-white/50">{roleLabel}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/50 lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Officer info */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {OFFICER.photo
              ? <img src={OFFICER.photo} alt={OFFICER.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-[#2196F3]" />
              : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                  {OFFICER.shortName.split(" ").map((w:string)=>w[0]).join("").slice(0,2)}
                </div>
            }
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">{OFFICER.shortName}</p>
              <p className="truncate text-[9px] text-white/50">{OFFICER.rank}</p>
              <p className="truncate text-[9px] text-white/40">{OFFICER.station}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => { navigate(item.screen); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  active ? "bg-[#2196F3]/20 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                <span className="text-[13px] font-medium">{item.label}</span>
                {item.screen === "alerts" && (unreadAlertCount ?? 0) > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                    {unreadAlertCount}
                  </span>
                )}
                {active && <ChevronRight size={14} className="ml-auto text-[#2196F3]" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={15} /> Toka
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-police-soft bg-police-card px-3 sm:px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-police lg:hidden">
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-police">
              {navItems.find(n => n.screen === currentScreen)?.label ?? "Nyumbani"}
            </p>
            <p className="text-[10px] text-police-faint">{roleLabel} · {OFFICER.station}</p>
          </div>

          {/* Search shortcut */}
          <button
            onClick={() => navigate("home")}
            className="ml-auto hidden sm:flex items-center gap-2 rounded-xl bg-police-muted px-3 py-1.5 text-[12px] text-police-faint"
          >
            <Search size={14} /> Utafutaji wa Haraka
          </button>

          {/* Alert bell */}
          <button
            onClick={() => navigate("alerts")}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-police-muted text-police"
          >
            <Bell size={18} />
            {(unreadAlertCount ?? 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <button onClick={() => navigate("profile")} className="flex items-center gap-2">
            {OFFICER.photo
              ? <img src={OFFICER.photo} alt={OFFICER.name} className="h-8 w-8 rounded-full object-cover" />
              : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">
                  {OFFICER.shortName.split(" ").map((w:string)=>w[0]).join("").slice(0,2)}
                </div>
            }
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-bold leading-tight text-police">{OFFICER.shortName}</p>
              <p className="text-[10px] leading-tight text-police-faint">{OFFICER.rankShort} · {OFFICER.id}</p>
            </div>
          </button>
        </header>

        {/* Screen content — renders the actual PWA screens */}
        <main key={currentScreen} className="flex-1 overflow-y-auto">
          {renderOfficerScreen(currentScreen, isGeneral)}
        </main>
      </div>
    </div>
  );
}
