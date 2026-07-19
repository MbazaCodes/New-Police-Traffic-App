// TZ Police Digital Platform — Mock data & types

export type ScreenId =
  | "login"
  | "home"
  | "search-results"
  | "citizen-search-results"
  | "traffic"
  | "patrol"
  | "alerts"
  | "profile"
  | "accident-report"
  | "vehicle-inspection"
  | "pf3"
  | "citation"
  | "history"
  | "arrest-form"
  | "warning-form"
  | "lost-property"
  | "driver-points"
  | "incident-detail"
  | "offense-detail"
  | "citation-detail"
  | "edit-profile"
  | "sos-request"
  | "incident-view"
  | "citizen-detail"
  | "add-vehicle"
  | "add-citizen"
  | "fine-payment"
  | "bail-out"


export const OFFICER = {
  name: "Cprl. Juma Mwinyi",
  shortName: "Cprl. Juma",
  rank: "Corporal",
  rankShort: "Cprl.",
  id: "TP123456",
  station: "Kituo Kikuu cha Polisi Dar es Salaam",
  unit: "Trafiki - Mkoa wa Dar es Salaam",
  phone: "0712 345 678",
  email: "juma.mwinyi@polisi.go.tz",
  status: "Mtaandao",
};

export const OFFICERS_LIST = [
  { id: "TP123456", name: "Cprl. Juma Mwinyi", rank: "Corporal", unit: "Trafiki", station: "Kikuu DSM", status: "active", points: 87 },
  { id: "TP234567", name: "Sgt. Ali Hassan", rank: "Sergeant", unit: "Trafiki", station: "Kinondoni", status: "active", points: 72 },
  { id: "TP345678", name: "Insp. Grace Mushi", rank: "Inspector", unit: "Jumla", station: "Ilala", status: "patrol", points: 95 },
  { id: "TP456789", name: "Cprl. Saidi Juma", rank: "Corporal", unit: "Trafiki", station: "Temeke", status: "active", points: 63 },
  { id: "TP567890", name: "Cst. Mariam Ally", rank: "Constable", unit: "Jumla", station: "Ubungo", status: "off", points: 100 },
];

export const HOME_STATS = [
  { label: "Matukio Yote", value: "1,234", icon: "alert", color: "#1E3A8A" },
  { label: "Kesi Zinazosubiri", value: "56", icon: "clock", color: "#FF9800" },
  { label: "Kesi Zilizotatuliwa", value: "1,178", icon: "check", color: "#10B981" },
  { label: "Patroli Zinazofanya Kazi", value: "23", icon: "car", color: "#EF4444" },
];

// TRAFFIC_STATS defined after CITATION_HISTORY below

export const TRAFFIC_QUICK_ACTIONS = [
  { label: "Ripoti Tukio",    icon: "clipboard",      color: "#2196F3", screen: "incident-detail"        as ScreenId },
  { label: "Tafuta Raia",     icon: "search",          color: "#1E3A8A", screen: "citizen-search-results" as ScreenId },
  { label: "Rekodi Taarifa",  icon: "file-text",       color: "#10B981", screen: "citation"               as ScreenId },
  { label: "Lipa Faini",      icon: "wallet",          color: "#10B981", screen: "fine-payment"           as ScreenId },
  { label: "Kamata Mtuhumiwa",icon: "user-x",          color: "#EF4444", screen: "arrest-form"            as ScreenId },
  { label: "Dhamana",         icon: "shield",          color: "#8B5CF6", screen: "bail-out"               as ScreenId },
  { label: "Ripoti Ajali",    icon: "alert-triangle",  color: "#F97316", screen: "accident-report"        as ScreenId },
  { label: "Historia",        icon: "clock",           color: "#2196F3", screen: "history"                as ScreenId },
];

// RECENT_OFFENSES removed — use Supabase

export const PATROL_STATS = [
  { label: "Patroli za Leo", value: "3", icon: "shield", color: "#2196F3" },
  { label: "Eneo Lililofunikwa", value: "8", icon: "map-pin", color: "#10B981" },
  { label: "Muda (Saa)", value: "6.5", icon: "clock", color: "#FF9800" },
  { label: "Umbali (km)", value: "42", icon: "route", color: "#1E3A8A" },
];

export const ALERTS = [
  {
    id: 1,
    icon: "alert-triangle",
    iconColor: "#EF4444",
    title: "SOS — Insp. Grace Mushi",
    time: "08:28",
    message: "Ofisa anahitaji msaada haraka! Kariakoo junction — gari linaloshukiwa limeendesha kwa hatari.",
    source: "Command Center",
    sourceBg: "#FFEBEE",
    dotColor: "#EF4444",
    borderColor: "#EF4444",
    unread: true,
    category: "all" as const,
    important: true,
  },
  {
    id: 2,
    icon: "megaphone",
    iconColor: "#2196F3",
    title: "Tangazo: Doria ya Usiku",
    time: "07:00",
    message: "Vikosi vyote: Doria maalum ya usiku itafanyika 22:00-06:00 katika maeneo ya Kariakoo, Ilala na Kinondoni.",
    source: "OCD Mwanza",
    sourceBg: "#E3F2FD",
    dotColor: "#2196F3",
    borderColor: "#2196F3",
    unread: true,
    category: "all" as const,
    important: false,
  },
  {
    id: 3,
    icon: "file-text",
    iconColor: "#10B981",
    title: "Citation CT-2026-0451 — Imekubaliwa",
    time: "06:45",
    message: "Citation namba CT-2026-0451 kwa gari T 003 GHI imekubaliwa na kusindikizwa kwa mahakama.",
    source: "Mfumo wa Kiotomatiki",
    sourceBg: "#E8F5E9",
    dotColor: "#10B981",
    borderColor: "#10B981",
    unread: false,
    category: "mine" as const,
    important: false,
  },
  {
    id: 4,
    icon: "user-x",
    iconColor: "#1E3A8A",
    title: "Kukamatwa: Ali Bakari — Imekamilika",
    time: "05:30",
    message: "Ripoti ya kukamatwa kwa Ali Bakari imepokewa na Kamishna wa Kituo. Weka kizuizini hadi uchunguzi ukamilike.",
    source: "Kituo cha Ilala",
    sourceBg: "#F3E5F5",
    dotColor: "#1E3A8A",
    borderColor: "#1E3A8A",
    unread: false,
    category: "mine" as const,
    important: true,
  },
  {
    id: 5,
    icon: "shield",
    iconColor: "#FF9800",
    title: "Onyo: Daraja la Pointi",
    time: "Jana",
    message: "Dereva HAMISI RASHID (DL987654) ana pointi 48/100. Chini ya kiwango kinachohitajika. Angalia historia yake.",
    source: "Mfumo wa Pointi",
    sourceBg: "#FFF3E0",
    dotColor: "#FF9800",
    borderColor: "#FF9800",
    unread: true,
    category: "important" as const,
    important: true,
  },
  {
    id: 6,
    icon: "search",
    iconColor: "#2196F3",
    title: "Mali Iliyopotea — Simu Imepatikana",
    time: "Jana",
    message: "Simu ya Samsung (SN: SM-S928B-2025) iliyoripotiwa kuibiwa Mei 10 imepatikana na ofisa wa Temeke.",
    source: "Kituo cha Temeke",
    sourceBg: "#E3F2FD",
    dotColor: "#2196F3",
    borderColor: "#2196F3",
    unread: false,
    category: "all" as const,
    important: false,
  },
];

export const PROFILE_STATS = [
  { label: "Patroli Zilizofanywa", value: "3", sub: "Leo", icon: "car", color: "#2196F3" },
  { label: "Citations Zimetolewa", value: "12", sub: "Leo", icon: "file-text", color: "#FF9800" },
  { label: "Makosa Yaliyoshughulikiwa", value: "18", sub: "Leo", icon: "users", color: "#10B981" },
  { label: "Masaa Kazini", value: "8.5", sub: "Leo", icon: "calendar", color: "#1E3A8A" },
  { label: "Umbali (km)", value: "116.5", sub: "Wiki Hii", icon: "route", color: "#2196F3" },
];

export const PROFILE_ACTIVITIES = [
  { title: "Patroli imekamilika", desc: "Kariakoo - Ilala Zone", time: "08:15 AM 15 Mei 2026", icon: "car", color: "#2196F3" },
  { title: "Citation imetolewa", desc: "Namba ya Gari: T 009 YZA", time: "07:45 AM 15 Mei 2026", icon: "file-text", color: "#10B981" },
  { title: "Kukamatwa — Ali Bakari", desc: "Wizi wa Silaha", time: "07:20 AM 15 Mei 2026", icon: "user-x", color: "#EF4444" },
  { title: "Onyo Limetolewa", desc: "Kasi kupita kiasi — T 005 MNO", time: "06:50 AM 15 Mei 2026", icon: "alert-triangle", color: "#FF9800" },
  { title: "Eneo la Patroli", desc: "Morogoro Road, Dar es Salaam", time: "06:30 AM 15 Mei 2026", icon: "map-pin", color: "#1E3A8A" },
];

export const PROFILE_SETTINGS = [
  { label: "Profaili Yangu", desc: "Maelezo binafsi", icon: "user", color: "#2196F3" },
  { label: "Mipangilio", desc: "Badilisha mipangilio", icon: "settings", color: "#2196F3" },
  { label: "Usalama", desc: "Nenosiri na usalama", icon: "shield", color: "#2196F3" },
  { label: "Pakua Ripoti", desc: "Ripoti na takwimu", icon: "download", color: "#10B981" },
  { label: "Historia ya Shughuli", desc: "Rekodi zako zote", icon: "clock", color: "#FF9800" },
  { label: "Msaada", desc: "Usaidizi na maelekezo", icon: "help-circle", color: "#2196F3" },
];

export const ACCIDENT_VEHICLES = [
  { plate: "T 003 GHI", model: "Toyota Corolla", color: "Nyeupe", damage: "Ndogo" },
  { plate: "T 009 YZA", model: "Toyota Hiace", color: "Fedha", damage: "Kubwa" },
];

export const ACCIDENT_PEOPLE = [
  { name: "Juma Khamis Mwinyi", role: "Dereva", phone: "0712 345 678", condition: "Hakuna Madhara" },
  { name: "Ali Mohamed Salum", role: "Abiria", phone: "0755 987 654", condition: "Maumivu Madogo" },
];

export const ACCIDENT_EVIDENCE = [
  { name: "picha_01.jpg", size: "2.4 MB", type: "image" as const },
  { name: "picha_02.jpg", size: "1.8 MB", type: "image" as const },
  { name: "video_01.mp4", size: "5.6 MB", type: "video" as const },
  { name: "ripoti_mwanzo.pdf", size: "1.2 MB", type: "pdf" as const },
];

export const VEHICLE_INSPECTION = {
  plate: "T 003 GHI",
  model: "Toyota Corolla",
  color: "Nyeupe",
  owner: "Juma Khamis Mwinyi",
  phone: "0712 345 678",
  location: "Morogoro Road, DSM",
  datetime: "15 Mei 2026, 08:15 AM",
  documents: [
    { label: "Leseni ya Udereva", status: "Sahihi", pass: true },
    { label: "Hati ya Usajili (Logbook)", status: "Sahihi", pass: true },
    { label: "Bima ya Gari", status: "Sahihi", pass: true },
    { label: "Vyeti vya Ukaguzi (Inspection Certificate)", status: "Haijasahihi", pass: false },
    { label: "Kibali cha Biashara / PSV Badge", status: "Sahihi", pass: true },
  ],
  mechanical: [
    { label: "Taa za Mbele na Nyuma", status: "Nzuri", pass: true },
    { label: "Brenki", status: "Nzuri", pass: true },
    { label: "Matairi", status: "Nzuri", pass: true },
    { label: "Kioo cha Mbele (Wiper)", status: "Nzuri", pass: true },
    { label: "Kelele za Gari", status: "Nzuri", pass: true },
    { label: "Viashiria (Indicators)", status: "Nzuri", pass: true },
    { label: "Horn", status: "Nzuri", pass: true },
    { label: "Suspension", status: "Nzuri", pass: true },
    { label: "Kioo (Mirrors)", status: "Nzuri", pass: true },
    { label: "Exhaust / Moshi", status: "Nzuri", pass: true },
  ],
  photos: [
    { label: "Nje - Nyuma" },
    { label: "Nje - Mbele" },
    { label: "Tairi la Mbele Kushoto" },
    { label: "Dashibodi" },
  ],
};

export const PF3_FORM = {
  referenceNo: "PF3/DSM/2026/00892",
  region: "Dar es Salaam",
  district: "Kinondoni",
  station: "Kituo Kikuu cha Polisi Dar es Salaam",
  accidentType: "Mgongano wa Magari Mawili",
  severity: "Mdogo",
  weather: "Wazi",
  roadSurface: "Lami",
  lightCondition: "Mchana",
  vehicles: [
    {
      plate: "T 003 GHI", make: "Toyota Corolla", year: "2020", color: "Nyeupe",
      driver: "Juma Khamis Mwinyi", license: "DL123456789TZ",
      direction: "Kuelekea Ubungo", damage: "Mbele - Upande wa Kulia", insured: true,
    },
    {
      plate: "T 009 YZA", make: "Toyota Hiace", year: "2019", color: "Fedha",
      driver: "Ali Mohamed Salum", license: "DL987654321TZ",
      direction: "Kutoka Ubungo", damage: "Nyuma - Upande wa Kushoto", insured: true,
    },
  ],
  casualties: [
    { name: "Ali Mohamed Salum", type: "Abiria", injury: "Maumivu Madogo", hospital: "Mwananyamala", status: "Matibabu" },
    { name: "Fatuma Hassan", type: "Abiria", injury: "Hakuna Madhara", hospital: "—", status: "Ametoka" },
  ],
  witnesses: [
    { name: "Saidi Juma", phone: "0788 123 456", statement: "Gari la T 003 GHI lilipita kasi na kupoteza udhibiti." },
    { name: "Mariam Ally", phone: "0766 987 654", statement: "Niliona gari la pindi likijaribu kuepuka." },
  ],
};

// CITATION_HISTORY removed — use Supabase

export const OFFENSE_TYPES = [
  "Over Speeding",
  "No Seatbelt",
  "Traffic Light Violation",
  "Kutumia Simu wakati wa Udereva",
  "Kutopita kasi",
  "Kutopita mstari",
  "Gari bila Bima",
  "Leseni imekwisha",
  "Kukata kona hatari",
  "Kuepuka kodi",
  "Overloading",
  "No Inspection Certificate",
  "Driving Under Influence",
  "Wrong Overtaking",
];

export const VEHICLE_TYPES = ["Saloon", "Pick Up", "Minibus", "Lori", "Pikipiki", "Bajaji", "Basila"];

// Violation points deduction table
// Points deducted per offense (0.5–3 scale)
export const VIOLATION_POINTS: Record<string, number> = {
  // Traffic offenses
  "Over Speeding":                    3.0,
  "Driving Under Influence":          3.0,
  "Wrong Overtaking":                 2.0,
  "Traffic Light Violation":          2.0,
  "No Insurance / Gari bila Bima":    2.0,
  "No Seatbelt":                      0.5,
  "Kutumia Simu wakati wa Udereva":   1.0,
  "Kukata kona hatari":               2.0,
  "Overloading":                      1.5,
  "No Inspection Certificate":        1.0,
  "Defective Vehicle":                1.0,
  "Leseni imekwisha":                 1.5,
  "Kutopita kasi":                    0.5,
  "Kutopita mstari":                  1.0,
  "Kuepuka kodi":                     1.0,
  // Warning/citizen offenses
  "Ugomvi na Mapigano":               2.0,
  "Kelele za Usiku":                  0.5,
  "Kunywa pombe hadharani":           1.0,
  "Kutotii Amri za Polisi":           1.5,
  "Kuzuia Utekelezaji wa Sheria":     2.5,
  "Uvunjaji wa Amri ya Mahakama":     3.0,
  "Ulevi wa Kupindukia":              2.0,
  "Uchafuzi wa Mazingira":            0.5,
};

// Points system constants
export const POINTS_YEAR_START = 100;  // Everyone starts at 100 on Jan 1
export const POINTS_STATUS = (pts: number) =>
  pts >= 80 ? "good" : pts >= 60 ? "warning" : pts >= 40 ? "critical" : "suspended";
export const POINTS_STATUS_LABEL = (pts: number) =>
  pts >= 80 ? "Nzuri" : pts >= 60 ? "Tahadhari" : pts >= 40 ? "Hatari" : "Imesimamishwa";
export const POINTS_STATUS_COLOR = (pts: number) =>
  pts >= 80 ? "#10B981" : pts >= 60 ? "#FF9800" : pts >= 40 ? "#EF4444" : "#7C3AED";

// Driver points registry
export interface PointsDeduction {
  date: string; offense: string; deducted: number; type: "citation" | "warning";
  officer: string; location: string;
}
export interface DriverPointsRecord {
  id: string;           // license number
  nida: string;
  name: string;
  plate: string;
  yearStart: number;    // always 100 on Jan 1
  points: number;       // current remaining
  deducted: number;     // total deducted this year
  violations: number;
  lastViolation: string;
  status: "good" | "warning" | "critical" | "suspended";
  deductions: PointsDeduction[];
}
export const DRIVER_POINTS: DriverPointsRecord[] = [
  { id:"DL001001TZ", nida:"199012031234567", name:"Juma Khamis Mwinyi",   plate:"T 001 ABC", yearStart:100, points:87, deducted:13, violations:4,  lastViolation:"10 Mei 2026", status:"good",
    deductions:[
      {date:"10 Mei 2026",offense:"Over Speeding",           deducted:3.0,type:"citation",officer:"Sgt. Ali Hassan",   location:"Morogoro Rd"},
      {date:"02 Apr 2026",offense:"No Seatbelt",             deducted:0.5,type:"citation",officer:"Cprl. Juma Mwinyi", location:"Samora Ave"},
      {date:"15 Feb 2026",offense:"Traffic Light Violation", deducted:2.0,type:"citation",officer:"Sgt. Fatuma Hassan",location:"Posta, Ilala"},
      {date:"10 Jan 2026",offense:"No Seatbelt",             deducted:0.5,type:"warning", officer:"Cprl. Juma Mwinyi", location:"Kariakoo"},
    ]
  },
  { id:"DL003003TZ", nida:"198803221234569", name:"Ali Mohamed Salum",    plate:"T 003 GHI", yearStart:100, points:74, deducted:26, violations:6,  lastViolation:"08 Mei 2026", status:"good",
    deductions:[
      {date:"08 Mei 2026",offense:"Wrong Overtaking",        deducted:2.0,type:"citation",officer:"Cprl. Juma Mwinyi", location:"Morogoro Rd"},
      {date:"20 Apr 2026",offense:"Over Speeding",           deducted:3.0,type:"citation",officer:"Sgt. Ali Hassan",   location:"Bagamoyo Rd"},
      {date:"05 Mar 2026",offense:"No Insurance / Gari bila Bima",deducted:2.0,type:"citation",officer:"Sgt. Fatuma Hassan",location:"Temeke"},
    ]
  },
  { id:"DL005005TZ", nida:"197612301234571", name:"Saidi Omari Bakari",   plate:"T 005 MNO", yearStart:100, points:63, deducted:37, violations:8,  lastViolation:"05 Mei 2026", status:"warning",
    deductions:[
      {date:"05 Mei 2026",offense:"Overloading",             deducted:1.5,type:"citation",officer:"Sgt. Ali Hassan",   location:"Dar–Moshi Hwy"},
      {date:"18 Apr 2026",offense:"Defective Vehicle",       deducted:1.0,type:"citation",officer:"Cprl. Juma Mwinyi", location:"Temeke Rd"},
      {date:"02 Mar 2026",offense:"Over Speeding",           deducted:3.0,type:"citation",officer:"Sgt. Fatuma Hassan",location:"Kilwa Rd"},
    ]
  },
  { id:"DL007007TZ", nida:"200005121234573", name:"Baraka John Mwanga",   plate:"T 007 STU", yearStart:100, points:78, deducted:22, violations:5,  lastViolation:"02 Mei 2026", status:"good",
    deductions:[
      {date:"02 Mei 2026",offense:"Traffic Light Violation", deducted:2.0,type:"citation",officer:"Sgt. Ali Hassan",   location:"Ubungo"},
      {date:"12 Mar 2026",offense:"Kutumia Simu wakati wa Udereva",deducted:1.0,type:"warning",officer:"Insp. Grace Mushi",location:"Mwenge"},
    ]
  },
  { id:"DL009009TZ", nida:"197805091234575", name:"Hamisi Rashid Omar",   plate:"T 009 YZA", yearStart:100, points:48, deducted:52, violations:14, lastViolation:"28 Apr 2026", status:"critical",
    deductions:[
      {date:"28 Apr 2026",offense:"Driving Under Influence", deducted:3.0,type:"citation",officer:"Cprl. Juma Mwinyi", location:"Kariakoo"},
      {date:"15 Apr 2026",offense:"Wrong Overtaking",        deducted:2.0,type:"citation",officer:"Sgt. Ali Hassan",   location:"Bagamoyo Rd"},
      {date:"01 Mar 2026",offense:"Over Speeding",           deducted:3.0,type:"citation",officer:"Sgt. Fatuma Hassan",location:"Morogoro Rd"},
      {date:"10 Feb 2026",offense:"No Insurance / Gari bila Bima",deducted:2.0,type:"citation",officer:"Insp. Grace Mushi",location:"Ilala"},
    ]
  },
  { id:"DL011011TZ", nida:"199811271234577", name:"Mariamu Ally Komba",   plate:"T 011 EFG", yearStart:100, points:91, deducted:9,  violations:2,  lastViolation:"01 Apr 2026", status:"good",
    deductions:[
      {date:"01 Apr 2026",offense:"No Seatbelt",             deducted:0.5,type:"warning", officer:"Cprl. Juma Mwinyi", location:"Sinza"},
    ]
  },
  { id:"DL015015TZ", nida:"199309251234581", name:"Sikudhani Mwema Nyota",plate:"T 015 QRS", yearStart:100, points:100,deducted:0,  violations:0,  lastViolation:"—",           status:"good",
    deductions:[]
  },
  { id:"DL018018TZ", nida:"198905231234584", name:"Nassoro Kombo Mataka", plate:"T 018 ZAB", yearStart:100, points:35, deducted:65, violations:18, lastViolation:"20 Apr 2026", status:"suspended",
    deductions:[
      {date:"20 Apr 2026",offense:"Driving Under Influence", deducted:3.0,type:"citation",officer:"Insp. Grace Mushi", location:"Goba"},
      {date:"05 Apr 2026",offense:"Kuzuia Utekelezaji wa Sheria",deducted:2.5,type:"warning",officer:"Cprl. Juma Mwinyi",location:"Kinondoni"},
      {date:"20 Mar 2026",offense:"Over Speeding",           deducted:3.0,type:"citation",officer:"Sgt. Ali Hassan",   location:"Mbezi Rd"},
    ]
  },
];

// Citizen conduct points (same system — warnings deduct)
export interface CitizenPointsRecord {
  nida: string; name: string; phone: string;
  yearStart: number; points: number; deducted: number;
  incidents: number; lastIncident: string;
  status: "good" | "warning" | "critical" | "suspended";
  deductions: PointsDeduction[];
}
export const CITIZEN_POINTS: CitizenPointsRecord[] = [
  { nida:"197805091234575", name:"Hamisi Rashid Omar",    phone:"0766 222 444", yearStart:100, points:60, deducted:40, incidents:4, lastIncident:"28 Apr 2026", status:"warning",
    deductions:[
      {date:"28 Apr 2026",offense:"Ugomvi na Mapigano",         deducted:2.0,type:"warning",officer:"Insp. Grace Mushi", location:"Kariakoo"},
      {date:"10 Mar 2026",offense:"Ulevi wa Kupindukia",        deducted:2.0,type:"warning",officer:"Cprl. Emmanuel",    location:"Ubungo"},
    ]
  },
  { nida:"198905231234584", name:"Nassoro Kombo Mataka",  phone:"0712 222 333", yearStart:100, points:25, deducted:75, incidents:9, lastIncident:"20 Apr 2026", status:"suspended",
    deductions:[
      {date:"20 Apr 2026",offense:"Kuzuia Utekelezaji wa Sheria",deducted:2.5,type:"warning",officer:"Cprl. Juma Mwinyi",location:"Goba"},
      {date:"15 Mar 2026",offense:"Uvunjaji wa Amri ya Mahakama",deducted:3.0,type:"warning",officer:"Insp. Grace Mushi", location:"Kinondoni"},
    ]
  },
  { nida:"199012031234567", name:"Juma Khamis Mwinyi",    phone:"0712 345 678", yearStart:100, points:95, deducted:5,  incidents:1, lastIncident:"10 Jan 2026", status:"good",  deductions:[{date:"10 Jan 2026",offense:"Kelele za Usiku",deducted:0.5,type:"warning",officer:"Cst. Baraka John",location:"Mbezi Beach"}] },
  { nida:"199209141234570", name:"Grace Amina Mushi",     phone:"0766 456 789", yearStart:100, points:100,deducted:0,  incidents:0, lastIncident:"—",           status:"good",  deductions:[] },
  { nida:"197612301234571", name:"Saidi Omari Bakari",    phone:"0788 321 654", yearStart:100, points:72, deducted:28, incidents:3, lastIncident:"05 Mei 2026", status:"good",
    deductions:[{date:"05 Mei 2026",offense:"Uchafuzi wa Mazingira",deducted:0.5,type:"warning",officer:"Cprl. Emmanuel",location:"Temeke"}]
  },
];

// Arrest records
// ARREST_RECORDS removed — use Supabase

// Warning records
// WARNING_RECORDS removed — use Supabase

// Lost properties
export const LOST_PROPERTIES = [
  {
    id: "LP-2026-0089",
    category: "simu",
    description: "Samsung Galaxy S24 Ultra — Nyeusi",
    serialNo: "SM-S928B-2025-887643",
    deviceNo: "IMEI: 358423092847163",
    owner: "Fatuma Hassan Mwanga",
    ownerPhone: "0754 123 456",
    ownerNida: "199507081234567",
    reportedDate: "10 Mei 2026",
    reportedStation: "Kituo cha Temeke",
    status: "found",
    foundDate: "14 Mei 2026",
    foundLocation: "Kariakoo Market",
    notes: "Simu ilipatikana na mfanyabiashara wa Kariakoo.",
  },
  {
    id: "LP-2026-0088",
    category: "kompyuta",
    description: "HP Laptop 15s — Fedha",
    serialNo: "CNF1234567",
    deviceNo: "5CD1234XYZ",
    owner: "Juma Rashid Ally",
    ownerPhone: "0712 987 654",
    ownerNida: "198803221234567",
    reportedDate: "08 Mei 2026",
    reportedStation: "Kituo Kikuu DSM",
    status: "searching",
    foundDate: null,
    foundLocation: null,
    notes: "Liliibwa kwenye gari lililowekwa parking.",
  },
  {
    id: "LP-2026-0087",
    category: "hati",
    description: "Pasi ya Tanzania — Bluu",
    serialNo: "TZ-1234567",
    deviceNo: "N/A",
    owner: "Grace Amina Mushi",
    ownerPhone: "0766 456 789",
    ownerNida: "199209141234567",
    reportedDate: "05 Mei 2026",
    reportedStation: "Kituo cha Kinondoni",
    status: "searching",
    foundDate: null,
    foundLocation: null,
    notes: "Pasi ilipotea uwanja wa ndege.",
  },
  {
    id: "LP-2026-0086",
    category: "mali-nyingine",
    description: "Mfuko wa ngozi — Kahawia, na fedha TZS 500,000",
    serialNo: "N/A",
    deviceNo: "N/A",
    owner: "Saidi Omari Bakari",
    ownerPhone: "0788 321 654",
    ownerNida: "197612301234567",
    reportedDate: "02 Mei 2026",
    reportedStation: "Kituo cha Ilala",
    status: "returned",
    foundDate: "03 Mei 2026",
    foundLocation: "Kariakoo Bus Terminal",
    notes: "Ilipatikana na dereva wa daladala — fedha zote zipo.",
  },
  {
    id: "LP-2026-0085",
    category: "simu",
    description: "iPhone 14 Pro — Dhahabu",
    serialNo: "DNPXK23456789",
    deviceNo: "IMEI: 352098103456789",
    owner: "Amina Said Juma",
    ownerPhone: "0755 789 012",
    ownerNida: "200101151234567",
    reportedDate: "28 Apr 2026",
    reportedStation: "Kituo cha Ubungo",
    status: "searching",
    foundDate: null,
    foundLocation: null,
    notes: "Iliibiwa kwenye daladala.",
  },
];

// Detained citizens (station commissioner view)
export const DETAINED_CITIZENS = [
  {
    id: "DT-2026-0031",
    fullName: "Ali Bakari Hassan",
    nida: "198905231234567",
    dob: "23 Mei 1989",
    gender: "Mme",
    address: "Mtaa wa Kariakoo, Ilala, DSM",
    phone: "0712 456 789",
    occupation: "Mfanyabiashara",
    reason: "Wizi wa Silaha",
    detainedDate: "15 Mei 2026",
    detainedTime: "07:20",
    cell: "B-3",
    station: "Kituo cha Ilala",
    officer: "Cprl. Juma Mwinyi",
    type: "arrested",
    status: "held",
    courtDate: "22 Mei 2026",
    medicalStatus: "Nzuri",
    nextOfKin: "Fatuma Hassan — 0755 111 222",
    lawyer: "Dkt. Omar Salum — 0788 333 444",
  },
  {
    id: "DT-2026-0030",
    fullName: "Rashid Omari Said",
    nida: "199203151234567",
    dob: "15 Mar 1992",
    gender: "Mme",
    address: "Mtaa wa Magomeni, Kinondoni, DSM",
    phone: "0755 321 654",
    occupation: "Dereva",
    reason: "Uendeshaji Gari kwa Ulevi",
    detainedDate: "14 Mei 2026",
    detainedTime: "23:45",
    cell: "A-1",
    station: "Kituo Kikuu DSM",
    officer: "Sgt. Ali Hassan",
    type: "traffic",
    status: "released",
    courtDate: "18 Mei 2026",
    medicalStatus: "Nzuri",
    nextOfKin: "Amina Omari — 0766 789 012",
    lawyer: "Hajulikani",
  },
  {
    id: "DT-2026-0029",
    fullName: "Baraka John Mwanga",
    nida: "200005121234567",
    dob: "12 May 2000",
    gender: "Mme",
    address: "Mtaa wa Manzese, Ubungo, DSM",
    phone: "0788 654 321",
    occupation: "Mwanafunzi",
    reason: "Migogoro ya Kikosi",
    detainedDate: "12 Mei 2026",
    detainedTime: "14:30",
    cell: "C-1",
    station: "Kituo cha Ubungo",
    officer: "Cst. Mariam Ally",
    type: "detained",
    status: "held",
    courtDate: "17 Mei 2026",
    medicalStatus: "Maumivu Madogo",
    nextOfKin: "John Mwanga — 0712 111 333",
    lawyer: "Hajulikani",
  },
];

// Chat messages for alerts
export const CHAT_MESSAGES = [
  { id: 1, from: "OCD Mwanza", role: "commander", message: "Vikosi vyote, doria ianze saa 4 usiku.", time: "07:00", mine: false },
  { id: 2, from: "Cprl. Juma", role: "officer", message: "Imepokewa. Tutakuwa tayari.", time: "07:02", mine: true },
  { id: 3, from: "Sgt. Ali Hassan", role: "officer", message: "Kikosi cha Kinondoni tayari.", time: "07:03", mine: false },
  { id: 4, from: "Insp. Grace", role: "officer", message: "Eneo la Kariakoo limefunikwa.", time: "07:05", mine: false },
  { id: 5, from: "OCD Mwanza", role: "commander", message: "Vizuri. Ripoti kila saa mbili.", time: "07:06", mine: false },
];

// Search result mock data
export const SEARCH_RESULT = {
  plate: "T 003 GHI",
  model: "Toyota Corolla",
  year: "2020",
  color: "Nyeupe",
  type: "Saloon",
  owner: "Juma Khamis Mwinyi",
  ownerNida: "199012031234567",
  ownerPhone: "0712 345 678",
  licenseNo: "DL123456789TZ",
  licenseExpiry: "31 Dec 2027",
  insuranceExpiry: "15 Jun 2026",
  inspectionExpiry: "30 Apr 2026",
  registrationExpiry: "31 Mar 2027",
  status: "clear" as const,
  outstanding_fines: 1,
  total_fines_amount: "TZS 150,000",
};

// General officer recent incidents (for Polisi screen)
export const GENERAL_INCIDENTS = [
  { id: 1, title: "Wizi wa simu - Kariakoo", type: "Wizi", status: "Yanaendelea", statusColor: "#F97316", icon: "alert", iconColor: "#F97316", date: "12 Mei 2026", time: "14:30", location: "Kariakoo Market, Ilala", description: "Mtuhumiwa aliiba simu 3 kutoka kwa wafanyabiashara wakati wa msongamano wa soko. Alitoroka kuelekea Mnazi Mmoja.", casualties: 0, officer: "Cprl. Juma Mwinyi" },
  { id: 2, title: "Gharika ya mto Msimbazi", type: "Dharura ya Asili", status: "Tatuliwa", statusColor: "#10B981", icon: "cloud-rain", iconColor: "#2196F3", date: "10 Mei 2026", time: "08:15", location: "Msimbazi Valley, Kinondoni", description: "Mafuriko yaliyosababishwa na mvua nyingi usiku. Familia 12 zilihamishwa. Hakuna majeruhi.", casualties: 0, officer: "Sgt. Ali Hassan" },
  { id: 3, title: "Ajali ya gari - Mwendokasi", type: "Ajali ya Barabara", status: "Yanaendelea", statusColor: "#F97316", icon: "car", iconColor: "#EF4444", date: "09 Mei 2026", time: "17:45", location: "Mwendokasi Terminal, Ubungo", description: "Mgongano kati ya daladala na pikipiki. Majeruhi 2 walipelekwa Mwananyamala.", casualties: 2, officer: "Cprl. Juma Mwinyi" },
  { id: 4, title: "Uvamizi wa nyumba - Mbezi", type: "Uvamizi", status: "Tatuliwa", statusColor: "#10B981", icon: "shield-alert", iconColor: "#10B981", date: "08 Mei 2026", time: "22:10", location: "Mbezi Beach, Kinondoni", description: "Wavamizi 3 waliingia nyumba usiku. Mmiliki alimpigia simu polisi. Wavamizi walikamatwa kituoni.", casualties: 0, officer: "Insp. Grace Mushi" },
  { id: 5, title: "Ufisadi wa umma - Posta", type: "Ufisadi", status: "Mpya", statusColor: "#2196F3", icon: "users", iconColor: "#1E3A8A", date: "07 Mei 2026", time: "11:20", location: "Posta Mpya, Ilala", description: "Mlalamiko wa ufisadi dhidi ya afisa wa serikali. Uchunguzi unaendelea.", casualties: 0, officer: "Cprl. Saidi Juma" },
];

// TRAFFIC_STATS — derived from CITATION_HISTORY (defined above)
export const TRAFFIC_STATS = (() => {
  const total     = CITATION_HISTORY.length;
  const unpaid    = CITATION_HISTORY.filter((c) => c.status === "Hajalipwa").length;
  const paid      = CITATION_HISTORY.filter((c) => c.status === "Imelipwa").length;
  const totalFine = CITATION_HISTORY.reduce(
    (s, c) => s + parseInt(c.fine.replace(/[^\d]/g, ""), 10), 0
  );
  return [
    { label: "Jumla ya Makosa", value: String(total),                        icon: "clipboard", color: "#2196F3" },
    { label: "Inasubiri",       value: String(unpaid),                       icon: "clock",     color: "#FF9800" },
    { label: "Imelipwa",        value: String(paid),                         icon: "check",     color: "#10B981" },
    { label: "Jumla ya Faini",  value: (totalFine/1000).toFixed(0)+"k", sub: "TZS", icon: "wallet", color: "#1E3A8A" },
  ];
})();
