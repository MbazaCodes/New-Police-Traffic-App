"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronRight, Send, Users, Bell, BellOff, MessageSquare, X, AlertOctagon, CheckCheck, ChevronDown } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { ALERTS, CHAT_MESSAGES } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

type ChatMsg = { id: number; from: string; role: string; message: string; time: string; mine: boolean };

export function AlertsScreen() {
  const { alertFilter, setAlertFilter, readAlertIds, markAlertRead, markAllAlertsRead, unreadAlertCount } = usePoliceStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredAlerts = useMemo(() => ALERTS.filter((a) => {
    if (alertFilter === "mine") return a.category === "mine";
    if (alertFilter === "important") return a.important;
    return true;
  }), [alertFilter]);

  const unread = unreadAlertCount();

  const handleAlertClick = (id: number) => {
    markAlertRead(id);
    setExpandedId((prev) => prev === id ? null : id);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });
    setChatMsgs((m) => [...m, { id: Date.now(), from: "Afisa wa Polisi", role: "officer", message: chatInput, time, mine: true }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Arifa / Tangazo" subtitle="Pata taarifa na matangazo muhimu" />
      <div className="space-y-3 p-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <Bell size={18} className="mx-auto text-[#2196F3]" />
            <p className="mt-1 text-[16px] font-bold text-police">{ALERTS.length}</p>
            <p className="text-[9px] text-police-faint">Jumla</p>
          </div>
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <BellOff size={18} className="mx-auto text-[#EF4444]" />
            <p className="mt-1 text-[16px] font-bold text-[#EF4444]">{unread}</p>
            <p className="text-[9px] text-police-faint">Haijasomwa</p>
          </div>
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <Users size={18} className="mx-auto text-[#FF9800]" />
            <p className="mt-1 text-[16px] font-bold text-police">{ALERTS.filter((a) => a.category === "mine").length}</p>
            <p className="text-[9px] text-police-faint">Kesi Zangu</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSosOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#EF4444] p-3 text-left shadow-md active:scale-[0.98]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><AlertOctagon size={18} className="text-white" /></div>
            <span className="text-[13px] font-bold text-white">Omba Msaada SOS</span>
          </button>
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#10B981] p-3 text-left shadow-md active:scale-[0.98]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><MessageSquare size={18} className="text-white" /></div>
            <span className="text-[13px] font-bold text-white">Kikosi Chat</span>
          </button>
        </div>

        {/* Filter tabs + mark all */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2">
            {([{ id: "all", label: "Yote" }, { id: "mine", label: "Zangu" }, { id: "important", label: "Muhimu" }] as const).map((tab) => (
              <button key={tab.id} onClick={() => setAlertFilter(tab.id)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${alertFilter === tab.id ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>{tab.label}</button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={() => markAllAlertsRead()} className="flex items-center gap-1 rounded-lg bg-police-card px-2.5 py-1.5 text-[11px] font-medium text-police-muted shadow-sm">
              <CheckCheck size={13} /> Soma Zote
            </button>
          )}
        </div>

        {/* Alert list */}
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const isUnread = alert.unread && !readAlertIds.includes(alert.id);
            const expanded = expandedId === alert.id;
            return (
              <div key={alert.id} className={`rounded-xl border bg-police-card transition ${isUnread ? "border-l-4" : "border-police-soft"}`} style={{ borderLeftColor: isUnread ? alert.borderColor : undefined }}>
                <button onClick={() => handleAlertClick(alert.id)} className="flex w-full items-start gap-3 p-3 text-left active:scale-[0.99]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: alert.sourceBg }}>
                    <PoliceIcon name={alert.icon} size={18} style={{ color: alert.iconColor }} className="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-[13px] font-bold text-police ${isUnread ? "" : "opacity-75"}`}>{alert.title}</p>
                      <span className="shrink-0 text-[10px] text-police-faint">{alert.time}</span>
                    </div>
                    {!expanded && <p className="mt-0.5 line-clamp-1 text-[11px] text-police-muted">{alert.message}</p>}
                    <p className="mt-0.5 text-[10px] font-medium" style={{ color: alert.dotColor }}>{alert.source}</p>
                  </div>
                  <ChevronDown size={14} className={`mt-1 shrink-0 text-police-faint transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && (
                  <div className="border-t border-police-soft px-4 pb-3 pt-2">
                    <p className="text-[13px] leading-relaxed text-police">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-police-faint">{alert.source} • {alert.time}</span>
                      {alert.important && <span className="rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[9px] font-bold text-[#EF4444]">MUHIMU</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SOS Modal */}
      {sosOpen && <SosModal onClose={() => setSosOpen(false)} />}

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-police">
          <div className="flex items-center justify-between bg-[#1E3A8A] px-4 py-3">
            <div>
              <p className="text-[16px] font-bold text-white">Kikosi Chat</p>
              <p className="text-[11px] text-white/70">{chatMsgs.length} ujumbe</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><X size={18} className="text-white" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMsgs.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${m.mine ? "bg-[#2196F3] text-white rounded-br-sm" : "bg-police-card text-police rounded-bl-sm"}`}>
                  {!m.mine && <p className="text-[10px] font-bold text-[#FF9800] mb-0.5">{m.from}</p>}
                  <p className="text-[13px] leading-snug">{m.message}</p>
                  <p className={`mt-1 text-[9px] text-right ${m.mine ? "text-white/70" : "text-police-faint"}`}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-police p-3">
            <div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Andika ujumbe..." className="h-10 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none" />
              <button onClick={sendChat} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3] active:scale-95"><Send size={15} className="text-white" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SosModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("backup");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!location) { toast({ title: "Taja mahali", description: "Weka eneo lako la sasa.", variant: "destructive" }); return; }
    setSent(true);
    setTimeout(() => { toast({ title: "SOS Imetumwa ✓", description: "Ujumbe wa dharura umepelekwa kwa Command Center." }); onClose(); }, 1500);
  };

  const types = [
    { id: "backup", label: "Msaada wa Ziada", color: "#FF9800" },
    { id: "medical", label: "Dharura ya Matibabu", color: "#EF4444" },
    { id: "threat", label: "Tishio la Usalama", color: "#1E3A8A" },
    { id: "accident", label: "Ajali", color: "#2196F3" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-3xl bg-police p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon size={20} className="text-[#EF4444]" />
            <p className="text-[17px] font-bold text-police">Omba Msaada — SOS</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-police-muted"><X size={16} className="text-police" /></button>
        </div>
        {sent ? (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]/15 animate-pulse"><AlertOctagon size={32} className="text-[#EF4444]" /></div>
            <p className="mt-3 text-[15px] font-bold text-police">Inatuma SOS...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {types.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} className={`rounded-xl border-2 py-2.5 text-[12px] font-bold transition ${type === t.id ? "text-white" : "border-police text-police-muted"}`} style={type === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Eneo Lako Sasa <span className="text-[#EF4444]">*</span></label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Barabara / mtaa / kiungo cha karibu" className="w-full rounded-xl border border-police bg-police-input px-3 h-10 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-police-muted">Maelezo ya Ziada</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Maelezo ya hali..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
            </div>
            <button onClick={send} className="w-full rounded-xl bg-[#EF4444] py-3 text-[15px] font-bold text-white active:scale-[0.98]">
              <AlertOctagon size={16} className="mr-2 inline" /> Tuma SOS Sasa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
