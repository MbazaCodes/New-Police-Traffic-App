"use client";

import { Database, FileText, Phone, User, CarFront, Search, ShieldCheck, ArrowRight } from "lucide-react";
import { usePoliceStore } from "@/store/police-store";
import { MOCK_CITIZENS, MOCK_VEHICLES, MOCK_DEVICES, validateName, validateNida, validateMobile, validatePlate, validateLicense, getSuggestions } from "@/lib/mock-database";

const fieldGroups = [
  {
    title: "Raia / Citizen",
    icon: User,
    fields: [
      ["Jina", MOCK_CITIZENS[0]?.name ?? "N/A"],
      ["NIDA", MOCK_CITIZENS[0]?.nida ?? "N/A"],
      ["Simu", MOCK_CITIZENS[0]?.mobile ?? "N/A"],
      ["Leseni", MOCK_CITIZENS[0]?.licenseNo ?? "N/A"],
      ["Makazi", MOCK_CITIZENS[0]?.address ?? "N/A"],
    ],
  },
  {
    title: "Gari / Vehicle",
    icon: CarFront,
    fields: [
      ["Plate", MOCK_VEHICLES[0]?.plate ?? "N/A"],
      ["Model", MOCK_VEHICLES[0]?.model ?? "N/A"],
      ["Mmiliki", MOCK_VEHICLES[0]?.ownerName ?? "N/A"],
      ["NIDA ya Mmiliki", MOCK_VEHICLES[0]?.ownerNida ?? "N/A"],
      ["Simu ya Mmiliki", MOCK_VEHICLES[0]?.ownerPhone ?? "N/A"],
    ],
  },
  {
    title: "Mali / Device",
    icon: FileText,
    fields: [
      ["Serial No.", MOCK_DEVICES[0]?.serialNo ?? "N/A"],
      ["IMEI", MOCK_DEVICES[0]?.imei ?? "N/A"],
      ["Maelezo", MOCK_DEVICES[0]?.description ?? "N/A"],
      ["Category", MOCK_DEVICES[0]?.category ?? "N/A"],
      ["Mmiliki", MOCK_DEVICES[0]?.ownerName ?? "N/A"],
    ],
  },
];

export function MockDataReferenceScreen() {
  const navigate = usePoliceStore((s) => s.navigate);

  const formats = [
    { label: "Jina", example: "Juma Khamis Mwinyi", helper: validateName("Juma Khamis Mwinyi").valid ? "Mfano sahihi" : "" },
    { label: "NIDA", example: "199012031234567", helper: validateNida("199012031234567").valid ? "Tarakimu 15" : "" },
    { label: "Simu", example: "0712 345 678", helper: validateMobile("0712 345 678").valid ? "07XX au 06XX" : "" },
    { label: "Plate", example: "T123ABC", helper: validatePlate("T123ABC").valid ? "Plate ya gari" : "" },
    { label: "Leseni", example: "DL001001TZ", helper: validateLicense("DL001001TZ").valid ? "Driver license" : "" },
  ];

  const searchExamples = [
    ["NIDA", getSuggestions("1990", "nida").slice(0, 3)],
    ["Simu", getSuggestions("0712", "mobile").slice(0, 3)],
    ["Jina", getSuggestions("juma", "name").slice(0, 3)],
    ["Plate", getSuggestions("T1", "plate").slice(0, 3)],
  ] as const;

  return (
    <div className="min-h-full bg-police p-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-white/75">Reference ya data ya mock</p>
            <h1 className="mt-1 text-[22px] font-bold leading-tight">Mock Data Reference</h1>
            <p className="mt-2 max-w-md text-[13px] text-white/80">
              Tumia hii kama mwongozo wa haraka wa majina, NIDA, simu, plate na leseni unapotafuta au kuingiza taarifa ndani ya app.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Database size={24} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {fieldGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="rounded-2xl bg-police-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A237E]/10 text-[#1A237E]">
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-police">{group.title}</h2>
                  <p className="text-[11px] text-police-muted">Mfano wa taarifa halisi kutoka mock database</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {group.fields.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-police-soft bg-police-muted/40 px-3 py-2.5">
                    <span className="text-[12px] text-police-muted">{label}</span>
                    <span className="text-right text-[12px] font-semibold text-police">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-police-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-[#2563EB]" />
          <h2 className="text-[15px] font-bold text-police">Search Helpers</h2>
        </div>
        <div className="mt-3 space-y-2">
          {searchExamples.map(([label, items]) => (
            <div key={label} className="rounded-xl border border-police-soft p-3">
              <p className="text-[12px] font-semibold text-police">{label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.length > 0 ? items.map((item) => (
                  <span key={item} className="rounded-full bg-police-muted px-3 py-1 text-[11px] text-police-muted">{item}</span>
                )) : <span className="text-[11px] text-police-muted">Hakuna mfano unaopatikana kwa sasa</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-police-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#10B981]" />
          <h2 className="text-[15px] font-bold text-police">How to use in app</h2>
        </div>
        <ul className="mt-3 space-y-2 text-[12px] text-police-muted">
          <li>• Tafuta raia kwa jina, NIDA au simu.</li>
          <li>• Tafuta gari kwa plate au leseni ya dereva.</li>
          <li>• Tumia thamani hizi kwenye fomu za kuongeza raia au gari.</li>
          <li>• Rekodi mpya zinaanza kwenye in-memory mock store ya session hii.</li>
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button onClick={() => navigate("add-citizen")} className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-3 text-[14px] font-bold text-white shadow-sm">
          <User size={16} /> Sajili Raia Mpya <ArrowRight size={16} />
        </button>
        <button onClick={() => navigate("add-vehicle")} className="flex items-center justify-center gap-2 rounded-xl border border-[#1E3A8A] bg-white px-4 py-3 text-[14px] font-bold text-[#1E3A8A] shadow-sm">
          <CarFront size={16} /> Sajili Gari Jipya <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}