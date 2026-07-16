"use client";

import { useState, useMemo } from "react";
import { Megaphone, ChevronRight, X, Send, Users, Bell, BellOff } from "lucide-react";
import { TopAppBar } from "../top-app-bar";
import { PoliceIcon } from "../police-icons";
import { ALERTS } from "@/lib/police-data";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

export function AlertsScreen() {
  const { alertFilter, setAlertFilter } = usePoliceStore();
  const [readIds, setReadIds] = useState<number[]>([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const tabs = [
    { id: "all" as const, label: "Yote" },
    { id: "mine" as const, label: "Kesi Zangu", badge: ALERTS.filter((a) => a.category === "mine").length },
    { id: "important" as const, label: "Muhimu" },
  ];

  // Filter alerts based on active tab + read state
  const filteredAlerts = useMemo(() => {
    return ALERTS.filter((alert) => {
      if (alertFilter === "mine") return alert.category === "mine";
      if (alertFilter === "important") return alert.important;
      return true;
    });
  }, [alertFilter]);

  const unreadCount = ALERTS.filter((a) => a.unread && !readIds.includes(a.id)).length;

  const handleAlertClick = (alert: (typeof ALERTS)[0]) => {
    if (a.unread && !readIds.includes(a.id)) {
      setReadIds([...readIds, a.id]);
    }
    toast({ title: alert.title, description: alert.source });
  };

  const markAllRead = () => {
    setReadIds(ALERTS.map((a) => a.id));
    toast({ title: "Zote Zimesomwa", description: "Arifa zote zimealamishwa kuwa zimesomwa." });
  };

  return (
    <div className="min-h-full bg-police">
      <TopAppBar title="Arifa / Tangazo" subtitle="Pata taarifa na matangazo muhimu" />

      <div className="space-y-3 p-4">
        {/* Stats summary */}
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
            <p className="mt-1 text-[16px] font-bold text-police">
              {ALERTS.filter((a) => a.category === "mine").length}
            </p>
            <p className="text-[9px] text-police-faint">Kesi Zangu</p>
          </div>
        </div>

        {/* Tuma Tangazo button */}
        <button
          onClick={() => setBroadcastOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-[#2196F3] p-4 text-left shadow-md shadow-[#2196F3]/20 active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Megaphone size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Tuma Tangazo</p>
            <p className="text-[11px] text-white/80">Tuma tangazo kwa maofisa wote au vikundi maalum</p>
          </div>
        </button>

        {/* Filter Tabs + Mark all read */}
        <div className="flex items-center gap-1 border-b border-police">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAlertFilter(tab.id)}
              className="relative flex items-center gap-1.5 px-3 py-2.5"
            >
              <span
                className={`text-[13px] font-medium ${
                  alertFilter === tab.id ? "font-bold text-[#2196F3]" : "text-police-muted"
                }`}
              >
                {tab.label}
              </span>
              {tab.badge ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F44336] px-1 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              ) : null}
              {alertFilter === tab.id && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#2196F3]" />
              )}
            </button>
          ))}
          <button
            onClick={markAllRead}
            className="ml-auto py-2.5 text-[11px] font-medium text-[#2196F3]"
          >
            Soma Zote
          </button>
        </div>

        {/* Alert List */}
        <div className="space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-police-card py-10 shadow-sm">
              <BellOff size={32} className="text-police-faint" />
              <p className="mt-2 text-[13px] text-police-muted">Hakuna arifa katika kategoria hii</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isRead = !alert.unread || readIds.includes(alert.id);
              return (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="block w-full overflow-hidden rounded-2xl bg-police-card text-left shadow-sm active:scale-[0.99]"
                  style={{ borderLeft: `4px solid ${alert.borderColor}` }}
                >
                  <div className="flex gap-3 p-3.5">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${alert.iconColor}18` }}
                    >
                      <PoliceIcon name={alert.icon} size={20} className="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-[14px] leading-tight text-police-navy ${
                            !isRead ? "font-bold" : "font-semibold"
                          }`}
                        >
                          {alert.title}
                        </h4>
                        {!isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2196F3]" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-police-faint">{alert.time}</p>
                      <p className="mt-1.5 text-[12px] leading-snug text-police-muted">{alert.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: alert.sourceBg, color: alert.borderColor }}
                        >
                          {alert.source}
                        </span>
                        {alert.important && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-600">
                            MUHIMU
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 self-center text-police-faint" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Broadcast modal */}
      {broadcastOpen && <BroadcastModal onClose={() => setBroadcastOpen(false)} />}
    </div>
  );
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [audience, setAudience] = useState<"all" | "unit" | "station">("all");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    toast({
      title: "Tangazo Limetumwa",
      description: `Limetumwa kwa ${
        audience === "all" ? "maofisa wote" : audience === "unit" ? "kitengo chako" : "kituo chako"
      }.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-[400px] rounded-t-3xl bg-police-card p-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-police-border" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[16px] font-bold text-police-navy">
            <Megaphone size={20} className="text-[#2196F3]" />
            Tuma Tangazo
          </h2>
          <button onClick={onClose} className="text-police-muted">
            <X size={20} />
          </button>
        </div>

        {/* Audience */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[12px] font-medium text-police-muted">Walengwa</label>
          <div className="flex gap-2">
            {([
              { id: "all", label: "Wote" },
              { id: "unit", label: "Kitengo" },
              { id: "station", label: "Kituo" },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAudience(opt.id)}
                className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition ${
                  audience === opt.id
                    ? "bg-[#2196F3] text-white"
                    : "bg-police-muted text-police-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[12px] font-medium text-police-muted">Kipaumbele</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPriority("normal")}
              className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition ${
                priority === "normal"
                  ? "bg-[#2196F3] text-white"
                  : "bg-police-muted text-police-muted"
              }`}
            >
              Kawaida
            </button>
            <button
              onClick={() => setPriority("important")}
              className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition ${
                priority === "important"
                  ? "bg-[#F44336] text-white"
                  : "bg-police-muted text-police-muted"
              }`}
            >
              Muhimu
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] font-medium text-police-muted">Ujumbe</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Andika ujumbe wa tangazo hapa..."
            className="w-full rounded-xl border border-police bg-police-input px-3 py-2.5 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2196F3] py-3 text-[14px] font-bold text-white shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          <Send size={18} />
          Tuma Tangazo
        </button>
      </div>
    </div>
  );
}
