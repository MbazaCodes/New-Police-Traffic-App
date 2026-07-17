"use client";

import { useState } from "react";
import { Shield, ChevronRight, Check } from "lucide-react";
import { ROLE_HIERARCHY, PERMISSIONS } from "@/lib/rbac";
import { ROLE_USERS } from "@/lib/mock-engine";
import type { Role } from "@/lib/auth";

export default function RolesPage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const roleUserCounts = Object.fromEntries(
    ROLE_HIERARCHY.map((r) => [
      r,
      ROLE_USERS.filter((u) => {
        const roleMap: Record<string, string[]> = {
          "TRAFFIC_OFFICER":    ["officer-traffic", "post-officer"],
          "GENERAL_OFFICER":    ["officer-general"],
          "SYSTEM_ADMIN":       ["admin"],
          "NATIONAL_COMMANDER": ["national-commissioner"],
          "REGIONAL_COMMANDER": ["regional-commissioner"],
          "DISTRICT_COMMANDER": ["district-commissioner"],
          "STATION_COMMANDER":  ["station-commissioner"],
        };
        return (roleMap[r] ?? []).includes(u.role);
      }).length,
    ])
  );

  return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3A8A]">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-police-navy">Roles za Mfumo</h1>
            <p className="text-[13px] text-police-muted">{ROLE_HIERARCHY.length} roles — zimegunduliwa kutoka RBAC automatically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Role list */}
          <div className="lg:col-span-1 space-y-2">
            {[...ROLE_HIERARCHY].reverse().map((role) => (
              <button key={role} onClick={() => setSelected(selected === role ? null : role)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected === role ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police hover:bg-police-muted"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${selected === role ? "bg-white/20 text-white" : "bg-[#1E3A8A]/10 text-[#1E3A8A]"}`}>
                  {ROLE_HIERARCHY.indexOf(role) + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-[13px] font-bold ${selected === role ? "text-white" : "text-police"}`}>{role}</p>
                  <p className={`text-[10px] ${selected === role ? "text-white/70" : "text-police-faint"}`}>{roleUserCounts[role] ?? 0} watumiaji</p>
                </div>
                <ChevronRight size={14} className={selected === role ? "text-white" : "text-police-faint"} />
              </button>
            ))}
          </div>

          {/* Permission detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="rounded-2xl bg-police-card p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A8A]/10"><Shield size={20} className="text-[#1E3A8A]" /></div>
                  <div>
                    <h2 className="text-[16px] font-bold text-police">{selected}</h2>
                    <p className="text-[12px] text-police-muted">Kiwango: {ROLE_HIERARCHY.indexOf(selected) + 1} kati ya {ROLE_HIERARCHY.length}</p>
                  </div>
                </div>

                {/* Users in this role */}
                {(() => {
                  const roleMap: Record<string, string[]> = {
                    "TRAFFIC_OFFICER": ["officer-traffic","post-officer"],
                    "GENERAL_OFFICER": ["officer-general"],
                    "SYSTEM_ADMIN": ["admin"],
                    "NATIONAL_COMMANDER": ["national-commissioner"],
                    "REGIONAL_COMMANDER": ["regional-commissioner"],
                    "DISTRICT_COMMANDER": ["district-commissioner"],
                    "STATION_COMMANDER": ["station-commissioner"],
                  };
                  const users = ROLE_USERS.filter((u) => (roleMap[selected] ?? []).includes(u.role));
                  if (users.length === 0) return null;
                  return (
                    <div>
                      <p className="mb-2 text-[12px] font-bold text-police">Watumiaji wa Role Hii</p>
                      <div className="flex flex-wrap gap-2">
                        {users.map((u) => (
                          <div key={u.id} className="flex items-center gap-2 rounded-lg border border-police-soft bg-police-muted px-2.5 py-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={u.photo} alt={u.name} className="h-5 w-5 rounded-full" />
                            <span className="text-[11px] font-medium text-police">{u.shortName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Permissions */}
                <div>
                  <p className="mb-2 text-[12px] font-bold text-police">Ruhusa (Permissions)</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(PERMISSIONS[selected] ?? {}).map(([resource, actions]) => (
                      <div key={resource} className="rounded-xl bg-police-muted p-3">
                        <p className="text-[11px] font-bold text-police capitalize">{resource.replace(/_/g, " ")}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {(["view","create","update","delete","manage"] as const).map((action) => {
                            const allowed = (actions as string[])?.includes(action);
                            return (
                              <span key={action} className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${allowed ? "bg-[#10B981]/15 text-[#10B981]" : "bg-police-soft text-police-faint"}`}>
                                {allowed && <Check size={8} className="inline mr-0.5" />}{action}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-police-card p-10 text-center">
                <div>
                  <Shield size={40} className="mx-auto text-police-faint" />
                  <p className="mt-3 text-[14px] text-police-muted">Chagua role kuona ruhusa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
