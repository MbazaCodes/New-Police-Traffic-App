// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Car, UserX, Search, Shield, Plus, Loader2, CheckCircle, X } from "lucide-react";

const TYPES = [
  { id:"incident",         label:"Ripoti Tukio",         icon:AlertTriangle, color:"var(--tpf-amber)", desc:"Ajali, wizi, fujo" },
  { id:"missing-person",  label:"Mtu Anayetafutwa",     icon:UserX,         color:"var(--tpf-red)",   desc:"Mtu aliyepotea" },
  { id:"missing-vehicle", label:"Gari Linalotafutwa",   icon:Car,           color:"var(--tpf-blue)",  desc:"Gari lililoibiwa" },
  { id:"complaint",       label:"Malalamiko ya Jumla",  icon:Shield,        color:"#8B5CF6",           desc:"Dhidi ya afisa au huduma" },
  { id:"tip",             label:"Taarifa ya Siri",      icon:Search,        color:"var(--tpf-green)", desc:"Taarifa ya siri" },
];

const STATUS_LABEL: Record<string,string> = { submitted:"Imewasilishwa", investigating:"Inachunguzwa", resolved:"Imetatuliwa", closed:"Imefungwa" };

export function CitizenComplaints({ citizen }: any) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [type, setType]             = useState("incident");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [form, setForm] = useState({ title:"", description:"", location:"", incidentDate:"", suspects:"", witnesses:"", evidenceDesc:"", contactPhone:"", priority:"normal" });

  useEffect(() => {
    if (!citizen?.id) { setLoading(false); return; }
    const token = localStorage.getItem("citizen-token") || "";
    fetch(`/api/citizen-portal/${citizen.id}/complaints`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.ok) setComplaints(j.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [citizen?.id]);

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.description) { setError("Kichwa na maelezo vinahitajika"); return; }
    setSubmitting(true); setError(null);
    const token = localStorage.getItem("citizen-token") || "";
    const res = await fetch(`/api/citizen-portal/${citizen.id}/complaints`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location || undefined,
        incidentDate: form.incidentDate || undefined,
        suspects: form.suspects || undefined,
        witnesses: form.witnesses || undefined,
        evidence_desc: form.evidenceDesc || undefined,
        priority: form.priority || "normal",
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!json.ok) { setError(json.error || "Imeshindikana"); return; }
    setDone(json.data?.reference_no || "CMP-✓");
    setComplaints(p => [json.data, ...p]);
    setShowForm(false);
    setForm({ title:"", description:"", location:"", incidentDate:"", suspects:"", witnesses:"", evidenceDesc:"", contactPhone:"", priority:"normal" });
  };

  const selType = TYPES.find(t => t.id === type) || TYPES[0];
  const inp = { border:"1px solid var(--tpf-border)", background:"var(--tpf-surface-2)", color:"var(--tpf-text)", borderRadius:"12px", padding:"0 12px", height:"44px", fontSize:"13px", width:"100%", outline:"none" };

  if (done) return (
    <div className="flex flex-col items-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background:"color-mix(in srgb, var(--tpf-green) 15%, transparent)" }}>
        <CheckCircle size={44} style={{ color:"var(--tpf-green)" }} />
      </div>
      <h2 className="mt-4 text-[20px] font-black" style={{ color:"var(--tpf-text)" }}>Imepokiwa!</h2>
      <p className="mt-1 text-[20px] font-black" style={{ color:"var(--tpf-blue)" }}>{done}</p>
      <p className="mt-3 text-[12px]" style={{ color:"var(--tpf-text-4)" }}>Polisi watashughulikia ripoti yako haraka iwezekanavyo.</p>
      <button onClick={() => setDone(null)} className="tpf-btn tpf-btn-primary mt-5 px-8 py-3 rounded-xl text-[14px] font-bold">Rudi</button>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4 px-3 sm:px-5 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black" style={{ color:"var(--tpf-text)" }}>Malalamiko na Ripoti</h2>
          <p className="text-[12px]" style={{ color:"var(--tpf-text-4)" }}>Ripoti matukio, watu wanaotafutwa, na malalamiko</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="tpf-btn px-4 py-2 rounded-xl text-[12px] font-bold text-white"
          style={{ background:"var(--tpf-red)" }}>
          <Plus size={14} className="inline mr-1" />Ripoti Mpya
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-4 shadow-sm space-y-3"
          style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-bold" style={{ color:"var(--tpf-text)" }}>Ripoti / Malalamiko Mapya</p>
            <button onClick={() => setShowForm(false)} style={{ color:"var(--tpf-text-4)" }}><X size={18}/></button>
          </div>
          {error && <div className="rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background:"#FEF2F2", color:"var(--tpf-red)", border:"1px solid #FECACA" }}>{error}</div>}

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>AINA YA RIPOTI</label>
            <div className="grid grid-cols-1 gap-1.5">
              {TYPES.map(t => {
                const Icon = t.icon; const active = type === t.id;
                return (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition"
                    style={active ? { background:t.color, borderColor:t.color, color:"#fff" } : { borderColor:"var(--tpf-border)", color:"var(--tpf-text)" }}>
                    <Icon size={15} style={active ? { color:"white" } : { color:t.color }}/>
                    <div>
                      <p className="text-[12px] font-bold">{t.label}</p>
                      <p className={`text-[10px] ${active ? "text-white/70" : ""}`} style={!active?{color:"var(--tpf-text-4)"}:{}}>{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {[{k:"title",l:"KICHWA *",p:`${selType.label} — maelezo mafupi`},{k:"location",l:"MAHALI PA TUKIO",p:"e.g. Kariakoo, DSM"}].map(f=>(
            <div key={f.k}>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>{f.l}</label>
              <input value={(form as any)[f.k]} onChange={set(f.k)} placeholder={f.p} style={inp}/>
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>TAREHE YA TUKIO</label>
            <input type="date" value={form.incidentDate} onChange={set("incidentDate")} style={inp}/>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>MAELEZO YA KINA *</label>
            <textarea rows={4} value={form.description} onChange={set("description")}
              placeholder="Eleza kwa undani kilichotokea..."
              style={{ ...inp, height:"auto", padding:"10px 12px", resize:"none" as any }}/>
          </div>
          {(type==="incident"||type==="tip") && (
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>TAARIFA ZA WASHUKIWA</label>
              <input value={form.suspects} onChange={set("suspects")} placeholder="Maelezo ya washukiwa" style={inp}/>
            </div>
          )}
          {/* Witnesses field — was previously in state but had no input rendered */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>MASHAIDI</label>
            <input value={form.witnesses} onChange={set("witnesses")}
              placeholder="Majina na namba za simu za mashahidi" style={inp}/>
          </div>
          {/* Evidence description — what evidence is available */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>MAELEZO YA USHAHIDI</label>
            <input value={form.evidenceDesc} onChange={set("evidenceDesc")}
              placeholder="e.g. Picha, video, hati" style={inp}/>
          </div>
          {/* Contact phone — in case police need to reach the reporter */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>SIMU YA KUKUFAKIA</label>
            <input value={form.contactPhone} onChange={set("contactPhone")}
              placeholder={citizen?.phone || "+255 7XX XXX XXX"} style={inp}/>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>KIPAUMBELE</label>
            <select value={form.priority} onChange={set("priority")}
              style={{ ...inp, appearance:"auto" }}>
              <option value="low">Chini — Si ya haraka</option>
              <option value="normal">Kawaida</option>
              <option value="high">Juu — Inahitaji haraka</option>
              <option value="urgent">Ya Dharura</option>
            </select>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="tpf-btn w-full py-3 rounded-xl text-[14px] font-bold text-white disabled:opacity-60"
            style={{ background:selType.color }}>
            {submitting ? <><Loader2 size={14} className="inline animate-spin mr-1"/>Inawasilisha...</> : "Wasilisha Ripoti"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" style={{ color:"var(--tpf-blue)" }}/></div>
      ) : complaints.length === 0 && !showForm ? (
        <div className="rounded-2xl p-8 text-center" style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
          <AlertTriangle size={32} className="mx-auto" style={{ color:"var(--tpf-border-2)" }}/>
          <p className="mt-2 text-[14px] font-bold" style={{ color:"var(--tpf-text-4)" }}>Hakuna ripoti bado</p>
          <button onClick={() => setShowForm(true)} className="mt-3 tpf-btn px-5 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background:"var(--tpf-red)" }}>Anza Ripoti ya Kwanza</button>
        </div>
      ) : (
        <div className="space-y-2">
          {complaints.map((c: any) => {
            const ct = TYPES.find(t => t.id === c.complaint_type) || TYPES[0];
            const Icon = ct.icon;
            return (
              <div key={c.id} className="rounded-xl p-4" style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background:`color-mix(in srgb, ${ct.color} 12%, transparent)` }}>
                    <Icon size={18} style={{ color:ct.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color:"var(--tpf-text)" }}>{c.title}</p>
                    <p className="text-[10px]" style={{ color:"var(--tpf-text-4)" }}>{c.reference_no} · {c.created_at ? new Date(c.created_at).toLocaleDateString("sw-TZ") : ""}</p>
                    {c.location && <p className="text-[10px]" style={{ color:"var(--tpf-text-4)" }}>📍 {c.location}</p>}
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ background:"color-mix(in srgb, var(--tpf-blue) 10%, transparent)", color:"var(--tpf-blue)" }}>
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
