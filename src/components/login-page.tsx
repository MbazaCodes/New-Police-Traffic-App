'use client';

import React, { useState } from 'react';
import { Shield, Server, Flag, Map, Building, Building2, Car, UserCheck, Search, FileText, Eye, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RoleOption {
  role: 'SUPER_ADMIN' | 'SYSTEM_ADMIN' | 'NATIONAL_COMMANDER' | 'REGIONAL_COMMANDER' | 'DISTRICT_COMMANDER' | 'STATION_COMMANDER' | 'TRAFFIC_OFFICER' | 'GENERAL_OFFICER' | 'CID' | 'CLERK' | 'VIEWER';
  label: string;
  labelSw: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  description: string;
  descriptionSw: string;
  pageCount: number;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', labelSw: 'Mkuu Mkuu', icon: Shield, gradient: 'from-red-500 to-red-600', borderColor: 'border-red-200 dark:border-red-800/50 hover:border-red-400', description: 'Full system control', descriptionSw: 'Udhibiti kamili', pageCount: 18 },
  { role: 'SYSTEM_ADMIN', label: 'System Admin', labelSw: 'Msimamizi', icon: Server, gradient: 'from-orange-500 to-orange-600', borderColor: 'border-orange-200 dark:border-orange-800/50 hover:border-orange-400', description: 'System maintenance', descriptionSw: 'Matunzo ya mfumo', pageCount: 8 },
  { role: 'NATIONAL_COMMANDER', label: 'National Commander', labelSw: 'Kamanda Kitaifa', icon: Flag, gradient: 'from-green-500 to-green-600', borderColor: 'border-green-200 dark:border-green-800/50 hover:border-green-400', description: 'National oversight', descriptionSw: 'Uangalifu wa kitaifa', pageCount: 9 },
  { role: 'REGIONAL_COMMANDER', label: 'Regional Commander', labelSw: 'Kamanda Mkoa', icon: Map, gradient: 'from-teal-500 to-teal-600', borderColor: 'border-teal-200 dark:border-teal-800/50 hover:border-teal-400', description: 'Regional operations', descriptionSw: 'Shughuli za mkoa', pageCount: 8 },
  { role: 'DISTRICT_COMMANDER', label: 'District Commander', labelSw: 'Kamanda Wilaya', icon: Building, gradient: 'from-sky-500 to-sky-600', borderColor: 'border-sky-200 dark:border-sky-800/50 hover:border-sky-400', description: 'District management', descriptionSw: 'Usimamizi wa wilaya', pageCount: 7 },
  { role: 'STATION_COMMANDER', label: 'Station Commander', labelSw: 'Kamanda Kituo', icon: Building2, gradient: 'from-violet-500 to-violet-600', borderColor: 'border-violet-200 dark:border-violet-800/50 hover:border-violet-400', description: 'Station operations', descriptionSw: 'Shughuli za kituo', pageCount: 7 },
  { role: 'TRAFFIC_OFFICER', label: 'Traffic Officer', labelSw: 'Afisa Barabara', icon: Car, gradient: 'from-yellow-500 to-amber-600', borderColor: 'border-yellow-200 dark:border-yellow-800/50 hover:border-yellow-400', description: 'Traffic enforcement', descriptionSw: 'utekelezwaji wa barabara', pageCount: 11 },
  { role: 'GENERAL_OFFICER', label: 'General Officer', labelSw: 'Afisa Jumla', icon: UserCheck, gradient: 'from-emerald-500 to-emerald-600', borderColor: 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400', description: 'General duties', descriptionSw: 'Wajibu wa jumla', pageCount: 8 },
  { role: 'CID', label: 'CID Investigator', labelSw: 'CID Mpelelezi', icon: Search, gradient: 'from-red-700 to-red-800', borderColor: 'border-red-300 dark:border-red-800/50 hover:border-red-500', description: 'Intelligence & investigations', descriptionSw: 'Akili na uchunguzi', pageCount: 10 },
  { role: 'CLERK', label: 'Clerk', labelSw: 'Karani', icon: FileText, gradient: 'from-slate-500 to-slate-600', borderColor: 'border-slate-200 dark:border-slate-700/50 hover:border-slate-400', description: 'Records management', descriptionSw: 'Usimamizi wa rekodi', pageCount: 6 },
  { role: 'VIEWER', label: 'Viewer', labelSw: 'Mtazamaji', icon: Eye, gradient: 'from-gray-400 to-gray-500', borderColor: 'border-gray-200 dark:border-gray-700/50 hover:border-gray-400', description: 'Read-only access', descriptionSw: 'Kusoma tu', pageCount: 3 },
];

export function LoginPage() {
  const { login, theme, toggleTheme } = useAppStore();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleRoleClick = (role: RoleOption) => {
    setSelectedRole(role.role);
    setIsLoggingIn(true);

    // Simulate brief loading
    setTimeout(() => {
      login(role.role);
      toast({
        title: `Welcome, ${role.label}`,
        description: `${role.labelSw} — ${role.pageCount} pages available`,
      });
      setIsLoggingIn(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Tanzania Police Force</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Jeshi la Polisi Tanzania — Digital Platform</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === 'dark' ? <Lock className="h-4 w-4 text-yellow-400" /> : <Lock className="h-4 w-4 text-slate-400" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
          <div className="max-w-5xl w-full">
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-medium mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Secure Access Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                Select Your Role
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Chagua jukumu lako kuendelea. Each role has its own dedicated workspace with specific tools, permissions, and data access.
              </p>
            </div>

            {/* Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((role, i) => {
                const IconComp = role.icon;
                const isSelected = selectedRole === role.role;
                return (
                  <button
                    key={role.role}
                    onClick={() => handleRoleClick(role)}
                    disabled={isLoggingIn}
                    className={cn(
                      'group relative text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200',
                      'hover:shadow-lg hover:-translate-y-0.5 hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
                      'bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm',
                      role.borderColor,
                      isSelected && 'ring-2 ring-primary/20 scale-[0.98]',
                      isLoggingIn && 'opacity-50 cursor-wait',
                      'animate-in fade-in-0 slide-in-from-bottom-2',
                    )}
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        'p-2.5 rounded-xl bg-gradient-to-br text-white shadow-sm shrink-0 transition-transform group-hover:scale-105',
                        role.gradient,
                      )}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{role.label}</h3>
                          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{role.labelSw}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{role.description}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-medium">
                            {role.pageCount} pages
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="mt-8 text-center space-y-2 animate-in fade-in-0 duration-700" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
              <div className="inline-flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> AES-256 Encrypted</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> RBAC Protected</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Audit Logged</span>
              </div>
              <p className="text-[10px] text-slate-400/60">
                Unauthorized access is prohibited. Access is logged and monitored. Kuingia bila ruhusu ni marufuku.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/30 dark:bg-slate-900/30 py-3 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">© 2024 Tanzania Police Force</p>
            <p className="text-[11px] text-slate-400">Digital Platform v2.1</p>
          </div>
        </footer>
      </div>
    </div>
  );
}