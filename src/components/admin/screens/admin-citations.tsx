"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Download, FileText, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { ADMIN_CITATIONS, OFFICERS } from "@/lib/admin-data";
import { getOfficerProfilePath } from "@/lib/admin-navigation";
import { toast } from "@/hooks/use-toast";

const TABS = [
  { id: "all", label: "Zote" },
  { id: "paid", label: "Zilizolipwa" },
  { id: "unpaid", label: "Haijalipwa" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-500/15 text-green-500 border border-green-500/30",
  unpaid: "bg-red-500/15 text-red-500 border border-red-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Imelipwa",
  unpaid: "Haijalipwa",
};

export function AdminCitations() {
  const pathname = usePathname();
  const router = useRouter();
  const [tab, setTab] = useState<string>("all");

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
          onClick={() =>
            toast({
              title: "Imefanikiwa",
              description: "Citations zimehamishiwa kama CSV (mfano)",
            })
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#2196F3] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1E88E5]"
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
          color="#4CAF50"
        />
        <StatBox
          icon={<XCircle size={16} />}
          label="Haijalipwa"
          value={String(stats.unpaid)}
          color="#F44336"
        />
        <StatBox
          icon={<Wallet size={16} />}
          label="Jumla ya Fedha"
          value={`TZS ${stats.totalAmount.toLocaleString()}`}
          color="#9C27B0"
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
                        onClick={() => {
                          const base = pathname.startsWith("/command") ? "/command" : "/admin";
                          router.push(`${base}/citations/${encodeURIComponent(c.id)}`);
                        }}
                        className="rounded-lg bg-police-input px-2 py-1.5 text-[11px] font-semibold text-police-navy hover:bg-police-muted"
                      >
                        Tazama
                      </button>
                      {c.status === "unpaid" && (
                        <button
                          onClick={() =>
                            toast({
                              title: "Kumbusho Limetumwa",
                              description: `Kumbusho limepokelewa kwa ${c.driver}`,
                            })
                          }
                          className="rounded-lg bg-orange-500/15 px-2 py-1.5 text-[11px] font-semibold text-orange-500 hover:bg-orange-500/25"
                        >
                          Kumbusha
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
