// =====================================================================
// Mock Data Engine - Tanzania Police Platform
// =====================================================================

export const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Mbeya',
  'Morogoro', 'Tanga', 'Zanzibar', 'Kilimanjaro', 'Iringa',
  'Kagera', 'Kigoma', 'Lindi', 'Mara', 'Mtwara',
  'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Singida',
  'Tabora', 'Geita', 'Katavi', 'Njombe', 'Simiyu',
  'Songwe', 'Kaskazini Pemba', 'Kusini Pemba', 'Kaskazini Unguja', 'Kusini Unguja', 'Mjini Magharibi'
];

export const DISTRICTS: Record<string, string[]> = {
  'Dar es Salaam': ['Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni'],
  'Arusha': ['Arusha DC', 'Arusha CC', 'Meru', 'Karatu', 'Longido'],
  'Dodoma': ['Dodoma MC', 'Dodoma DC', 'Kondoa', 'Mpwapwa', 'Kongwa'],
  'Mwanza': ['Mwanza CC', 'Nyamagana', 'Ilemela', 'Magu', 'Sengerema'],
  'Mbeya': ['Mbeya CC', 'Mbeya DC', 'Rungwe', 'Kyela', 'Mbarali'],
  'Morogoro': ['Morogoro MC', 'Morogoro DC', 'Mvomero', 'Kilosa', 'Gairo'],
};

export const STATIONS = [
  'Central Police Station', 'Sokoni One Police Post', 'Kijitonyama Station',
  'Mwenge Police Post', 'Tegeta Station', 'Mbezi Police Post',
  'Kariakoo Station', 'Posta Station', 'Upanga Station',
  'Arusha DC Station', 'Sinyanga Station', 'Moshi Central',
  'Dodoma Central Station', 'Mwanza Central Station', 'Mbeya Central Station',
];

export const RANKS = [
  'IGP', 'DIGP', 'CP', 'ACP', 'ASP', 'SP', 'Inspector',
  'Sergeant', 'Corporal', 'Lance Corporal', 'Constable',
];

export const VIOLATIONS = [
  'Overspeeding', 'Running Red Light', 'Reckless Driving',
  'Driving Without License', 'No Seatbelt', 'Drunk Driving',
  'Using Phone While Driving', 'No Helmet', 'Overloading',
  'Expired Insurance', 'No Vehicle Inspection', 'Wrong Way',
  'Illegal Parking', 'No Reflectors', 'Tinted Windows',
];

export const CASE_TYPES = [
  'Theft', 'Robbery', 'Assault', 'Fraud', 'Murder',
  'Burglary', 'Drug Offense', 'Cybercrime', 'Corruption',
  'Traffic Accident', 'Domestic Violence', 'Arson',
];

export const CASE_STATUSES = ['Open', 'Under Investigation', 'Pending Court', 'Closed', 'Archived'];

// Mock Citizens
export const MOCK_CITIZENS = Array.from({ length: 30 }, (_, i) => ({
  id: `CIT-${String(i + 1).padStart(4, '0')}`,
  fullName: [
    'John Makonda', 'Fatma Hassan', 'Peter Mwangi', 'Amina Juma',
    'David Mollel', 'Grace Temu', 'Hassan Omar', 'Sarah Kimaro',
    'Joseph Lekule', 'Rehema Mcharo', 'Frank Mushi', 'Anna Kileo',
    'Barnaba Loth', 'Dorothy Senge', 'Michael Nyagawa', 'Christina Gadi',
    'Raphael Magesa', 'Neema Shuma', 'Thomas Laizer', 'Pendo Mlay',
    'Gideon Mrema', 'Happy Mbise', 'Clement Kayombo', 'Lightness Shayo',
    'Emmanuel Urio', 'Agnes Moshi', 'Daniel Tarimo', 'Violet Massawe',
    'Richard Mwenda', 'Elizabeth Kahabi',
  ][i],
  nationalId: `TZ${String(100000000 + i * 3719).padStart(12, '0')}`,
  dateOfBirth: `19${80 + (i % 20)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
  gender: i % 3 === 0 ? 'Female' : 'Male',
  phone: `+2557${String(10000000 + i * 123456).slice(0, 8)}`,
  address: `${STATIONS[i % STATIONS.length]} Area`,
  region: REGIONS[i % REGIONS.length],
  hasWarrant: i % 10 === 0,
  status: i % 15 === 0 ? 'Wanted' : 'Clean',
}));

// Mock Vehicles
export const MOCK_VEHICLES = Array.from({ length: 25 }, (_, i) => ({
  id: `VEH-${String(i + 1).padStart(4, '0')}`,
  plateNumber: [
    'T 123 ABC', 'T 456 DEF', 'T 789 GHI', 'T 111 JKL',
    'T 222 MNO', 'T 333 PQR', 'T 444 STU', 'T 555 VWX',
    'T 666 YZA', 'T 777 BCD', 'T 888 EFG', 'T 999 HIJ',
    'T 100 KLM', 'T 200 NOP', 'T 300 QRS', 'T 400 TUV',
    'T 500 WXY', 'T 600 ZAB', 'T 700 CDE', 'T 800 FGH',
    'T 900 IJK', 'T 101 LMN', 'T 202 OPQ', 'T 303 RST', 'T 404 UVW',
  ][i],
  make: ['Toyota', 'Nissan', 'Honda', 'Mitsubishi', 'Isuzu', 'Suzuki', 'Volkswagen', 'BMW', 'Mercedes', 'Hyundai'][i % 10],
  model: ['Corolla', 'Hilux', 'Pickup', 'Civic', 'Pajero', 'Carry', 'Golf', 'X5', 'C-Class', 'Tucson'][i % 10],
  year: 2015 + (i % 9),
  color: ['White', 'Black', 'Silver', 'Blue', 'Red', 'Green', 'Grey', 'Yellow'][i % 8],
  ownerName: MOCK_CITIZENS[i % MOCK_CITIZENS.length].fullName,
  ownerId: MOCK_CITIZENS[i % MOCK_CITIZENS.length].id,
  status: i % 8 === 0 ? 'Stolen' : i % 12 === 0 ? 'Wanted' : 'Registered',
  insuranceExpiry: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  lastInspection: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

// Mock Officers
export const MOCK_OFFICERS = Array.from({ length: 20 }, (_, i) => ({
  id: `OFC-${String(i + 1).padStart(4, '0')}`,
  badgeNumber: `TF-${String(100 + i).padStart(3, '0')}`,
  fullName: [
    'Sgt. Joseph Mcharo', 'Cpl. Rehema Juma', 'Insp. Frank Mushi',
    'Sgt. Daniel Tarimo', 'Const. Agnes Moshi', 'Sgt. Gideon Mrema',
    'Const. Happy Mbise', 'Cpl. Clement Kayombo', 'Const. Lightness Shayo',
    'Insp. Emmanuel Urio', 'Const. Violet Massawe', 'Sgt. Richard Mwenda',
    'Const. Elizabeth Kahabi', 'Sgt. Thomas Laizer', 'Const. Pendo Mlay',
    'Cpl. Raphael Magesa', 'Const. Neema Shuma', 'Sgt. Michael Nyagawa',
    'Const. Christina Gadi', 'Insp. Dorothy Senge',
  ][i],
  rank: RANKS[i % RANKS.length],
  station: STATIONS[i % STATIONS.length],
  region: REGIONS[i % REGIONS.length],
  status: i % 15 === 0 ? 'Suspended' : 'Active',
  phone: `+2557${String(20000000 + i * 234567).slice(0, 8)}`,
}));

// Mock Cases
export const MOCK_CASES = Array.from({ length: 20 }, (_, i) => ({
  id: `CASE-${String(2024000 + i)}`,
  caseNumber: `CR/${String(2024).slice(2)}/${String(i + 1).padStart(4, '0')}`,
  title: [
    'Theft of Motor Vehicle', 'Armed Robbery at Bank', 'Assault Incident',
    'Fraud - Counterfeit Currency', 'Burglary at Residence', 'Drug Possession',
    'Cyber Fraud Case', 'Traffic Fatality', 'Domestic Violence Report',
    'Missing Person', 'Vandalism of Property', 'Extortion Case',
    'Illegal Possession of Firearm', 'Human Trafficking', 'Money Laundering',
    'Insurance Fraud', 'Carjacking Incident', 'Shoplifting', 'Identity Theft', 'Public Nuisance',
  ][i],
  type: CASE_TYPES[i % CASE_TYPES.length],
  status: CASE_STATUSES[i % CASE_STATUSES.length],
  assignedTo: MOCK_OFFICERS[i % MOCK_OFFICERS.length].fullName,
  dateOpened: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  region: REGIONS[i % REGIONS.length],
  station: STATIONS[i % STATIONS.length],
  priority: ['High', 'Medium', 'Low'][i % 3],
}));

// Mock Wanted Persons
export const MOCK_WANTED = MOCK_CITIZENS.filter(c => c.hasWarrant || c.status === 'Wanted').map(c => ({
  ...c,
  warrantNumber: `WRT-${c.id}`,
  crime: 'Wanted for questioning',
  lastSeen: c.address,
  reward: 'TZS 500,000',
}));

// Mock PF3 Forms
export const MOCK_PF3 = Array.from({ length: 10 }, (_, i) => ({
  id: `PF3-${String(2024000 + i)}`,
  formNumber: `PF3/${String(2024).slice(2)}/${String(i + 1).padStart(4, '0')}`,
  citizenName: MOCK_CITIZENS[i].fullName,
  citizenId: MOCK_CITIZENS[i].id,
  offense: VIOLATIONS[i % VIOLATIONS.length],
  officerName: MOCK_OFFICERS[i % MOCK_OFFICERS.length].fullName,
  dateIssued: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  fineAmount: [10000, 20000, 30000, 50000, 100000][i % 5],
  status: i % 3 === 0 ? 'Paid' : 'Pending',
  station: STATIONS[i % STATIONS.length],
}));

// Mock Accidents
export const MOCK_ACCIDENTS = Array.from({ length: 10 }, (_, i) => ({
  id: `ACC-${String(2024000 + i)}`,
  reportNumber: `ACC/${String(2024).slice(2)}/${String(i + 1).padStart(4, '0')}`,
  location: `${STATIONS[i % STATIONS.length]} Road`,
  date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  type: ['Head-on Collision', 'Rear-end', 'Side Impact', 'Rollover', 'Pedestrian', 'Multi-vehicle'][i % 6],
  severity: ['Fatal', 'Serious', 'Minor'][i % 3],
  vehiclesInvolved: i % 3 + 1,
  casualties: { fatalities: i % 4, injured: i % 5 + 1 },
  officerOnScene: MOCK_OFFICERS[i % MOCK_OFFICERS.length].fullName,
  status: i % 2 === 0 ? 'Closed' : 'Under Investigation',
}));

// Mock Notifications
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'System Maintenance', message: 'Scheduled maintenance tonight at 23:00', time: '5 min ago', read: false, type: 'warning' as const },
  { id: 'n2', title: 'New Case Assigned', message: 'Case CR/24/0015 assigned to you', time: '1 hour ago', read: false, type: 'info' as const },
  { id: 'n3', title: 'Warrant Alert', message: 'New warrant issued in your region', time: '2 hours ago', read: true, type: 'danger' as const },
  { id: 'n4', title: 'Report Approved', message: 'Your monthly report has been approved', time: '1 day ago', read: true, type: 'success' as const },
  { id: 'n5', title: 'Duty Roster Updated', message: 'Next week roster has been published', time: '2 days ago', read: true, type: 'info' as const },
];

// Stats generators
export function generateStats(role: string) {
  return {
    totalCases: Math.floor(Math.random() * 500 + 100),
    openCases: Math.floor(Math.random() * 100 + 20),
    closedCases: Math.floor(Math.random() * 200 + 50),
    officers: Math.floor(Math.random() * 50 + 10),
    stations: Math.floor(Math.random() * 10 + 3),
    arrests: Math.floor(Math.random() * 200 + 50),
    vehicles: Math.floor(Math.random() * 300 + 100),
    citations: Math.floor(Math.random() * 500 + 100),
  };
}

export function generateMonthlyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    cases: Math.floor(Math.random() * 80 + 20),
    arrests: Math.floor(Math.random() * 40 + 10),
    citations: Math.floor(Math.random() * 120 + 30),
  }));
}

export function generateRegionData() {
  return ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Mbeya', 'Morogoro'].map(region => ({
    region,
    cases: Math.floor(Math.random() * 200 + 50),
    resolved: Math.floor(Math.random() * 150 + 30),
  }));
}