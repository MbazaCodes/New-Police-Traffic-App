"use client";

import { Lock, Check, X } from "lucide-react";
import { ROLE_HIERARCHY, PERMISSIONS } from "@/lib/rbac";
import type { Resource } from "@/lib/rbac";

const RESOURCES: Resource[] = ["officers","citations","incidents","stations","posts","assignments","alerts","patrols","search","users","pf3","inspections","reports","audit_logs"];
const ACTIONS = ["view","create","update","delete","manage"] as const;

export default function PermissionsPage() {
  return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3A8A]">
            <Lock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-police-navy">Permissions Matrix</h1>
            <p className="text-[13px] text-police-muted">Jedwali la ruhusa — dynamically loaded from rbac.ts • {ROLE_HIERARCHY.length} roles × {RESOURCES.length} resources</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-police-card shadow-sm">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b-2 border-[#1E3A8A]">
                <th className="px-4 py-3 text-left font-bold text-police-navy bg-[#1E3A8A]/5 w-36">Resource</th>
                {[...ROLE_HIERARCHY].reverse().map((role) => (
                  <th key={role} className="px-2 py-3 text-center font-bold text-police-navy min-w-[80px]">
                    <div className="writing-mode-vertical text-[9px] font-bold text-police leading-tight break-all">{role.replace(/_/g, "\n")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-police-soft">
              {RESOURCES.map((resource) => (
                <tr key={resource} className="hover:bg-police-muted transition">
                  <td className="px-4 py-2 font-bold text-police capitalize bg-[#1E3A8A]/5">{resource.replace(/_/g," ")}</td>
                  {[...ROLE_HIERARCHY].reverse().map((role) => {
                    const perms = PERMISSIONS[role]?.[resource] ?? [];
                    const hasManage = perms.includes("manage");
                    const level = hasManage ? 5 : perms.length;
                    return (
                      <td key={role} className="px-2 py-2 text-center">
                        {level === 0 ? (
                          <span className="flex items-center justify-center"><X size={12} className="text-[#EF4444]" /></span>
                        ) : hasManage ? (
                          <span className="rounded-full bg-[#1E3A8A]/15 px-2 py-0.5 text-[8px] font-bold text-[#1E3A8A]">ALL</span>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] font-medium text-police">{level}</span>
                            <div className="flex gap-0.5">
                              {ACTIONS.map((a) => (
                                <span key={a} className={`h-1.5 w-1.5 rounded-full ${perms.includes(a) ? "bg-[#10B981]" : "bg-police-muted"}`} title={a} />
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 rounded-xl bg-police-card p-4 shadow-sm">
          <div className="flex items-center gap-2"><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="h-2 w-2 rounded-full bg-[#10B981]" />)}</div><span className="text-[11px] text-police-muted">= view/create/update/delete/manage</span></div>
          <div className="flex items-center gap-2"><span className="rounded-full bg-[#1E3A8A]/15 px-2 py-0.5 text-[9px] font-bold text-[#1E3A8A]">ALL</span><span className="text-[11px] text-police-muted">= manage (full control)</span></div>
          <div className="flex items-center gap-2"><X size={12} className="text-[#EF4444]" /><span className="text-[11px] text-police-muted">= hakuna ruhusa</span></div>
          <div className="ml-auto flex gap-1">
            {ACTIONS.map((a, i) => <span key={a} className="flex items-center gap-1 text-[9px] text-police-faint"><span className="h-2 w-2 rounded-full bg-[#10B981]" />{i+1}={a}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
