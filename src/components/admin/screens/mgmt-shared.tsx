// @ts-nocheck
"use client";
// Shared components for all 6 Management Pages

import { useState, useRef } from "react";
import {
  Search, X, Plus, Loader2, RefreshCw, Pencil, Trash2,
  Save, AlertCircle, ChevronLeft, Eye, EyeOff,
} from "lucide-react";
import { useApiData } from "@/hooks/use-api-data";
import { authFetch } from "@/lib/client-auth";
import { toast } from "@/hooks/use-toast";
import { TZ_ALL_REGIONS, districtsForRegion, TZ_POLICE_RANKS } from "@/lib/tz-locations";

export { useApiData, authFetch, toast, TZ_ALL_REGIONS, districtsForRegion, TZ_POLICE_RANKS };
export { Search, X, Plus, Loader2, RefreshCw, Pencil, Trash2, Save, AlertCircle, ChevronLeft, Eye, EyeOff };

// ── Generic badge ───────────────────────────────────────────────────────
export function RoleBadge({ role, color, label }: { role?: string; color: string; label: string }) {
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap"
      style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}

// ── Status badge ────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:     { label: "Kazini",         cls: "bg-[#10B981]/15 text-[#10B981]" },
    "on-leave": { label: "Mapumziko",      cls: "bg-[#FF9800]/15 text-[#FF9800]" },
    suspended:  { label: "Amesimamishwa",  cls: "bg-[#EF4444]/15 text-[#EF4444]" },
    "off-duty": { label: "Nje ya Kazi",    cls: "bg-gray-500/15 text-gray-500" },
    inactive:   { label: "Haufanyi Kazi",  cls: "bg-gray-500/15 text-gray-500" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-500/15 text-gray-500" };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>;
}

// ── Avatar initials ─────────────────────────────────────────────────────
export function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

// ── Page header ─────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, color, icon: Icon, onAdd, addLabel }: {
  title: string; subtitle: string; color: string;
  icon: any; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div>
          <h1 className="text-[19px] font-black text-police">{title}</h1>
          <p className="text-[12px] text-police-muted">{subtitle}</p>
        </div>
      </div>
      {onAdd && (
        <button onClick={onAdd}
          className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-sm"
          style={{ backgroundColor: color }}>
          <Plus size={15} /> {addLabel || "Ongeza"}
        </button>
      )}
    </div>
  );
}

// ── Search + filter bar ─────────────────────────────────────────────────
export function SearchBar({ value, onChange, onClear, placeholder, children }: {
  value: string; onChange: (v: string) => void; onClear: () => void;
  placeholder?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-police bg-police-card px-3">
        <Search size={15} className="shrink-0 text-police-faint" />
        <input value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "Tafuta..."}
          className="h-10 flex-1 bg-transparent text-[13px] text-police focus:outline-none" />
        {value && <button onClick={onClear}><X size={13} className="text-police-faint" /></button>}
      </div>
      {children}
    </div>
  );
}

// ── Data table ──────────────────────────────────────────────────────────
export function DataTable({ columns, data, loading, emptyLabel, onAdd }: {
  columns: { key: string; label: string; render?: (v: any, row: any) => React.ReactNode }[];
  data: any[]; loading: boolean; emptyLabel?: string; onAdd?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-police-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="border-b border-police-soft bg-police-muted/30">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-4 py-3 text-left text-[11px] font-semibold text-police-muted whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-police-soft">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-police-soft" /></td>
                  ))}
                </tr>
              ))
              : data.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                      <p className="text-[13px] font-bold text-police">{emptyLabel || "Hakuna rekodi"}</p>
                      {onAdd && (
                        <button onClick={onAdd} className="mt-3 rounded-xl bg-[#2196F3] px-4 py-2 text-[12px] font-bold text-white">
                          <Plus size={13} className="mr-1 inline" /> Ongeza wa Kwanza
                        </button>
                      )}
                    </td>
                  </tr>
                )
                : data.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-police-muted/10 transition">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-police">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="border-t border-police-soft px-4 py-2 text-[11px] text-police-faint">
          {data.length} rekodi
        </div>
      )}
    </div>
  );
}

// ── Form modal wrapper ──────────────────────────────────────────────────
export function FormModal({ title, subtitle, icon: Icon, color, onClose, onSave, saving, error, children }: {
  title: string; subtitle?: string; icon: any; color: string;
  onClose: () => void; onSave: () => void; saving: boolean;
  error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto rounded-2xl bg-police-card p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-bold text-police">{title}</h2>
            {subtitle && <p className="text-[11px] text-police-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-police-faint hover:text-police"><X size={18} /></button>
        </div>
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#EF4444]/10 px-3 py-2 text-[12px] font-medium text-[#EF4444]">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <div className="space-y-3">{children}</div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 rounded-xl border border-police-soft py-3 text-[13px] font-semibold text-police disabled:opacity-50">
            Ghairi
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: color }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Inahifadhi...</> : <><Save size={14} /> Hifadhi</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form field helpers ──────────────────────────────────────────────────
export const lbl = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-police-muted";
export const inp = "w-full rounded-xl border border-police-soft bg-police px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";
export const sel = "w-full rounded-xl border border-police-soft bg-police px-3 h-10 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";
export const ta  = "w-full rounded-xl border border-police-soft bg-police px-3 py-2.5 text-[13px] text-police focus:outline-none focus:border-[#2196F3]";

export function FI({ label, required, value, onChange, placeholder, type = "text", disabled }: {
  label: string; required?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className={lbl}>{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled}
        className={inp + (disabled ? " opacity-50 cursor-not-allowed" : "")} />
    </div>
  );
}

export function FS({ label, required, value, onChange, children, disabled }: {
  label: string; required?: boolean; value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div>
      <label className={lbl}>{label}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}</label>
      <select value={value} onChange={onChange} disabled={disabled}
        className={sel + (disabled ? " opacity-50 cursor-not-allowed" : "")}>
        {children}
      </select>
    </div>
  );
}

// ── Scope fields (Region / District) ───────────────────────────────────
export function ScopeFields({ region, district, onRegion, onDistrict, showDistrict = true }: {
  region: string; district: string;
  onRegion: (v: string) => void; onDistrict: (v: string) => void;
  showDistrict?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${showDistrict ? "grid-cols-2" : "grid-cols-1"}`}>
      <FS label="Mkoa / Region" value={region} onChange={e => { onRegion(e.target.value); onDistrict(""); }}>
        <option value="">— Chagua Mkoa —</option>
        {TZ_ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </FS>
      {showDistrict && (
        <FS label="Wilaya / District" value={district} onChange={e => onDistrict(e.target.value)} disabled={!region}>
          <option value="">{region ? "— Chagua Wilaya —" : "Mkoa kwanza"}</option>
          {districtsForRegion(region).map(d => <option key={d} value={d}>{d}</option>)}
        </FS>
      )}
    </div>
  );
}

// ── Generic CRUD hook ───────────────────────────────────────────────────
export function useDeleteRecord(endpoint: string, refetch: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Una uhakika kutaka kufuta akaunti ya ${name}? Hatua hii haiwezi kutenduliwa.`)) return;
    setDeleting(id);
    const { error } = await authFetch(`${endpoint}/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (error) { toast({ title: "Hitilafu", description: error, variant: "destructive" }); return; }
    toast({ title: "Imefutwa ✓", description: `Akaunti ya ${name} imefutwa` });
    refetch();
  };
  return { deleting, handleDelete };
}

// ── Actions cell ────────────────────────────────────────────────────────
export function ActionCell({ id, name, deleting, onEdit, onDelete }: {
  id: string; name: string; deleting: string | null;
  onEdit: () => void; onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onEdit} className="rounded-lg bg-[#2196F3]/10 p-1.5 text-[#2196F3] hover:bg-[#2196F3]/20">
        <Pencil size={13} />
      </button>
      <button onClick={() => onDelete(id, name)} disabled={deleting === id}
        className="rounded-lg bg-[#EF4444]/10 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/20 disabled:opacity-50">
        {deleting === id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}
