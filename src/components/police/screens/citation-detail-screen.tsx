"use client";

import { ArrowLeft, FileText, Car, User, MapPin, Clock, TrendingDown, CheckCircle, XCircle, Printer, Share2 } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { CITATION_HISTORY } from "@/lib/police-data";
import { toast } from "@/hooks/use-toast";

export function CitationDetailScreen() {
  const { goBack, selectedCitationId } = usePoliceStore();
  const citation = CITATION_HISTORY.find((c) => c.id === selectedCitationId);

  if (!citation) {
    return (
      <div className="min-h-full bg-police flex flex-col items-center justify-center p-6 gap-4">
        <FileText size={40} className="text-police-faint" />
        <p className="text-[14px] text-police-muted">Citation haijapatikana.</p>
        <button onClick={() => goBack()} className="rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-[14px] font-bold text-white">Rudi</button>
      </div>
    );
  }

  const isPaid = citation.status === "Imelipwa";

  const handlePrint = () => window.print();
  const handleShare = () => {
    const text = `Citation ${citation.id}\nGari: ${citation.plate}\nKosa: ${citation.offense}\nFaini: ${citation.fine}\nDereva: ${citation.driver}\nTarehe: ${citation.date}`;
    navigator.clipboard?.writeText(text).then(() => {
      toast({ title: "Imenakiliwa ✓", description: "Maelezo ya citation yamenakiliwa kwenye clipboard." });
    }).catch(() => toast({ title: "Kushiriki", description: text }));
  };
  const handleMarkPaid = () => toast({ title: "Imesasishwa", description: `${citation.id} imewekwa kuwa imelipwa. (Demo)` });

  return (
    <div className="min-h-full bg-police">
      {/* Header */}
      <div className={`px-4 py-4 ${isPaid ? "bg-gradient-to-r from-[#10B981] to-[#059669]" : "bg-gradient-to-r from-[#EF4444] to-[#DC2626]"}`}>
        <button onClick={() => goBack()} className="mb-3 flex items-center gap-2 text-white/80">
          <ArrowLeft size={18} /> <span className="text-[13px]">Historia</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-medium text-white/70">Nambari ya Citation</p>
            <h1 className="text-[20px] font-bold text-white">{citation.id}</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${isPaid ? "bg-white/20 text-white" : "bg-white/20 text-white"}`}>
            {isPaid ? "✓ Imelipwa" : "⚠ Hajalipwa"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-white/70">{citation.date} saa {citation.time}</p>
      </div>

      <div className="space-y-4 p-4">
        {/* Offense + Fine */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-police-card p-4 text-center shadow-sm">
            <p className="text-[10px] text-police-faint">Faini</p>
            <p className="mt-1 text-[20px] font-extrabold text-[#EF4444]">{citation.fine}</p>
            <p className="mt-0.5 text-[10px] text-police-faint">Tanzanian Shilling</p>
          </div>
          <div className="rounded-2xl bg-police-card p-4 text-center shadow-sm">
            <p className="text-[10px] text-police-faint">Pointi Zilizopunguzwa</p>
            <p className="mt-1 text-[20px] font-extrabold text-[#FF9800]">-{citation.deductedPoints}</p>
            <div className="mt-0.5 flex items-center justify-center gap-1"><TrendingDown size={11} className="text-[#FF9800]" /><span className="text-[10px] text-police-faint">kutoka 100</span></div>
          </div>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${isPaid ? "bg-[#10B981]/10 border border-[#10B981]/30" : "bg-[#EF4444]/10 border border-[#EF4444]/30"}`}>
          {isPaid ? <CheckCircle size={22} className="shrink-0 text-[#10B981]" /> : <XCircle size={22} className="shrink-0 text-[#EF4444]" />}
          <div>
            <p className={`text-[14px] font-bold ${isPaid ? "text-[#10B981]" : "text-[#EF4444]"}`}>{isPaid ? "Faini Imelipwa" : "Faini Haijalipwa"}</p>
            <p className="text-[11px] text-police-muted">{isPaid ? "Malipo yamepokelewa na kurekodiwa." : "Faini bado haijafanywa malipo."}</p>
          </div>
        </div>

        {/* Offense details */}
        <div className="tpf-card p-4">
          <h3 className="mb-3 text-[14px] font-bold text-police">Maelezo ya Kosa</h3>
          <div className="space-y-3">
            <DR icon={<FileText size={15} />} label="Kosa" value={citation.offense} />
            <DR icon={<Car size={15} />} label="Namba ya Gari" value={citation.plate} />
            <DR icon={<User size={15} />} label="Dereva" value={citation.driver} />
            <DR icon={<MapPin size={15} />} label="Eneo" value={citation.location} />
            <DR icon={<Clock size={15} />} label="Tarehe na Saa" value={`${citation.date} • ${citation.time}`} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handlePrint} className="flex items-center justify-center gap-2 rounded-xl border border-police py-2.5 text-[13px] font-semibold text-police active:scale-[0.98]">
            <Printer size={16} /> Chapisha
          </button>
          <button onClick={handleShare} className="flex items-center justify-center gap-2 rounded-xl border border-police py-2.5 text-[13px] font-semibold text-police active:scale-[0.98]">
            <Share2 size={16} /> Shiriki
          </button>
        </div>

        {!isPaid && (
          <button onClick={handleMarkPaid} className="w-full rounded-xl bg-[#10B981] py-3 text-[14px] font-bold text-white shadow-md active:scale-[0.98]">
            Weka Kuwa Imelipwa
          </button>
        )}
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
