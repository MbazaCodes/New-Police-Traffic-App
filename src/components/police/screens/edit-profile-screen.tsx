"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, CheckCircle } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { useOfficer } from "@/hooks/use-officer";
import { toast } from "@/hooks/use-toast";

export function EditProfileScreen() {
  const OFFICER = useOfficer();
  const { goBack } = usePoliceStore();
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: OFFICER.name,
    phone: OFFICER.phone,
    email: OFFICER.email,
    unit: OFFICER.unit,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { if (ev.target?.result) setAvatar(ev.target.result as string); };
    r.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Kosa", description: "Jaza jina.", variant: "destructive" }); return; }
    setSaved(true);
    toast({ title: "Profaili Imesasishwa ✓", description: "Mabadiliko yako yamehifadhiwa." });
    setTimeout(() => goBack(), 1200);
  };

  if (saved) {
    return (
      <div className="min-h-full bg-police flex flex-col items-center justify-center p-8 gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/15">
          <CheckCircle size={44} className="text-[#10B981]" />
        </div>
        <p className="text-[18px] font-bold text-police">Imehifadhiwa</p>
        <p className="text-[13px] text-police-muted">Inarudi kwenye profaili...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-police">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2196F3] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Akaunti</span>
        </button>
        <h1 className="text-[18px] font-bold text-white">Hariri Profaili</h1>
        <p className="text-[11px] text-white/70">Sasisha taarifa zako za kibinafsi</p>
      </div>

      <div className="space-y-4 p-4">
        {/* Avatar */}
        <div className="flex flex-col items-center rounded-2xl bg-police-card p-6 shadow-sm">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#2196F3]/30">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1E3A8A]/10 text-[28px] font-bold text-[#1E3A8A]">
                  {form.name.charAt(0)}
                </div>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3] shadow-md">
              <Camera size={15} className="text-white" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <p className="mt-3 text-[13px] font-bold text-police">{OFFICER.id}</p>
          <p className="text-[11px] text-police-muted">{OFFICER.rank}</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-police">Taarifa Binafsi</h3>
          <FI label="Jina Kamili" value={form.name} onChange={set("name")} />
          <FI label="Namba ya Simu" value={form.phone} onChange={set("phone")} type="tel" />
          <FI label="Barua Pepe" value={form.email} onChange={set("email")} type="email" />
          <FI label="Kitengo / Unit" value={form.unit} onChange={set("unit")} />

          {/* Read-only fields */}
          <div className="rounded-xl bg-police-muted p-3 space-y-1.5">
            <p className="text-[10px] font-medium text-police-faint uppercase tracking-wide">Taarifa Zisizoweza Kubadilika</p>
            <div className="flex justify-between"><span className="text-[12px] text-police-muted">Nambari ya Afisa</span><span className="text-[12px] font-medium text-police">{OFFICER.id}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-police-muted">Cheo</span><span className="text-[12px] font-medium text-police">{OFFICER.rank}</span></div>
            <div className="flex justify-between"><span className="text-[12px] text-police-muted">Kituo</span><span className="text-[12px] font-medium text-police truncate max-w-[55%] text-right">{OFFICER.station}</span></div>
          </div>
        </div>

        <button onClick={handleSave} className="w-full rounded-xl bg-[#1E3A8A] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
          Hifadhi Mabadiliko
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}

function FI({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-police-muted">{label}</label>
      <input type={type} value={value} onChange={onChange} className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police focus:border-[#2196F3] focus:outline-none" />
    </div>
  );
}
