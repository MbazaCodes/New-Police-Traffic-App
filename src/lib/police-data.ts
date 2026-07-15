// TZ Police Digital Platform — Mock data & types
// All data extracted from the supplied UI mockup images.

export type ScreenId =
  | "login"
  | "home"
  | "search-results"
  | "traffic"
  | "patrol"
  | "alerts"
  | "profile"
  | "accident-report"
  | "vehicle-inspection"
  | "pf3"
  | "citation"
  | "history";

export const OFFICER = {
  name: "Insp. Juma Mwinyi",
  shortName: "Juma Mwinyi",
  rank: "Police Inspector",
  rankShort: "Insp.",
  id: "TP123456",
  station: "Kituo Kikuu cha Polisi Dar es Salaam",
  unit: "Trafiki - Mkoa wa Dar es Salaam",
  phone: "0712 345 678",
  email: "juma.mwinyi@polisi.go.tz",
  status: "Mtaandao",
};

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
  { label: "Ripoti Kosa", icon: "clipboard", color: "#2563EB", screen: "citation" as ScreenId },
  { label: "Toa Citation", icon: "file-text", color: "#10B981", screen: "citation" as ScreenId },
  { label: "Tafuta Gari", icon: "search", color: "#8B5CF6", screen: "search-results" as ScreenId },
  { label: "Ukaguzi wa Gari", icon: "car", color: "#F97316", screen: "vehicle-inspection" as ScreenId },
  { label: "Ripoti Ajali", icon: "alert-triangle", color: "#EF4444", screen: "accident-report" as ScreenId },
  { label: "Fomu PF3", icon: "file-text", color: "#0A3D62", screen: "pf3" as ScreenId },
  { label: "Historia ya Citation", icon: "clock", color: "#3B82F6", screen: "history" as ScreenId },
];

export const RECENT_OFFENSES = [
  {
    id: 1,
    name: "Kutopita mstari",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    icon: "git-merge",
    iconColor: "#F97316",
    date: "25 Okt 2024",
    location: "Singida-Dodoma Road",
    fine: "TZS 30,000",
  },
  {
    id: 2,
    name: "Kutovaa mkanda",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    icon: "shield-alert",
    iconColor: "#F97316",
    date: "23 Okt 2024",
    location: "Mpanda Road, Kigoma",
    fine: "TZS 30,000",
  },
  {
    id: 3,
    name: "Kutumia simu wakati wa udereva",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    icon: "smartphone",
    iconColor: "#F97316",
    date: "22 Okt 2024",
    location: "Nkrumah Street, Morogoro",
    fine: "TZS 50,000",
  },
  {
    id: 4,
    name: "Kupita mwanga mwekundu",
    status: "Imelipwa" as const,
    statusColor: "#10B981",
    icon: "traffic-cone",
    iconColor: "#10B981",
    date: "21 Okt 2024",
    location: "Jamhuri Street, Bukoba",
    fine: "TZS 80,000",
  },
  {
    id: 5,
    name: "Kupita kasi",
    status: "Inasubiri" as const,
    statusColor: "#F97316",
    icon: "gauge",
    iconColor: "#F97316",
    date: "20 Okt 2024",
    location: "Morogoro Road, Dar es Salaam",
    fine: "TZS 30,000",
  },
];

export const SEARCH_RESULT = {
  plate: "T123ABC",
  date: "15 Mei 2026 • 09:35 AM",
  status: "Imepatikana",
  riskScore: 70,
  riskLevel: "JUU",
  alertMessage: "Dereva ana historia ya makosa ya trafiki",
  insurance: {
    company: "CRDB Insurance Company",
    policy: "CRDB/2026/154689",
    expires: "15/05/2027",
    valid: true,
  },
  driver: {
    name: "Juma Khamis Mwinyi",
    gender: "Male",
    license: "DL123456789TZ",
    licenseClass: "Class B",
    nida: "1990123456789",
    mobile: "07X XXX XXXX",
  },
  vehicle: {
    model: "Toyota Hilux",
    type: "Pick Up",
    year: "2022",
    color: "White",
    accidentInvolved: true,
  },
  payment: {
    hasOutstanding: true,
    totalViolations: 3,
  },
  violations: [
    { id: 1, name: "Over Speeding", date: "10/05/2026", area: "Mandela Road", fine: "TZS 150,000", paid: false },
    { id: 2, name: "No Seatbelt", date: "28/04/2026", area: "Mbezi Beach", fine: "TZS 50,000", paid: false },
    { id: 3, name: "Traffic Light Violation", date: "15/04/2026", area: "Samora Ave", fine: "TZS 100,000", paid: false },
  ],
};

export const PATROL_STATS = [
  { label: "Jumla Patroli", value: "3", icon: "shield", color: "#2196F3" },
  { label: "Umbali (km)", value: "116.5", icon: "map-pin", color: "#4CAF50" },
  { label: "Masaa", value: "24.0", icon: "clock", color: "#FF9800" },
];

export const ALERTS = [
  {
    id: 1,
    icon: "car",
    iconColor: "#F44336",
    title: "Gari la Uhalifu limeonekana",
    time: "siku 628 zilizopita",
    message:
      "Gari la aina ya Toyota Corolla, nambari ya usajili T789GHI, limeordeshwa kama gari la wizi. Endelea kwa tahadhari.",
    source: "Kituo Kikuu cha Polisi",
    sourceBg: "#FFEBEE",
    dotColor: "#F44336",
    borderColor: "#F44336",
    unread: true,
  },
  {
    id: 2,
    icon: "cloud-rain",
    iconColor: "#9E9E9E",
    title: "Onyo la Mvua Kubwa",
    time: "siku 628 zilizopita",
    message:
      "Tahadhari: Mvua kubwa inatarajiwa katika mkoa wa Dar es Salaam kuanzia saa 2 asubuhi. Waofisa wa trafiki watahimizwa kuwa makini.",
    source: "Idara ya Hali ya Hewa",
    sourceBg: "#E3F2FD",
    dotColor: "#2196F3",
    borderColor: "#2196F3",
    unread: false,
  },
  {
    id: 3,
    icon: "graduation-cap",
    iconColor: "#4CAF50",
    title: "Mafunzo ya IPS mpya",
    time: "siku 629 zilizopita",
    message:
      "Mafunzo mapya ya IPS (International Police System) yatapokelewa wiki ijayo. Waofisa wote watahitajiwa kuhudhuria.",
    source: "Mkuu wa Mkoa - Dar es Salaam",
    sourceBg: "#E8F5E9",
    dotColor: "#4CAF50",
    borderColor: "#4CAF50",
    unread: false,
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
  { title: "Kosa Imeripotiwa", desc: "Exceeding Speed Limit", time: "07:20 AM 15 Mei 2026", icon: "alert-triangle", color: "#FF9800" },
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

// PF3 — Police Form 3 (Tanzania Police Traffic Accident Report)
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
      plate: "T123ABC",
      make: "Toyota Corolla",
      year: "2020",
      color: "Nyeupe",
      driver: "Juma Khamis Mwinyi",
      license: "DL123456789TZ",
      direction: "Kuelekea Ubungo",
      damage: "Mbele - Upande wa Kulia",
      insured: true,
    },
    {
      plate: "T789GHI",
      make: "Toyota Hiace",
      year: "2019",
      color: "Fedha",
      driver: "Ali Mohamed Salum",
      license: "DL987654321TZ",
      direction: "Kutoka Ubungo",
      damage: "Nyuma - Upande wa Kushoto",
      insured: true,
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

// Citation history
export const CITATION_HISTORY = [
  {
    id: "CT-2026-0451",
    plate: "T123ABC",
    offense: "Over Speeding",
    driver: "Juma Khamis Mwinyi",
    date: "10 Mei 2026",
    time: "14:30",
    location: "Mandela Road, DSM",
    fine: "TZS 150,000",
    status: "Hajalipwa",
    statusColor: "#F44336",
  },
  {
    id: "CT-2026-0450",
    plate: "T789GHI",
    offense: "No Seatbelt",
    driver: "Ali Mohamed Salum",
    date: "08 Mei 2026",
    time: "09:15",
    location: "Mbezi Beach, DSM",
    fine: "TZS 50,000",
    status: "Imelipwa",
    statusColor: "#10B981",
  },
  {
    id: "CT-2026-0449",
    plate: "T456DEF",
    offense: "Traffic Light Violation",
    driver: "Saidi Juma Khamis",
    date: "05 Mei 2026",
    time: "17:45",
    location: "Samora Ave, DSM",
    fine: "TZS 100,000",
    status: "Imelipwa",
    statusColor: "#10B981",
  },
  {
    id: "CT-2026-0448",
    plate: "T321XYZ",
    offense: "Kutumia Simu wakati wa Udereva",
    driver: "Grace Mushi",
    date: "02 Mei 2026",
    time: "11:20",
    location: "Nkrumah Street, DSM",
    fine: "TZS 50,000",
    status: "Hajalipwa",
    statusColor: "#F44336",
  },
  {
    id: "CT-2026-0447",
    plate: "T654ABC",
    offense: "Kutopita kasi",
    driver: "Hamisi Rashid",
    date: "28 Apr 2026",
    time: "08:05",
    location: "Morogoro Road, DSM",
    fine: "TZS 30,000",
    status: "Imelipwa",
    statusColor: "#10B981",
  },
];

// Citation form options
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
];

export const VEHICLE_TYPES = ["Saloon", "Pick Up", "Minibus", "Lori", "Pikipiki", "Bajaji", "Basila"];
