// Universal Search Screen — works across ALL role shells
// Uses /api/search directly (no police-store dependency)
// Supports: citizen name, NIDA, phone, license, plate, passport, nssf, nhif, ppf, enec, tin

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, Loader2, User, Car, XCircle, ChevronRight,
  Phone, MapPin, CreditCard, IdCard, FileText, ShieldCheck,
  AlertTriangle, Hash, BadgeCheck, Star, TrendingDown,
  CheckCircle2, XCircle as XIcon, Fingerprint, Globe,
  BookOpen, Heart, Ban,
} from "lucide-react";

const SEARCH_TYPES = [
  { id: "name",     label: "Jina",       icon: User,       placeholder: "Jina la raia..." },
  { id: "nida",     label: "NIDA",       icon: Fingerprint,placeholder: "YYYYMMDD-XXXXX-XX..." },
  { id: "mobile",   label: "Simu",       icon: Phone,      placeholder: "Namba ya simu..." },
  { id: "plate",    label: "Gari",       icon: Car,        placeholder: "T 123 ABC" },
  { id: "license",  label: "Leseni",     icon: IdCard,     placeholder: "Namba ya leseni..." },
  { id: "passport", label: "Paspo",      icon: Globe,      placeholder: "Namba ya paspo..." },
  { id: "nssf",     label: "NSSF",       icon: Hash,       placeholder: "Namba ya NSSF..." },
  { id: "nhif",     label: "NHIF",       icon: Heart,      placeholder: "Namba ya NHIF..." },
];

type SearchType = typeof SEARCH_TYPES[number]["id"];

interface Props {
  onBack?: () => void;
}

export function UniversalSearchScreen({ onBack }: Props) {
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [found, setFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [searchType]);

  const doSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(null); setResult(null); setFound(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${searchType}`);
      const json = await res.json();
      if (json.found) { setFound(true); setResult(json.data); }
      else { setFound(false); setResult(null); }
    } catch { setError("Hitilafu ya mtandao. Jaribu tena."); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") doSearch(); };

  const citizen = result && !result.plate ? result : null;
  const vehicle = result && result.plate ? result : null;
  const ownerCitizen = result?.citizen ?? null;

  const statusBadge = (s: string, v: boolean) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      s === "good" ? "bg-green-100 text-green-700" : s === "suspended" ? "bg-red-100 text-red-700" : s === "flagged" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
    }`}>{v && <CheckCircle2 size={10}/>} {s === "good" ? "Bora" : s === "active" ? "Hai" : s === "suspended" ? "Imesimwa" : s}</span>
  );

  const riskBadge = (score: number) => {
    if (score >= 8) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Hatari ({score})</span>;
    if (score >= 4) return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">Tahadhari ({score})</span>;
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Salama ({score})</span>;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2">
          {onBack && <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700"><ChevronRight size={16} className="rotate-180"/> Rudi</button>}
          <h2 className="text-[15px] font-bold text-[#0f2347] flex items-center gap-2"><Search size={18} className="text-[#10B981]"/> Tafuta</h2>
        </div>
        {/* Search type tabs */}
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {SEARCH_TYPES.map(st => (
            <button key={st.id} onClick={() => { setSearchType(st.id); setQuery(""); setResult(null); }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold whitespace-nowrap transition ${
                searchType === st.id ? "bg-[#0f2347] text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              <st.icon size={12}/> {st.label}
            </button>
          ))}
        </div>
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 flex-1 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition">
            <Search size={16} className="text-[#10B981] shrink-0"/>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={SEARCH_TYPES.find(st => st.id === searchType)?.placeholder || "Tafuta..."}
              className="h-10 flex-1 bg-transparent text-[13px] placeholder:text-gray-300 focus:outline-none"
              inputMode={searchType === "mobile" ? "tel" : "text"}/>
            {query && <button onClick={() => { setQuery(""); setResult(null); }} className="text-gray-400"><XCircle size={14}/></button>}
          </div>
          <button onClick={doSearch} disabled={!query.trim() || loading}
            className={`flex items-center gap-1 rounded-xl px-3 h-10 text-[12px] font-bold shadow transition ${
              !query.trim() || loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#0f2347] text-white hover:bg-[#1a3a6a]"
            }`}>
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>} Tafuta
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {loading && <div className="flex flex-col items-center py-10"><Loader2 size={32} className="animate-spin text-[#0f2347]"/><p className="mt-2 text-[12px] text-gray-400">Inatafuta...</p></div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-600">{error}</div>}
        {!loading && !error && !found && query.trim() && result === null && (
          <div className="flex flex-col items-center py-10"><XIcon size={40} className="text-gray-300"/><p className="mt-2 text-[14px] font-bold text-gray-500">Hakuna matokeo</p><p className="text-[11px] text-gray-400">Jaribu kutafuta kwa jina tofauti au namba</p></div>
        )}

        {citizen && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#10B981] to-[#059669]"/>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0"><User size={24} className="text-[#10B981]"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><h3 className="text-[16px] font-black text-[#0f2347] truncate">{citizen.name}</h3>{statusBadge(citizen.status, citizen.verified)}</div>
                    {citizen.risk_score > 0 && <div className="mt-1">{riskBadge(citizen.risk_score)}</div>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { icon: Fingerprint, label: "NIDA", value: citizen.nida },
                    { icon: Phone, label: "Simu", value: citizen.mobile },
                    { icon: IdCard, label: "Leseni", value: citizen.license_no },
                    { icon: MapPin, label: "Eneo", value: citizen.address },
                    { icon: BookOpen, label: "Kabila", value: citizen.tribe },
                    { icon: Heart, label: "Damu", value: citizen.blood_group },
                    { icon: Globe, label: "Taifa", value: citizen.nationality },
                    { icon: Star, label: "Miaka", value: citizen.age ? `${citizen.age}` : "—" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">
                      <item.icon size={12} className="text-[#10B981] shrink-0"/>
                      <span className="text-[10px] text-gray-400 shrink-0">{item.label}</span>
                      <span className="text-[11px] font-bold text-gray-700 truncate">{item.value || "—"}</span>
                    </div>
                  ))}
                </div>
                {citizen.has_criminal_record && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-200">
                    <AlertTriangle size={14} className="text-red-500"/>
                    <span className="text-[11px] font-bold text-red-700">Rekodi ya Jinai — Kesi: {citizen.cases_count}, Ushahidi: {citizen.convictions_count}</span>
                  </div>
                )}
                {(citizen.good_conduct_points || citizen.driver_points) && (
                  <div className="mt-2 flex gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 border border-green-200">
                      <ShieldCheck size={12} className="text-green-600"/><span className="text-[10px] text-green-600">Conduct</span>
                      <span className="text-[12px] font-bold text-green-700">{citizen.good_conduct_points ?? "—"}</span>
                    </div>
                    {citizen.driver_points != null && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 border border-blue-200">
                        <Car size={12} className="text-blue-600"/><span className="text-[10px] text-blue-600">Driver</span>
                        <span className="text-[12px] font-bold text-blue-700">{citizen.driver_points}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  {[
                    { label: "Magari", count: citizen.counts?.vehicles, icon: Car, color: "blue" },
                    { label: "Faini", count: citizen.counts?.fines, icon: FileText, color: "orange" },
                    { label: "Bila", count: citizen.counts?.unpaid_fines, icon: Ban, color: "red" },
                    { label: "Hati", count: citizen.counts?.government_ids, icon: Globe, color: "purple" },
                  ].map(item => (
                    <div key={item.label} className="flex-1 flex flex-col items-center rounded-xl bg-gray-50 py-2">
                      <item.icon size={14} className={`text-${item.color}-500`}/><span className="text-[10px] text-gray-400">{item.label}</span>
                      <span className="text-[14px] font-black text-gray-700">{item.count ?? 0}</span>
                    </div>
                  ))}
                </div>
                {citizen.outstanding_amount > 0 && (
                  <div className="mt-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
                    <CreditCard size={14} className="text-red-500"/>
                    <span className="text-[11px] font-bold text-red-700">Faini Bila Kulipwa: TZS {citizen.outstanding_amount.toLocaleString()}</span>
                  </div>
                )}
                {citizen.vehicles?.length > 0 && (
                  <div className="mt-3"><p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Car size={12}/> Magari</p>
                    {citizen.vehicles.map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 mb-1">
                        <span className="text-[12px] font-black text-[#0f2347]">{v.plate}</span>
                        <span className="text-[11px] text-gray-500">{v.make} {v.model}</span>
                        <span className="text-[10px] text-gray-400">{v.color}</span>
                      </div>
                    ))}
                  </div>
                )}
                {citizen.fines?.length > 0 && (
                  <div className="mt-3"><p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1"><FileText size={12}/> Faini</p>
                    {citizen.fines.slice(0, 5).map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 mb-1">
                        <span className="text-[11px] font-bold text-gray-700">{f.offense || "—"}</span>
                        <span className="text-[10px] text-gray-400">TZS {(f.amount || 0).toLocaleString()}</span>
                        <span className={`text-[10px] font-bold ${f.status === "paid" ? "text-green-600" : "text-red-600"}`}>{f.status === "paid" ? "Lipwa" : "Bila"}</span>
                      </div>
                    ))}
                  </div>
                )}
                {citizen.government_ids?.length > 0 && (
                  <div className="mt-3"><p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Globe size={12}/> Hati za Serikali</p>
                    {citizen.government_ids.map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 mb-1">
                        <span className="text-[11px] font-bold text-gray-700">{g.type_name_sw || g.id_type_code}</span>
                        <span className="text-[10px] text-gray-500">{g.id_number}</span>
                        {g.verified && <BadgeCheck size={10} className="text-green-500"/>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {vehicle && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#2196F3] to-[#1565C0]"/>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Car size={24} className="text-blue-600"/></div>
                  <div className="flex-1"><h3 className="text-[16px] font-black text-[#0f2347]">{vehicle.plate}</h3><p className="text-[12px] text-gray-500">{vehicle.make} {vehicle.model} — {vehicle.color}</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { icon: Hash, label: "Chassis", value: vehicle.chassis_no },
                    { icon: ShieldCheck, label: "Bima", value: vehicle.insurance_valid ? "Hai" : "Muda" },
                    { icon: FileText, label: "Faini", value: `${vehicle.outstanding_fines}` },
                    { icon: AlertTriangle, label: "Ajali", value: `${vehicle.accident_count}` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">
                      <item.icon size={12} className="text-blue-500 shrink-0"/><span className="text-[10px] text-gray-400 shrink-0">{item.label}</span>
                      <span className="text-[11px] font-bold text-gray-700 truncate">{item.value || "—"}</span>
                    </div>
                  ))}
                </div>
                {ownerCitizen && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3 border border-gray-200">
                    <p className="text-[11px] font-bold text-gray-500 mb-1">Mmiliki</p>
                    <div className="flex items-center gap-2"><User size={16} className="text-[#10B981]"/><span className="text-[13px] font-bold text-[#0f2347]">{ownerCitizen.name}</span><span className="text-[11px] text-gray-400">NIDA: {ownerCitizen.nida}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !result && !query.trim() && (
          <div className="flex flex-col items-center py-10"><Search size={48} className="text-gray-200"/><p className="mt-3 text-[14px] font-bold text-gray-400">Tafuta Raia, Gari, au Hati</p><p className="text-[11px] text-gray-300 mt-1">Chagua aina ya utafutaji halafu weka namba au jina</p></div>
        )}
      </div>
    </div>
  );
}
