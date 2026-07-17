'use client';

import React, { useState } from 'react';
import { Shield, Server, Flag, Map, Building, Building2, Car, UserCheck, Search, FileText, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, Role } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RoleOption {
  role: Role;
  label: string;
  labelSw: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  pageCount: number;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', labelSw: 'Mkuu Mkuu', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-800', description: 'Full system control', pageCount: 18 },
  { role: 'SYSTEM_ADMIN', label: 'System Admin', labelSw: 'Msimamizi', icon: Server, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-200 dark:border-orange-800', description: 'System maintenance', pageCount: 8 },
  { role: 'NATIONAL_COMMANDER', label: 'National Commander', labelSw: 'Kamanda Kitaifa', icon: Flag, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-200 dark:border-green-800', description: 'National oversight', pageCount: 9 },
  { role: 'REGIONAL_COMMANDER', label: 'Regional Commander', labelSw: 'Kamanda Mkoa', icon: Map, color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30', borderColor: 'border-teal-200 dark:border-teal-800', description: 'Regional operations', pageCount: 8 },
  { role: 'DISTRICT_COMMANDER', label: 'District Commander', labelSw: 'Kamanda Wilaya', icon: Building, color: 'text-sky-600', bgColor: 'bg-sky-50 dark:bg-sky-950/30', borderColor: 'border-sky-200 dark:border-sky-800', description: 'District management', pageCount: 7 },
  { role: 'STATION_COMMANDER', label: 'Station Commander', labelSw: 'Kamanda Kituo', icon: Building2, color: 'text-violet-600', bgColor: 'bg-violet-50 dark:bg-violet-950/30', borderColor: 'border-violet-200 dark:border-violet-800', description: 'Station operations', pageCount: 7 },
  { role: 'TRAFFIC_OFFICER', label: 'Traffic Officer', labelSw: 'Afisa Barabara', icon: Car, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-200 dark:border-yellow-800', description: 'Traffic enforcement', pageCount: 11 },
  { role: 'GENERAL_OFFICER', label: 'General Officer', labelSw: 'Afisa Jumla', icon: UserCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800', description: 'General duties', pageCount: 8 },
  { role: 'CID', label: 'CID Investigator', labelSw: 'CID Mpelelezi', icon: Search, color: 'text-red-800', bgColor: 'bg-red-50 dark:bg-red-950/30', borderColor: 'border-red-200 dark:border-red-800', description: 'Intelligence & investigations', pageCount: 10 },
  { role: 'CLERK', label: 'Clerk', labelSw: 'Karani', icon: FileText, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30', borderColor: 'border-slate-200 dark:border-slate-800', description: 'Records management', pageCount: 6 },
  { role: 'VIEWER', label: 'Viewer', labelSw: 'Mtazamaji', icon: Eye, color: 'text-slate-500', bgColor: 'bg-slate-50 dark:bg-slate-950/30', borderColor: 'border-slate-200 dark:border-slate-800', description: 'Read-only access', pageCount: 3 },
];

export function LoginPage() {
  const { login } = useAppStore();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tanzania Police Force</h1>
            <p className="text-xs text-slate-500">Jeshi la Polisi Tanzania — Digital Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Your Role</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Chagua jukumu lako kuendelea. Each role has its own dedicated workspace with specific tools and permissions.
            </p>
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLE_OPTIONS.map((role) => {
              const IconComp = role.icon;
              const isHovered = hoveredRole === role.role;
              return (
                <button
                  key={role.role}
                  onClick={() => login(role.role)}
                  onMouseEnter={() => setHoveredRole(role.role)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className={cn(
                    'group relative text-left p-4 rounded-xl border-2 transition-all duration-200',
                    'hover:shadow-lg hover:-translate-y-0.5',
                    role.bgColor, role.borderColor,
                    isHovered && 'shadow-lg -translate-y-0.5',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm', role.color)}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{role.label}</h3>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{role.labelSw}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{role.description} • {role.pageCount} pages</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Unauthorized access is prohibited. Access is logged and monitored.
            <br />
            <span className="text-slate-400">Kuingia bila ruhusa ni marufuku.</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 py-3">
        <p className="text-center text-xs text-slate-400">
          © 2024 Tanzania Police Force Digital Platform v2.0
        </p>
      </footer>
    </div>
  );
}