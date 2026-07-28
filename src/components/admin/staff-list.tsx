"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Shield, User, Trash2, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/client-auth";
import { StaffAssignmentModal } from "./staff-assignment-modal";
import type { POST_ROLES, STATION_ROLES } from "@/app/api/stations/[id]/staff/route";

interface StaffMember {
  id: string; user_id: string; name: string; badge_no: string;
  station_role: string; rank: string; user_rank: string;
  is_commanding: boolean; shift: string | null; status: string;
  assigned_from: string; photo_url: string | null;
}

interface Props {
  mode: "station" | "post";
  entityId: string;
  entityName: string;
  canEdit?: boolean;
}

const STATION_ROLE_CONFIG = [
  { id: "OCD",    label: "OCD — Officer Commanding District",   max: 1,    commanding: true  },
  { id: "OCS",    label: "OCS — Officer Commanding Station",    max: 2,    commanding: true  },
  { id: "OCPD",   label: "OCPD — Officer Commanding Police Div",max: 2,    commanding: true  },
  { id: "officer",label: "Afisa wa Kawaida",                    max: null, commanding: false },
  { id: "clerk",  label: "Karani",                              max: null, commanding: false },
  { id: "driver", label: "Dereva",                              max: null, commanding: false },
  { id: "guard",  label: "Mlinzi",                              max: null, commanding: false },
];

const POST_ROLE_CONFIG = [
  { id: "OCS",     label: "OCS — Officer Commanding Station", max: 2,    commanding: true  },
  { id: "OIC",     label: "OIC — Officer In Charge",         max: 2,    commanding: true  },
  { id: "officer", label: "Afisa wa Kawaida",                 max: null, commanding: false },
  { id: "guard",   label: "Mlinzi / Askari",                  max: null, commanding: false },
];

export function StaffList({ mode, entityId, entityName, canEdit = true }: Props) {
  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setModal]   = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const endpoint = mode === "station"
    ? `/api/stations/${entityId}/staff`
    : `/api/posts/${entityId}/staff`;

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await authFetch(endpoint);
    setStaff(data?.data ?? []);
    setLoading(false);
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const remove = async (staffId: string) => {
    if (!confirm("Una uhakika unataka kuondoa afisa huyu?")) return;
    setRemoving(staffId);
    await authFetch(`${endpoint}?staff_id=${staffId}`, { method: "DELETE" });
    setRemoving(null);
    load();
  };

  const roles = mode === "station" ? STATION_ROLE_CONFIG : POST_ROLE_CONFIG;
  const commanders = staff.filter(s => s.is_commanding);
  const regulars   = staff.filter(s => !s.is_commanding);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-black text-police">
            Wafanyakazi ({staff.length})
          </h3>
          <p className="text-[11px] text-police-muted">
            {mode === "station" ? "Maafisa wa Kituo" : "Maafisa wa Posti"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-xl p-2 bg-police-soft hover:bg-police-card">
            <RefreshCw size={14} className="text-police-muted" />
          </button>
          {canEdit && (
            <button onClick={() => setModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-3 py-2 text-[12px] font-bold text-white">
              <UserPlus size={14} /> Ongeza
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-police-muted">
          <User size={32} className="mb-2 opacity-30" />
          <p className="text-[13px] font-medium">Hakuna wafanyakazi waliowekwa</p>
          {canEdit && <p className="text-[11px]">Bonyeza "Ongeza" kuweka afisa</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Commanding officers first */}
          {commanders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-police-muted mb-1.5">
                Uongozi
              </p>
              {commanders.map(s => (
                <StaffCard key={s.id} member={s} canEdit={canEdit}
                  onRemove={() => remove(s.id)} removing={removing === s.id} />
              ))}
            </div>
          )}
          {/* Regular staff */}
          {regulars.length > 0 && (
            <div>
              {commanders.length > 0 && (
                <p className="text-[10px] font-bold uppercase tracking-wide text-police-muted mb-1.5 mt-3">
                  Maafisa
                </p>
              )}
              {regulars.map(s => (
                <StaffCard key={s.id} member={s} canEdit={canEdit}
                  onRemove={() => remove(s.id)} removing={removing === s.id} />
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <StaffAssignmentModal
          mode={mode}
          entityId={entityId}
          entityName={entityName}
          roles={roles}
          onClose={() => setModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function StaffCard({ member, canEdit, onRemove, removing }: {
  member: StaffMember; canEdit: boolean;
  onRemove: () => void; removing: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 mb-1.5 ${
      member.is_commanding ? "bg-[#1E3A8A]/5 border border-[#1E3A8A]/15" : "bg-police-soft"
    }`}>
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[13px] ${
        member.is_commanding ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police-muted"
      }`}>
        {member.is_commanding ? <Shield size={16} /> : (member.name?.[0] ?? "?")}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-bold text-police truncate">{member.name}</p>
          <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-black ${
            member.is_commanding ? "bg-[#1E3A8A] text-white" : "bg-police-card text-police-muted"
          }`}>{member.station_role}</span>
        </div>
        <p className="text-[11px] text-police-muted">
          {member.badge_no && `${member.badge_no} · `}
          {member.rank || member.user_rank || "Cheo hakijawekwa"}
          {member.shift && ` · ${member.shift}`}
        </p>
        <p className="text-[10px] text-police-faint">
          Tangu: {new Date(member.assigned_from).toLocaleDateString("sw-TZ")}
        </p>
      </div>

      {/* Remove */}
      {canEdit && (
        <button onClick={onRemove} disabled={removing}
          className="rounded-xl p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40">
          {removing ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  );
}
