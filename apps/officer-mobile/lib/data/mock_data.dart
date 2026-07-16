import '../models/accident_report.dart';
import '../models/alert.dart';
import '../models/citation.dart';
import '../models/offense.dart';
import '../models/officer.dart';
import '../models/pf3.dart';
import '../models/vehicle_inspection.dart';

/// All Swahili mock data for the TZ Police Digital Platform.
/// Mirrors `src/lib/police-data.ts` from the Next.js PWA so the Flutter app
/// shows identical content.

const Officer officer = Officer(
  name: 'Insp. Juma Mwinyi',
  shortName: 'Juma Mwinyi',
  rank: 'Police Inspector',
  rankShort: 'Insp.',
  id: 'TP123456',
  station: 'Kituo Kikuu cha Polisi Dar es Salaam',
  unit: 'Trafiki - Mkoa wa Dar es Salaam',
  phone: '0712 345 678',
  email: 'juma.mwinyi@polisi.go.tz',
  status: 'Mtaandao',
);

class StatItem {
  const StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.sub,
  });

  final String label;
  final String value;
  final String icon; // icon key
  final String color; // hex
  final String? sub;
}

const List<StatItem> homeStats = [
  StatItem(label: 'Matukio Yote', value: '1,234', icon: 'alert', color: '#1A237E'),
  StatItem(label: 'Kesi Zinazosubiri', value: '56', icon: 'clock', color: '#FF9800'),
  StatItem(label: 'Kesi Zilizotatuliwa', value: '1,178', icon: 'check', color: '#4CAF50'),
  StatItem(label: 'Patroli Zinazofanya Kazi', value: '23', icon: 'car', color: '#F44336'),
];

const List<StatItem> trafficStats = [
  StatItem(label: 'Jumla ya Makosa', value: '10', icon: 'clipboard', color: '#2563EB'),
  StatItem(label: 'Inasubiri', value: '6', icon: 'clock', color: '#F97316'),
  StatItem(label: 'Imelipwa', value: '4', icon: 'check', color: '#10B981'),
  StatItem(
    label: 'Jumla ya Faini',
    value: '580,000',
    sub: 'TZS',
    icon: 'wallet',
    color: '#8B5CF6',
  ),
];

class QuickAction {
  const QuickAction({
    required this.label,
    required this.icon,
    required this.color,
    required this.route,
  });

  final String label;
  final String icon;
  final String color;
  final String route;
}

const List<QuickAction> trafficQuickActions = [
  QuickAction(label: 'Ripoti Kosa', icon: 'clipboard', color: '#2563EB', route: '/citation'),
  QuickAction(label: 'Toa Citation', icon: 'file-text', color: '#10B981', route: '/citation'),
  QuickAction(label: 'Tafuta Gari', icon: 'search', color: '#8B5CF6', route: '/search-results'),
  QuickAction(label: 'Ukaguzi wa Gari', icon: 'car', color: '#F97316', route: '/vehicle-inspection'),
  QuickAction(label: 'Ripoti Ajali', icon: 'alert-triangle', color: '#EF4444', route: '/accident-report'),
  QuickAction(label: 'Fomu PF3', icon: 'file-text', color: '#0A3D62', route: '/pf3'),
  QuickAction(label: 'Historia ya Citation', icon: 'clock', color: '#3B82F6', route: '/history'),
];

const List<Offense> recentOffenses = [
  Offense(
    id: 1,
    name: 'Kutopita mstari',
    status: 'Inasubiri',
    statusColor: '#F97316',
    icon: 'git-merge',
    iconColor: '#F97316',
    date: '25 Okt 2024',
    location: 'Singida-Dodoma Road',
    fine: 'TZS 30,000',
  ),
  Offense(
    id: 2,
    name: 'Kutovaa mkanda',
    status: 'Inasubiri',
    statusColor: '#F97316',
    icon: 'shield-alert',
    iconColor: '#F97316',
    date: '23 Okt 2024',
    location: 'Mpanda Road, Kigoma',
    fine: 'TZS 30,000',
  ),
  Offense(
    id: 3,
    name: 'Kutumia simu wakati wa udereva',
    status: 'Inasubiri',
    statusColor: '#F97316',
    icon: 'smartphone',
    iconColor: '#F97316',
    date: '22 Okt 2024',
    location: 'Nkrumah Street, Morogoro',
    fine: 'TZS 50,000',
  ),
  Offense(
    id: 4,
    name: 'Kupita mwanga mwekundu',
    status: 'Imelipwa',
    statusColor: '#10B981',
    icon: 'traffic-cone',
    iconColor: '#10B981',
    date: '21 Okt 2024',
    location: 'Jamhuri Street, Bukoba',
    fine: 'TZS 80,000',
  ),
  Offense(
    id: 5,
    name: 'Kupita kasi',
    status: 'Inasubiri',
    statusColor: '#F97316',
    icon: 'gauge',
    iconColor: '#F97316',
    date: '20 Okt 2024',
    location: 'Morogoro Road, Dar es Salaam',
    fine: 'TZS 30,000',
  ),
];

class SearchResult {
  const SearchResult({
    required this.plate,
    required this.date,
    required this.status,
    required this.riskScore,
    required this.riskLevel,
    required this.alertMessage,
    required this.insurance,
    required this.driver,
    required this.vehicle,
    required this.payment,
    required this.violations,
  });

  final String plate;
  final String date;
  final String status;
  final int riskScore;
  final String riskLevel;
  final String alertMessage;
  final SearchInsurance insurance;
  final SearchDriver driver;
  final SearchVehicle vehicle;
  final SearchPayment payment;
  final List<SearchViolation> violations;
}

class SearchInsurance {
  const SearchInsurance({
    required this.company,
    required this.policy,
    required this.expires,
    required this.valid,
  });

  final String company;
  final String policy;
  final String expires;
  final bool valid;
}

class SearchDriver {
  const SearchDriver({
    required this.name,
    required this.gender,
    required this.license,
    required this.licenseClass,
    required this.nida,
    required this.mobile,
  });

  final String name;
  final String gender;
  final String license;
  final String licenseClass;
  final String nida;
  final String mobile;
}

class SearchVehicle {
  const SearchVehicle({
    required this.model,
    required this.type,
    required this.year,
    required this.color,
    required this.accidentInvolved,
  });

  final String model;
  final String type;
  final String year;
  final String color;
  final bool accidentInvolved;
}

class SearchPayment {
  const SearchPayment({required this.hasOutstanding, required this.totalViolations});

  final bool hasOutstanding;
  final int totalViolations;
}

class SearchViolation {
  const SearchViolation({
    required this.id,
    required this.name,
    required this.date,
    required this.area,
    required this.fine,
    required this.paid,
  });

  final int id;
  final String name;
  final String date;
  final String area;
  final String fine;
  final bool paid;
}

const SearchResult searchResult = SearchResult(
  plate: 'T123ABC',
  date: '15 Mei 2026 • 09:35 AM',
  status: 'Imepatikana',
  riskScore: 70,
  riskLevel: 'JUU',
  alertMessage: 'Dereva ana historia ya makosa ya trafiki',
  insurance: SearchInsurance(
    company: 'CRDB Insurance Company',
    policy: 'CRDB/2026/154689',
    expires: '15/05/2027',
    valid: true,
  ),
  driver: SearchDriver(
    name: 'Juma Khamis Mwinyi',
    gender: 'Male',
    license: 'DL123456789TZ',
    licenseClass: 'Class B',
    nida: '1990123456789',
    mobile: '07X XXX XXXX',
  ),
  vehicle: SearchVehicle(
    model: 'Toyota Hilux',
    type: 'Pick Up',
    year: '2022',
    color: 'White',
    accidentInvolved: true,
  ),
  payment: SearchPayment(hasOutstanding: true, totalViolations: 3),
  violations: [
    SearchViolation(
      id: 1,
      name: 'Over Speeding',
      date: '10/05/2026',
      area: 'Mandela Road',
      fine: 'TZS 150,000',
      paid: false,
    ),
    SearchViolation(
      id: 2,
      name: 'No Seatbelt',
      date: '28/04/2026',
      area: 'Mbezi Beach',
      fine: 'TZS 50,000',
      paid: false,
    ),
    SearchViolation(
      id: 3,
      name: 'Traffic Light Violation',
      date: '15/04/2026',
      area: 'Samora Ave',
      fine: 'TZS 100,000',
      paid: false,
    ),
  ],
);

const List<StatItem> patrolStats = [
  StatItem(label: 'Jumla Patroli', value: '3', icon: 'shield', color: '#2196F3'),
  StatItem(label: 'Umbali (km)', value: '116.5', icon: 'map-pin', color: '#4CAF50'),
  StatItem(label: 'Masaa', value: '24.0', icon: 'clock', color: '#FF9800'),
];

const List<Alert> alerts = [
  Alert(
    id: 1,
    icon: 'car',
    iconColor: '#F44336',
    title: 'Gari la Uhalifu limeonekana',
    time: 'siku 628 zilizopita',
    message:
        'Gari la aina ya Toyota Corolla, nambari ya usajili T789GHI, limeordeshwa kama gari la wizi. Endelea kwa tahadhari.',
    source: 'Kituo Kikuu cha Polisi',
    sourceBg: '#FFEBEE',
    dotColor: '#F44336',
    borderColor: '#F44336',
    unread: true,
  ),
  Alert(
    id: 2,
    icon: 'cloud-rain',
    iconColor: '#9E9E9E',
    title: 'Onyo la Mvua Kubwa',
    time: 'siku 628 zilizopita',
    message:
        'Tahadhari: Mvua kubwa inatarajiwa katika mkoa wa Dar es Salaam kuanzia saa 2 asubuhi. Waofisa wa trafiki watahimizwa kuwa makini.',
    source: 'Idara ya Hali ya Hewa',
    sourceBg: '#E3F2FD',
    dotColor: '#2196F3',
    borderColor: '#2196F3',
    unread: false,
  ),
  Alert(
    id: 3,
    icon: 'graduation-cap',
    iconColor: '#4CAF50',
    title: 'Mafunzo ya IPS mpya',
    time: 'siku 629 zilizopita',
    message:
        'Mafunzo mapya ya IPS (International Police System) yatapokelewa wiki ijayo. Waofisa wote watahitajiwa kuhudhuria.',
    source: 'Mkuu wa Mkoa - Dar es Salaam',
    sourceBg: '#E8F5E9',
    dotColor: '#4CAF50',
    borderColor: '#4CAF50',
    unread: false,
  ),
];

class ProfileStat {
  const ProfileStat({
    required this.label,
    required this.value,
    required this.sub,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final String sub;
  final String icon;
  final String color;
}

const List<ProfileStat> profileStats = [
  ProfileStat(label: 'Patroli Zilizofanywa', value: '3', sub: 'Leo', icon: 'car', color: '#2196F3'),
  ProfileStat(label: 'Citations Zimetolewa', value: '12', sub: 'Leo', icon: 'file-text', color: '#FF9800'),
  ProfileStat(label: 'Makosa Yaliyoshughulikiwa', value: '18', sub: 'Leo', icon: 'users', color: '#4CAF50'),
  ProfileStat(label: 'Masaa Kazini', value: '8.5', sub: 'Leo', icon: 'calendar', color: '#9C27B0'),
  ProfileStat(label: 'Umbali (km)', value: '116.5', sub: 'Wiki Hii', icon: 'route', color: '#2196F3'),
];

class ProfileActivity {
  const ProfileActivity({
    required this.title,
    required this.desc,
    required this.time,
    required this.icon,
    required this.color,
  });

  final String title;
  final String desc;
  final String time;
  final String icon;
  final String color;
}

const List<ProfileActivity> profileActivities = [
  ProfileActivity(
    title: 'Patroli imekamilika',
    desc: 'Kariakoo - Ilala Zone',
    time: '08:15 AM 15 Mei 2026',
    icon: 'car',
    color: '#2196F3',
  ),
  ProfileActivity(
    title: 'Citation imetolewa',
    desc: 'Namba ya Gari: T789GHI',
    time: '07:45 AM 15 Mei 2026',
    icon: 'file-text',
    color: '#4CAF50',
  ),
  ProfileActivity(
    title: 'Kosa Imeripotiwa',
    desc: 'Exceeding Speed Limit',
    time: '07:20 AM 15 Mei 2026',
    icon: 'alert-triangle',
    color: '#FF9800',
  ),
  ProfileActivity(
    title: 'Eneo la Patroli',
    desc: 'Morogoro Road, Dar es Salaam',
    time: '06:30 AM 15 Mei 2026',
    icon: 'map-pin',
    color: '#9C27B0',
  ),
];

class ProfileSetting {
  const ProfileSetting({
    required this.label,
    required this.desc,
    required this.icon,
    required this.color,
  });

  final String label;
  final String desc;
  final String icon;
  final String color;
}

const List<ProfileSetting> profileSettings = [
  ProfileSetting(label: 'Profaili Yangu', desc: 'Maelezo binafsi', icon: 'user', color: '#2196F3'),
  ProfileSetting(label: 'Mipangilio', desc: 'Badilisha mipangilio', icon: 'settings', color: '#2196F3'),
  ProfileSetting(label: 'Usalama', desc: 'Nenosiri na usalama', icon: 'shield', color: '#2196F3'),
  ProfileSetting(label: 'Pakua Ripoti', desc: 'Ripoti na takwimu', icon: 'download', color: '#4CAF50'),
  ProfileSetting(label: 'Historia ya Shughuli', desc: 'Rekodi zako zote', icon: 'clock', color: '#FF9800'),
  ProfileSetting(label: 'Msaada', desc: 'Usaidizi na maelekezo', icon: 'help-circle', color: '#2196F3'),
];

const AccidentReport accidentReport = AccidentReport(
  vehicles: [
    AccidentVehicle(plate: 'T123ABC', model: 'Toyota Corolla', color: 'Nyeupe', damage: 'Ndogo'),
    AccidentVehicle(plate: 'T789GHI', model: 'Toyota Hiace', color: 'Fedha', damage: 'Kubwa'),
  ],
  people: [
    AccidentPerson(
      name: 'Juma Khamis Mwinyi',
      role: 'Dereva',
      phone: '0712 345 678',
      condition: 'Hakuna Madhara',
    ),
    AccidentPerson(
      name: 'Ali Mohamed Salum',
      role: 'Abiria',
      phone: '0755 987 654',
      condition: 'Maumivu Madogo',
    ),
  ],
  evidence: [
    AccidentEvidence(name: 'picha_01.jpg', size: '2.4 MB', type: EvidenceType.image),
    AccidentEvidence(name: 'picha_02.jpg', size: '1.8 MB', type: EvidenceType.image),
    AccidentEvidence(name: 'video_01.mp4', size: '5.6 MB', type: EvidenceType.video),
    AccidentEvidence(name: 'ripoti_mwanzo.pdf', size: '1.2 MB', type: EvidenceType.pdf),
  ],
);

const VehicleInspection vehicleInspection = VehicleInspection(
  plate: 'T123ABC',
  model: 'Toyota Corolla',
  color: 'Nyeupe',
  owner: 'Juma Khamis Mwinyi',
  phone: '0712 345 678',
  location: 'Morogoro Road, DSM',
  datetime: '15 Mei 2026, 08:15 AM',
  documents: [
    InspectionItem(label: 'Leseni ya Udereva', status: 'Sahihi', pass: true),
    InspectionItem(label: 'Hati ya Usajili (Logbook)', status: 'Sahihi', pass: true),
    InspectionItem(label: 'Bima ya Gari', status: 'Sahihi', pass: true),
    InspectionItem(label: 'Vyeti vya Ukaguzi (Inspection Certificate)', status: 'Haijasahihi', pass: false),
    InspectionItem(label: 'Kibali cha Biashara / PSV Badge', status: 'Sahihi', pass: true),
  ],
  mechanical: [
    InspectionItem(label: 'Taa za Mbele na Nyuma', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Brenki', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Matairi', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Kioo cha Mbele (Wiper)', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Kelele za Gari', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Viashiria (Indicators)', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Horn', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Suspension', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Kioo (Mirrors)', status: 'Nzuri', pass: true),
    InspectionItem(label: 'Exhaust / Moshi', status: 'Nzuri', pass: true),
  ],
  photos: [
    InspectionPhoto(label: 'Nje - Nyuma'),
    InspectionPhoto(label: 'Nje - Mbele'),
    InspectionPhoto(label: 'Tairi la Mbele Kushoto'),
    InspectionPhoto(label: 'Dashibodi'),
  ],
);

const Pf3Form pf3Form = Pf3Form(
  referenceNo: 'PF3/DSM/2026/00892',
  region: 'Dar es Salaam',
  district: 'Kinondoni',
  station: 'Kituo Kikuu cha Polisi Dar es Salaam',
  accidentType: 'Mgongano wa Magari Mawili',
  severity: 'Mdogo',
  weather: 'Wazi',
  roadSurface: 'Lami',
  lightCondition: 'Mchana',
  vehicles: [
    Pf3Vehicle(
      plate: 'T123ABC',
      make: 'Toyota Corolla',
      year: '2020',
      color: 'Nyeupe',
      driver: 'Juma Khamis Mwinyi',
      license: 'DL123456789TZ',
      direction: 'Kuelekea Ubungo',
      damage: 'Mbele - Upande wa Kulia',
      insured: true,
    ),
    Pf3Vehicle(
      plate: 'T789GHI',
      make: 'Toyota Hiace',
      year: '2019',
      color: 'Fedha',
      driver: 'Ali Mohamed Salum',
      license: 'DL987654321TZ',
      direction: 'Kutoka Ubungo',
      damage: 'Nyuma - Upande wa Kushoto',
      insured: true,
    ),
  ],
  casualties: [
    Pf3Casualty(
      name: 'Ali Mohamed Salum',
      type: 'Abiria',
      injury: 'Maumivu Madogo',
      hospital: 'Mwananyamala',
      status: 'Matibabu',
    ),
    Pf3Casualty(
      name: 'Fatuma Hassan',
      type: 'Abiria',
      injury: 'Hakuna Madhara',
      hospital: '—',
      status: 'Ametoka',
    ),
  ],
  witnesses: [
    Pf3Witness(
      name: 'Saidi Juma',
      phone: '0788 123 456',
      statement: 'Gari la T123ABC lilipita kasi na kupoteza udhibiti.',
    ),
    Pf3Witness(
      name: 'Mariam Ally',
      phone: '0766 987 654',
      statement: 'Niliona gari la pindi likijaribu kuepuka.',
    ),
  ],
);

const List<Citation> citationHistory = [
  Citation(
    id: 'CT-2026-0451',
    plate: 'T123ABC',
    offense: 'Over Speeding',
    driver: 'Juma Khamis Mwinyi',
    date: '10 Mei 2026',
    time: '14:30',
    location: 'Mandela Road, DSM',
    fine: 'TZS 150,000',
    status: 'Hajalipwa',
    statusColor: '#F44336',
  ),
  Citation(
    id: 'CT-2026-0450',
    plate: 'T789GHI',
    offense: 'No Seatbelt',
    driver: 'Ali Mohamed Salum',
    date: '08 Mei 2026',
    time: '09:15',
    location: 'Mbezi Beach, DSM',
    fine: 'TZS 50,000',
    status: 'Imelipwa',
    statusColor: '#10B981',
  ),
  Citation(
    id: 'CT-2026-0449',
    plate: 'T456DEF',
    offense: 'Traffic Light Violation',
    driver: 'Saidi Juma Khamis',
    date: '05 Mei 2026',
    time: '17:45',
    location: 'Samora Ave, DSM',
    fine: 'TZS 100,000',
    status: 'Imelipwa',
    statusColor: '#10B981',
  ),
  Citation(
    id: 'CT-2026-0448',
    plate: 'T321XYZ',
    offense: 'Kutumia Simu wakati wa Udereva',
    driver: 'Grace Mushi',
    date: '02 Mei 2026',
    time: '11:20',
    location: 'Nkrumah Street, DSM',
    fine: 'TZS 50,000',
    status: 'Hajalipwa',
    statusColor: '#F44336',
  ),
  Citation(
    id: 'CT-2026-0447',
    plate: 'T654ABC',
    offense: 'Kutopita kasi',
    driver: 'Hamisi Rashid',
    date: '28 Apr 2026',
    time: '08:05',
    location: 'Morogoro Road, DSM',
    fine: 'TZS 30,000',
    status: 'Imelipwa',
    statusColor: '#10B981',
  ),
];

const List<String> offenseTypes = [
  'Over Speeding',
  'No Seatbelt',
  'Traffic Light Violation',
  'Kutumia Simu wakati wa Udereva',
  'Kutopita kasi',
  'Kutopita mstari',
  'Gari bila Bima',
  'Leseni imekwisha',
  'Kukata kona hatari',
  'Kuepuka kodi',
];

const List<String> vehicleTypes = [
  'Saloon',
  'Pick Up',
  'Minibus',
  'Lori',
  'Pikipiki',
  'Bajaji',
  'Basila',
];
