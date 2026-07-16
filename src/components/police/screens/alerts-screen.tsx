"use client";

import { useState, useMemo, useRef } from "react";
import { Megaphone, ChevronRight, Send, Users, Bell, BellOff, MessageSquare, X } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { ALERTS, CHAT_MESSAGES } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

type ChatMsg = { id: number; from: string; role: string; message: string; time: string; mine: boolean };

export function AlertsScreen() {
  const { alertFilter, setAlertFilter } = usePoliceStore();
  const [readIds, setReadIds] = useState<number[]>([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredAlerts = useMemo(() => ALERTS.filter((a) => {
    if (alertFilter === "mine") return a.category === "mine";
    if (alertFilter === "important") return a.important;
    return true;
  }), [alertFilter]);

  const unreadCount = ALERTS.filter((a) => a.unread && !readIds.includes(a.id)).length;

  const handleAlertClick = (alert: (typeof ALERTS)[0]) => {
    if (alert.unread && !readIds.includes(alert.id)) setReadIds((r) => [...r, alert.id]);
    toast({ title: alert.title, description: alert.message });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" });
    setChatMsgs((m) => [...m, { id: Date.now(), from: "Cprl. Juma", role: "officer", message: chatInput, time, mine: true }]);
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
            <BellOff size={18} className="mx-auto text-[#F44336]" />
            <p className="mt-1 text-[16px] font-bold text-[#F44336]">{unreadCount}</p>
            <p className="text-[9px] text-police-faint">Haijasomwa</p>
          </div>
          <div className="rounded-xl bg-police-card p-2.5 text-center shadow-sm">
            <Users size={18} className="mx-auto text-[#FF9800]" />
            <p className="mt-1 text-[16px] font-bold text-police">{ALERTS.filter((a) => a.category === "mine").length}</p>
            <p className="text-[9px] text-police-faint">Kesi Zangu</p>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setBroadcastOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#2196F3] p-3 text-left shadow-md active:scale-[0.98]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><Megaphone size={18} className="text-white" /></div>
            <span className="text-[13px] font-bold text-white">Tuma Tangazo</span>
          </button>
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#10B981] p-3 text-left shadow-md active:scale-[0.98]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><MessageSquare size={18} className="text-white" /></div>
            <span className="text-[13px] font-bold text-white">Kikosi Chat</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {([{ id: "all", label: "Yote" }, { id: "mine", label: "Kesi Zangu" }, { id: "important", label: "Muhimu" }] as const).map((tab) => (
            <button key={tab.id} onClick={() => setAlertFilter(tab.id)} className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition ${alertFilter === tab.id ? "bg-[#2196F3] text-white" : "bg-police-muted text-police-muted"}`}>{tab.label}</button>
          ))}
        </div>

        {/* Alert List */}
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const isUnread = alert.unread && !readIds.includes(alert.id);
            return (
              <button key={alert.id} onClick={() => handleAlertClick(alert)} className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] ${isUnread ? "border-l-4 bg-police-card" : "bg-police-card/60 border-police-soft"}`} style={{ borderLeftColor: isUnread ? alert.borderColor : undefined }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: alert.sourceBg }}>
                    <PoliceIcon name={alert.icon} size={18} style={{ color: alert.iconColor }} className="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-[13px] font-bold text-police ${isUnread ? "" : "opacity-75"}`}>{alert.title}</p>
                      <span className="shrink-0 text-[10px] text-police-faint">{alert.time}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-police-muted">{alert.message}</p>
                    <p className="mt-1 text-[10px] font-medium" style={{ color: alert.dotColor }}>{alert.source}</p>
                  </div>
                  <ChevronRight size={14} className="mt-1 shrink-0 text-police-faint" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastOpen && <BroadcastModal onClose={() => setBroadcastOpen(false)} />}

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-police">
          <div className="flex items-center justify-between bg-[#1E3A8A] px-4 py-3">
            <div>
              <p className="text-[16px] font-bold text-white">Kikosi Chat</p>
              <p className="text-[11px] text-white/70">Mazungumzo ya kikosi • {chatMsgs.length} ujumbe</p>
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
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Andika ujumbe..."
                className="h-10 flex-1 bg-transparent text-[14px] text-police placeholder:text-police-faint focus:outline-none"
              />
              <button onClick={sendChat} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2196F3] active:scale-95">
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [audience, setAudience] = useState("all");

  const send = () => {
    if (!title || !msg) { toast({ title: "Kosa", description: "Jaza kichwa na ujumbe.", variant: "destructive" }); return; }
    toast({ title: "Tangazo Limetumwa ✓", description: `"${title}" limetumwa kwa ${audience === "all" ? "kikosi chote" : audience}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="w-full rounded-t-3xl bg-police p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[17px] font-bold text-police">Tuma Tangazo</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-police-muted"><X size={16} className="text-police" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Kichwa cha Tangazo</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kichwa..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[14px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Walengwa</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police focus:border-[#2196F3] focus:outline-none">
              <option value="all">Vikosi Vyote</option>
              <option value="traffic">Kikosi cha Trafiki</option>
              <option value="general">Kikosi cha Jumla</option>
              <option value="commanders">Makamanda</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-police-muted">Ujumbe</label>
            <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Andika ujumbe..." className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none" />
          </div>
          <button onClick={send} className="w-full rounded-xl bg-[#2196F3] py-3 text-[15px] font-bold text-white active:scale-[0.98]">
            <Send size={16} className="mr-2 inline" /> Tuma Tangazo
          </button>
        </div>
      </div>
    </div>
  );
}


