"use client";
// Root page — Universal Login Gateway
// All roles start here after logout. The proxy redirects authenticated
// users to their role-specific dashboard. Unauthenticated users see
// this landing page to choose their login portal.

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield, Users, Car, Database, Eye, UserCheck,
  ChevronRight, Lock,
} from "lucide-react";

const PORTALS = [
  {
    id: "officer",
    title: "Maafisa wa Polisi",
    subtitle: "Traffic · General · Posti",
    icon: Shield,
    color: "#2196F3",
    bg: "from-[#1E3A8A] to-[#2196F3]",
    href: "/officer/traffic/home",
    desc: "Maafisa wa trafiki, kawaida na posti",
  },
  {
    id: "admin",
    title: "Usimamizi",
    subtitle: "Admin · Super Admin",
    icon: Users,
    color: "#8B5CF6",
    bg: "from-[#4C1D95] to-[#8B5CF6]",
    href: "/admin",
    desc: "Wasimamizi wa mfumo na watumiaji",
  },
  {
    id: "clerk",
    title: "Karani wa Data",
    subtitle: "National · Regional · District",
    icon: Database,
    color: "#10B981",
    bg: "from-[#0d4f3c] to-[#10B981]",
    href: "/clerk/records",
    desc: "Uingizaji na usimamizi wa rekodi",
  },
  {
    id: "command",
    title: "Kamandi",
    subtitle: "National · Regional · District · Station",
    icon: UserCheck,
    color: "#FF9800",
    bg: "from-[#b35900] to-[#FF9800]",
    href: "/command/national/dashboard",
    desc: "Kamanda wa vituo, wilaya, mkoa na taifa",
  },
  {
    id: "cid",
    title: "Upelelezi (CID)",
    subtitle: "CID Officers · Investigators",
    icon: Eye,
    color: "#EF4444",
    bg: "from-[#7f1d1d] to-[#EF4444]",
    href: "/cid/home",
    desc: "Maafisa wa upelelezi wa jinai",
  },
];

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // If there's an active session, the proxy will redirect to the right dashboard.
  // Ping /api/auth/session to check — if authenticated, let proxy handle it.
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        // Session exists → navigate to dashboard (proxy will redirect correctly)
        if (data?.user) {
          router.replace("/admin");  // proxy will intercept and redirect to role route
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
          <p className="mt-3 text-[13px] text-blue-200">Inaangalia kikao...</p>
        </div>
      </div>
    );
  }

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

      {/* Portal grid */}
      <div className="w-full max-w-2xl space-y-3">
        {PORTALS.map(portal => (
          <button
            key={portal.id}
            onClick={() => router.push(portal.href)}
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10 active:scale-[0.99]"
          >
            {/* Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${portal.bg} shadow-lg`}
            >
              <portal.icon size={22} className="text-white" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-white">{portal.title}</p>
              <p className="text-[11px] text-white/40">{portal.subtitle}</p>
              <p className="mt-0.5 text-[11px] text-white/30">{portal.desc}</p>
            </div>

            {/* Arrow */}
            <ChevronRight size={18} className="shrink-0 text-white/20 transition group-hover:text-white/60 group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* Security notice */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-white/20">
        <Lock size={11} />
        <span>Mfumo salama wa Jeshi la Polisi Tanzania · © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
