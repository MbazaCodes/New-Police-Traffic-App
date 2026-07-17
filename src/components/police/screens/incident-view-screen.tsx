"use client";

import { ArrowLeft, MapPin, Clock, User, AlertTriangle, FileText, Shield, UserX } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { GENERAL_INCIDENTS } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  "Yanaendelea": "#FF9800",
  "Tatuliwa":    "#10B981",
  "Mpya":        "#2563EB",
  "Hatarini":    "#EF4444",
};

export function IncidentViewScreen() {
  const { goBack, selectedIncidentId, navigate, setArrestPrefill, setIncidentPrefill } = usePoliceStore();
  const incident = GENERAL_INCIDENTS.find((i) => i.id === selectedIncidentId);

  if (!incident) {
    return (
      <div className="min-h-full bg-police flex flex-col items-center justify-center p-6 gap-4">
        <AlertTriangle size={40} className="text-police-faint" />
        <p className="text-[14px] text-police-muted">Tukio halijapatikani.</p>
        <button onClick={() => goBack()} className="rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-[14px] font-bold text-white">Rudi</button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[incident.status] ?? "#888";

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-4">
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Rudi</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[11px] text-white/60 uppercase tracking-wide">{incident.type}</p>
            <h1 className="mt-0.5 text-[17px] font-bold leading-snug text-white">{incident.title}</h1>
          </div>
          <span className="mt-1 shrink-0 rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: `${statusColor}40`, border: `1px solid ${statusColor}` }}>
            {incident.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-white/70">
          <span className="flex items-center gap-1"><Clock size={11} /> {incident.date} • {incident.time}</span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Key info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-police-card p-3 text-center shadow-sm">
            <p className="text-[10px] text-police-faint">Majeruhi</p>
            <p className="mt-1 text-[22px] font-extrabold" style={{ color: incident.casualties > 0 ? "#EF4444" : "#10B981" }}>{incident.casualties}</p>
            <p className="text-[9px] text-police-faint">{incident.casualties > 0 ? "Wanahitaji msaada" : "Hakuna"}</p>
          </div>
          <div className="rounded-2xl bg-police-card p-3 text-center shadow-sm">
            <p className="text-[10px] text-police-faint">Afisa Aliyepewa</p>
            <p className="mt-1 text-[12px] font-bold text-police leading-tight">{incident.officer}</p>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police">Maelezo ya Tukio</h3>
          <div className="space-y-3">
            <DR icon={<FileText size={15} />} label="Aina ya Tukio" value={incident.type} />
            <DR icon={<MapPin size={15} />} label="Mahali" value={incident.location} />
            <DR icon={<Clock size={15} />} label="Tarehe na Saa" value={`${incident.date} saa ${incident.time}`} />
            <DR icon={<User size={15} />} label="Afisa" value={incident.officer} />
          </div>
          <div className="mt-3 border-t border-police-soft pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-police-faint">Maelezo Kamili</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-police">{incident.description}</p>
          </div>
        </div>

        {/* Status tracker */}
        <div className="rounded-2xl bg-police-card p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-police">Hali ya Kesi</h3>
          <div className="flex items-center gap-2">
            {["Mpya", "Yanaendelea", "Tatuliwa"].map((s, i) => {
              const statuses = ["Mpya", "Yanaendelea", "Tatuliwa"];
              const currentIdx = statuses.indexOf(incident.status);
              const isActive = i <= currentIdx;
              const isNow = s === incident.status;
              return (
                <div key={s} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${isNow ? "bg-[#1E3A8A] text-white" : isActive ? "bg-[#10B981]/20 text-[#10B981]" : "bg-police-muted text-police-faint"}`}>
                    {i + 1}
                  </div>
                  <p className={`text-center text-[9px] ${isNow ? "font-bold text-[#1E3A8A]" : isActive ? "text-[#10B981]" : "text-police-faint"}`}>{s}</p>
                  {i < 2 && <div className={`absolute h-0.5 w-8 translate-x-10 ${isActive ? "bg-[#10B981]" : "bg-police-muted"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setIncidentPrefill({ citizenName: "", citizenNida: "", citizenPhone: "", citizenAddress: incident.location });
              navigate("incident-detail");
            }}
            className="w-full rounded-xl bg-[#2563EB] py-3 text-[14px] font-bold text-white active:scale-[0.98]"
          >
            <FileText size={16} className="mr-2 inline" /> Ongeza Ripoti Mpya kwa Tukio Hili
          </button>
          {incident.status !== "Tatuliwa" && (
            <button
              onClick={() => toast({ title: "Imesasishwa", description: `${incident.title} imewekwa kuwa Tatuliwa.` })}
              className="w-full rounded-xl bg-[#10B981] py-3 text-[14px] font-bold text-white active:scale-[0.98]"
            >
              <Shield size={16} className="mr-2 inline" /> Weka Kuwa Tatuliwa
            </button>
          )}
          <button
            onClick={() => {
              setArrestPrefill({ suspectName: "", nida: "", phone: "", plate: "", licenseNo: "" });
              navigate("arrest-form");
            }}
            className="w-full rounded-xl border border-police py-3 text-[14px] font-semibold text-police active:scale-[0.98]"
          >
            <UserX size={16} className="mr-2 inline" /> Kamata Mtuhumiwa wa Tukio Hili
          </button>
        </div>
      </div>
    </div>
  );
}

function DR({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A]">{icon}</div>
      <div>
        <p className="text-[10px] text-police-faint uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-medium text-police">{value}</p>
      </div>
    </div>
  );
}
