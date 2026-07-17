"use client";

import { useState } from "react";
import { Database, Users, Car, Smartphone, MapPin, Shield, Search, X } from "lucide-react";
import { MOCK_CITIZENS, MOCK_VEHICLES, MOCK_DEVICES } from "@/lib/mock-database";
import { ROLE_USERS, ADMIN_STATIONS, ADMIN_POSTS, MISSING_RECORDS } from "@/lib/mock-engine";

type Tab = "users" | "citizens" | "vehicles" | "devices" | "stations" | "posts" | "missing";

const TABS: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
  { id: "users",    label: "Watumiaji",  icon: <Users size={14} />,      count: ROLE_USERS.length },
  { id: "citizens", label: "Raia",       icon: <Shield size={14} />,     count: MOCK_CITIZENS.length },
  { id: "vehicles", label: "Magari",     icon: <Car size={14} />,        count: MOCK_VEHICLES.length },
  { id: "devices",  label: "Vifaa",      icon: <Smartphone size={14} />, count: MOCK_DEVICES.length },
  { id: "stations", label: "Vituo",      icon: <MapPin size={14} />,     count: ADMIN_STATIONS.length },
  { id: "posts",    label: "Posti",      icon: <MapPin size={14} />,     count: ADMIN_POSTS.length },
  { id: "missing",  label: "Wanaotafutwa",icon: <Shield size={14} />,   count: MISSING_RECORDS.length },
];

export default function MockDatabasePage() {
  const [tab, setTab] = useState<Tab>("users");
  const [query, setQuery] = useState("");

  const filter = <T extends Record<string, unknown>>(items: T[]) =>
    query ? items.filter((i) => JSON.stringify(i).toLowerCase().includes(query.toLowerCase())) : items;

  const statusColor = (s: string) =>
    s === "active" || s === "clean" || s === "found" ? "#10B981"
    : s === "stolen" ? "#EF4444" : s === "maintenance" ? "#FF9800" : "#9E9E9E";

  return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3A8A]">
            <Database size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-police-navy">Mock Database Viewer</h1>
            <p className="text-[13px] text-police-muted">
              Single source of truth — {ROLE_USERS.length} watumiaji • {MOCK_CITIZENS.length} raia • {MOCK_VEHICLES.length} magari • {MOCK_DEVICES.length} vifaa
            </p>
          </div>
          <div className="ml-auto rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-2">
            <p className="text-[11px] font-bold text-[#10B981]">MOCK DATABASE — CHANZO CHA KWELI</p>
            <p className="text-[10px] text-[#10B981]/70">Usisasie mara kwa mara — data hii inadhibiti programu yote</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${tab === t.id ? "bg-[#1E3A8A] text-white shadow-md" : "bg-police-card text-police-muted shadow-sm"}`}>
              {t.icon} {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-police-muted text-police-faint"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3 shadow-sm">
          <Search size={16} className="text-police-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta katika database..." className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
          {query && <button onClick={() => setQuery("")}><X size={14} className="text-police-faint" /></button>}
        </div>

        {/* Users */}
        {tab === "users" && (
          <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#1E3A8A] text-white">
                  <tr>{["ID","Jina","Username","Mobile","Role","Kituo","Hali"].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-police-soft">
                  {filter(ROLE_USERS as unknown as Record<string, unknown>[]).map((u) => {
                    const user = u as typeof ROLE_USERS[0];
                    return (
                      <tr key={user.id} className="hover:bg-police-muted transition">
                        <td className="px-4 py-2 font-mono text-[10px] text-police-faint">{user.id}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.photo} alt={user.name} className="h-6 w-6 rounded-full" />
                            <span className="font-medium text-police">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-police-muted">{user.username}</td>
                        <td className="px-4 py-2 text-police-muted">{user.mobile}</td>
                        <td className="px-4 py-2"><span className="rounded-full bg-[#1E3A8A]/10 px-2 py-0.5 text-[10px] font-bold text-[#1E3A8A]">{user.role}</span></td>
                        <td className="px-4 py-2 text-police-muted max-w-[160px] truncate">{user.station}</td>
                        <td className="px-4 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: statusColor(user.status) }}>{user.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Citizens */}
        {tab === "citizens" && (
          <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#1E3A8A] text-white">
                  <tr>{["Picha","Jina","NIDA","Mobile","Leseni","Makazi","Hatari"].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-police-soft">
                  {filter(MOCK_CITIZENS as unknown as Record<string, unknown>[]).map((c) => {
                    const cit = c as typeof MOCK_CITIZENS[0];
                    return (
                      <tr key={cit.nida} className="hover:bg-police-muted transition">
                        <td className="px-4 py-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cit.photo ?? ""} alt={cit.name} className="h-7 w-7 rounded-full" />
                        </td>
                        <td className="px-4 py-2 font-medium text-police">{cit.name}</td>
                        <td className="px-4 py-2 font-mono text-[10px] text-police-faint">{cit.nida}</td>
                        <td className="px-4 py-2 text-police-muted">{cit.mobile}</td>
                        <td className="px-4 py-2 text-police-muted">{cit.licenseNo}</td>
                        <td className="px-4 py-2 text-police-muted max-w-[140px] truncate">{cit.address}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-police-muted">
                              <div className="h-full rounded-full" style={{ width:`${cit.riskScore}%`, backgroundColor: cit.riskScore > 70 ? "#EF4444" : cit.riskScore > 40 ? "#FF9800" : "#10B981" }} />
                            </div>
                            <span className="text-[10px] text-police-faint">{cit.riskScore}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles */}
        {tab === "vehicles" && (
          <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#1E3A8A] text-white">
                  <tr>{["Plate","Gari","Rangi","Mwaka","Mmiliki","Bima","Faini"].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-police-soft">
                  {filter(MOCK_VEHICLES as unknown as Record<string, unknown>[]).map((v) => {
                    const veh = v as typeof MOCK_VEHICLES[0];
                    return (
                      <tr key={veh.plate} className="hover:bg-police-muted transition">
                        <td className="px-4 py-2"><div className="rounded-md border-2 border-[#1E3A8A] bg-yellow-50 px-2 py-0.5 text-[11px] font-extrabold text-police-navy inline-block">{veh.plate}</div></td>
                        <td className="px-4 py-2 font-medium text-police">{veh.model}</td>
                        <td className="px-4 py-2 text-police-muted">{veh.color}</td>
                        <td className="px-4 py-2 text-police-muted">{veh.year}</td>
                        <td className="px-4 py-2 text-police-muted max-w-[130px] truncate">{veh.ownerName}</td>
                        <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${veh.insurance.valid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{veh.insurance.valid ? "Valid" : "Expired"}</span></td>
                        <td className="px-4 py-2 font-bold" style={{ color: veh.outstandingFines > 0 ? "#EF4444" : "#10B981" }}>{veh.outstandingFines > 0 ? `TZS ${veh.outstandingFines.toLocaleString()}` : "Safi"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Devices */}
        {tab === "devices" && (
          <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#1E3A8A] text-white">
                  <tr>{["S/N","IMEI","Kifaa","Aina","Mmiliki","Hali"].map((h) => <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-police-soft">
                  {filter(MOCK_DEVICES as unknown as Record<string, unknown>[]).map((d) => {
                    const dev = d as typeof MOCK_DEVICES[0];
                    return (
                      <tr key={dev.serialNo} className="hover:bg-police-muted transition">
                        <td className="px-4 py-2 font-mono text-[10px] text-police-faint">{dev.serialNo}</td>
                        <td className="px-4 py-2 font-mono text-[10px] text-police-faint">{dev.imei}</td>
                        <td className="px-4 py-2 font-medium text-police max-w-[160px] truncate">{dev.description}</td>
                        <td className="px-4 py-2 text-police-muted">{dev.category}</td>
                        <td className="px-4 py-2 text-police-muted max-w-[130px] truncate">{dev.ownerName}</td>
                        <td className="px-4 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: statusColor(dev.status) }}>{dev.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stations */}
        {tab === "stations" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filter(ADMIN_STATIONS as unknown as Record<string, unknown>[]).map((s) => {
              const st = s as typeof ADMIN_STATIONS[0];
              return (
                <div key={st.id} className="rounded-2xl bg-police-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-police">{st.name}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: statusColor(st.status) }}>{st.status}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-police-muted">{st.district} • {st.region}</p>
                  <p className="mt-0.5 text-[11px] text-police-faint">{st.address}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#1E3A8A]">{st.commissioner}</p>
                  <div className="mt-2 flex gap-3 text-[10px] text-police-faint">
                    <span>{st.officersCount} Maofisa</span>
                    <span>{st.postsCount} Posti</span>
                    <span>Est. {st.established}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Posts */}
        {tab === "posts" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filter(ADMIN_POSTS as unknown as Record<string, unknown>[]).map((p) => {
              const post = p as typeof ADMIN_POSTS[0];
              return (
                <div key={post.id} className="rounded-2xl bg-police-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="font-bold text-police">{post.name}</p>
                    <span className="rounded-full bg-[#2196F3]/10 px-2 py-0.5 text-[9px] font-bold text-[#2196F3]">{post.type}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-police-muted">{post.location}</p>
                  <p className="mt-0.5 text-[11px] text-police-faint">{post.stationName}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#1E3A8A]">{post.officer}</p>
                  <div className="mt-2 flex gap-3 text-[10px] text-police-faint">
                    <span>{post.officersCount} Maofisa</span><span>{post.shift}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Missing */}
        {tab === "missing" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filter(MISSING_RECORDS as unknown as Record<string, unknown>[]).map((m) => {
              const rec = m as typeof MISSING_RECORDS[0];
              const tc = { person: "#EF4444", car: "#2196F3", device: "#9C27B0" };
              return (
                <div key={rec.id} className="rounded-2xl bg-police-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rec.photo} alt={rec.title} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: tc[rec.type] }}>{rec.type}</span>
                        <span className="text-[9px] text-police-faint">{rec.caseNo}</span>
                      </div>
                      <p className="mt-1 text-[12px] font-bold text-police leading-tight">{rec.title}</p>
                      <p className="text-[10px] text-police-muted">{rec.identifier}</p>
                      <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: statusColor(rec.status) }}>{rec.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-4 text-center">
          <p className="text-[12px] font-bold text-[#10B981]">⚡ MOCK DATABASE IS THE ONLY SOURCE OF TRUTH</p>
          <p className="mt-1 text-[11px] text-police-muted">mock-database.ts • mock-engine.ts • police-data.ts</p>
          <p className="text-[11px] text-police-muted">Taarifa zote zinaonekana hapa. Hakuna data nyingine inayoundwa popote kwenye programu.</p>
        </div>
      </div>
    </div>
  );
}
