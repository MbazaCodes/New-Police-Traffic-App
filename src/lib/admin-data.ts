// Admin & Command Center mock data

export const ADMIN_USER = {
  name: "CP. Saidi Waziri",
  shortName: "Saidi Waziri",
  rank: "Commissioner of Police",
  role: "commander",
  id: "ADM-001",
  station: "Makao Makuu - Dar es Salaam",
  email: "saidi.waziri@polisi.go.tz",
};

export const DASHBOARD_KPIS = [
  { label: "Maofisa Walioko Kazini", value: "147", change: "+12%", trend: "up", icon: "users", color: "#2196F3" },
  { label: "Patroli Zinazoendelea", value: "23", change: "+5%", trend: "up", icon: "shield", color: "#10B981" },
  { label: "Matukio ya Leo", value: "34", change: "-8%", trend: "down", icon: "alert-triangle", color: "#FF9800" },
  { label: "Citations za Leo", value: "89", change: "+15%", trend: "up", icon: "file-text", color: "#1E3A8A" },
];

export const INCIDENT_TREND = [
  { day: "Mon", incidents: 28, citations: 65 },
  { day: "Tue", incidents: 35, citations: 72 },
  { day: "Wed", incidents: 22, citations: 58 },
  { day: "Thu", incidents: 41, citations: 81 },
  { day: "Fri", incidents: 38, citations: 94 },
  { day: "Sat", incidents: 45, citations: 102 },
  { day: "Sun", incidents: 34, citations: 89 },
];

export const OFFENSE_DISTRIBUTION = [
  { name: "Over Speeding", value: 342, color: "#2196F3" },
  { name: "No Seatbelt", value: 218, color: "#10B981" },
  { name: "Traffic Light", value: 156, color: "#FF9800" },
  { name: "Phone While Driving", value: 98, color: "#1E3A8A" },
  { name: "Other", value: 74, color: "#607D8B" },
];

// Dynamic distributions — derived from real mock data
export const GENERAL_INCIDENT_DISTRIBUTION = [
  { name: "Wizi", value: 89, color: "#EF4444" },
  { name: "Uvamizi", value: 56, color: "#1E3A8A" },
  { name: "Mgogoro", value: 43, color: "#FF9800" },
  { name: "Ufisadi", value: 28, color: "#2196F3" },
  { name: "Nyingine", value: 34, color: "#607D8B" },
];

export const COMBINED_DISTRIBUTION = [
  { name: "Over Speeding", value: 342, color: "#2196F3", type: "traffic" },
  { name: "No Seatbelt", value: 218, color: "#1E3A8A", type: "traffic" },
  { name: "Traffic Light", value: 156, color: "#FF9800", type: "traffic" },
  { name: "Phone Driving", value: 98, color: "#10B981", type: "traffic" },
  { name: "Wizi", value: 89, color: "#EF4444", type: "general" },
  { name: "Uvamizi", value: 56, color: "#607D8B", type: "general" },
  { name: "Mgogoro", value: 43, color: "#FF9800", type: "general" },
];


export const LIVE_INCIDENTS = [
  { id: "INC-2026-0341", type: "Ajali ya Gari", location: "Morogoro Road, DSM", time: "2 min ago", status: "urgent", officer: "Insp. Juma Mwinyi", lat: -6.8235, lng: 39.2695 },
  { id: "INC-2026-0340", type: "Kosa la Trafiki", location: "Samora Ave, DSM", time: "8 min ago", status: "active", officer: "Sgt. Ali Hassan", lat: -6.816, lng: 39.289 },
  { id: "INC-2026-0339", type: "Wizi wa Gari", location: "Kariakoo, DSM", time: "15 min ago", status: "active", officer: "Insp. Grace Mushi", lat: -6.824, lng: 39.277 },
  { id: "INC-2026-0338", type: "Mgogoro wa Trafiki", location: "Ubungo, DSM", time: "22 min ago", status: "resolved", officer: "Sgt. Saidi Juma", lat: -6.778, lng: 39.233 },
  { id: "INC-2026-0337", type: "Kosa la Trafiki", location: "Mbezi Beach, DSM", time: "35 min ago", status: "resolved", officer: "Insp. Juma Mwinyi", lat: -6.766, lng: 39.251 },
];

export const OFFICERS = [
  { id: "TP123456", name: "Insp. Juma Mwinyi", rank: "Inspector", unit: "Trafiki - Dar es Salaam", station: "Kituo Kikuu cha DSM", status: "active", patrols: 3, citations: 12, incidents: 18, hoursToday: 8.5, phone: "0712 345 678" },
  { id: "TP234567", name: "Sgt. Ali Hassan", rank: "Sergeant", unit: "Trafiki - Dar es Salaam", station: "Kituo cha Ilala", status: "active", patrols: 2, citations: 8, incidents: 5, hoursToday: 6.0, phone: "0788 123 456" },
  { id: "TP345678", name: "Insp. Grace Mushi", rank: "Inspector", unit: "Uhalifu - Dar es Salaam", station: "Kituo cha Kinondoni", status: "active", patrols: 1, citations: 0, incidents: 9, hoursToday: 7.5, phone: "0766 987 654" },
  { id: "TP456789", name: "Sgt. Saidi Juma", rank: "Sergeant", unit: "Trafiki - Dar es Salaam", station: "Kituo cha Temeke", status: "break", patrols: 2, citations: 5, incidents: 3, hoursToday: 5.0, phone: "0755 111 222" },
  { id: "TP567890", name: "Cpl. Mariam Ally", rank: "Corporal", unit: "Patrol - Dar es Salaam", station: "Kituo cha Kariakoo", status: "active", patrols: 4, citations: 7, incidents: 2, hoursToday: 9.0, phone: "0744 333 444" },
  { id: "TP678901", name: "Insp. Hamisi Rashid", rank: "Inspector", unit: "Uhalifu - Dar es Salaam", station: "Kituo cha Ubungo", status: "off-duty", patrols: 0, citations: 0, incidents: 0, hoursToday: 0, phone: "0733 555 666" },
  { id: "TP789012", name: "Sgt. Fatuma Hassan", rank: "Sergeant", unit: "Trafiki - Dar es Salaam", station: "Kituo cha Kinondoni", status: "active", patrols: 2, citations: 15, incidents: 7, hoursToday: 7.0, phone: "0722 777 888" },
  { id: "TP890123", name: "Cpl. Emmanuel Joseph", rank: "Corporal", unit: "Patrol - Dar es Salaam", station: "Kituo cha Ilala", status: "active", patrols: 3, citations: 4, incidents: 1, hoursToday: 8.0, phone: "0711 999 000" },
];

export const ADMIN_INCIDENTS = [
  { id: "INC-2026-0341", type: "Ajali ya Gari", location: "Morogoro Road, DSM", date: "15 Mei 2026", time: "08:15", status: "urgent", priority: "high", assignedTo: "Insp. Juma Mwinyi", description: "Mgongano wa magari mawili, majeruhi 2" },
  { id: "INC-2026-0340", type: "Kosa la Trafiki", location: "Samora Ave, DSM", date: "15 Mei 2026", time: "08:07", status: "active", priority: "medium", assignedTo: "Sgt. Ali Hassan", description: "Kupita mwanga mwekundu" },
  { id: "INC-2026-0339", type: "Wizi wa Gari", location: "Kariakoo, DSM", date: "15 Mei 2026", time: "07:45", status: "active", priority: "high", assignedTo: "Insp. Grace Mushi", description: "Gari la Toyota Corolla limeibiwa" },
  { id: "INC-2026-0338", type: "Mgogoro wa Trafiki", location: "Ubungo, DSM", date: "15 Mei 2026", time: "07:20", status: "resolved", priority: "low", assignedTo: "Sgt. Saidi Juma", description: "Mgogoro kati ya madereva wawili" },
  { id: "INC-2026-0337", type: "Kosa la Trafiki", location: "Mbezi Beach, DSM", date: "15 Mei 2026", time: "06:50", status: "resolved", priority: "low", assignedTo: "Insp. Juma Mwinyi", description: "Kutovaa mkanda wa usalama" },
  { id: "INC-2026-0336", type: "Ajali ya Pikipiki", location: "Nkrumah St, DSM", date: "14 Mei 2026", time: "18:30", status: "resolved", priority: "medium", assignedTo: "Cpl. Mariam Ally", description: "Pikipiki imegongana na basi" },
  { id: "INC-2026-0335", type: "Wizi wa Gari", location: "Sinza, DSM", date: "14 Mei 2026", time: "15:15", status: "investigating", priority: "high", assignedTo: "Insp. Hamisi Rashid", description: "Gari limeibiwa kutoka kwenye stoo" },
];

export const ADMIN_CITATIONS = [
  { id: "CT-2026-0451", plate: "T 003 GHI", offense: "Over Speeding",             driver: "Ali Mohamed Salum",     date: "10 Mei 2026", amount: "150,000", status: "unpaid", officer: "Sgt. Ali Hassan",    type: "traffic" },
  { id: "CT-2026-0450", plate: "T 009 YZA", offense: "No Seatbelt",               driver: "Hamisi Rashid Omar",   date: "08 Mei 2026", amount: "50,000",  status: "paid",   officer: "Sgt. Fatuma Hassan", type: "traffic" },
  { id: "CT-2026-0449", plate: "T 005 MNO", offense: "Traffic Light Violation",   driver: "Saidi Omari Bakari",   date: "05 Mei 2026", amount: "100,000", status: "unpaid", officer: "Cprl. Juma",         type: "traffic" },
  { id: "CT-2026-0448", plate: "T 007 STU", offense: "Phone While Driving",       driver: "Baraka John Mwanga",   date: "02 Mei 2026", amount: "50,000",  status: "unpaid", officer: "Insp. Grace Mushi",  type: "traffic" },
  { id: "CT-2026-0447", plate: "T 009 YZA", offense: "Over Speeding",             driver: "Hamisi Rashid Omar",   date: "28 Apr 2026", amount: "30,000",  status: "paid",   officer: "Cpl. Mariamu Ally",  type: "traffic" },
  { id: "CT-2026-0446", plate: "T 018 ZAB", offense: "No Insurance",              driver: "Nassoro Kombo Mataka", date: "25 Apr 2026", amount: "200,000", status: "unpaid", officer: "Sgt. Ali Hassan",    type: "traffic" },
  { id: "CT-2026-0445", plate: "T 005 MNO", offense: "No Inspection Certificate", driver: "Saidi Omari Bakari",   date: "22 Apr 2026", amount: "100,000", status: "paid",   officer: "Insp. Grace Mushi",  type: "traffic" },
  { id: "CT-2026-0444", plate: "T 018 ZAB", offense: "Gari bila Bima",            driver: "Nassoro Kombo Mataka", date: "15 Apr 2026", amount: "200,000", status: "unpaid", officer: "Cprl. Juma",         type: "traffic" },
  { id: "CT-2026-0443", plate: "T 003 GHI", offense: "Expired License",           driver: "Ali Mohamed Salum",    date: "10 Apr 2026", amount: "100,000", status: "unpaid", officer: "Sgt. Ali Hassan",    type: "traffic" },
  { id: "CT-2026-0442", plate: "T 007 STU", offense: "No Seatbelt",               driver: "Baraka John Mwanga",   date: "05 Apr 2026", amount: "50,000",  status: "paid",   officer: "Insp. Grace Mushi",  type: "traffic" },
];

export const ACTIVE_PATROLS = [
  { id: "PT-001", officer: "Insp. Juma Mwinyi", area: "Kariakoo - Ilala Zone", start: "06:30", distance: "12.5 km", status: "active", progress: 65 },
  { id: "PT-002", officer: "Sgt. Ali Hassan", area: "Samora Avenue", start: "07:00", distance: "8.2 km", status: "active", progress: 40 },
  { id: "PT-003", officer: "Insp. Grace Mushi", area: "Kinondoni Zone", start: "06:45", distance: "15.3 km", status: "active", progress: 80 },
  { id: "PT-004", officer: "Cpl. Mariam Ally", area: "Kariakoo Market", start: "07:15", distance: "5.7 km", status: "active", progress: 25 },
  { id: "PT-005", officer: "Sgt. Fatuma Hassan", area: "Mbezi Beach", start: "06:00", distance: "22.1 km", status: "active", progress: 90 },
];

export const ADMIN_ALERTS_HISTORY = [
  { id: "AL-001", title: "Gari la Uhalifu limeonekana", audience: "Wote", priority: "high", sentBy: "CP. Saidi Waziri", date: "15 Mei 2026", time: "06:00", recipients: 147 },
  { id: "AL-002", title: "Onyo la Mvua Kubwa", audience: "Trafiki", priority: "normal", sentBy: "Idara ya Hali ya Hewa", date: "14 Mei 2026", time: "18:30", recipients: 52 },
  { id: "AL-003", title: "Mafunzo ya IPS mpya", audience: "Wote", priority: "normal", sentBy: "Mkuu wa Mkoa", date: "14 Mei 2026", time: "10:00", recipients: 147 },
  { id: "AL-004", title: "Tahadhari ya Usalama - Ubungo", audience: "Kituo - Ubungo", priority: "high", sentBy: "Kamanda wa Mkoa", date: "13 Mei 2026", time: "20:15", recipients: 28 },
];

export const ADMIN_USERS = [
  { id: "ADM-001", name: "CP. Saidi Waziri", role: "commander", rank: "Commissioner of Police", email: "saidi.waziri@polisi.go.tz", station: "Makao Makuu - DSM", status: "active", lastLogin: "15 Mei 2026 08:00" },
  { id: "ADM-002", name: "ACP. Mariam Juma", role: "admin", rank: "Assistant Commissioner", email: "mariam.juma@polisi.go.tz", station: "Makao Makuu - DSM", status: "active", lastLogin: "15 Mei 2026 07:45" },
  { id: "ADM-003", name: "SP. Hamisi Ally", role: "admin", rank: "Senior Superintendent", email: "hamisi.ally@polisi.go.tz", station: "Kituo Kikuu - DSM", status: "active", lastLogin: "14 Mei 2026 18:30" },
  { id: "ADM-004", name: "CSP. Grace Mushi", role: "commander", rank: "Chief Superintendent", email: "grace.mushi@polisi.go.tz", station: "Mkoa wa Arusha", status: "active", lastLogin: "15 Mei 2026 06:15" },
  { id: "ADM-005", name: "SP. Emmanuel Joseph", role: "admin", rank: "Superintendent", email: "emmanuel.joseph@polisi.go.tz", station: "Mkoa wa Mwanza", status: "suspended", lastLogin: "10 Mei 2026 14:00" },
];

export const REGION_STATS = [
  { region: "Dar es Salaam", officers: 147, incidents: 34, citations: 89, resolved: 28 },
  { region: "Arusha", officers: 62, incidents: 12, citations: 24, resolved: 10 },
  { region: "Mwanza", officers: 58, incidents: 15, citations: 31, resolved: 12 },
  { region: "Dodoma", officers: 45, incidents: 8, citations: 18, resolved: 7 },
  { region: "Mbeya", officers: 51, incidents: 11, citations: 22, resolved: 9 },
];
