"use client";

import { useEffect, useState } from "react";
import { Users, FileText, AlertTriangle, Shield, BarChart3, Activity, Building2, Network } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface LiveStats {
  officers: number; citations: number; incidents: number; patrols: number;
  stations: number; posts: number; arrests: number; unpaidFines: number;
}

const EMPTY: LiveStats = { officers:0, citations:0, incidents:0, patrols:0, stations:0, posts:0, arrests:0, unpaidFines:0 };

export function AdminDashboard() {
  const [stats, setStats] = useState<LiveStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = getSupabaseClient();
      if (!sb) { setLoading(false); return; }

      try {
        const [officers, citations, incidents, patrols, stations, posts, arrests, fines] = await Promise.all([
          sb.from("officers").select("*", { count:"exact", head:true }),
          sb.from("citations").select("*", { count:"exact", head:true }),
          sb.from("incidents").select("*", { count:"exact", head:true }).neq("status", "resolved"),
          sb.from("patrols").select("*", { count:"exact", head:true }).eq("status", "active"),
          sb.from("stations").select("*", { count:"exact", head:true }),
          sb.from("posts").select("*", { count:"exact", head:true }),
          sb.from("arrests").select("*", { count:"exact", head:true }).eq("status", "held"),
          sb.from("citations").select("*", { count:"exact", head:true }).eq("status", "unpaid"),
        ]);
        setStats({
          officers:   officers.count ?? 0,
          citations:  citations.count ?? 0,
          incidents:  incidents.count ?? 0,
          patrols:    patrols.count ?? 0,
          stations:   stations.count ?? 0,
          posts:      posts.count ?? 0,
          arrests:    arrests.count ?? 0,
          unpaidFines: fines.count ?? 0,
        });
      } catch { /* ignore — stay at zeros */ }
      setLoading(false);
    }
    load();
    const refreshTimer = window.setInterval(load, 15_000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const kpis = [
    { label:"Maofisa",       value: stats.officers,    icon: Users,         color:"#2196F3" },
    { label:"Citations",     value: stats.citations,   icon: FileText,      color:"#10B981" },
    { label:"Matukio Hai",   value: stats.incidents,   icon: AlertTriangle, color:"#EF4444" },
    { label:"Patroli Sasa",  value: stats.patrols,     icon: Shield,        color:"#FF9800" },
    { label:"Vituo",         value: stats.stations,    icon: Building2,     color:"#1E3A8A" },
    { label:"Posti",         value: stats.posts,       icon: Network,       color:"#8B5CF6" },
    { label:"Wafungwa",      value: stats.arrests,     icon: Shield,        color:"#EF4444" },
    { label:"Faini Hazijalipwa", value: stats.unpaidFines, icon: BarChart3, color:"#FF9800" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-black text-police">Dashboard</h1>
        <p className="text-[12px] text-police-muted mt-0.5">Muhtasari wa mfumo — husasishwa kila sekunde 15</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({length:8}).map((_,i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-police-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl bg-police-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <p className="text-[26px] font-black leading-none" style={{ color: k.color }}>{k.value}</p>
              <p className="mt-1 text-[11px] text-police-muted leading-tight">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Getting Started Guide */}
      {!loading && stats.officers === 0 && stats.stations === 0 && (
        <div className="rounded-2xl border border-[#2196F3]/20 bg-[#2196F3]/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2196F3]/15">
              <Activity size={20} className="text-[#2196F3]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">Karibu! Anza Kusakinisha Mfumo</p>
              <p className="text-[12px] text-police-muted">Fuata hatua hizi ili mfumo uanze kufanya kazi</p>
            </div>
          </div>
          <ol className="space-y-3">
            {[
              { step:1, label:"Ongeza Vituo", desc:"Nenda Vituo → ongeza kituo cha kwanza cha polisi", nav:"stations" },
              { step:2, label:"Ongeza Posti",  desc:"Kila kituo kinaweza kuwa na posti nyingi", nav:"posts" },
              { step:3, label:"Ongeza Watumiaji", desc:"Ongeza maofisa na wasimamizi wapya", nav:"users" },
              { step:4, label:"Weka Maofisa",  desc:"Gawanya maofisa kwenye vituo na posti", nav:"assignments" },
            ].map(({step, label, desc}) => (
              <li key={step} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2196F3] text-[11px] font-bold text-white">{step}</div>
                <div>
                  <p className="text-[13px] font-semibold text-police">{label}</p>
                  <p className="text-[11px] text-police-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Activity placeholder when data exists */}
      {!loading && (stats.officers > 0 || stats.stations > 0) && (
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-police mb-3 flex items-center gap-2">
            <Activity size={16} className="text-[#2196F3]" />
            Mfumo Unafanya Kazi
          </h2>
          <p className="text-[12px] text-police-muted">
            Vituo: <strong className="text-police">{stats.stations}</strong> •
            Maofisa: <strong className="text-police">{stats.officers}</strong> •
            Citations: <strong className="text-police">{stats.citations}</strong> •
            Wafungwa: <strong className="text-police">{stats.arrests}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
