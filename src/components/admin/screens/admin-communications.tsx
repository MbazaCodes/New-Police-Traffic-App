"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send, Shield, Phone, AlertTriangle, User, Search, X,
  ChevronRight, Mic, Clock, CheckCheck, UserCheck, UserX,
  Bell, Radio, Zap, FileText, RefreshCw, Plus, Megaphone,
} from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { toast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────
type CommTab = "messages" | "wafungwa" | "orders";
type MsgStatus = "sent" | "delivered" | "read";

interface Message {
  id: string; from: string; fromBadge: string; to: string; toBadge: string;
  text: string; time: string; status: MsgStatus; isOwn: boolean;
}
interface Conversation {
  id: string; name: string; badge: string; role: string; station: string;
  lastMsg: string; lastTime: string; unread: number; online: boolean;
}
interface CommandOrder {
  id: string; toOfficer: string; toBadge: string; order: string;
  priority: "urgent" | "high" | "normal"; sentBy: string;
  sentAt: string; status: "sent" | "acknowledged" | "completed";
}

// ── Seed data ──────────────────────────────────────────────────────────────
const CONVERSATIONS: never[] = [];

const INIT_MSGS: Record<string, Message[]> = {};

const INIT_ORDERS: CommandOrder[] = [
  { id:"ORD-001", toOfficer:"Cprl. Juma Mwinyi", toBadge:"TP123456",
    order:"Nenda Morogoro Road mara moja — ajali imetokea. Ripoti hali.",
    priority:"urgent", sentBy:"CSP. Yusuph Majaliwa", sentAt:"08:32", status:"acknowledged" },
  { id:"ORD-002", toOfficer:"Sgt. Afisa", toBadge:"TP234567",
    order:"Ongeza doria eneo la Kariakoo masaa 2 ijao.",
    priority:"high", sentBy:"CSP. Yusuph Majaliwa", sentAt:"08:15", status:"sent" },
  { id:"ORD-003", toOfficer:"Insp. Grace Mushi", toBadge:"GO123456",
    order:"Fika CID HQ saa 4 asubuhi kwa mkutano wa dharura.",
    priority:"normal", sentBy:"CSP. Yusuph Majaliwa", sentAt:"07:50", status:"completed" },
];

const ORDER_COLOR = { urgent:"#EF4444", high:"#FF9800", normal:"#2196F3" };
const ORDER_LABEL = { urgent:"Dharura", high:"Muhimu", normal:"Kawaida" };
const ORD_STATUS_COLOR = { sent:"#FF9800", acknowledged:"#2196F3", completed:"#10B981" };
const ORD_STATUS_LABEL = { sent:"Imetumwa", acknowledged:"Imepokelewa", completed:"Imekamilika" };

const STATUS_MAP = {
  held:"#EF4444", released:"#10B981", charged:"#1E3A8A", investigating:"#FF9800"
} as const;
const STATUS_LABEL = {
  held:"Kizuizini", released:"Ameachiwa", charged:"Ameshtakiwa", investigating:"Uchunguzi"
} as const;

export function AdminCommunications() {
  const { authRole } = usePoliceStore();
  const [tab, setTab]             = useState<CommTab>("messages");
  const [activeConv, setActiveConv] = useState<Conversation|null>(null);
  const [messages, setMessages]   = useState<Record<string,Message[]>>(INIT_MSGS);
  const [text, setText]           = useState("");
  const [search, setSearch]       = useState("");
  const [orders, setOrders]       = useState<CommandOrder[]>(INIT_ORDERS);
  const [detained, setDetained]   = useState([] as {id:string;fullName:string;reason:string;status:string;cell:string;detainedDate:string;officer:string}[]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ toOfficer:"", toBadge:"", order:"", priority:"normal" as "urgent"|"high"|"normal" });
  const [detSearch, setDetSearch] = useState("");
  const [detFilter, setDetFilter] = useState("all");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const isCommander = ["NATIONAL_COMMANDER","REGIONAL_COMMANDER","DISTRICT_COMMANDER",
    "STATION_COMMANDER","SUPER_ADMIN","DIG"].includes(authRole ?? "");

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, activeConv]);

  const convList = useMemo(() =>
    CONVERSATIONS.filter(c =>
      !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.badge.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const currentMsgs = activeConv ? (messages[activeConv.id] || []) : [];

  function sendMessage() {
    if (!text.trim() || !activeConv) return;
    const msg: Message = {
      id: `M-${Date.now()}`, from:"Kamanda", fromBadge:"CMD",
      to: activeConv.name, toBadge: activeConv.badge,
      text: text.trim(), time: new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),
      status:"sent", isOwn:true,
    };
    setMessages(m => ({ ...m, [activeConv.id]: [...(m[activeConv.id]||[]), msg] }));
    setText("");
    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id:`M-${Date.now()+1}`, from:activeConv.name, fromBadge:activeConv.badge,
        to:"Kamanda", toBadge:"CMD",
        text: ["Sawa Kamanda, nimeelewa.","Ndio Kamanda, natii.","Naendelea mara moja.","Ripoti baadaye."][Math.floor(Math.random()*4)],
        time: new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),
        status:"read", isOwn:false,
      };
      setMessages(m => ({ ...m, [activeConv.id]: [...(m[activeConv.id]||[]), reply] }));
    }, 1500 + Math.random()*2000);
  }

  function sendOrder() {
    if (!orderForm.toOfficer || !orderForm.order) {
      toast({title:"Kosa",description:"Chagua afisa na andika amri.",variant:"destructive"}); return;
    }
    const newOrder: CommandOrder = {
      id:`ORD-${Date.now()}`, toOfficer:orderForm.toOfficer, toBadge:orderForm.toBadge,
      order:orderForm.order, priority:orderForm.priority, sentBy:"Kamanda",
      sentAt:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),
      status:"sent",
    };
    setOrders(o => [newOrder,...o]);
    setShowOrderForm(false);
    setOrderForm({toOfficer:"",toBadge:"",order:"",priority:"normal"});
    toast({title:"Amri Imetumwa ✓",description:`Amri imetumwa kwa ${newOrder.toOfficer}`});
  }

  function releaseDetained(id: string) {
    setDetained(d => d.map(r => r.id===id ? {...r,status:"released"} : r));
    toast({title:"Mfungwa Ameachiwa ✓",description:"Hali imebadilishwa."});
  }

  const filtDetained = detained.filter(d => {
    const match = !detSearch || d.fullName.toLowerCase().includes(detSearch.toLowerCase()) || d.reason.toLowerCase().includes(detSearch.toLowerCase());
    const filt = detFilter==="all" || d.status===detFilter;
    return match && filt;
  });

  // ── Conversation view ────────────────────────────────────────────────────
  if (tab==="messages" && activeConv) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-police-soft bg-police-card px-4 py-3">
          <button onClick={() => setActiveConv(null)} className="text-[#2196F3] text-[13px]">← Rudi</button>
          <img src={avatarUrl(activeConv.name)} alt={activeConv.name} className="h-9 w-9 rounded-full object-cover"/>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-police truncate">{activeConv.name}</p>
            <p className="text-[10px] text-police-muted">{activeConv.badge} · {activeConv.station}</p>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full ${activeConv.online?"bg-[#10B981]":"bg-gray-400"}`}/>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-police-muted">
          {currentMsgs.length===0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Radio size={32} className="text-police-faint mb-2"/>
              <p className="text-[12px] text-police-faint">Anza mazungumzo na {activeConv.name}</p>
            </div>
          )}
          {currentMsgs.map(msg => (
            <div key={msg.id} className={`flex ${msg.isOwn?"justify-end":"justify-start"}`}>
              {!msg.isOwn && <img src={avatarUrl(msg.from)} alt={msg.from} className="mr-2 h-7 w-7 rounded-full object-cover self-end"/>}
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                msg.isOwn ? "rounded-br-md bg-[#1E3A8A] text-white" : "rounded-bl-md bg-police-card text-police"
              }`}>
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.isOwn?"justify-end":""}`}>
                  <span className="text-[9px] opacity-60">{msg.time}</span>
                  {msg.isOwn && <CheckCheck size={11} className={msg.status==="read"?"text-[#2196F3]":"opacity-50"}/>}
                </div>
              </div>
            </div>
          ))}
          <div ref={msgEndRef}/>
        </div>

        {/* Input */}
        <div className="border-t border-police-soft bg-police-card px-3 py-2.5">
          <div className="flex items-center gap-2">
            <input value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
              placeholder="Andika ujumbe..."
              className="flex-1 rounded-xl border border-police bg-police-muted px-3 py-2 text-[13px] text-police placeholder:text-police-faint focus:border-[#2196F3] focus:outline-none"/>
            <button onClick={sendMessage} disabled={!text.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A8A] text-white disabled:opacity-40">
              <Send size={16}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main tabbed view ──────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[var(--tpf-border)] bg-[var(--tpf-card)]">
        {([
          ["messages","💬 Ujumbe"],
          ["wafungwa","🔒 Wafungwa"],
          ["orders","📡 Amri"],
        ] as const).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-3 text-[12px] font-semibold transition ${
              tab===id ? "border-b-2 border-[#2196F3] text-[#2196F3]" : "text-police-muted"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── MESSAGES TAB ─────────────────────────────────────────────── */}
      {tab==="messages" && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center gap-2 rounded-xl border border-police bg-police-card px-3">
              <Search size={14} className="text-police-faint"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tafuta afisa..."
                className="h-9 flex-1 bg-transparent text-[12px] text-police placeholder:text-police-faint focus:outline-none"/>
              {search && <button onClick={()=>setSearch("")}><X size={12}/></button>}
            </div>
          </div>
          <div className="divide-y divide-police-soft">
            {convList.map(c => (
              <div key={c.id} onClick={()=>setActiveConv(c)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-police-muted cursor-pointer transition">
                <div className="relative">
                  <img src={avatarUrl(c.name)} alt={c.name} className="h-11 w-11 rounded-full object-cover"/>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-police-card ${c.online?"bg-[#10B981]":"bg-gray-400"}`}/>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-police truncate">{c.name}</p>
                    <span className="text-[10px] text-police-faint">{c.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-police-muted truncate">{c.badge} · {c.station}</p>
                  <p className="text-[11px] text-police-faint truncate mt-0.5">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2196F3] text-[9px] font-bold text-white px-1">
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WAFUNGWA TAB ─────────────────────────────────────────────── */}
      {tab==="wafungwa" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Jumla", detained.length, "#1E3A8A"],
              ["Kizuizini", detained.filter(d=>d.status==="held").length, "#EF4444"],
              ["Uchunguzi", detained.filter(d=>d.status==="investigating"||d.status==="charged").length, "#FF9800"],
              ["Wameachiwa", detained.filter(d=>d.status==="released").length, "#10B981"],
            ].map(([l,v,c]) => (
              <div key={l as string} className="rounded-xl bg-police-card p-2 text-center shadow-sm">
                <p className="text-[18px] font-bold" style={{color:c as string}}>{v}</p>
                <p className="text-[9px] text-police-faint">{l}</p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
              <Search size={13} className="text-police-faint"/>
              <input value={detSearch} onChange={e=>setDetSearch(e.target.value)}
                placeholder="Tafuta mfungwa..."
                className="h-8 flex-1 bg-transparent text-[12px] text-police placeholder:text-police-faint focus:outline-none"/>
              {detSearch && <button onClick={()=>setDetSearch("")}><X size={11}/></button>}
            </div>
            <select value={detFilter} onChange={e=>setDetFilter(e.target.value)}
              className="rounded-xl border border-police bg-police-card px-2 text-[11px] text-police focus:outline-none">
              <option value="all">Wote</option>
              <option value="held">Kizuizini</option>
              <option value="charged">Ameshtakiwa</option>
              <option value="investigating">Uchunguzi</option>
              <option value="released">Ameachiwa</option>
            </select>
          </div>

          {/* Detained list */}
          {filtDetained.map(d => (
            <div key={d.id} className="tpf-card p-3.5">
              <div className="flex items-center gap-3">
                <img src={avatarUrl(d.fullName)} alt={d.fullName} className="h-10 w-10 rounded-full object-cover"/>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-police truncate">{d.fullName}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                      style={{backgroundColor:(STATUS_MAP as Record<string,string>)[d.status]??"#607D8B"}}>
                      {(STATUS_LABEL as Record<string,string>)[d.status]??d.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-police-muted truncate">{d.reason}</p>
                  <p className="text-[9px] text-police-faint">Chumba: {d.cell||"—"} · {d.detainedDate} · {d.officer||"—"}</p>
                </div>
              </div>
              {/* Commander actions */}
              {isCommander && d.status !== "released" && (
                <div className="mt-2.5 flex gap-2">
                  <button onClick={() => releaseDetained(d.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#10B981]/15 py-1.5 text-[11px] font-bold text-[#10B981]">
                    <UserCheck size={12}/> Achilia
                  </button>
                  <button onClick={() => {
                    setDetained(prev => prev.map(r => r.id===d.id ? {...r,status:"charged"} : r));
                    toast({title:"Ameshtakiwa ✓"});
                  }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E3A8A]/15 py-1.5 text-[11px] font-bold text-[#1E3A8A]">
                    <Shield size={12}/> Mshtaki
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ORDERS TAB ───────────────────────────────────────────────── */}
      {tab==="orders" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isCommander && (
            <button onClick={() => setShowOrderForm(!showOrderForm)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-2.5 text-[13px] font-bold text-white">
              <Plus size={15}/> Tuma Amri Mpya kwa Afisa
            </button>
          )}

          {/* Order form */}
          {showOrderForm && isCommander && (
            <div className="rounded-2xl border border-[#1E3A8A]/30 bg-police-card p-4 space-y-3">
              <p className="text-[13px] font-bold text-police">Amri Mpya</p>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-police-faint">Afisa</label>
                <select value={orderForm.toOfficer} onChange={e => {
                  const officer = undefined;
                  setOrderForm(f=>({...f, toOfficer:e.target.value, toBadge:officer?.badgeNo||""}));
                }} className="h-10 w-full rounded-xl border border-police bg-police-input px-3 text-[12px] text-police focus:outline-none">
                  <option value="">-- Chagua Afisa --</option>
                  {([] as {name:string;role:string}[]).map(u => (
                    <option key={u.id} value={u.name}>{u.shortName} ({u.badgeNo}) — {u.station}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-police-faint">Kiwango cha Haraka</label>
                <div className="flex gap-2">
                  {(["urgent","high","normal"] as const).map(p => (
                    <button key={p} onClick={()=>setOrderForm(f=>({...f,priority:p}))}
                      className={`flex-1 rounded-xl border py-1.5 text-[11px] font-bold transition ${
                        orderForm.priority===p ? "border-transparent text-white" : "border-police text-police-muted"
                      }`}
                      style={orderForm.priority===p?{backgroundColor:ORDER_COLOR[p]}:{}}>
                      {ORDER_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-police-faint">Amri</label>
                <textarea value={orderForm.order} onChange={e=>setOrderForm(f=>({...f,order:e.target.value}))}
                  rows={3} placeholder="Andika amri kwa afisa..."
                  className="w-full rounded-xl border border-police bg-police-input px-3 py-2 text-[12px] text-police focus:border-[#2196F3] focus:outline-none resize-none"/>
              </div>

              <div className="flex gap-2">
                <button onClick={()=>setShowOrderForm(false)}
                  className="tpf-btn tpf-btn-secondary flex-1">
                  Ghairi
                </button>
                <button onClick={sendOrder}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-2 text-[12px] font-bold text-white">
                  <Send size={13}/> Tuma Amri
                </button>
              </div>
            </div>
          )}

          {/* Orders list */}
          {orders.map(o => (
            <div key={o.id} className="tpf-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <img src={avatarUrl(o.toOfficer)} alt={o.toOfficer} className="h-8 w-8 rounded-full object-cover"/>
                  <div>
                    <p className="text-[12px] font-bold text-police">{o.toOfficer}</p>
                    <p className="text-[9px] text-police-faint">{o.toBadge} · Imetumwa {o.sentAt}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                    style={{backgroundColor:ORDER_COLOR[o.priority]}}>
                    {ORDER_LABEL[o.priority]}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                    style={{backgroundColor:ORD_STATUS_COLOR[o.status]}}>
                    {ORD_STATUS_LABEL[o.status]}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-police-muted px-3 py-2">
                <p className="text-[12px] text-police">{o.order}</p>
              </div>
              <p className="mt-1.5 text-[10px] text-police-faint">na {o.sentBy}</p>

              {/* Acknowledge button (for testing) */}
              {o.status==="sent" && isCommander && (
                <button onClick={() => setOrders(prev => prev.map(ord => ord.id===o.id?{...ord,status:"acknowledged"}:ord))}
                  className="mt-2 w-full rounded-xl border border-[#2196F3]/30 bg-[#2196F3]/8 py-1.5 text-[11px] font-bold text-[#2196F3]">
                  Simula: Afisa Amepokea
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
