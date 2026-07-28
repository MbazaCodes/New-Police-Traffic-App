"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Users, Shield, Plus, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";

type StationRow = {
  id: string; name: string; region: string; district: string | null;
  ward: string | null; address: string | null; phone: string | null; status: string;
};
type OfficerRow = {
  id: string; name: string; rank: string; officer_number: string; status: string;
  user?: { role?: string | null } | null;
};
type PostRow = { id: string; name: string; type: string; shift: string | null; status: string };

export function StationDetailPage({ stationId, basePath }: { stationId: string; basePath: "/admin" | "/command" }) {
  const [station, setStation] = useState<StationRow | null>(null);
  const [officers, setOfficers] = useState<OfficerRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Unassigned officer panel
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [unassigned, setUnassigned] = useState<OfficerRow[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/stations/${stationId}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    const stRes = await res.json();
    setStation(stRes.data ?? stRes);

    const [offRes, postRes] = await Promise.all([
      fetch(`/api/officers?station=${stationId}`).then((r) => r.json()),
      fetch(`/api/posts?station_id=${stationId}`).then((r) => r.json()),
    ]);
    setOfficers(offRes.data ?? []);
    setPosts(postRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [stationId]);

  async function loadUnassigned() {
    const res = await fetch("/api/officers?status=active").then((r) => r.json());
    const all: OfficerRow[] = res.data ?? [];
    setUnassigned(all.filter((o) => !officers.find((x) => x.id === o.id)));
  }

  async function assignOfficer(officerId: string, name: string) {
    setAssigning(officerId);
    const { error } = await authFetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officerId, stationId, postId: null, role: null }),
    });
    setAssigning(null);
    if (error) { toast({ title: "Hitilafu", description: error, variant: "destructive" }); return; }
    toast({ title: "Amegawiwa", description: `${name} ameongezwa kwenye ${station?.name}` });
    setShowAddStaff(false);
    void load();
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-police">
      <Loader2 size={28} className="animate-spin text-[#2196F3]" />
    </div>
  );
  if (notFound || !station) return (
    <div className="min-h-screen bg-police p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
        <h1 className="text-xl font-bold text-police">Kituo Hakipatikani</h1>
        <p className="mt-1 text-[13px] text-police-muted">ID: {stationId}</p>
        <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-soft px-3 py-2 text-[12px] font-semibold text-police hover:bg-police-muted">
          <ArrowLeft size={14} /> Rudi
        </Link>
      </div>
    </div>
  );

  const roleLabel: Record<string, string> = {
    "officer-traffic": "Trafiki", "officer-general": "Kawaida",
    "post-officer": "Posti", "cid-officer": "CID", "investigator": "Upelelezi",
    "station-commissioner": "OCS",
  };

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police shadow-sm hover:bg-police-soft">
          <ArrowLeft size={14} /> Rudi
        </Link>

        {/* Station header */}
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-police">{station.name}</h1>
              <p className="text-[12px] text-police-muted">
                {station.region}{station.district ? ` — ${station.district}` : ""}{station.ward ? ` — Kata ${station.ward}` : ""}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${station.status === "active" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-500"}`}>
              {station.status === "active" ? "Inafanya Kazi" : station.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            {station.address && <p className="text-police-muted flex items-center gap-1"><MapPin size={13} />{station.address}</p>}
            {station.phone && <p className="text-police-muted flex items-center gap-1"><Phone size={13} />{station.phone}</p>}
          </div>
          <div className="mt-3 flex gap-4 text-[13px]">
            <span className="flex items-center gap-1 text-police-muted"><Users size={13} /><b className="text-police">{officers.length}</b> Maofisa</span>
            <span className="flex items-center gap-1 text-police-muted"><Shield size={13} /><b className="text-police">{posts.length}</b> Posti</span>
          </div>
        </div>

        {/* Staff list */}
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-police">Wafanyakazi / Staff</h2>
            <button
              onClick={() => { setShowAddStaff(true); void loadUnassigned(); }}
              className="flex items-center gap-1.5 rounded-xl bg-[#2196F3] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#1E88E5]"
            >
              <Plus size={13} /> Ongeza Afisa
            </button>
          </div>

          {officers.length === 0 ? (
            <p className="text-center text-[13px] text-police-muted py-6">Hakuna wafanyakazi waliogawiwa kituo hiki bado.</p>
          ) : (
            <div className="divide-y divide-police-soft">
              {officers.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2196F3]/15 text-[11px] font-bold text-[#2196F3]">
                      {o.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-police">{o.name}</p>
                      <p className="text-[11px] text-police-muted">{o.rank} · {o.officer_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-police-faint">{roleLabel[o.user?.role ?? ""] ?? o.user?.role ?? "—"}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${o.status === "active" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-500"}`}>
                      {o.status === "active" ? "Kazini" : o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posts list */}
        {posts.length > 0 && (
          <div className="rounded-xl bg-police-card p-5 shadow-sm">
            <h2 className="mb-4 text-[15px] font-bold text-police">Posti</h2>
            <div className="divide-y divide-police-soft">
              {posts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-police">{p.name}</p>
                    <p className="text-[11px] text-police-muted">{p.type} · {p.shift ?? "24/7"}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${p.status === "active" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-500"}`}>
                    {p.status === "active" ? "Inafanya Kazi" : p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add staff slide-in */}
        {showAddStaff && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShowAddStaff(false)}>
            <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-[15px] font-bold text-police">Ongeza Afisa kwenye {station.name}</h3>
              {unassigned.length === 0 ? (
                <p className="text-center text-[13px] text-police-muted py-4">Maofisa wote wamegawiwa tayari.</p>
              ) : (
                <div className="divide-y divide-police-soft">
                  {unassigned.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[13px] font-semibold text-police">{o.name}</p>
                        <p className="text-[11px] text-police-muted">{o.rank} · {o.officer_number}</p>
                      </div>
                      <button
                        disabled={assigning === o.id}
                        onClick={() => assignOfficer(o.id, o.name)}
                        className="flex items-center gap-1 rounded-xl bg-[#2196F3] px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        {assigning === o.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        Gawa
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowAddStaff(false)} className="mt-4 w-full rounded-xl bg-police-soft py-2.5 text-[13px] font-bold text-police">Funga</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
