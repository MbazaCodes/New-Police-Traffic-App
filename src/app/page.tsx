"use client";
// Root page — Universal Login Gateway
// Proxy handles authenticated users BEFORE this renders (redirects to role dashboard).
// If we reach here → user is unauthenticated → show role portals.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Users, Car, Database, Eye, UserCheck, ChevronRight, Lock } from "lucide-react";

const PORTALS = [
  { title: "Maafisa wa Polisi",    subtitle: "Traffic · General · Posti",                    icon: Shield,     color: "#2196F3", bg: "from-[#1E3A8A] to-[#2196F3]",   href: "/officer/traffic/home",        desc: "Maafisa wa trafiki, kawaida na posti" },
  { title: "Usimamizi (Admin)",    subtitle: "Admin · Super Admin",                           icon: Users,      color: "#8B5CF6", bg: "from-[#4C1D95] to-[#8B5CF6]",   href: "/admin",                       desc: "Wasimamizi wa mfumo na watumiaji" },
  { title: "Karani wa Data",       subtitle: "National · Regional · District",                icon: Database,   color: "#10B981", bg: "from-[#0d4f3c] to-[#10B981]",   href: "/clerk/records",               desc: "Uingizaji na usimamizi wa rekodi" },
  { title: "Kamandi",              subtitle: "National · Regional · District · Station",      icon: UserCheck,  color: "#FF9800", bg: "from-[#b35900] to-[#FF9800]",   href: "/command/national/dashboard",  desc: "Kamanda wa vituo, wilaya, mkoa na taifa" },
  { title: "Upelelezi (CID)",      subtitle: "CID Officers · Investigators",                  icon: Eye,        color: "#EF4444", bg: "from-[#7f1d1d] to-[#EF4444]",   href: "/cid/home",                    desc: "Maafisa wa upelelezi wa jinai" },
];

export default function RootPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060d1f] px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20">
          <Image src="/police-logo.png" alt="TPF" width={64} height={64} className="h-16 w-16 object-contain" />
        </div>
        <h1 className="text-[28px] font-black tracking-tight text-white">TANZANIA POLICE FORCE</h1>
        <p className="text-[14px] font-semibold tracking-widest text-[#2196F3]">USALAMA WETU, JUKUMU LETU</p>
        <p className="mt-3 text-[13px] text-white/40">Chagua mlango wako wa kuingia</p>
      </div>

      {/* Portal list */}
      <div className="w-full max-w-lg space-y-3">
        {PORTALS.map(portal => (
          <button key={portal.href} onClick={() => router.push(portal.href)}
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10 active:scale-[0.99]">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${portal.bg} shadow-lg`}>
              <portal.icon size={22} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-white">{portal.title}</p>
              <p className="text-[11px] text-white/40">{portal.subtitle}</p>
              <p className="mt-0.5 text-[11px] text-white/25">{portal.desc}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-white/20 transition group-hover:text-white/60" />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-white/20">
        <Lock size={11} />
        <span>Mfumo salama wa Jeshi la Polisi Tanzania · © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
