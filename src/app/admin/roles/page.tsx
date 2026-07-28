"use client";

import { useState } from "react";
import { Shield, ChevronRight, Check } from "lucide-react";
import { ROLE_HIERARCHY, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@/lib/auth";
import {
  PageHeader,
  Section,
  StatusBadge,
  EmptyState,
} from "@/components/ui/police";

export default function RolesPage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const roleUserCounts = Object.fromEntries(ROLE_HIERARCHY.map((r) => [r, 0]));

  return (
    <div className="min-h-screen bg-[var(--tpf-surface)] p-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Roles za Mfumo"
          subtitle={`${ROLE_HIERARCHY.length} roles — RBAC`}
          icon={Shield}
          breadcrumbs={[{ label: "Admin" }, { label: "Roles" }]}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Role list */}
          <Section className="lg:col-span-1" noPadding>
            <div className="space-y-2">
              {[...ROLE_HIERARCHY].reverse().map((role) => {
                const isSelected = selected === role;
                return (
                  <button
                    key={role}
                    onClick={() => setSelected(isSelected ? null : role)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      isSelected
                        ? "bg-[var(--tpf-navy-2)] text-white"
                        : "bg-[var(--tpf-card)] text-[var(--tpf-text)] hover:bg-[var(--tpf-surface-2)]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--tpf-blue-pale)] text-[var(--tpf-navy-2)]"
                      }`}
                    >
                      {ROLE_HIERARCHY.indexOf(role) + 1}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-[13px] font-bold ${
                          isSelected ? "text-white" : "text-[var(--tpf-text)]"
                        }`}
                      >
                        {role}
                      </p>
                      <p
                        className={`text-[10px] ${
                          isSelected ? "text-white/70" : "text-[var(--tpf-text-4)]"
                        }`}
                      >
                        {roleUserCounts[role] ?? 0} watumiaji
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className={isSelected ? "text-white" : "text-[var(--tpf-text-4)]"}
                    />
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Role detail */}
          <Section className="lg:col-span-2" noPadding>
            {selected ? (
              <div className="rounded-2xl bg-[var(--tpf-card)] p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tpf-blue-pale)]">
                    <Shield size={20} className="text-[var(--tpf-navy-2)]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[var(--tpf-text)]">{selected}</h2>
                    <p className="text-[12px] text-[var(--tpf-text-3)]">
                      Kiwango: {ROLE_HIERARCHY.indexOf(selected) + 1} kati ya{" "}
                      {ROLE_HIERARCHY.length}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-bold text-[var(--tpf-text)]">
                    Ruhusa (Permissions)
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(PERMISSIONS[selected] ?? {}).map(
                      ([resource, actions]) => (
                        <div
                          key={resource}
                          className="rounded-xl bg-[var(--tpf-surface-2)] p-3"
                        >
                          <p className="text-[11px] font-bold text-[var(--tpf-text)] capitalize">
                            {resource.replace(/_/g, " ")}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {(["view", "create", "update", "delete", "manage"] as const).map(
                              (action) => {
                                const allowed = (actions as string[])?.includes(action);
                                return (
                                  <span
                                    key={action}
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                      allowed
                                        ? "bg-[var(--tpf-status-success-bg)] text-[var(--tpf-status-success)]"
                                        : "bg-[var(--tpf-surface)] text-[var(--tpf-text-4)]"
                                    }`}
                                  >
                                    {allowed && (
                                      <Check size={8} className="inline mr-0.5" />
                                    )}
                                    {action}
                                  </span>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-[var(--tpf-card)] p-10">
                <EmptyState
                  icon={Shield}
                  title="Chagua role kuona ruhusa"
                  description="Bonyeza role upande wa kushoto kuona permissions zake."
                />
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
