"use client";

import { Lock, Check, X } from "lucide-react";
import { ROLE_HIERARCHY, PERMISSIONS } from "@/lib/rbac";
import type { Resource } from "@/lib/rbac";
import { PageHeader, Section } from "@/components/ui/police";

const RESOURCES: Resource[] = [
  "officers", "citations", "incidents", "stations", "posts", "assignments",
  "alerts", "patrols", "search", "users", "pf3", "inspections", "reports", "audit_logs",
];
const ACTIONS = ["view", "create", "update", "delete", "manage"] as const;

export default function PermissionsPage() {
  return (
    <div className="min-h-screen bg-[var(--tpf-surface)] p-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Permissions Matrix"
          subtitle={`Jedwali la ruhusa — dynamically loaded from rbac.ts • ${ROLE_HIERARCHY.length} roles × ${RESOURCES.length} resources`}
          icon={Lock}
          breadcrumbs={[{ label: "Admin" }, { label: "Permissions" }]}
        />

        <Section noPadding>
          <div className="overflow-x-auto rounded-2xl bg-[var(--tpf-card)] shadow-sm">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b-2 border-[var(--tpf-navy-2)]">
                  <th className="px-4 py-3 text-left font-bold text-[var(--tpf-navy)] bg-[var(--tpf-blue-pale)] w-36">
                    Resource
                  </th>
                  {[...ROLE_HIERARCHY].reverse().map((role) => (
                    <th
                      key={role}
                      className="px-2 py-3 text-center font-bold text-[var(--tpf-navy)] min-w-[80px]"
                    >
                      <div className="writing-mode-vertical text-[9px] font-bold text-[var(--tpf-text)] leading-tight break-all">
                        {role.replace(/_/g, "\n")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--tpf-border)]">
                {RESOURCES.map((resource) => (
                  <tr key={resource} className="hover:bg-[var(--tpf-surface-2)] transition">
                    <td className="px-4 py-2 font-bold text-[var(--tpf-text)] capitalize bg-[var(--tpf-blue-pale)]">
                      {resource.replace(/_/g, " ")}
                    </td>
                    {[...ROLE_HIERARCHY].reverse().map((role) => {
                      const perms = PERMISSIONS[role]?.[resource] ?? [];
                      const hasManage = perms.includes("manage");
                      const level = hasManage ? 5 : perms.length;
                      return (
                        <td key={role} className="px-2 py-2 text-center">
                          {level === 0 ? (
                            <span className="flex items-center justify-center">
                              <X size={12} className="text-[var(--tpf-status-danger)]" />
                            </span>
                          ) : hasManage ? (
                            <span className="rounded-full bg-[var(--tpf-blue-pale)] px-2 py-0.5 text-[8px] font-bold text-[var(--tpf-navy-2)]">
                              ALL
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] font-medium text-[var(--tpf-text)]">
                                {level}
                              </span>
                              <div className="flex gap-0.5">
                                {ACTIONS.map((a) => (
                                  <span
                                    key={a}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      perms.includes(a)
                                        ? "bg-[var(--tpf-status-success)]"
                                        : "bg-[var(--tpf-surface-2)]"
                                    }`}
                                    title={a}
                                  />
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
          <div className="flex flex-wrap gap-4 rounded-xl bg-[var(--tpf-card)] p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-[var(--tpf-status-success)]" />
                ))}
              </div>
              <span className="text-[11px] text-[var(--tpf-text-3)]">
                = view/create/update/delete/manage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--tpf-blue-pale)] px-2 py-0.5 text-[9px] font-bold text-[var(--tpf-navy-2)]">
                ALL
              </span>
              <span className="text-[11px] text-[var(--tpf-text-3)]">= manage (full control)</span>
            </div>
            <div className="flex items-center gap-2">
              <X size={12} className="text-[var(--tpf-status-danger)]" />
              <span className="text-[11px] text-[var(--tpf-text-3)]">= hakuna ruhusa</span>
            </div>
            <div className="ml-auto flex gap-1">
              {ACTIONS.map((a, i) => (
                <span
                  key={a}
                  className="flex items-center gap-1 text-[9px] text-[var(--tpf-text-4)]"
                >
                  <span className="h-2 w-2 rounded-full bg-[var(--tpf-status-success)]" />
                  {i + 1}={a}
                </span>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
