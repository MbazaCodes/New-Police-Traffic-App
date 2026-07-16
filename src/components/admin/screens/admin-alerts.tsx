"use client";

import { useState } from "react";
import { Send, Bell, Users, AlertTriangle, Mail, Megaphone } from "lucide-react";
import { ADMIN_ALERTS_HISTORY, ADMIN_USER } from "@/lib/admin-data";
import { toast } from "@/hooks/use-toast";

const AUDIENCE_OPTIONS = [
  { id: "all", label: "Wote", icon: Users, count: 147 },
  { id: "trafiki", label: "Trafiki", icon: Megaphone, count: 52 },
  { id: "uhalifu", label: "Uhalifu", icon: AlertTriangle, count: 38 },
  { id: "patrol", label: "Patroli", icon: Bell, count: 31 },
  { id: "kituo-dsm", label: "Kituo - DSM", icon: Mail, count: 26 },
] as const;

const PRIORITY_OPTIONS = [
  { id: "normal", label: "Kawaida", color: "#2196F3" },
  { id: "high", label: "Muhimu", color: "#F44336" },
] as const;

export function AdminAlerts() {
  const [audience, setAudience] = useState<string>("all");
  const [priority, setPriority] = useState<string>("normal");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selectedAudience =
    AUDIENCE_OPTIONS.find((a) => a.id === audience) ?? AUDIENCE_OPTIONS[0];

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "Hitilafu",
        description: "Tafadhali andika ujumbe kabla ya kutuma",
      });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({
        title: "Tangazo Limetumwa",
        description: `Limewafikia ${selectedAudience.count} wa ${selectedAudience.label}`,
      });
      setMessage("");
    }, 800);
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-bold text-police-navy">Arifa & Tangazo</h1>
        <p className="text-[13px] text-police-muted">
          Tuma tangazo na fuatilia historia ya arifa zote
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Compose form */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <Send size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-police-navy">
                Tuma Tangazo
              </h2>
              <p className="text-[11px] text-police-muted">
                Tangaza kwa maafisa haraka
              </p>
            </div>
          </div>

          {/* Audience selector */}
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-police-faint">
            Walengwa
          </label>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {AUDIENCE_OPTIONS.map((a) => {
              const Icon = a.icon;
              const active = audience === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAudience(a.id)}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${
                    active
                      ? "border-[#2196F3] bg-[#2196F3]/10"
                      : "border-police-soft bg-police-input hover:bg-police-muted"
                  }`}
                >
                  <Icon
                    size={14}
                    className={active ? "text-[#2196F3]" : "text-police-faint"}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-semibold ${
                        active ? "text-[#2196F3]" : "text-police"
                      }`}
                    >
                      {a.label}
                    </p>
                    <p className="text-[9px] text-police-faint">{a.count} walengwa</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Priority */}
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-police-faint">
            Kipaumbele
          </label>
          <div className="mb-4 flex gap-2">
            {PRIORITY_OPTIONS.map((p) => {
              const active = priority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold transition ${
                    active
                      ? "text-white"
                      : "border-police-soft bg-police-input text-police-muted"
                  }`}
                  style={
                    active
                      ? { backgroundColor: p.color, borderColor: p.color }
                      : undefined
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Message */}
          <label className="mb-1.5 block text-[11px] font-semibold uppercase text-police-faint">
            Ujumbe
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Andika ujumbe wa tangazo hapa..."
            className="w-full resize-none rounded-lg border border-police-soft bg-police-input p-3 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-police-faint">
            <span>{message.length}/500 wahusika</span>
            <span>
              Litawafikia:{" "}
              <strong className="text-police-navy">
                {selectedAudience.count} wa {selectedAudience.label}
              </strong>
            </span>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2196F3] py-3 text-[13px] font-semibold text-white transition hover:bg-[#1E88E5] disabled:opacity-60"
          >
            <Send size={15} />
            {sending ? "Inatuma..." : "Tuma Tangazo"}
          </button>
        </div>

        {/* History table */}
        <div className="rounded-xl bg-police-card p-4 shadow-sm xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-police-navy">
              Historia ya Arifa
            </h2>
            <span className="rounded-lg bg-police-input px-2.5 py-1 text-[11px] text-police-muted">
              {ADMIN_ALERTS_HISTORY.length} arifa
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                  <th className="px-3 py-3 font-semibold">Kichwa</th>
                  <th className="px-3 py-3 font-semibold">Walengwa</th>
                  <th className="px-3 py-3 font-semibold">Kipaumbele</th>
                  <th className="px-3 py-3 font-semibold">Aliyetuma</th>
                  <th className="px-3 py-3 font-semibold">Tarehe/Saa</th>
                  <th className="px-3 py-3 text-right font-semibold">Wapokeaji</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_ALERTS_HISTORY.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {a.priority === "high" ? (
                          <AlertTriangle size={14} className="shrink-0 text-red-500" />
                        ) : (
                          <Bell size={14} className="shrink-0 text-police-faint" />
                        )}
                        <span className="font-semibold text-police">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-police-muted">{a.audience}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          a.priority === "high"
                            ? "bg-red-500/15 text-red-500"
                            : "bg-[#2196F3]/15 text-[#2196F3]"
                        }`}
                      >
                        {a.priority === "high" ? "Muhimu" : "Kawaida"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-police-muted">{a.sentBy}</td>
                    <td className="px-3 py-3 text-police-muted">
                      <div>{a.date}</div>
                      <div className="text-[10px] text-police-faint">{a.time}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-police-navy">
                      {a.recipients}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg bg-police-muted/40 p-3 text-[11px] text-police-muted">
            <p>
              <strong className="text-police-navy">Msimamizi:</strong>{" "}
              {ADMIN_USER.shortName} • {ADMIN_USER.rank}
            </p>
            <p className="mt-0.5 text-police-faint">
              Arifa zote zinahifadhiwa kwenye mfumo kwa ajili ya usimamizi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
