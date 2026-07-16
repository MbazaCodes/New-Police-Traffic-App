// ===== TZ Police Digital Platform — Shared Mock Data (Dart mirror) =====
//
// Mirrors:
//   • `src/lib/police-data.ts`       — officer / traffic / patrol / alerts / search results / profile / citation history
//   • `src/lib/admin-data.ts`       — dashboard KPIs / officers / incidents / citations / patrols / region stats
//   • `src/lib/admin-mgmt-data.ts`  — stations / posts / assignments / unassigned officers / citizen result
//
// All values are kept as plain `const` Dart `List`s / `Map`s so they read
// exactly like the TypeScript originals. The [AppDataService] in
// `app_data_service.dart` exposes typed getters over these structures.
//
// NOTE: This file deliberately avoids model classes so it can stay a 1:1
// mirror of the TypeScript data. UI widgets consume the maps directly,
// matching how the PWA consumes the TS objects.

// ─────────────────────────────────────────────────────────────────────────────
// OFFICER  (src/lib/police-data.ts → OFFICER)
// ─────────────────────────────────────────────────────────────────────────────

const Map<String, Object> OFFICER = {
  'name': 'Insp. Juma Mwinyi',
  'shortName': 'Juma Mwinyi',
  'rank': 'Police Inspector',
  'rankShort': 'Insp.',
  'id': 'TP123456',
  'station': 'Kituo Kikuu cha Polisi Dar es Salaam',
  'unit': 'Trafiki - Mkoa wa Dar es Salaam',
  'phone': '0712 345 678',
  'email': 'juma.mwinyi@polisi.go.tz',
  'status': 'Mtaandao',
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME_STATS / TRAFFIC_STATS / PATROL_STATS  (police-data.ts)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> HOME_STATS = [
  {'label': 'Matukio Yote', 'value': '1,234', 'icon': 'alert', 'color': '#1A237E'},
  {'label': 'Kesi Zinazosubiri', 'value': '56', 'icon': 'clock', 'color': '#FF9800'},
  {'label': 'Kesi Zilizotatuliwa', 'value': '1,178', 'icon': 'check', 'color': '#4CAF50'},
  {'label': 'Patroli Zinazofanya Kazi', 'value': '23', 'icon': 'car', 'color': '#F44336'},
];

const List<Map<String, Object>> TRAFFIC_STATS = [
  {'label': 'Jumla ya Makosa', 'value': '10', 'icon': 'clipboard', 'color': '#2563EB'},
  {'label': 'Inasubiri', 'value': '6', 'icon': 'clock', 'color': '#F97316'},
  {'label': 'Imelipwa', 'value': '4', 'icon': 'check', 'color': '#10B981'},
  {'label': 'Jumla ya Faini', 'value': '580,000', 'sub': 'TZS', 'icon': 'wallet', 'color': '#8B5CF6'},
];

const List<Map<String, Object>> PATROL_STATS = [
  {'label': 'Jumla Patroli', 'value': '3', 'icon': 'shield', 'color': '#2196F3'},
  {'label': 'Umbali (km)', 'value': '116.5', 'icon': 'map-pin', 'color': '#4CAF50'},
  {'label': 'Masaa', 'value': '24.0', 'icon': 'clock', 'color': '#FF9800'},
];

// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC_QUICK_ACTIONS  (7 items, including PF3)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> TRAFFIC_QUICK_ACTIONS = [
  {'label': 'Ripoti Kosa', 'icon': 'clipboard', 'color': '#2563EB', 'screen': 'citation'},
  {'label': 'Toa Citation', 'icon': 'file-text', 'color': '#10B981', 'screen': 'citation'},
  {'label': 'Tafuta Gari', 'icon': 'search', 'color': '#8B5CF6', 'screen': 'search-results'},
  {'label': 'Ukaguzi wa Gari', 'icon': 'car', 'color': '#F97316', 'screen': 'vehicle-inspection'},
  {'label': 'Ripoti Ajali', 'icon': 'alert-triangle', 'color': '#EF4444', 'screen': 'accident-report'},
  {'label': 'Fomu PF3', 'icon': 'file-text', 'color': '#0A3D62', 'screen': 'pf3'},
  {'label': 'Historia ya Citation', 'icon': 'clock', 'color': '#3B82F6', 'screen': 'history'},
];

// ─────────────────────────────────────────────────────────────────────────────
// RECENT_OFFENSES  (5 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> RECENT_OFFENSES = [
  {
    'id': 1,
    'name': 'Kutopita mstari',
    'status': 'Inasubiri',
    'statusColor': '#F97316',
    'icon': 'git-merge',
    'iconColor': '#F97316',
    'date': '25 Okt 2024',
    'location': 'Singida-Dodoma Road',
    'fine': 'TZS 30,000',
  },
  {
    'id': 2,
    'name': 'Kutovaa mkanda',
    'status': 'Inasubiri',
    'statusColor': '#F97316',
    'icon': 'shield-alert',
    'iconColor': '#F97316',
    'date': '23 Okt 2024',
    'location': 'Mpanda Road, Kigoma',
    'fine': 'TZS 30,000',
  },
  {
    'id': 3,
    'name': 'Kutumia simu wakati wa udereva',
    'status': 'Inasubiri',
    'statusColor': '#F97316',
    'icon': 'smartphone',
    'iconColor': '#F97316',
    'date': '22 Okt 2024',
    'location': 'Nkrumah Street, Morogoro',
    'fine': 'TZS 50,000',
  },
  {
    'id': 4,
    'name': 'Kupita mwanga mwekundu',
    'status': 'Imelipwa',
    'statusColor': '#10B981',
    'icon': 'traffic-cone',
    'iconColor': '#10B981',
    'date': '21 Okt 2024',
    'location': 'Jamhuri Street, Bukoba',
    'fine': 'TZS 80,000',
  },
  {
    'id': 5,
    'name': 'Kupita kasi',
    'status': 'Inasubiri',
    'statusColor': '#F97316',
    'icon': 'gauge',
    'iconColor': '#F97316',
    'date': '20 Okt 2024',
    'location': 'Morogoro Road, Dar es Salaam',
    'fine': 'TZS 30,000',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH_RESULT  (vehicle)
// ─────────────────────────────────────────────────────────────────────────────

const Map<String, Object> SEARCH_RESULT = {
  'plate': 'T123ABC',
  'date': '15 Mei 2026 • 09:35 AM',
  'status': 'Imepatikana',
  'riskScore': 70,
  'riskLevel': 'JUU',
  'alertMessage': 'Dereva ana historia ya makosa ya trafiki',
  'insurance': {
    'company': 'CRDB Insurance Company',
    'policy': 'CRDB/2026/154689',
    'expires': '15/05/2027',
    'valid': true,
  },
  'driver': {
    'name': 'Juma Khamis Mwinyi',
    'gender': 'Male',
    'license': 'DL123456789TZ',
    'licenseClass': 'Class B',
    'nida': '1990123456789',
    'mobile': '07X XXX XXXX',
  },
  'vehicle': {
    'model': 'Toyota Hilux',
    'type': 'Pick Up',
    'year': '2022',
    'color': 'White',
    'accidentInvolved': true,
  },
  'payment': {
    'hasOutstanding': true,
    'totalViolations': 3,
  },
  'violations': [
    {'id': 1, 'name': 'Over Speeding', 'date': '10/05/2026', 'area': 'Mandela Road', 'fine': 'TZS 150,000', 'paid': false},
    {'id': 2, 'name': 'No Seatbelt', 'date': '28/04/2026', 'area': 'Mbezi Beach', 'fine': 'TZS 50,000', 'paid': false},
    {'id': 3, 'name': 'Traffic Light Violation', 'date': '15/04/2026', 'area': 'Samora Ave', 'fine': 'TZS 100,000', 'paid': false},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS  (5 items with category + important flags)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ALERTS = [
  {
    'id': 1,
    'icon': 'car',
    'iconColor': '#F44336',
    'title': 'Gari la Uhalifu limeonekana',
    'time': 'siku 628 zilizopita',
    'message':
        'Gari la aina ya Toyota Corolla, nambari ya usajili T789GHI, limeordeshwa kama gari la wizi. Endelea kwa tahadhari.',
    'source': 'Kituo Kikuu cha Polisi',
    'sourceBg': '#FFEBEE',
    'dotColor': '#F44336',
    'borderColor': '#F44336',
    'unread': true,
    'category': 'mine',
    'important': true,
  },
  {
    'id': 2,
    'icon': 'cloud-rain',
    'iconColor': '#9E9E9E',
    'title': 'Onyo la Mvua Kubwa',
    'time': 'siku 628 zilizopita',
    'message':
        'Tahadhari: Mvua kubwa inatarajiwa katika mkoa wa Dar es Salaam kuanzia saa 2 asubuhi. Waofisa wa trafiki watahimizwa kuwa makini.',
    'source': 'Idara ya Hali ya Hewa',
    'sourceBg': '#E3F2FD',
    'dotColor': '#2196F3',
    'borderColor': '#2196F3',
    'unread': false,
    'category': 'all',
    'important': true,
  },
  {
    'id': 3,
    'icon': 'graduation-cap',
    'iconColor': '#4CAF50',
    'title': 'Mafunzo ya IPS mpya',
    'time': 'siku 629 zilizopita',
    'message':
        'Mafunzo mapya ya IPS (International Police System) yatapokelewa wiki ijayo. Waofisa wote watahitajiwa kuhudhuria.',
    'source': 'Mkuu wa Mkoa - Dar es Salaam',
    'sourceBg': '#E8F5E9',
    'dotColor': '#4CAF50',
    'borderColor': '#4CAF50',
    'unread': false,
    'category': 'all',
    'important': false,
  },
  {
    'id': 4,
    'icon': 'shield-alert',
    'iconColor': '#FF9800',
    'title': 'Kesi Mpya Imekabidhiwa',
    'time': 'siku 630 zilizopita',
    'message':
        'Kesi mpya ya wizi imerekodiwa na imekabidhiwa kwako. Tafadhali kagua maelezo na uanze uchunguzi haraka.',
    'source': 'Kituo Kikuu cha Polisi',
    'sourceBg': '#FFF3E0',
    'dotColor': '#FF9800',
    'borderColor': '#FF9800',
    'unread': true,
    'category': 'mine',
    'important': false,
  },
  {
    'id': 5,
    'icon': 'alert-triangle',
    'iconColor': '#F44336',
    'title': 'Tahadhari ya Usalama - Eneo la Ubungo',
    'time': 'siku 631 zilizopita',
    'message':
        'Ripoti za majambazi zimeongezeka katika eneo la Ubungo. Patroli za ziada zimepangwa. Waofisa wa jirani waone kesi husika.',
    'source': 'Kamanda wa Mkoa',
    'sourceBg': '#FFEBEE',
    'dotColor': '#F44336',
    'borderColor': '#F44336',
    'unread': false,
    'category': 'all',
    'important': true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CITATION_HISTORY  (5 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> CITATION_HISTORY = [
  {
    'id': 'CT-2026-0451',
    'plate': 'T123ABC',
    'offense': 'Over Speeding',
    'driver': 'Juma Khamis Mwinyi',
    'date': '10 Mei 2026',
    'time': '14:30',
    'location': 'Mandela Road, DSM',
    'fine': 'TZS 150,000',
    'status': 'Hajalipwa',
    'statusColor': '#F44336',
  },
  {
    'id': 'CT-2026-0450',
    'plate': 'T789GHI',
    'offense': 'No Seatbelt',
    'driver': 'Ali Mohamed Salum',
    'date': '08 Mei 2026',
    'time': '09:15',
    'location': 'Mbezi Beach, DSM',
    'fine': 'TZS 50,000',
    'status': 'Imelipwa',
    'statusColor': '#10B981',
  },
  {
    'id': 'CT-2026-0449',
    'plate': 'T456DEF',
    'offense': 'Traffic Light Violation',
    'driver': 'Saidi Juma Khamis',
    'date': '05 Mei 2026',
    'time': '17:45',
    'location': 'Samora Ave, DSM',
    'fine': 'TZS 100,000',
    'status': 'Imelipwa',
    'statusColor': '#10B981',
  },
  {
    'id': 'CT-2026-0448',
    'plate': 'T321XYZ',
    'offense': 'Kutumia Simu wakati wa Udereva',
    'driver': 'Grace Mushi',
    'date': '02 Mei 2026',
    'time': '11:20',
    'location': 'Nkrumah Street, DSM',
    'fine': 'TZS 50,000',
    'status': 'Hajalipwa',
    'statusColor': '#F44336',
  },
  {
    'id': 'CT-2026-0447',
    'plate': 'T654ABC',
    'offense': 'Kutopita kasi',
    'driver': 'Hamisi Rashid',
    'date': '28 Apr 2026',
    'time': '08:05',
    'location': 'Morogoro Road, DSM',
    'fine': 'TZS 30,000',
    'status': 'Imelipwa',
    'statusColor': '#10B981',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — DASHBOARD_KPIS / INCIDENT_TREND / OFFENSE_DISTRIBUTION / REGION_STATS
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> DASHBOARD_KPIS = [
  {'label': 'Maofisa Walioko Kazini', 'value': '147', 'change': '+12%', 'trend': 'up', 'icon': 'users', 'color': '#2196F3'},
  {'label': 'Patroli Zinazoendelea', 'value': '23', 'change': '+5%', 'trend': 'up', 'icon': 'shield', 'color': '#4CAF50'},
  {'label': 'Matukio ya Leo', 'value': '34', 'change': '-8%', 'trend': 'down', 'icon': 'alert-triangle', 'color': '#FF9800'},
  {'label': 'Citations za Leo', 'value': '89', 'change': '+15%', 'trend': 'up', 'icon': 'file-text', 'color': '#9C27B0'},
];

const List<Map<String, Object>> INCIDENT_TREND = [
  {'day': 'Mon', 'incidents': 28, 'citations': 65},
  {'day': 'Tue', 'incidents': 35, 'citations': 72},
  {'day': 'Wed', 'incidents': 22, 'citations': 58},
  {'day': 'Thu', 'incidents': 41, 'citations': 81},
  {'day': 'Fri', 'incidents': 38, 'citations': 94},
  {'day': 'Sat', 'incidents': 45, 'citations': 102},
  {'day': 'Sun', 'incidents': 34, 'citations': 89},
];

const List<Map<String, Object>> OFFENSE_DISTRIBUTION = [
  {'name': 'Over Speeding', 'value': 342, 'color': '#2196F3'},
  {'name': 'No Seatbelt', 'value': 218, 'color': '#4CAF50'},
  {'name': 'Traffic Light', 'value': 156, 'color': '#FF9800'},
  {'name': 'Phone While Driving', 'value': 98, 'color': '#9C27B0'},
  {'name': 'Other', 'value': 74, 'color': '#607D8B'},
];

const List<Map<String, Object>> REGION_STATS = [
  {'region': 'Dar es Salaam', 'officers': 147, 'incidents': 34, 'citations': 89, 'resolved': 28},
  {'region': 'Arusha', 'officers': 62, 'incidents': 12, 'citations': 24, 'resolved': 10},
  {'region': 'Mwanza', 'officers': 58, 'incidents': 15, 'citations': 31, 'resolved': 12},
  {'region': 'Dodoma', 'officers': 45, 'incidents': 8, 'citations': 18, 'resolved': 7},
  {'region': 'Mbeya', 'officers': 51, 'incidents': 11, 'citations': 22, 'resolved': 9},
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — OFFICERS  (8 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> OFFICERS = [
  {
    'id': 'TP123456',
    'name': 'Insp. Juma Mwinyi',
    'rank': 'Inspector',
    'unit': 'Trafiki - Dar es Salaam',
    'station': 'Kituo Kikuu cha DSM',
    'status': 'active',
    'patrols': 3,
    'citations': 12,
    'incidents': 18,
    'hoursToday': 8.5,
    'phone': '0712 345 678',
  },
  {
    'id': 'TP234567',
    'name': 'Sgt. Ali Hassan',
    'rank': 'Sergeant',
    'unit': 'Trafiki - Dar es Salaam',
    'station': 'Kituo cha Ilala',
    'status': 'active',
    'patrols': 2,
    'citations': 8,
    'incidents': 5,
    'hoursToday': 6.0,
    'phone': '0788 123 456',
  },
  {
    'id': 'TP345678',
    'name': 'Insp. Grace Mushi',
    'rank': 'Inspector',
    'unit': 'Uhalifu - Dar es Salaam',
    'station': 'Kituo cha Kinondoni',
    'status': 'active',
    'patrols': 1,
    'citations': 0,
    'incidents': 9,
    'hoursToday': 7.5,
    'phone': '0766 987 654',
  },
  {
    'id': 'TP456789',
    'name': 'Sgt. Saidi Juma',
    'rank': 'Sergeant',
    'unit': 'Trafiki - Dar es Salaam',
    'station': 'Kituo cha Temeke',
    'status': 'break',
    'patrols': 2,
    'citations': 5,
    'incidents': 3,
    'hoursToday': 5.0,
    'phone': '0755 111 222',
  },
  {
    'id': 'TP567890',
    'name': 'Cpl. Mariam Ally',
    'rank': 'Corporal',
    'unit': 'Patrol - Dar es Salaam',
    'station': 'Kituo cha Kariakoo',
    'status': 'active',
    'patrols': 4,
    'citations': 7,
    'incidents': 2,
    'hoursToday': 9.0,
    'phone': '0744 333 444',
  },
  {
    'id': 'TP678901',
    'name': 'Insp. Hamisi Rashid',
    'rank': 'Inspector',
    'unit': 'Uhalifu - Dar es Salaam',
    'station': 'Kituo cha Ubungo',
    'status': 'off-duty',
    'patrols': 0,
    'citations': 0,
    'incidents': 0,
    'hoursToday': 0,
    'phone': '0733 555 666',
  },
  {
    'id': 'TP789012',
    'name': 'Sgt. Fatuma Hassan',
    'rank': 'Sergeant',
    'unit': 'Trafiki - Dar es Salaam',
    'station': 'Kituo cha Kinondoni',
    'status': 'active',
    'patrols': 2,
    'citations': 15,
    'incidents': 7,
    'hoursToday': 7.0,
    'phone': '0722 777 888',
  },
  {
    'id': 'TP890123',
    'name': 'Cpl. Emmanuel Joseph',
    'rank': 'Corporal',
    'unit': 'Patrol - Dar es Salaam',
    'station': 'Kituo cha Ilala',
    'status': 'active',
    'patrols': 3,
    'citations': 4,
    'incidents': 1,
    'hoursToday': 8.0,
    'phone': '0711 999 000',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — ADMIN_INCIDENTS  (7 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ADMIN_INCIDENTS = [
  {
    'id': 'INC-2026-0341',
    'type': 'Ajali ya Gari',
    'location': 'Morogoro Road, DSM',
    'date': '15 Mei 2026',
    'time': '08:15',
    'status': 'urgent',
    'priority': 'high',
    'assignedTo': 'Insp. Juma Mwinyi',
    'description': 'Mgongano wa magari mawili, majeruhi 2',
  },
  {
    'id': 'INC-2026-0340',
    'type': 'Kosa la Trafiki',
    'location': 'Samora Ave, DSM',
    'date': '15 Mei 2026',
    'time': '08:07',
    'status': 'active',
    'priority': 'medium',
    'assignedTo': 'Sgt. Ali Hassan',
    'description': 'Kupita mwanga mwekundu',
  },
  {
    'id': 'INC-2026-0339',
    'type': 'Wizi wa Gari',
    'location': 'Kariakoo, DSM',
    'date': '15 Mei 2026',
    'time': '07:45',
    'status': 'active',
    'priority': 'high',
    'assignedTo': 'Insp. Grace Mushi',
    'description': 'Gari la Toyota Corolla limeibiwa',
  },
  {
    'id': 'INC-2026-0338',
    'type': 'Mgogoro wa Trafiki',
    'location': 'Ubungo, DSM',
    'date': '15 Mei 2026',
    'time': '07:20',
    'status': 'resolved',
    'priority': 'low',
    'assignedTo': 'Sgt. Saidi Juma',
    'description': 'Mgogoro kati ya madereva wawili',
  },
  {
    'id': 'INC-2026-0337',
    'type': 'Kosa la Trafiki',
    'location': 'Mbezi Beach, DSM',
    'date': '15 Mei 2026',
    'time': '06:50',
    'status': 'resolved',
    'priority': 'low',
    'assignedTo': 'Insp. Juma Mwinyi',
    'description': 'Kutovaa mkanda wa usalama',
  },
  {
    'id': 'INC-2026-0336',
    'type': 'Ajali ya Pikipiki',
    'location': 'Nkrumah St, DSM',
    'date': '14 Mei 2026',
    'time': '18:30',
    'status': 'resolved',
    'priority': 'medium',
    'assignedTo': 'Cpl. Mariam Ally',
    'description': 'Pikipiki imegongana na basi',
  },
  {
    'id': 'INC-2026-0335',
    'type': 'Wizi wa Gari',
    'location': 'Sinza, DSM',
    'date': '14 Mei 2026',
    'time': '15:15',
    'status': 'investigating',
    'priority': 'high',
    'assignedTo': 'Insp. Hamisi Rashid',
    'description': 'Gari limeibiwa kutoka kwenye stoo',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — ADMIN_CITATIONS  (7 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ADMIN_CITATIONS = [
  {'id': 'CT-2026-0451', 'plate': 'T123ABC', 'offense': 'Over Speeding', 'driver': 'Juma Khamis Mwinyi', 'date': '10 Mei 2026', 'amount': '150,000', 'status': 'unpaid', 'officer': 'Insp. Juma Mwinyi'},
  {'id': 'CT-2026-0450', 'plate': 'T789GHI', 'offense': 'No Seatbelt', 'driver': 'Ali Mohamed Salum', 'date': '08 Mei 2026', 'amount': '50,000', 'status': 'paid', 'officer': 'Sgt. Ali Hassan'},
  {'id': 'CT-2026-0449', 'plate': 'T456DEF', 'offense': 'Traffic Light Violation', 'driver': 'Saidi Juma Khamis', 'date': '05 Mei 2026', 'amount': '100,000', 'status': 'paid', 'officer': 'Sgt. Fatuma Hassan'},
  {'id': 'CT-2026-0448', 'plate': 'T321XYZ', 'offense': 'Phone While Driving', 'driver': 'Grace Mushi', 'date': '02 Mei 2026', 'amount': '50,000', 'status': 'unpaid', 'officer': 'Insp. Juma Mwinyi'},
  {'id': 'CT-2026-0447', 'plate': 'T654ABC', 'offense': 'Over Speeding', 'driver': 'Hamisi Rashid', 'date': '28 Apr 2026', 'amount': '30,000', 'status': 'paid', 'officer': 'Cpl. Mariam Ally'},
  {'id': 'CT-2026-0446', 'plate': 'T987GHI', 'offense': 'No Seatbelt', 'driver': 'Mariam Ally', 'date': '25 Apr 2026', 'amount': '50,000', 'status': 'unpaid', 'officer': 'Sgt. Ali Hassan'},
  {'id': 'CT-2026-0445', 'plate': 'T111ABC', 'offense': 'Traffic Light Violation', 'driver': 'Emmanuel Joseph', 'date': '22 Apr 2026', 'amount': '100,000', 'status': 'paid', 'officer': 'Insp. Grace Mushi'},
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — ACTIVE_PATROLS  (5 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ACTIVE_PATROLS = [
  {'id': 'PT-001', 'officer': 'Insp. Juma Mwinyi', 'area': 'Kariakoo - Ilala Zone', 'start': '06:30', 'distance': '12.5 km', 'status': 'active', 'progress': 65},
  {'id': 'PT-002', 'officer': 'Sgt. Ali Hassan', 'area': 'Samora Avenue', 'start': '07:00', 'distance': '8.2 km', 'status': 'active', 'progress': 40},
  {'id': 'PT-003', 'officer': 'Insp. Grace Mushi', 'area': 'Kinondoni Zone', 'start': '06:45', 'distance': '15.3 km', 'status': 'active', 'progress': 80},
  {'id': 'PT-004', 'officer': 'Cpl. Mariam Ally', 'area': 'Kariakoo Market', 'start': '07:15', 'distance': '5.7 km', 'status': 'active', 'progress': 25},
  {'id': 'PT-005', 'officer': 'Sgt. Fatuma Hassan', 'area': 'Mbezi Beach', 'start': '06:00', 'distance': '22.1 km', 'status': 'active', 'progress': 90},
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — ADMIN_ALERTS_HISTORY  (4 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ADMIN_ALERTS_HISTORY = [
  {'id': 'AL-001', 'title': 'Gari la Uhalifu limeonekana', 'audience': 'Wote', 'priority': 'high', 'sentBy': 'CP. Saidi Waziri', 'date': '15 Mei 2026', 'time': '06:00', 'recipients': 147},
  {'id': 'AL-002', 'title': 'Onyo la Mvua Kubwa', 'audience': 'Trafiki', 'priority': 'normal', 'sentBy': 'Idara ya Hali ya Hewa', 'date': '14 Mei 2026', 'time': '18:30', 'recipients': 52},
  {'id': 'AL-003', 'title': 'Mafunzo ya IPS mpya', 'audience': 'Wote', 'priority': 'normal', 'sentBy': 'Mkuu wa Mkoa', 'date': '14 Mei 2026', 'time': '10:00', 'recipients': 147},
  {'id': 'AL-004', 'title': 'Tahadhari ya Usalama - Ubungo', 'audience': 'Kituo - Ubungo', 'priority': 'high', 'sentBy': 'Kamanda wa Mkoa', 'date': '13 Mei 2026', 'time': '20:15', 'recipients': 28},
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  — ADMIN_USERS  (5 items)  +  ADMIN_USER
// ─────────────────────────────────────────────────────────────────────────────

const Map<String, Object> ADMIN_USER = {
  'name': 'CP. Saidi Waziri',
  'shortName': 'Saidi Waziri',
  'rank': 'Commissioner of Police',
  'role': 'commander',
  'id': 'ADM-001',
  'station': 'Makao Makuu - Dar es Salaam',
  'email': 'saidi.waziri@polisi.go.tz',
};

const List<Map<String, Object>> ADMIN_USERS = [
  {'id': 'ADM-001', 'name': 'CP. Saidi Waziri', 'role': 'commander', 'rank': 'Commissioner of Police', 'email': 'saidi.waziri@polisi.go.tz', 'station': 'Makao Makuu - DSM', 'status': 'active', 'lastLogin': '15 Mei 2026 08:00'},
  {'id': 'ADM-002', 'name': 'ACP. Mariam Juma', 'role': 'admin', 'rank': 'Assistant Commissioner', 'email': 'mariam.juma@polisi.go.tz', 'station': 'Makao Makuu - DSM', 'status': 'active', 'lastLogin': '15 Mei 2026 07:45'},
  {'id': 'ADM-003', 'name': 'SP. Hamisi Ally', 'role': 'admin', 'rank': 'Senior Superintendent', 'email': 'hamisi.ally@polisi.go.tz', 'station': 'Kituo Kikuu - DSM', 'status': 'active', 'lastLogin': '14 Mei 2026 18:30'},
  {'id': 'ADM-004', 'name': 'CSP. Grace Mushi', 'role': 'commander', 'rank': 'Chief Superintendent', 'email': 'grace.mushi@polisi.go.tz', 'station': 'Mkoa wa Arusha', 'status': 'active', 'lastLogin': '15 Mei 2026 06:15'},
  {'id': 'ADM-005', 'name': 'SP. Emmanuel Joseph', 'role': 'admin', 'rank': 'Superintendent', 'email': 'emmanuel.joseph@polisi.go.tz', 'station': 'Mkoa wa Mwanza', 'status': 'suspended', 'lastLogin': '10 Mei 2026 14:00'},
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MGMT  — STATIONS  (7 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> STATIONS = [
  {
    'id': 'ST-001',
    'name': 'Kituo Kikuu cha Polisi Dar es Salaam',
    'region': 'Dar es Salaam',
    'district': 'Ilala',
    'address': 'Sokoine Drive, Dar es Salaam',
    'phone': '022 211 0001',
    'officersCount': 42,
    'postsCount': 6,
    'status': 'active',
    'established': '1961',
  },
  {
    'id': 'ST-002',
    'name': 'Kituo cha Polisi Kariakoo',
    'region': 'Dar es Salaam',
    'district': 'Ilala',
    'address': 'Mwembe Chai, Kariakoo',
    'phone': '022 218 5544',
    'officersCount': 28,
    'postsCount': 4,
    'status': 'active',
    'established': '1972',
  },
  {
    'id': 'ST-003',
    'name': 'Kituo cha Polisi Kinondoni',
    'region': 'Dar es Salaam',
    'district': 'Kinondoni',
    'address': 'Mwenge, Kinondoni',
    'phone': '022 277 3311',
    'officersCount': 35,
    'postsCount': 5,
    'status': 'active',
    'established': '1975',
  },
  {
    'id': 'ST-004',
    'name': 'Kituo cha Polisi Temeke',
    'region': 'Dar es Salaam',
    'district': 'Temeke',
    'address': 'Temeke St, Temeke',
    'phone': '022 285 9922',
    'officersCount': 22,
    'postsCount': 3,
    'status': 'active',
    'established': '1978',
  },
  {
    'id': 'ST-005',
    'name': 'Kituo cha Polisi Ubungo',
    'region': 'Dar es Salaam',
    'district': 'Kinondoni',
    'address': 'Ubungo Terminal, DSM',
    'phone': '022 243 7788',
    'officersCount': 20,
    'postsCount': 4,
    'status': 'maintenance',
    'established': '1985',
  },
  {
    'id': 'ST-006',
    'name': 'Kituo cha Polisi Arusha Mkoani',
    'region': 'Arusha',
    'district': 'Arusha',
    'address': 'Fire Road, Arusha',
    'phone': '027 250 1100',
    'officersCount': 38,
    'postsCount': 5,
    'status': 'active',
    'established': '1963',
  },
  {
    'id': 'ST-007',
    'name': 'Kituo cha Polisi Mwanza',
    'region': 'Mwanza',
    'district': 'Nyamagana',
    'address': 'Kenyatta Road, Mwanza',
    'phone': '028 250 2200',
    'officersCount': 31,
    'postsCount': 4,
    'status': 'active',
    'established': '1965',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MGMT  — POSTS  (7 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> POSTS = [
  {
    'id': 'PT-001',
    'name': 'Posti ya Mwenge',
    'stationId': 'ST-003',
    'stationName': 'Kituo cha Polisi Kinondoni',
    'location': 'Mwenge Bus Terminal',
    'type': 'Traffic',
    'officersCount': 4,
    'status': 'active',
    'shift': '24/7',
  },
  {
    'id': 'PT-002',
    'name': 'Posti ya Ubungo',
    'stationId': 'ST-005',
    'stationName': 'Kituo cha Polisi Ubungo',
    'location': 'Ubungo Terminal',
    'type': 'Traffic',
    'officersCount': 6,
    'status': 'active',
    'shift': '24/7',
  },
  {
    'id': 'PT-003',
    'name': 'Posti ya Kariakoo Market',
    'stationId': 'ST-002',
    'stationName': 'Kituo cha Polisi Kariakoo',
    'location': 'Kariakoo Market',
    'type': 'Patrol',
    'officersCount': 3,
    'status': 'active',
    'shift': '06:00 - 22:00',
  },
  {
    'id': 'PT-004',
    'name': 'Posti ya Samora Avenue',
    'stationId': 'ST-001',
    'stationName': 'Kituo Kikuu cha Polisi DSM',
    'location': 'Samora Avenue CBD',
    'type': 'Traffic',
    'officersCount': 5,
    'status': 'active',
    'shift': '24/7',
  },
  {
    'id': 'PT-005',
    'name': 'Posti ya Mbezi Beach',
    'stationId': 'ST-003',
    'stationName': 'Kituo cha Polisi Kinondoni',
    'location': 'Mbezi Beach Junction',
    'type': 'Patrol',
    'officersCount': 2,
    'status': 'active',
    'shift': '18:00 - 06:00',
  },
  {
    'id': 'PT-006',
    'name': 'Posti ya Temeke St',
    'stationId': 'ST-004',
    'stationName': 'Kituo cha Polisi Temeke',
    'location': 'Temeke Road',
    'type': 'Traffic',
    'officersCount': 3,
    'status': 'inactive',
    'shift': '06:00 - 18:00',
  },
  {
    'id': 'PT-007',
    'name': 'Posti ya Mandela Road',
    'stationId': 'ST-001',
    'stationName': 'Kituo Kikuu cha Polisi DSM',
    'location': 'Mandela Expressway',
    'type': 'Traffic',
    'officersCount': 4,
    'status': 'active',
    'shift': '24/7',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MGMT  — ASSIGNMENTS  (7 items) + UNASSIGNED_OFFICERS (3 items)
// ─────────────────────────────────────────────────────────────────────────────

const List<Map<String, Object>> ASSIGNMENTS = [
  {
    'id': 'ASG-001',
    'officerId': 'TP123456',
    'officerName': 'Insp. Juma Mwinyi',
    'officerRank': 'Inspector',
    'stationId': 'ST-001',
    'stationName': 'Kituo Kikuu cha Polisi DSM',
    'postId': 'PT-004',
    'postName': 'Posti ya Samora Avenue',
    'role': 'Traffic Officer',
    'assignedDate': '01 Jan 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-002',
    'officerId': 'TP234567',
    'officerName': 'Sgt. Ali Hassan',
    'officerRank': 'Sergeant',
    'stationId': 'ST-002',
    'stationName': 'Kituo cha Polisi Kariakoo',
    'postId': 'PT-003',
    'postName': 'Posti ya Kariakoo Market',
    'role': 'Patrol Officer',
    'assignedDate': '15 Feb 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-003',
    'officerId': 'TP345678',
    'officerName': 'Insp. Grace Mushi',
    'officerRank': 'Inspector',
    'stationId': 'ST-003',
    'stationName': 'Kituo cha Polisi Kinondoni',
    'postId': 'PT-001',
    'postName': 'Posti ya Mwenge',
    'role': 'General Duty',
    'assignedDate': '10 Mar 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-004',
    'officerId': 'TP456789',
    'officerName': 'Sgt. Saidi Juma',
    'officerRank': 'Sergeant',
    'stationId': 'ST-004',
    'stationName': 'Kituo cha Polisi Temeke',
    'postId': 'PT-006',
    'postName': 'Posti ya Temeke St',
    'role': 'Traffic Officer',
    'assignedDate': '20 Mar 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-005',
    'officerId': 'TP567890',
    'officerName': 'Cpl. Mariam Ally',
    'officerRank': 'Corporal',
    'stationId': 'ST-002',
    'stationName': 'Kituo cha Polisi Kariakoo',
    'postId': 'PT-003',
    'postName': 'Posti ya Kariakoo Market',
    'role': 'Patrol Officer',
    'assignedDate': '05 Apr 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-006',
    'officerId': 'TP789012',
    'officerName': 'Sgt. Fatuma Hassan',
    'officerRank': 'Sergeant',
    'stationId': 'ST-003',
    'stationName': 'Kituo cha Polisi Kinondoni',
    'postId': 'PT-005',
    'postName': 'Posti ya Mbezi Beach',
    'role': 'Patrol Officer',
    'assignedDate': '12 Apr 2026',
    'status': 'active',
  },
  {
    'id': 'ASG-007',
    'officerId': 'TP678901',
    'officerName': 'Insp. Hamisi Rashid',
    'officerRank': 'Inspector',
    'stationId': 'ST-005',
    'stationName': 'Kituo cha Polisi Ubungo',
    'postId': 'PT-002',
    'postName': 'Posti ya Ubungo',
    'role': 'General Duty',
    'assignedDate': '01 May 2026',
    'status': 'on-leave',
  },
];

const List<Map<String, Object>> UNASSIGNED_OFFICERS = [
  {'id': 'TP890123', 'name': 'Cpl. Emmanuel Joseph', 'rank': 'Corporal'},
  {'id': 'TP901234', 'name': 'Cpl. Zainab Salum', 'rank': 'Corporal'},
  {'id': 'TP012345', 'name': 'Sgt. David Mtui', 'rank': 'Sergeant'},
];

// ─────────────────────────────────────────────────────────────────────────────
// CITIZEN_RESULT  (general-officer search result)
// ─────────────────────────────────────────────────────────────────────────────

const Map<String, Object?> CITIZEN_RESULT = {
  'name': 'Juma Khamis Mwinyi',
  'photo': null,
  'nida': '1990123456789',
  'mobile': '0712 345 678',
  'gender': 'Male',
  'dob': '15 Juni 1990',
  'age': 35,
  'address': 'House No. 45, Mbezi Beach, Kinondoni, Dar es Salaam',
  'occupation': 'Mfanyabiashara',
  'status': 'Mtu wa Kawaida',
  'statusColor': '#4CAF50',
  'alerts': <String>[],
  'criminalRecord': {
    'hasRecord': false,
    'cases': 0,
    'convictions': 0,
  },
  'documents': [
    {'type': 'Kitambulisho cha Taifa (NIDA)', 'number': '1990123456789', 'status': 'Sahihi'},
    {'type': 'Leseni ya Udereva', 'number': 'DL123456789TZ', 'status': 'Sahihi'},
    {'type': 'Pasipoti', 'number': 'TZ12345678', 'status': 'Sahihi'},
  ],
  'vehicles': [
    {'plate': 'T123ABC', 'model': 'Toyota Hilux', 'color': 'White', 'year': '2022'},
  ],
  'history': [
    {'date': '10 Mei 2026', 'type': 'Mshiriki wa Shahidi', 'case': 'INC-2026-0341', 'station': 'Kituo Kikuu DSM'},
    {'date': '02 Apr 2026', 'type': 'Ripoti ya Wizi', 'case': 'INC-2026-0298', 'station': 'Kituo cha Kinondoni'},
  ],
};
