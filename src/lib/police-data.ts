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
  | "offense-detail";

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
  { label: "Matukio Yote", value: "1,234", icon: "alert", color: "#1A237E" },
  { label: "Kesi Zinazosubiri", value: "56", icon: "clock", color: "#FF9800" },
  { label: "Kesi Zilizotatuliwa", value: "1,178", icon: "check", color: "#4CAF50" },
  { label: "Patroli Zinazofanya Kazi", value: "23", icon: "car", color: "#F44336" },
];

export const TRAFFIC_STATS = [
  { label: "Jumla ya Makosa", value: "10", icon: "clipboard", color: "#2563EB" },
  { label: "Inasubiri", value: "6", icon: "clock", color: "#F97316" },
  { label: "Imelipwa", value: "4", icon: "check", color: "#10B981" },
  { label: "Jumla ya Faini", value: "580,000", sub: "TZS", icon: "wallet", color: "#8B5CF6" },
];

export const TRAFFIC_QUICK_ACTIONS = [
  { label: "Ripoti Tukio", icon: "clipboard", color: "#2563EB", screen: "incident-detail" as ScreenId },
  { label: "Tafuta Raia", icon: "search", color: "#8B5CF6", screen: "citizen-search-results" as ScreenId },
  { label: "Rekodi Taarifa", icon: "file-text", color: "#10B981", screen: "citation" as ScreenId },
  { label: "Kamata Mtuhumiwa", icon: "user-x", color: "#EF4444", screen: "arrest-form" as ScreenId },
  { label: "Ripoti Ajali", icon: "alert-triangle", color: "#F97316", screen: "accident-report" as ScreenId },
  { label: "Historia", icon: "clock", color: "#3B82F6", screen: "history" as ScreenId },
];

export const RECENT_OFFENSES = [
  {
    id: 1,
    name: "Kutopita mstari",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    date: "15 Mei 2026",
    location: "Morogoro Road, DSM",
    fine: "TZS 50,000",
    icon: "alert-triangle",
    iconColor: "#F97316",
    plate: "T123ABC",
    driver: "Juma Khamis Mwinyi",
    offense: "Kutopita mstari wa kugawanya barabara",
    deductedPoints: 1,
  },
  {
    id: 2,
    name: "Kasi kupita kiasi",
    status: "Imelipwa" as const,
    statusColor: "#10B981",
    date: "14 Mei 2026",
    location: "Mandela Road, DSM",
    fine: "TZS 150,000",
    icon: "zap",
    iconColor: "#EF4444",
    plate: "T789GHI",
    driver: "Ali Mohamed Salum",
    offense: "Over Speeding - 95km/h kwenye 60km/h zone",
    deductedPoints: 3,
  },
  {
    id: 3,
    name: "Kutumia simu",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    date: "13 Mei 2026",
    location: "Samora Ave, DSM",
    fine: "TZS 50,000",
    icon: "phone",
    iconColor: "#8B5CF6",
    plate: "T456DEF",
    driver: "Grace Mushi",
    offense: "Kutumia simu bila headset wakati wa udereva",
    deductedPoints: 1,
  },
  {
    id: 4,
    name: "Bila mkanda",
    status: "Imelipwa" as const,
    statusColor: "#10B981",
    date: "12 Mei 2026",
    location: "Kivukoni, DSM",
    fine: "TZS 30,000",
    icon: "minus-circle",
    iconColor: "#3B82F6",
    plate: "T321XYZ",
    driver: "Saidi Juma Khamis",
    offense: "Kutumia gari bila mkanda wa usalama",
    deductedPoints: 0.5,
  },
  {
    id: 5,
    name: "Taa nyekundu",
    status: "Hajalipwa" as const,
    statusColor: "#EF4444",
    date: "11 Mei 2026",
    location: "Posta, DSM",
    fine: "TZS 100,000",
    icon: "circle",
    iconColor: "#EF4444",
    plate: "T654ABC",
    driver: "Hamisi Rashid",
    offense: "Kupita taa nyekundu - junction ya Posta",
    deductedPoints: 2,
  },
];

export const PATROL_STATS = [
  { label: "Patroli za Leo", value: "3", icon: "shield", color: "#2196F3" },
  { label: "Eneo Lililofunikwa", value: "8", icon: "map-pin", color: "#4CAF50" },
  { label: "Muda (Saa)", value: "6.5", icon: "clock", color: "#FF9800" },
  { label: "Umbali (km)", value: "42", icon: "route", color: "#9C27B0" },
];

export const ALERTS = [
  {
    id: 1,
    icon: "alert-triangle",
    iconColor: "#F44336",
    title: "SOS — Insp. Grace Mushi",
    time: "08:28",
    message: "Ofisa anahitaji msaada haraka! Kariakoo junction — gari linaloshukiwa limeendesha kwa hatari.",
    source: "Command Center",
    sourceBg: "#FFEBEE",
    dotColor: "#F44336",
    borderColor: "#F44336",
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
    message: "Citation namba CT-2026-0451 kwa gari T123ABC imekubaliwa na kusindikizwa kwa mahakama.",
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
    iconColor: "#9C27B0",
    title: "Kukamatwa: Ali Bakari — Imekamilika",
    time: "05:30",
    message: "Ripoti ya kukamatwa kwa Ali Bakari imepokewa na Kamishna wa Kituo. Weka kizuizini hadi uchunguzi ukamilike.",
    source: "Kituo cha Ilala",
    sourceBg: "#F3E5F5",
    dotColor: "#9C27B0",
    borderColor: "#9C27B0",
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
    iconColor: "#3B82F6",
    title: "Mali Iliyopotea — Simu Imepatikana",
    time: "Jana",
    message: "Simu ya Samsung (SN: SM-S928B-2025) iliyoripotiwa kuibiwa Mei 10 imepatikana na ofisa wa Temeke.",
    source: "Kituo cha Temeke",
    sourceBg: "#E3F2FD",
    dotColor: "#3B82F6",
    borderColor: "#3B82F6",
    unread: false,
    category: "all" as const,
    important: false,
  },
];

export const PROFILE_STATS = [
  { label: "Patroli Zilizofanywa", value: "3", sub: "Leo", icon: "car", color: "#2196F3" },
  { label: "Citations Zimetolewa", value: "12", sub: "Leo", icon: "file-text", color: "#FF9800" },
  { label: "Makosa Yaliyoshughulikiwa", value: "18", sub: "Leo", icon: "users", color: "#4CAF50" },
  { label: "Masaa Kazini", value: "8.5", sub: "Leo", icon: "calendar", color: "#9C27B0" },
  { label: "Umbali (km)", value: "116.5", sub: "Wiki Hii", icon: "route", color: "#2196F3" },
];

export const PROFILE_ACTIVITIES = [
  { title: "Patroli imekamilika", desc: "Kariakoo - Ilala Zone", time: "08:15 AM 15 Mei 2026", icon: "car", color: "#2196F3" },
  { title: "Citation imetolewa", desc: "Namba ya Gari: T789GHI", time: "07:45 AM 15 Mei 2026", icon: "file-text", color: "#4CAF50" },
  { title: "Kukamatwa — Ali Bakari", desc: "Wizi wa Silaha", time: "07:20 AM 15 Mei 2026", icon: "user-x", color: "#EF4444" },
  { title: "Onyo Limetolewa", desc: "Kasi kupita kiasi — T456DEF", time: "06:50 AM 15 Mei 2026", icon: "alert-triangle", color: "#FF9800" },
  { title: "Eneo la Patroli", desc: "Morogoro Road, Dar es Salaam", time: "06:30 AM 15 Mei 2026", icon: "map-pin", color: "#9C27B0" },
];

export const PROFILE_SETTINGS = [
  { label: "Profaili Yangu", desc: "Maelezo binafsi", icon: "user", color: "#2196F3" },
  { label: "Mipangilio", desc: "Badilisha mipangilio", icon: "settings", color: "#2196F3" },
  { label: "Usalama", desc: "Nenosiri na usalama", icon: "shield", color: "#2196F3" },
  { label: "Pakua Ripoti", desc: "Ripoti na takwimu", icon: "download", color: "#4CAF50" },
  { label: "Historia ya Shughuli", desc: "Rekodi zako zote", icon: "clock", color: "#FF9800" },
  { label: "Msaada", desc: "Usaidizi na maelekezo", icon: "help-circle", color: "#2196F3" },
];

export const ACCIDENT_VEHICLES = [
  { plate: "T123ABC", model: "Toyota Corolla", color: "Nyeupe", damage: "Ndogo" },
  { plate: "T789GHI", model: "Toyota Hiace", color: "Fedha", damage: "Kubwa" },
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
  plate: "T123ABC",
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
      plate: "T123ABC", make: "Toyota Corolla", year: "2020", color: "Nyeupe",
      driver: "Juma Khamis Mwinyi", license: "DL123456789TZ",
      direction: "Kuelekea Ubungo", damage: "Mbele - Upande wa Kulia", insured: true,
    },
    {
      plate: "T789GHI", make: "Toyota Hiace", year: "2019", color: "Fedha",
      driver: "Ali Mohamed Salum", license: "DL987654321TZ",
      direction: "Kutoka Ubungo", damage: "Nyuma - Upande wa Kushoto", insured: true,
    },
  ],
  casualties: [
    { name: "Ali Mohamed Salum", type: "Abiria", injury: "Maumivu Madogo", hospital: "Mwananyamala", status: "Matibabu" },
    { name: "Fatuma Hassan", type: "Abiria", injury: "Hakuna Madhara", hospital: "—", status: "Ametoka" },
  ],
  witnesses: [
    { name: "Saidi Juma", phone: "0788 123 456", statement: "Gari la T123ABC lilipita kasi na kupoteza udhibiti." },
    { name: "Mariam Ally", phone: "0766 987 654", statement: "Niliona gari la pindi likijaribu kuepuka." },
  ],
};

export const CITATION_HISTORY = [
  { id: "CT-2026-0451", plate: "T123ABC", offense: "Over Speeding", driver: "Juma Khamis Mwinyi", date: "10 Mei 2026", time: "14:30", location: "Mandela Road, DSM", fine: "TZS 150,000", status: "Hajalipwa", statusColor: "#F44336", deductedPoints: 3 },
  { id: "CT-2026-0450", plate: "T789GHI", offense: "No Seatbelt", driver: "Ali Mohamed Salum", date: "08 Mei 2026", time: "09:15", location: "Mbezi Beach, DSM", fine: "TZS 50,000", status: "Imelipwa", statusColor: "#10B981", deductedPoints: 0.5 },
  { id: "CT-2026-0449", plate: "T456DEF", offense: "Traffic Light Violation", driver: "Saidi Juma Khamis", date: "05 Mei 2026", time: "17:45", location: "Samora Ave, DSM", fine: "TZS 100,000", status: "Imelipwa", statusColor: "#10B981", deductedPoints: 2 },
  { id: "CT-2026-0448", plate: "T321XYZ", offense: "Kutumia Simu wakati wa Udereva", driver: "Grace Mushi", date: "02 Mei 2026", time: "11:20", location: "Nkrumah Street, DSM", fine: "TZS 50,000", status: "Hajalipwa", statusColor: "#F44336", deductedPoints: 1 },
  { id: "CT-2026-0447", plate: "T654ABC", offense: "Kutopita kasi", driver: "Hamisi Rashid", date: "28 Apr 2026", time: "08:05", location: "Morogoro Road, DSM", fine: "TZS 30,000", status: "Imelipwa", statusColor: "#10B981", deductedPoints: 0.5 },
  { id: "CT-2026-0446", plate: "T888ZZZ", offense: "No Insurance", driver: "Baraka Msangi", date: "25 Apr 2026", time: "15:30", location: "Kariakoo, DSM", fine: "TZS 200,000", status: "Hajalipwa", statusColor: "#F44336", deductedPoints: 2 },
  { id: "CT-2026-0445", plate: "T555YYY", offense: "Defective Vehicle", driver: "Zawadi Kimani", date: "22 Apr 2026", time: "10:00", location: "Tabata, DSM", fine: "TZS 75,000", status: "Imelipwa", statusColor: "#10B981", deductedPoints: 1 },
];

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
export const VIOLATION_POINTS: Record<string, number> = {
  "Over Speeding": 3,
  "Driving Under Influence": 3,
  "Wrong Overtaking": 2,
  "Traffic Light Violation": 2,
  "No Insurance": 2,
  "No Seatbelt": 0.5,
  "Kutumia Simu wakati wa Udereva": 1,
  "Kutopita kasi": 0.5,
  "Kutopita mstari": 1,
  "Gari bila Bima": 2,
  "Leseni imekwisha": 1.5,
  "Kukata kona hatari": 2,
  "Kuepuka kodi": 1,
  "Overloading": 1.5,
  "No Inspection Certificate": 1,
  "Defective Vehicle": 1,
};

// Driver points registry
export const DRIVER_POINTS = [
  { id: "DL123456789TZ", name: "Juma Khamis Mwinyi", plate: "T123ABC", points: 87, violations: 3, lastViolation: "10 Mei 2026", status: "good" as const },
  { id: "DL987654321TZ", name: "Ali Mohamed Salum", plate: "T789GHI", points: 74, violations: 5, lastViolation: "08 Mei 2026", status: "good" as const },
  { id: "DL555555555TZ", name: "Grace Mushi", plate: "T456DEF", points: 63, violations: 7, lastViolation: "05 Mei 2026", status: "warning" as const },
  { id: "DL444444444TZ", name: "Saidi Juma Khamis", plate: "T321XYZ", points: 55, violations: 9, lastViolation: "02 Mei 2026", status: "warning" as const },
  { id: "DL777777777TZ", name: "Hamisi Rashid", plate: "T654ABC", points: 48, violations: 12, lastViolation: "28 Apr 2026", status: "critical" as const },
  { id: "DL888888888TZ", name: "Baraka Msangi", plate: "T888ZZZ", points: 72, violations: 4, lastViolation: "25 Apr 2026", status: "good" as const },
  { id: "DL999999999TZ", name: "Zawadi Kimani", plate: "T555YYY", points: 100, violations: 0, lastViolation: "—", status: "good" as const },
  { id: "DL111111111TZ", name: "Fatuma Hassan", plate: "T777AAA", points: 52, violations: 10, lastViolation: "20 Apr 2026", status: "warning" as const },
  { id: "DL222222222TZ", name: "Rashid Omari", plate: "T222BBB", points: 38, violations: 15, lastViolation: "15 Apr 2026", status: "critical" as const },
  { id: "DL333333333TZ", name: "Amina Said", plate: "T333CCC", points: 91, violations: 2, lastViolation: "01 Apr 2026", status: "good" as const },
];

// Arrest records
export const ARREST_RECORDS = [
  {
    id: "AR-2026-0045",
    suspect: "Ali Bakari Hassan",
    nida: "198905231234567",
    dob: "23 Mei 1989",
    gender: "Mme",
    offense: "Wizi wa Silaha",
    offenseCategory: "criminal",
    arrestDate: "15 Mei 2026",
    arrestTime: "07:20",
    arrestLocation: "Kariakoo, DSM",
    station: "Kituo cha Ilala",
    holdingCell: "Chumba B-3",
    arrestingOfficer: "Cprl. Juma Mwinyi",
    status: "held",
    courtDate: "22 Mei 2026",
    notes: "Mshukiwa alikamatwa na silaha mkononi. Dawa za kulevya zilipatikana.",
  },
  {
    id: "AR-2026-0044",
    suspect: "Rashid Omari Said",
    nida: "199203151234567",
    dob: "15 Mar 1992",
    gender: "Mme",
    offense: "Uendeshaji Gari kwa Ulevi",
    offenseCategory: "traffic",
    arrestDate: "14 Mei 2026",
    arrestTime: "23:45",
    arrestLocation: "Bagamoyo Road, DSM",
    station: "Kituo Kikuu DSM",
    holdingCell: "Chumba A-1",
    arrestingOfficer: "Sgt. Ali Hassan",
    status: "released",
    courtDate: "18 Mei 2026",
    notes: "BAC 0.12%. Gari lilisimamishwa. Familia ilipigiwa simu.",
  },
  {
    id: "AR-2026-0043",
    suspect: "Grace Amina Mwanga",
    nida: "199507081234567",
    dob: "08 Jul 1995",
    gender: "Mke",
    offense: "Kupiga Risasi Holela",
    offenseCategory: "criminal",
    arrestDate: "13 Mei 2026",
    arrestTime: "15:10",
    arrestLocation: "Mnazi Mmoja, DSM",
    station: "Kituo cha Kinondoni",
    holdingCell: "Chumba C-2",
    arrestingOfficer: "Insp. Grace Mushi",
    status: "charged",
    courtDate: "20 Mei 2026",
    notes: "Inahusishwa na tukio la ugaidi mdogo.",
  },
];

// Warning records
export const WARNING_RECORDS = [
  {
    id: "WR-2026-0112",
    recipient: "Juma Khamis Mwinyi",
    plate: "T123ABC",
    licenseNo: "DL123456789TZ",
    warningType: "traffic",
    offense: "Kutopita mstari",
    date: "15 Mei 2026",
    time: "08:30",
    location: "Morogoro Road, DSM",
    issuingOfficer: "Cprl. Juma Mwinyi",
    station: "Kituo Kikuu DSM",
    notes: "Onyo la kwanza. Mwelekeze kuzingatia kanuni za barabarani.",
    acknowledged: true,
  },
  {
    id: "WR-2026-0111",
    recipient: "Baraka Msangi",
    plate: "T888ZZZ",
    licenseNo: "DL888888888TZ",
    warningType: "traffic",
    offense: "Kasi kidogo zaidi ya kiwango",
    date: "14 Mei 2026",
    time: "11:15",
    location: "Nelson Mandela Road, DSM",
    issuingOfficer: "Sgt. Ali Hassan",
    station: "Kituo Kikuu DSM",
    notes: "Dereva alikubaliana na onyo.",
    acknowledged: true,
  },
  {
    id: "WR-2026-0110",
    recipient: "Zawadi Kimani",
    plate: "T555YYY",
    licenseNo: "DL999999999TZ",
    warningType: "conduct",
    offense: "Tabia mbaya kwa afisa wa polisi",
    date: "12 Mei 2026",
    time: "16:45",
    location: "Samora Ave, DSM",
    issuingOfficer: "Cprl. Saidi Juma",
    station: "Kituo cha Temeke",
    notes: "Mtu alionyesha tabia ya dharau kwa afisa.",
    acknowledged: false,
  },
];

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
  plate: "T123ABC",
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
