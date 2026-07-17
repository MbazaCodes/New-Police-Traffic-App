"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Download, FileText, CheckCircle2, XCircle, Wallet, Eye, X, Bell } from "lucide-react";
import { ADMIN_CITATIONS, OFFICERS } from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";

const TABS = [
  { id: "all", label: "Zote" },
  { id: "paid", label: "Zilizolipwa" },
  { id: "unpaid", label: "Haijalipwa" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/500/30",
  unpaid: "bg-[#EF4444]/100/15 text-[#EF4444] border border-[#EF4444]/500/30",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Imelipwa",
  unpaid: "Haijalipwa",
};

type Citation = (typeof ADMIN_CITATIONS)[number];

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminCitations() {
  const pathname = usePathname();
  const router = useRouter();
  const [tab, setTab] = useState<string>("all");
  const [viewing, setViewing] = useState<Citation | null>(null);

  const stats = useMemo(() => {
    const total = ADMIN_CITATIONS.length;
    const paid = ADMIN_CITATIONS.filter((c) => c.status === "paid").length;
    const unpaid = total - paid;
    const totalAmount = ADMIN_CITATIONS.reduce(
      (sum, c) => sum + parseInt(c.amount.replace(/[^\d]/g, ""), 10),
      0
    );
    return { total, paid, unpaid, totalAmount };
  }, []);

  const filtered =
    tab === "all"
      ? ADMIN_CITATIONS
      : ADMIN_CITATIONS.filter((c) => c.status === tab);

  const handleExportCsv = () => {
    toast({
      title: "Inapakua",
      description: "Faili la CSV linapakuliwa sasa hivi",
    });
    const header = ["ID", "Plate", "Offense", "Driver", "Date", "Amount (TZS)", "Status", "Officer"];
    const rows = filtered.map((c) => [
      c.id,
      c.plate,
      c.offense,
      c.driver,
      c.date,
      c.amount,
      c.status,
      c.officer,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map(escapeCsv).join(","))
      .join("\n");
    const filename = `citations-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile("\uFEFF" + csv, filename, "text/csv;charset=utf-8;");
  };

  const handleRemind = (c: Citation) => {
    toast({
      title: "Ukumbusho Umetumwa",
      description: `Ukumbusho wa SMS umetumwa kwa ${c.driver} (${c.plate})`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-police-navy">Citations</h1>
          <p className="text-[13px] text-police-muted">
            Citations zote zilizotolewa na maafisa
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
        >
          <Download size={14} /> Hamisha CSV
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox
          icon={<FileText size={16} />}
          label="Jumla"
          value={String(stats.total)}
          color="#2196F3"
        />
        <StatBox
          icon={<CheckCircle2 size={16} />}
          label="Zilizolipwa"
          value={String(stats.paid)}
          color="#10B981"
        />
        <StatBox
          icon={<XCircle size={16} />}
          label="Haijalipwa"
          value={String(stats.unpaid)}
          color="#EF4444"
        />
        <StatBox
          icon={<Wallet size={16} />}
          label="Jumla ya Fedha"
          value={`TZS ${stats.totalAmount.toLocaleString()}`}
          color="#1E3A8A"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-police-card p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-[12px] font-medium transition ${
              tab === t.id
                ? "bg-[#2196F3] text-white"
                : "text-police-muted hover:bg-police-input"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Citations table */}
      <div className="rounded-xl bg-police-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-police-soft bg-police-muted/40 text-[10px] uppercase text-police-faint">
                <th className="px-4 py-3 font-semibold">Kitambulisho</th>
                <th className="px-4 py-3 font-semibold">Nambari</th>
                <th className="px-4 py-3 font-semibold">Kosa</th>
                <th className="px-4 py-3 font-semibold">Dereva</th>
                <th className="px-4 py-3 font-semibold">Tarehe</th>
                <th className="px-4 py-3 text-right font-semibold">Kiasi</th>
                <th className="px-4 py-3 font-semibold">Hadhi</th>
                <th className="px-4 py-3 font-semibold">Afisa</th>
                <th className="px-4 py-3 text-right font-semibold">Hatua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const officer = OFFICERS.find((o) => o.name === c.officer);
                return (
                <tr key={c.id} className="border-b border-police-soft transition hover:bg-police-muted/40 last:border-0">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-police-navy">
                    {c.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-police-input px-2 py-0.5 font-mono text-[11px] font-bold text-police-navy">
                      {c.plate}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-police">{c.offense}</td>
                  <td className="px-4 py-3 text-police-muted">{c.driver}</td>
                  <td className="px-4 py-3 text-police-muted">{c.date}</td>
                  <td className="px-4 py-3 text-right font-semibold text-police-navy">
                    TZS {parseInt(c.amount.replace(/[^\d]/g, ""), 10).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_STYLES[c.status]
                      }`}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-police-muted">
                    {officer ? (
                      <Link href={getOfficerProfilePath(pathname, officer.id)} className="font-medium text-[#2196F3] hover:underline">
                        {c.officer}
                      </Link>
                    ) : (
                      c.officer
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewing(c)}
                        className="flex items-center gap-1 rounded-lg bg-police-input px-2 py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                        title="Tazama"
                      >
                        <Eye size={12} /> Tazama
                      </button>
                      {c.status === "unpaid" && (
                        <button
                          onClick={() => handleRemind(c)}
                          className="flex items-center gap-1 rounded-lg bg-[#FF9800]/15 px-2 py-1.5 text-[11px] font-semibold text-[#FF9800] hover:bg-[#FF9800]/25"
                          title="Tuma Ukumbusho"
                        >
                          <Bell size={12} /> Kumbusha
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-police-faint">
            Hakuna citations kwenye kichungi hiki.
          </div>
        )}
      </div>

      {viewing && (
        <CitationModal
          citation={viewing}
          pathname={pathname}
          onClose={() => setViewing(null)}
          onGoToDetail={(id) => {
            const base = pathname.startsWith("/command") ? "/command" : "/admin";
            router.push(`${base}/citations/${encodeURIComponent(id)}`);
          }}
        />
      )}
    </div>
  );
}

function CitationModal({
  citation,
  pathname,
  onClose,
  onGoToDetail,
}: {
  citation: Citation;
  pathname: string;
  onClose: () => void;
  onGoToDetail: (id: string) => void;
}) {
  const officer = OFFICERS.find((o) => o.name === citation.officer);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-police-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-police-soft bg-police-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2196F3]/15 text-[#2196F3]">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-police">Maelezo ya Citation</p>
              <p className="font-mono text-[11px] text-police-faint">{citation.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-police-faint hover:bg-police-muted">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_STYLES[citation.status]}`}>
              {STATUS_LABEL[citation.status]}
            </span>
            <span className="rounded-md bg-police-input px-2.5 py-1 font-mono text-[11px] font-bold text-police-navy">
              {citation.plate}
            </span>
          </div>

          <DetailRow label="Kosa" value={citation.offense} />
          <DetailRow label="Dereva" value={citation.driver} />
          <DetailRow label="Tarehe" value={citation.date} />
          <DetailRow label="Kiasi" value={`TZS ${parseInt(citation.amount.replace(/[^\d]/g, ""), 10).toLocaleString()}`} />
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase text-police-faint">Afisa</p>
            {officer ? (
              <Link href={getOfficerProfilePath(pathname, officer.id)} className="font-medium text-[#2196F3] hover:underline">
                {citation.officer}
              </Link>
            ) : (
              <p className="text-[13px] text-police">{citation.officer}</p>
            )}
          </div>

          {citation.status === "unpaid" && (
            <div className="rounded-lg border border-[#FF9800]/30 bg-[#FF9800]/5 p-3 text-[12px] text-[#FF9800]">
              <p className="font-semibold">Citation haijalipwa bado.</p>
              <p className="mt-0.5 text-[11px]">Ukumbusho wa SMS unaweza kutumwa kwa dereva.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-police-input py-2.5 text-[12px] font-semibold text-police-navy hover:bg-police-muted"
            >
              Funga
            </button>
            <button
              onClick={() => {
                onGoToDetail(citation.id);
                onClose();
              }}
              className="rounded-lg bg-[#2196F3] py-2.5 text-[12px] font-semibold text-white hover:bg-[#2196F3]"
            >
              Ukurasa Kamili
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-police-input p-2.5">
      <p className="text-[10px] uppercase text-police-faint">{label}</p>
      <p className="text-[13px] text-police font-semibold text-right">{value}</p>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-police-card p-4 shadow-sm">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <p className="mt-2 text-lg font-bold text-police-navy">{value}</p>
      <p className="text-[11px] text-police-muted">{label}</p>
    </div>
  );
}
