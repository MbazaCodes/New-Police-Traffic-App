// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, Loader2, Phone, Plus } from "lucide-react";

const METHODS = [
  { id:"mpesa",    label:"M-Pesa",      color:"var(--tpf-green)" },
  { id:"airtel",   label:"Airtel Money", color:"var(--tpf-red)" },
  { id:"tigo",     label:"Tigo Pesa",   color:"#0088CC" },
  { id:"halopesa", label:"HaloPesa",    color:"var(--tpf-amber)" },
];

export function CitizenPayments({ citizen }: any) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);
  const [paying, setPaying]     = useState(false);
  const [payDone, setPayDone]   = useState(false);
  const [method, setMethod]     = useState("mpesa");
  const [phone, setPhone]       = useState(citizen?.phone || "");
  const [amount, setAmount]     = useState("");
  const [desc, setDesc]         = useState("");

  const [error, setError]               = useState("");

  // Quick amount presets for common fees
  const PRESETS = [2000, 5000, 10000, 15000, 25000];

  useEffect(() => {
    if (!citizen?.id) { setLoading(false); return; }
    const token = localStorage.getItem("citizen-token") || "";
    fetch(`/api/citizen-portal/${citizen.id}/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.ok) setPayments(j.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [citizen?.id]);

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    // Tanzanian phone: +255 or 0 followed by 9 digits
    return /^(\+255|0)\d{9}$/.test(cleaned) || /^255\d{9}$/.test(cleaned);
  };

  const handlePay = async () => {
    setError("");
    if (!amount || parseFloat(amount) <= 0) { setError("Kiasi lazima kiwe kubwa kuliko sifuri"); return; }
    if (parseFloat(amount) < 500) { setError("Kiasi cha chini ni TZS 500"); return; }
    if (!phone) { setError("Namba ya simu inahitajika"); return; }
    if (!validatePhone(phone)) { setError("Namba ya simu si sahihi. Mfano: +255 7XX XXX XXX au 07XXXXXXXX"); return; }
    setPaying(true);
    const token = localStorage.getItem("citizen-token") || "";
    const res = await fetch(`/api/citizen-portal/${citizen.id}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: parseFloat(amount), description: desc || "Malipo ya huduma", paymentMethod: method }),
    });
    const json = await res.json();
    setPaying(false);
    if (json.ok) {
      setPayDone(true);
      setPayments(p => [json.data, ...p]);
      setShowNew(false);
      setAmount(""); setDesc("");
      setTimeout(() => setPayDone(false), 5000);
    } else {
      setError(json.error || "Imeshindwa kufanya malipo");
    }
  };

  const total = payments.reduce((s: number, p: any) => p.status === "paid" ? s + (p.amount || 0) : s, 0);

  const statusStyle = (s: string) => s === "paid"
    ? { background: "color-mix(in srgb, var(--tpf-green) 12%, transparent)", color: "var(--tpf-green)" }
    : s === "pending"
      ? { background: "color-mix(in srgb, var(--tpf-amber) 12%, transparent)", color: "var(--tpf-amber)" }
      : { background: "color-mix(in srgb, var(--tpf-red) 12%, transparent)", color: "var(--tpf-red)" };
  const statusLabel = (s: string) => ({ paid:"Imelipwa", pending:"Inasubiri", failed:"Imeshindwa" }[s] || s);

  const inp = { border:"1px solid var(--tpf-border)", background:"var(--tpf-surface-2)", color:"var(--tpf-text)", borderRadius:"12px", padding:"0 12px", height:"44px", fontSize:"13px", width:"100%", outline:"none" };

  return (
    <div className="space-y-3 sm:space-y-4 px-3 sm:px-5 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black" style={{ color:"var(--tpf-text)" }}>Malipo na Risiti</h2>
          <p className="text-[12px]" style={{ color:"var(--tpf-text-4)" }}>Historia ya malipo yako yote</p>
        </div>
        <button onClick={() => setShowNew(v => !v)} className="tpf-btn tpf-btn-primary px-4 py-2 rounded-xl text-[12px] font-bold">
          <Plus size={14} className="inline mr-1" />Malipo Mapya
        </button>
      </div>

      {payDone && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-semibold"
          style={{ background:"color-mix(in srgb, var(--tpf-green) 10%, transparent)", color:"var(--tpf-green)", border:"1px solid color-mix(in srgb, var(--tpf-green) 25%, transparent)" }}>
          <CheckCircle size={15} /> Malipo yamehifadhiwa. Subiri uthibitishaji wa SMS.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Yaliyolipwa",  val:`TZS ${total.toLocaleString()}`, color:"var(--tpf-green)" },
          { label:"Yanasubiri",   val:payments.filter((p:any)=>p.status==="pending").length, color:"var(--tpf-amber)" },
          { label:"Malipo Yote",  val:payments.length, color:"var(--tpf-blue)" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center shadow-sm"
            style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
            <p className="text-[15px] font-black" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[9px]" style={{ color:"var(--tpf-text-4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* New payment form */}
      {showNew && (
        <div className="rounded-2xl p-4 shadow-sm space-y-3"
          style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
          <p className="text-[14px] font-bold" style={{ color:"var(--tpf-text)" }}>Fanya Malipo Mapya</p>

          {error && (
            <div className="rounded-xl px-3 py-2 text-[12px] font-medium"
              style={{ background:"color-mix(in srgb, var(--tpf-red) 8%, transparent)", color:"var(--tpf-red)", border:"1px solid color-mix(in srgb, var(--tpf-red) 25%, transparent)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>NJIA YA MALIPO</label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className="rounded-xl border-2 p-2.5 text-[11px] font-bold transition"
                  style={method===m.id ? { background:m.color, borderColor:m.color, color:"#fff" } : { borderColor:"var(--tpf-border)", color:"var(--tpf-text-3)" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>NAMBA YA SIMU</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 7XX XXX XXX" style={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>KIASI (TZS)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10000" style={inp} />
              {/* Quick preset amounts */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS.map(p => (
                  <button key={p} type="button" onClick={() => setAmount(String(p))}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold transition"
                    style={{ background:"var(--tpf-surface-2)", color:"var(--tpf-text-3)", border:"1px solid var(--tpf-border)" }}>
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide" style={{ color:"var(--tpf-text-3)" }}>MAELEZO</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ada ya huduma" style={inp} />
            </div>
          </div>
          <button onClick={handlePay} disabled={paying || !amount || !phone}
            className="tpf-btn tpf-btn-primary w-full py-3 rounded-xl text-[14px] font-bold">
            {paying ? <><Loader2 size={14} className="inline animate-spin mr-1" />Inafanya...</> : "Tuma Malipo"}
          </button>
        </div>
      )}

      {/* Payments list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" style={{ color:"var(--tpf-blue)" }} /></div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl p-8 text-center shadow-sm" style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
          <CreditCard size={32} className="mx-auto" style={{ color:"var(--tpf-border-2)" }} />
          <p className="mt-2 text-[14px] font-bold" style={{ color:"var(--tpf-text-4)" }}>Hakuna malipo bado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl p-4"
              style={{ background:"var(--tpf-card)", border:"1px solid var(--tpf-border)" }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background:"color-mix(in srgb, var(--tpf-blue) 10%, transparent)" }}>
                <CreditCard size={18} style={{ color:"var(--tpf-blue)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color:"var(--tpf-text)" }}>{p.description || "Malipo ya huduma"}</p>
                <p className="text-[10px]" style={{ color:"var(--tpf-text-4)" }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString("sw-TZ") : "—"}
                  {p.control_number ? ` · ${p.control_number}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black" style={{ color:"var(--tpf-text)" }}>TZS {(p.amount||0).toLocaleString()}</p>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={statusStyle(p.status)}>{statusLabel(p.status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
