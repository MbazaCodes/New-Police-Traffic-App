// ============================================================
// TZ POLICE DIGITAL PLATFORM — MOCK DATABASE
// 20 Citizens · 20 Plates · 20 Licenses · 20 NIDs · 20 Phones · 20 Serials
// All cross-linked. Use any field to search and get a real result.
// ============================================================

export interface MockCitizen {
  // Identity
  name: string;
  nida: string;
  mobile: string;
  gender: "Mme" | "Mke";
  dob: string;
  age: number;
  address: string;
  occupation: string;
  status: string;
  statusColor: string;
  // Criminal
  criminalRecord: { hasRecord: boolean; cases: number; convictions: number };
  alerts: string[];
  // Documents
  licenseNo: string;
  licenseExpiry: string;
  licenseClass: string;
  passportNo: string;
  passportExpiry: string;
  documents?: { type: string; number: string; status: string }[];
  // Vehicles
  vehicles: MockVehicle[];
  // Devices
  devices: MockDevice[];
  // History
  history: { date: string; type: string; case: string; station: string }[];
  // Risk
  riskScore: number;
  riskLevel: string;
}

export interface MockVehicle {
  plate: string;
  model: string;
  type: string;
  color: string;
  year: string;
  ownerNida: string;
  ownerName: string;
  ownerPhone: string;
  insurance: { company: string; policy: string; expires: string; valid: boolean };
  inspectionExpiry: string;
  registrationExpiry: string;
  accidentInvolved: boolean;
  violations: { id: number; name: string; date: string; area: string; fine: string; paid: boolean }[];
  outstandingFines: number;
}

export interface MockDevice {
  serialNo: string;
  imei: string;
  description: string;
  category: string;
  ownerNida: string;
  ownerName: string;
  ownerPhone: string;
  status: "clean" | "stolen" | "found";
  reportDate?: string;
}

// ── 20 CITIZENS ──────────────────────────────────────────────
export const MOCK_CITIZENS: MockCitizen[] = [
  {
    name: "Juma Khamis Mwinyi", nida: "199012031234567", mobile: "0712 345 678",
    gender: "Mme", dob: "03 Des 1990", age: 35,
    address: "Nyumba Na. 45, Mbezi Beach, Kinondoni, Dar es Salaam",
    occupation: "Mfanyabiashara", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL001001TZ", licenseExpiry: "31 Des 2027", licenseClass: "B",
    passportNo: "TZ-AA-001001", passportExpiry: "15 Mar 2029",
    vehicles: [], devices: [],
    history: [
      { date: "10 Mei 2026", type: "Shahidi wa Kesi", case: "INC-2026-0341", station: "Kituo Kikuu DSM" },
    ],
    riskScore: 12, riskLevel: "Chini",
  },
  {
    name: "Fatuma Hassan Mwanga", nida: "199507081234568", mobile: "0754 123 456",
    gender: "Mke", dob: "08 Jul 1995", age: 30,
    address: "Mtaa wa Mikocheni, Kinondoni, Dar es Salaam",
    occupation: "Mwalimu", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL002002TZ", licenseExpiry: "20 Jun 2028", licenseClass: "B",
    passportNo: "TZ-BB-002002", passportExpiry: "10 Ago 2030",
    vehicles: [], devices: [],
    history: [],
    riskScore: 5, riskLevel: "Chini",
  },
  {
    name: "Ali Mohamed Salum", nida: "198803221234569", mobile: "0712 987 654",
    gender: "Mme", dob: "22 Mar 1988", age: 38,
    address: "Mtaa wa Magomeni, Kinondoni, Dar es Salaam",
    occupation: "Dereva", status: "Ana Makosa", statusColor: "#FF9800",
    criminalRecord: { hasRecord: true, cases: 2, convictions: 1 }, alerts: ["Faini isiyolipwa TZS 150,000"],
    licenseNo: "DL003003TZ", licenseExpiry: "05 Jan 2026", licenseClass: "C",
    passportNo: "TZ-CC-003003", passportExpiry: "01 Nov 2027",
    vehicles: [], devices: [],
    history: [
      { date: "08 Mei 2026", type: "Citation - Kasi", case: "CT-2026-0450", station: "Kituo Kikuu DSM" },
      { date: "15 Jan 2026", type: "Ajali ya Barabara", case: "INC-2026-0088", station: "Kituo cha Kinondoni" },
    ],
    riskScore: 68, riskLevel: "Wastani",
  },
  {
    name: "Grace Amina Mushi", nida: "199209141234570", mobile: "0766 456 789",
    gender: "Mke", dob: "14 Sep 1992", age: 33,
    address: "Mtaa wa Sinza, Kinondoni, Dar es Salaam",
    occupation: "Mhudumu wa Afya", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL004004TZ", licenseExpiry: "12 Apr 2027", licenseClass: "B",
    passportNo: "TZ-DD-004004", passportExpiry: "20 Feb 2031",
    vehicles: [], devices: [],
    history: [],
    riskScore: 8, riskLevel: "Chini",
  },
  {
    name: "Saidi Omari Bakari", nida: "197612301234571", mobile: "0788 321 654",
    gender: "Mme", dob: "30 Des 1976", age: 49,
    address: "Mtaa wa Temeke, Temeke, Dar es Salaam",
    occupation: "Mkandarasi", status: "Ana Makosa", statusColor: "#F44336",
    criminalRecord: { hasRecord: true, cases: 4, convictions: 2 }, alerts: ["Alikimbia baada ya ajali", "Leseni imekwisha"],
    licenseNo: "DL005005TZ", licenseExpiry: "28 Feb 2024", licenseClass: "C",
    passportNo: "TZ-EE-005005", passportExpiry: "05 Jul 2026",
    vehicles: [], devices: [],
    history: [
      { date: "02 Mei 2026", type: "Kukimbia Baada ya Ajali", case: "INC-2026-0311", station: "Kituo cha Temeke" },
      { date: "10 Feb 2026", type: "Leseni Imekwisha", case: "CT-2026-0123", station: "Kituo cha Temeke" },
      { date: "05 Nov 2025", type: "Uendeshaji kwa Ulevi", case: "CT-2025-0887", station: "Kituo Kikuu DSM" },
    ],
    riskScore: 85, riskLevel: "Juu",
  },
  {
    name: "Amina Said Juma", nida: "200101151234572", mobile: "0755 789 012",
    gender: "Mke", dob: "15 Jan 2001", age: 25,
    address: "Mtaa wa Ubungo, Ubungo, Dar es Salaam",
    occupation: "Mwanafunzi wa Chuo", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL006006TZ", licenseExpiry: "30 Sep 2029", licenseClass: "B",
    passportNo: "TZ-FF-006006", passportExpiry: "22 Des 2032",
    vehicles: [], devices: [],
    history: [],
    riskScore: 3, riskLevel: "Chini",
  },
  {
    name: "Baraka John Mwanga", nida: "200005121234573", mobile: "0788 654 321",
    gender: "Mme", dob: "12 Mei 2000", age: 26,
    address: "Mtaa wa Manzese, Ubungo, Dar es Salaam",
    occupation: "Fundi Umeme", status: "Chini ya Uchunguzi", statusColor: "#FF9800",
    criminalRecord: { hasRecord: true, cases: 1, convictions: 0 }, alerts: ["Kesi inayoendelea"],
    licenseNo: "DL007007TZ", licenseExpiry: "14 Ago 2028", licenseClass: "B",
    passportNo: "TZ-GG-007007", passportExpiry: "08 Mar 2030",
    vehicles: [], devices: [],
    history: [
      { date: "12 Mei 2026", type: "Kukamatwa - Ugomvi", case: "AR-2026-0029", station: "Kituo cha Ubungo" },
    ],
    riskScore: 42, riskLevel: "Wastani",
  },
  {
    name: "Zawadi Kimani Ochieng", nida: "198506201234574", mobile: "0712 111 333",
    gender: "Mke", dob: "20 Jun 1985", age: 40,
    address: "Mtaa wa Ilala, Ilala, Dar es Salaam",
    occupation: "Mfanyakazi wa Benki", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL008008TZ", licenseExpiry: "25 Nov 2026", licenseClass: "B",
    passportNo: "TZ-HH-008008", passportExpiry: "14 Jan 2028",
    vehicles: [], devices: [],
    history: [],
    riskScore: 15, riskLevel: "Chini",
  },
  {
    name: "Hamisi Rashid Omar", nida: "197805091234575", mobile: "0766 222 444",
    gender: "Mme", dob: "09 Mei 1978", age: 48,
    address: "Mtaa wa Kariakoo, Ilala, Dar es Salaam",
    occupation: "Mfanyabiashara wa Jumla", status: "Ana Makosa", statusColor: "#F44336",
    criminalRecord: { hasRecord: true, cases: 6, convictions: 3 }, alerts: ["Faini nyingi isiyolipwa", "Historia ya makosa ya trafiki"],
    licenseNo: "DL009009TZ", licenseExpiry: "31 Mar 2025", licenseClass: "D",
    passportNo: "TZ-II-009009", passportExpiry: "30 Jun 2027",
    vehicles: [], devices: [],
    history: [
      { date: "28 Apr 2026", type: "Kasi kupita kiasi", case: "CT-2026-0447", station: "Kituo Kikuu DSM" },
      { date: "15 Mar 2026", type: "Kupita taa nyekundu", case: "CT-2026-0234", station: "Kituo cha Ilala" },
      { date: "10 Des 2025", type: "Gari bila Bima", case: "CT-2025-0991", station: "Kituo cha Kariakoo" },
    ],
    riskScore: 91, riskLevel: "Hatari",
  },
  {
    name: "Rashid Omari Said", nida: "199203151234576", mobile: "0755 321 654",
    gender: "Mme", dob: "15 Mar 1992", age: 34,
    address: "Mtaa wa Magomeni, Kinondoni, Dar es Salaam",
    occupation: "Dereva wa Daladala", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL010010TZ", licenseExpiry: "18 Des 2027", licenseClass: "D",
    passportNo: "TZ-JJ-010010", passportExpiry: "22 Sep 2029",
    vehicles: [], devices: [],
    history: [],
    riskScore: 20, riskLevel: "Chini",
  },
  {
    name: "Mariamu Ally Komba", nida: "199811271234577", mobile: "0712 555 666",
    gender: "Mke", dob: "27 Nov 1998", age: 27,
    address: "Mtaa wa Mwananyamala, Kinondoni, Dar es Salaam",
    occupation: "Muuguzi", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL011011TZ", licenseExpiry: "09 Jul 2030", licenseClass: "B",
    passportNo: "TZ-KK-011011", passportExpiry: "05 Nov 2033",
    vehicles: [], devices: [],
    history: [],
    riskScore: 2, riskLevel: "Chini",
  },
  {
    name: "Omari Hassan Kitwana", nida: "198210081234578", mobile: "0766 777 888",
    gender: "Mme", dob: "08 Okt 1982", age: 43,
    address: "Mtaa wa Kijitonyama, Kinondoni, Dar es Salaam",
    occupation: "Mkurugenzi", status: "Ana Faili", statusColor: "#2196F3",
    criminalRecord: { hasRecord: true, cases: 1, convictions: 0 }, alerts: ["Kesi ya kiraia - bado"],
    licenseNo: "DL012012TZ", licenseExpiry: "03 Feb 2028", licenseClass: "B",
    passportNo: "TZ-LL-012012", passportExpiry: "18 Apr 2031",
    vehicles: [], devices: [],
    history: [
      { date: "20 Apr 2026", type: "Mshtaki - Kesi ya Kiraia", case: "CIV-2026-0045", station: "Mahakama ya Hakimu" },
    ],
    riskScore: 30, riskLevel: "Wastani",
  },
  {
    name: "Pendo Mkwawa Haji", nida: "199604031234579", mobile: "0788 999 000",
    gender: "Mke", dob: "03 Apr 1996", age: 30,
    address: "Mtaa wa Tabata, Ilala, Dar es Salaam",
    occupation: "Msanifu Majengo", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL013013TZ", licenseExpiry: "27 Ago 2029", licenseClass: "B",
    passportNo: "TZ-MM-013013", passportExpiry: "12 Jul 2032",
    vehicles: [], devices: [],
    history: [],
    riskScore: 7, riskLevel: "Chini",
  },
  {
    name: "Yusuph Issa Majaliwa", nida: "197001171234580", mobile: "0712 444 555",
    gender: "Mme", dob: "17 Jan 1970", age: 56,
    address: "Mtaa wa Buguruni, Ilala, Dar es Salaam",
    occupation: "Mstaafu wa Polisi", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL014014TZ", licenseExpiry: "01 Okt 2026", licenseClass: "C",
    passportNo: "TZ-NN-014014", passportExpiry: "28 Feb 2028",
    vehicles: [], devices: [],
    history: [],
    riskScore: 10, riskLevel: "Chini",
  },
  {
    name: "Sikudhani Mwema Nyota", nida: "199309251234581", mobile: "0755 666 777",
    gender: "Mke", dob: "25 Sep 1993", age: 32,
    address: "Mtaa wa Kimara, Ubungo, Dar es Salaam",
    occupation: "Mwandishi wa Habari", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL015015TZ", licenseExpiry: "16 Mei 2028", licenseClass: "B",
    passportNo: "TZ-OO-015015", passportExpiry: "30 Des 2031",
    vehicles: [], devices: [],
    history: [],
    riskScore: 4, riskLevel: "Chini",
  },
  {
    name: "Masoud Ally Mapunda", nida: "198107141234582", mobile: "0766 888 999",
    gender: "Mme", dob: "14 Jul 1981", age: 44,
    address: "Mtaa wa Mwenge, Kinondoni, Dar es Salaam",
    occupation: "Daktari", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL016016TZ", licenseExpiry: "21 Mar 2027", licenseClass: "B",
    passportNo: "TZ-PP-016016", passportExpiry: "09 Okt 2030",
    vehicles: [], devices: [],
    history: [],
    riskScore: 6, riskLevel: "Chini",
  },
  {
    name: "Hidaya Ramadhani Chiku", nida: "200208061234583", mobile: "0788 000 111",
    gender: "Mke", dob: "06 Ago 2002", age: 23,
    address: "Mtaa wa Msasani, Kinondoni, Dar es Salaam",
    occupation: "Mubunifu", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL017017TZ", licenseExpiry: "14 Nov 2030", licenseClass: "B",
    passportNo: "TZ-QQ-017017", passportExpiry: "25 Mar 2034",
    vehicles: [], devices: [],
    history: [],
    riskScore: 1, riskLevel: "Chini",
  },
  {
    name: "Nassoro Kombo Mataka", nida: "198905231234584", mobile: "0712 222 333",
    gender: "Mme", dob: "23 Mei 1989", age: 37,
    address: "Mtaa wa Goba, Kinondoni, Dar es Salaam",
    occupation: "Injinia", status: "Ana Makosa", statusColor: "#FF9800",
    criminalRecord: { hasRecord: true, cases: 3, convictions: 1 }, alerts: ["Ombi la kuzuia liko"],
    licenseNo: "DL018018TZ", licenseExpiry: "07 Jan 2027", licenseClass: "B",
    passportNo: "TZ-RR-018018", passportExpiry: "16 Jun 2029",
    vehicles: [], devices: [],
    history: [
      { date: "15 Mei 2026", type: "Kukamatwa - Wizi", case: "AR-2026-0045", station: "Kituo cha Ilala" },
      { date: "03 Feb 2026", type: "Kuachiwa kwa dhamana", case: "AR-2026-0011", station: "Kituo Kikuu DSM" },
    ],
    riskScore: 72, riskLevel: "Juu",
  },
  {
    name: "Twaha Mrisho Lukindo", nida: "197503311234585", mobile: "0755 444 555",
    gender: "Mme", dob: "31 Mar 1975", age: 51,
    address: "Mtaa wa Segerea, Ilala, Dar es Salaam",
    occupation: "Mkulima", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL019019TZ", licenseExpiry: "19 Apr 2025", licenseClass: "C",
    passportNo: "TZ-SS-019019", passportExpiry: "11 Ago 2027",
    vehicles: [], devices: [],
    history: [],
    riskScore: 18, riskLevel: "Chini",
  },
  {
    name: "Zainab Hemed Singida", nida: "199704121234586", mobile: "0766 333 444",
    gender: "Mke", dob: "12 Apr 1997", age: 29,
    address: "Mtaa wa Makuburi, Kinondoni, Dar es Salaam",
    occupation: "Mhadhiri wa Chuo Kikuu", status: "Mtu wa Kawaida", statusColor: "#4CAF50",
    criminalRecord: { hasRecord: false, cases: 0, convictions: 0 }, alerts: [],
    licenseNo: "DL020020TZ", licenseExpiry: "28 Okt 2028", licenseClass: "B",
    passportNo: "TZ-TT-020020", passportExpiry: "03 Feb 2033",
    vehicles: [], devices: [],
    history: [],
    riskScore: 3, riskLevel: "Chini",
  },
];

// ── 20 VEHICLES — linked to citizens ────────────────────────
export const MOCK_VEHICLES: MockVehicle[] = [
  { plate: "T 001 ABC", model: "Toyota Corolla", type: "Saloon", color: "Nyeupe", year: "2020", ownerNida: "199012031234567", ownerName: "Juma Khamis Mwinyi", ownerPhone: "0712 345 678", insurance: { company: "Jubilee Insurance", policy: "JUB-2026-00123", expires: "30 Jun 2027", valid: true }, inspectionExpiry: "15 Mei 2027", registrationExpiry: "31 Mar 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 002 DEF", model: "Toyota Vitz", type: "Saloon", color: "Nyekundu", year: "2019", ownerNida: "199507081234568", ownerName: "Fatuma Hassan Mwanga", ownerPhone: "0754 123 456", insurance: { company: "GA Insurance", policy: "GA-2026-00234", expires: "28 Feb 2027", valid: true }, inspectionExpiry: "10 Apr 2027", registrationExpiry: "28 Feb 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 003 GHI", model: "Toyota Hiace", type: "Minibus", color: "Fedha", year: "2018", ownerNida: "198803221234569", ownerName: "Ali Mohamed Salum", ownerPhone: "0712 987 654", insurance: { company: "Strategies Insurance", policy: "STR-2026-00345", expires: "15 Mar 2026", valid: false }, inspectionExpiry: "20 Jan 2026", registrationExpiry: "31 Jan 2026", accidentInvolved: true, violations: [{ id: 1, name: "Kasi kupita kiasi", date: "08 Mei 2026", area: "Mbezi Beach", fine: "TZS 150,000", paid: false }], outstandingFines: 150000 },
  { plate: "T 004 JKL", model: "Suzuki Swift", type: "Saloon", color: "Bluu", year: "2021", ownerNida: "199209141234570", ownerName: "Grace Amina Mushi", ownerPhone: "0766 456 789", insurance: { company: "Alliance Insurance", policy: "ALL-2026-00456", expires: "20 Dec 2027", valid: true }, inspectionExpiry: "05 Mar 2027", registrationExpiry: "20 Dec 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 005 MNO", model: "Toyota Land Cruiser", type: "SUV", color: "Mweusi", year: "2016", ownerNida: "197612301234571", ownerName: "Saidi Omari Bakari", ownerPhone: "0788 321 654", insurance: { company: "Heritage Insurance", policy: "HER-2024-00567", expires: "10 Jan 2025", valid: false }, inspectionExpiry: "01 Des 2024", registrationExpiry: "10 Jan 2025", accidentInvolved: true, violations: [{ id: 1, name: "Gari bila Bima", date: "02 Mei 2026", area: "Kariakoo", fine: "TZS 200,000", paid: false }, { id: 2, name: "Leseni imekwisha", date: "10 Feb 2026", area: "Temeke", fine: "TZS 100,000", paid: false }], outstandingFines: 300000 },
  { plate: "T 006 PQR", model: "Honda Fit", type: "Saloon", color: "Kijani", year: "2022", ownerNida: "200101151234572", ownerName: "Amina Said Juma", ownerPhone: "0755 789 012", insurance: { company: "UAP Insurance", policy: "UAP-2026-00678", expires: "05 Nov 2027", valid: true }, inspectionExpiry: "22 Aug 2027", registrationExpiry: "05 Nov 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 007 STU", model: "Nissan Note", type: "Saloon", color: "Dhahabu", year: "2020", ownerNida: "200005121234573", ownerName: "Baraka John Mwanga", ownerPhone: "0788 654 321", insurance: { company: "Jubilee Insurance", policy: "JUB-2026-00789", expires: "14 Aug 2027", valid: true }, inspectionExpiry: "30 Jul 2027", registrationExpiry: "14 Aug 2027", accidentInvolved: false, violations: [{ id: 1, name: "Kutumia simu", date: "12 Mei 2026", area: "Manzese", fine: "TZS 50,000", paid: false }], outstandingFines: 50000 },
  { plate: "T 008 VWX", model: "Toyota Prado", type: "SUV", color: "Kahawia", year: "2023", ownerNida: "198506201234574", ownerName: "Zawadi Kimani Ochieng", ownerPhone: "0712 111 333", insurance: { company: "ICEA Lion", policy: "ICE-2026-00890", expires: "25 Nov 2027", valid: true }, inspectionExpiry: "18 Oct 2027", registrationExpiry: "25 Nov 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 009 YZA", model: "Bajaji RE", type: "Bajaji", color: "Njano", year: "2019", ownerNida: "197805091234575", ownerName: "Hamisi Rashid Omar", ownerPhone: "0766 222 444", insurance: { company: "Madison Insurance", policy: "MAD-2025-00901", expires: "31 Mar 2025", valid: false }, inspectionExpiry: "28 Feb 2025", registrationExpiry: "31 Mar 2025", accidentInvolved: true, violations: [{ id: 1, name: "Kasi kupita kiasi", date: "28 Apr 2026", area: "Morogoro Road", fine: "TZS 150,000", paid: false }, { id: 2, name: "Kupita taa nyekundu", date: "15 Mar 2026", area: "Posta", fine: "TZS 100,000", paid: false }, { id: 3, name: "Bila mkanda", date: "10 Des 2025", area: "Kariakoo", fine: "TZS 30,000", paid: true }], outstandingFines: 250000 },
  { plate: "T 010 BCD", model: "Toyota Ipsum", type: "Minibus", color: "Nyeupe", year: "2017", ownerNida: "199203151234576", ownerName: "Rashid Omari Said", ownerPhone: "0755 321 654", insurance: { company: "Jubilee Insurance", policy: "JUB-2026-01012", expires: "18 Dec 2027", valid: true }, inspectionExpiry: "10 Nov 2027", registrationExpiry: "18 Dec 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 011 EFG", model: "Toyota Axio", type: "Saloon", color: "Fedha", year: "2021", ownerNida: "199811271234577", ownerName: "Mariamu Ally Komba", ownerPhone: "0712 555 666", insurance: { company: "GA Insurance", policy: "GA-2026-01123", expires: "09 Jul 2027", valid: true }, inspectionExpiry: "01 Jun 2027", registrationExpiry: "09 Jul 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 012 HIJ", model: "Mitsubishi Outlander", type: "SUV", color: "Nyeusi", year: "2022", ownerNida: "198210081234578", ownerName: "Omari Hassan Kitwana", ownerPhone: "0766 777 888", insurance: { company: "Strategies Insurance", policy: "STR-2026-01234", expires: "03 Feb 2028", valid: true }, inspectionExpiry: "25 Jan 2028", registrationExpiry: "03 Feb 2028", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 013 KLM", model: "Toyota Rush", type: "SUV", color: "Buluu ya Giza", year: "2023", ownerNida: "199604031234579", ownerName: "Pendo Mkwawa Haji", ownerPhone: "0788 999 000", insurance: { company: "Alliance Insurance", policy: "ALL-2026-01345", expires: "27 Aug 2028", valid: true }, inspectionExpiry: "15 Aug 2028", registrationExpiry: "27 Aug 2028", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 014 NOP", model: "Toyota Hilux", type: "Pick Up", color: "Nyeupe", year: "2015", ownerNida: "197001171234580", ownerName: "Yusuph Issa Majaliwa", ownerPhone: "0712 444 555", insurance: { company: "Heritage Insurance", policy: "HER-2026-01456", expires: "01 Oct 2027", valid: true }, inspectionExpiry: "20 Sep 2027", registrationExpiry: "01 Oct 2027", accidentInvolved: false, violations: [{ id: 1, name: "Leseni karibu kwisha", date: "14 Apr 2026", area: "Buguruni", fine: "TZS 0", paid: true }], outstandingFines: 0 },
  { plate: "T 015 QRS", model: "Nissan Leaf", type: "Saloon", color: "Nyeupe", year: "2024", ownerNida: "199309251234581", ownerName: "Sikudhani Mwema Nyota", ownerPhone: "0755 666 777", insurance: { company: "UAP Insurance", policy: "UAP-2026-01567", expires: "16 May 2028", valid: true }, inspectionExpiry: "08 May 2028", registrationExpiry: "16 May 2028", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 016 TUV", model: "Toyota Fortuner", type: "SUV", color: "Fedha", year: "2022", ownerNida: "198107141234582", ownerName: "Masoud Ally Mapunda", ownerPhone: "0766 888 999", insurance: { company: "ICEA Lion", policy: "ICE-2026-01678", expires: "21 Mar 2027", valid: true }, inspectionExpiry: "12 Mar 2027", registrationExpiry: "21 Mar 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 017 WXY", model: "Suzuki Alto", type: "Saloon", color: "Pinki", year: "2023", ownerNida: "200208061234583", ownerName: "Hidaya Ramadhani Chiku", ownerPhone: "0788 000 111", insurance: { company: "Madison Insurance", policy: "MAD-2026-01789", expires: "14 Nov 2028", valid: true }, inspectionExpiry: "05 Nov 2028", registrationExpiry: "14 Nov 2028", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 018 ZAB", model: "Toyota Premio", type: "Saloon", color: "Mwekundu wa Giza", year: "2018", ownerNida: "198905231234584", ownerName: "Nassoro Kombo Mataka", ownerPhone: "0712 222 333", insurance: { company: "Jubilee Insurance", policy: "JUB-2025-01890", expires: "07 Jan 2026", valid: false }, inspectionExpiry: "01 Jan 2026", registrationExpiry: "07 Jan 2026", accidentInvolved: true, violations: [{ id: 1, name: "Gari bila Bima", date: "15 Mei 2026", area: "Goba", fine: "TZS 200,000", paid: false }], outstandingFines: 200000 },
  { plate: "T 019 CDE", model: "Toyota Dyna (Lori)", type: "Lori", color: "Bluu na Nyeupe", year: "2014", ownerNida: "197503311234585", ownerName: "Twaha Mrisho Lukindo", ownerPhone: "0755 444 555", insurance: { company: "GA Insurance", policy: "GA-2026-01901", expires: "19 Apr 2027", valid: true }, inspectionExpiry: "10 Apr 2027", registrationExpiry: "19 Apr 2027", accidentInvolved: false, violations: [], outstandingFines: 0 },
  { plate: "T 020 FGH", model: "Toyota RAV4", type: "SUV", color: "Nyeupe ya Lulu", year: "2024", ownerNida: "199704121234586", ownerName: "Zainab Hemed Singida", ownerPhone: "0766 333 444", insurance: { company: "Strategies Insurance", policy: "STR-2026-02012", expires: "28 Oct 2028", valid: true }, inspectionExpiry: "20 Oct 2028", registrationExpiry: "28 Oct 2028", accidentInvolved: false, violations: [], outstandingFines: 0 },
];

// ── 20 DEVICES — linked to citizens ─────────────────────────
export const MOCK_DEVICES: MockDevice[] = [
  { serialNo: "SM-S928B-TZ-001", imei: "358423092847001", description: "Samsung Galaxy S24 Ultra — Nyeusi", category: "simu", ownerNida: "199012031234567", ownerName: "Juma Khamis Mwinyi", ownerPhone: "0712 345 678", status: "clean" },
  { serialNo: "DNPXK-TZ-002", imei: "352098103456002", description: "iPhone 15 Pro — Dhahabu", category: "simu", ownerNida: "199507081234568", ownerName: "Fatuma Hassan Mwanga", ownerPhone: "0754 123 456", status: "stolen", reportDate: "10 Mei 2026" },
  { serialNo: "SM-A546E-TZ-003", imei: "358423092847003", description: "Samsung Galaxy A54 — Njano ya Kupendeza", category: "simu", ownerNida: "198803221234569", ownerName: "Ali Mohamed Salum", ownerPhone: "0712 987 654", status: "clean" },
  { serialNo: "CPH2551-TZ-004", imei: "869912034567004", description: "OPPO Reno 11 — Nyeupe ya Jadi", category: "simu", ownerNida: "199209141234570", ownerName: "Grace Amina Mushi", ownerPhone: "0766 456 789", status: "clean" },
  { serialNo: "CNF-HP-TZ-005", imei: "N/A", description: "HP Laptop 15s-fq5 — Fedha", category: "kompyuta", ownerNida: "197612301234571", ownerName: "Saidi Omari Bakari", ownerPhone: "0788 321 654", status: "stolen", reportDate: "08 Mei 2026" },
  { serialNo: "SM-T500-TZ-006", imei: "354513069012006", description: "Samsung Galaxy Tab A7 — Fedha Nyepesi", category: "simu", ownerNida: "200101151234572", ownerName: "Amina Said Juma", ownerPhone: "0755 789 012", status: "clean" },
  { serialNo: "POCO-X6-TZ-007", imei: "863947056789007", description: "Xiaomi Poco X6 Pro — Nyeusi ya Mkaa", category: "simu", ownerNida: "200005121234573", ownerName: "Baraka John Mwanga", ownerPhone: "0788 654 321", status: "clean" },
  { serialNo: "ASUS-TUF-TZ-008", imei: "N/A", description: "ASUS TUF Gaming Laptop F15 — Giza", category: "kompyuta", ownerNida: "198506201234574", ownerName: "Zawadi Kimani Ochieng", ownerPhone: "0712 111 333", status: "clean" },
  { serialNo: "DNPXK-TZ-009", imei: "352098103456009", description: "iPhone 14 — Midnait Nyeusi", category: "simu", ownerNida: "197805091234575", ownerName: "Hamisi Rashid Omar", ownerPhone: "0766 222 444", status: "stolen", reportDate: "15 Mar 2026" },
  { serialNo: "TECNO-TZ-010", imei: "358741023456010", description: "Tecno Camon 30 Pro — Bluu ya Anga", category: "simu", ownerNida: "199203151234576", ownerName: "Rashid Omari Said", ownerPhone: "0755 321 654", status: "clean" },
  { serialNo: "SM-S928B-TZ-011", imei: "358423092847011", description: "Samsung Galaxy S23 — Nyeupe ya Cream", category: "simu", ownerNida: "199811271234577", ownerName: "Mariamu Ally Komba", ownerPhone: "0712 555 666", status: "found", reportDate: "05 Apr 2026" },
  { serialNo: "DELL-I5-TZ-012", imei: "N/A", description: "Dell Inspiron 15 3520 — Fedha", category: "kompyuta", ownerNida: "198210081234578", ownerName: "Omari Hassan Kitwana", ownerPhone: "0766 777 888", status: "clean" },
  { serialNo: "INFINIX-TZ-013", imei: "359047012345013", description: "Infinix Note 40 Pro — Kijani cha Misitu", category: "simu", ownerNida: "199604031234579", ownerName: "Pendo Mkwawa Haji", ownerPhone: "0788 999 000", status: "clean" },
  { serialNo: "NOKIA-TZ-014", imei: "351456087890014", description: "Nokia G60 5G — Bluu ya Bahari", category: "simu", ownerNida: "197001171234580", ownerName: "Yusuph Issa Majaliwa", ownerPhone: "0712 444 555", status: "clean" },
  { serialNo: "OPPO-TZ-015", imei: "869374056789015", description: "OPPO A98 5G — Matunda ya Fedha", category: "simu", ownerNida: "199309251234581", ownerName: "Sikudhani Mwema Nyota", ownerPhone: "0755 666 777", status: "clean" },
  { serialNo: "APPLE-MBP-TZ-016", imei: "N/A", description: "MacBook Pro M3 — Fedha ya Anga", category: "kompyuta", ownerNida: "198107141234582", ownerName: "Masoud Ally Mapunda", ownerPhone: "0766 888 999", status: "clean" },
  { serialNo: "SM-F946B-TZ-017", imei: "354223098765017", description: "Samsung Galaxy Z Fold5 — Cream", category: "simu", ownerNida: "200208061234583", ownerName: "Hidaya Ramadhani Chiku", ownerPhone: "0788 000 111", status: "clean" },
  { serialNo: "VIVO-TZ-018", imei: "864523012345018", description: "Vivo V29 5G — Jewel Red", category: "simu", ownerNida: "198905231234584", ownerName: "Nassoro Kombo Mataka", ownerPhone: "0712 222 333", status: "stolen", reportDate: "01 Mei 2026" },
  { serialNo: "HONOR-TZ-019", imei: "352789045678019", description: "Honor X8b — Titanium Silver", category: "simu", ownerNida: "197503311234585", ownerName: "Twaha Mrisho Lukindo", ownerPhone: "0755 444 555", status: "clean" },
  { serialNo: "REAL-TZ-020", imei: "868412034567020", description: "Realme 12 Pro+ — Submarine Blue", category: "simu", ownerNida: "199704121234586", ownerName: "Zainab Hemed Singida", ownerPhone: "0766 333 444", status: "clean" },
];

// ── LOOKUP HELPERS ────────────────────────────────────────────
// Cross-link: assign vehicles and devices to their citizens
MOCK_CITIZENS.forEach((c) => {
  c.vehicles = MOCK_VEHICLES.filter((v) => v.ownerNida === c.nida);
  c.devices  = MOCK_DEVICES.filter((d) => d.ownerNida === c.nida);
});

/** Find a citizen by any searchable field */
export function lookupCitizen(query: string): MockCitizen | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  return MOCK_CITIZENS.find((c) =>
    c.name.toLowerCase().includes(q) ||
    c.nida === query.trim() ||
    c.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
    c.licenseNo.toLowerCase() === q ||
    c.passportNo.toLowerCase() === q
  ) ?? null;
}

/** Find a vehicle by plate */
export function lookupVehicle(query: string): MockVehicle | null {
  const q = query.trim().toUpperCase().replace(/\s+/g, " ");
  return MOCK_VEHICLES.find((v) =>
    v.plate.toUpperCase().replace(/\s+/g, " ") === q ||
    v.plate.toUpperCase().replace(/\s/g, "").includes(q.replace(/\s/g, ""))
  ) ?? null;
}

/** Find a device by serial number or IMEI */
export function lookupDevice(query: string): MockDevice | null {
  const q = query.trim().toLowerCase();
  return MOCK_DEVICES.find((d) =>
    d.serialNo.toLowerCase().includes(q) ||
    d.imei.includes(q)
  ) ?? null;
}

/** Universal search across all records */
export function universalSearch(query: string): { citizen: MockCitizen | null; vehicle: MockVehicle | null; device: MockDevice | null } {
  const q = query.trim();
  const vehicle  = lookupVehicle(q);
  const ownerOfVehicle = vehicle ? MOCK_CITIZENS.find((c) => c.nida === vehicle.ownerNida) ?? null : null;
  const citizen  = ownerOfVehicle ?? lookupCitizen(q);
  const device   = lookupDevice(q);
  return { citizen, vehicle, device };
}

// ── IN-SESSION NEW RECORDS (added by officers during session) ─
export interface NewVehicleRecord {
  id: string;
  plate: string;
  model: string;
  type: string;
  color: string;
  year: string;
  ownerName: string;
  ownerNida: string;
  ownerPhone: string;
  ownerLicense: string;
  station: string;
  addedBy: string;
  addedAt: string;
  notes: string;
}

export interface NewCitizenRecord {
  id: string;
  name: string;
  nida: string;
  mobile: string;
  gender: string;
  dob: string;
  address: string;
  occupation: string;
  station: string;
  addedBy: string;
  addedAt: string;
  notes: string;
}

// In-memory store for officer-added records (session only)
export const newVehicleRecords: NewVehicleRecord[] = [];
export const newCitizenRecords: NewCitizenRecord[] = [];

export function saveNewVehicle(r: Omit<NewVehicleRecord, "id" | "addedAt">): NewVehicleRecord {
  const record = { ...r, id: `VEH-NEW-${Date.now()}`, addedAt: new Date().toISOString() };
  newVehicleRecords.unshift(record);
  return record;
}

export function saveNewCitizen(r: Omit<NewCitizenRecord, "id" | "addedAt">): NewCitizenRecord {
  const record = { ...r, id: `CIT-NEW-${Date.now()}`, addedAt: new Date().toISOString() };
  newCitizenRecords.unshift(record);
  return record;
}

// ── INPUT VALIDATION HELPERS ──────────────────────────────────
export type ValidationResult = { valid: boolean; error: string };

/** Tanzania plate: T NNN XYZ or T NNN XYZW — flexible */
export function validatePlate(v: string): ValidationResult {
  const clean = v.trim().toUpperCase().replace(/\s+/g, " ");
  if (!clean) return { valid: false, error: "Ingiza namba ya gari" };
  // TZ plates: T followed by 3 digits and 2-4 letters, with optional space
  if (!/^T\s?\d{2,4}\s?[A-Z]{2,4}$/.test(clean.replace(/\s/g, "")))
    return { valid: false, error: "Fomati sahihi: T 001 ABC au T123ABC" };
  return { valid: true, error: "" };
}

/** Tanzania driving license: DL + 6+ digits + TZ */
export function validateLicense(v: string): ValidationResult {
  const clean = v.trim().toUpperCase();
  if (!clean) return { valid: false, error: "Ingiza namba ya leseni" };
  if (!/^DL\d{6,}TZ$/.test(clean))
    return { valid: false, error: "Fomati sahihi: DL001001TZ" };
  return { valid: true, error: "" };
}

/** Tanzania NIDA: 15 digits */
export function validateNida(v: string): ValidationResult {
  const clean = v.trim().replace(/\s/g, "");
  if (!clean) return { valid: false, error: "Ingiza namba ya NIDA" };
  if (!/^\d{15}$/.test(clean))
    return { valid: false, error: "NIDA lazima iwe na tarakimu 15" };
  return { valid: true, error: "" };
}

/** Tanzania mobile: 07XX or 06XX, 10 digits */
export function validateMobile(v: string): ValidationResult {
  const clean = v.trim().replace(/[\s\-]/g, "");
  if (!clean) return { valid: false, error: "Ingiza namba ya simu" };
  if (!/^(07|06)\d{8}$/.test(clean))
    return { valid: false, error: "Fomati sahihi: 0712345678 au 0712 345 678" };
  return { valid: true, error: "" };
}

/** Serial/IMEI: at least 8 chars */
export function validateSerial(v: string): ValidationResult {
  const clean = v.trim();
  if (!clean) return { valid: false, error: "Ingiza namba ya serial au IMEI" };
  if (clean.length < 8)
    return { valid: false, error: "Namba ya serial lazima iwe na herufi angalau 8" };
  return { valid: true, error: "" };
}

/** Name: at least 3 chars, two words */
export function validateName(v: string): ValidationResult {
  const clean = v.trim();
  if (!clean) return { valid: false, error: "Ingiza jina la mtu" };
  if (clean.length < 3) return { valid: false, error: "Jina ni fupi sana" };
  if (!clean.includes(" ")) return { valid: false, error: "Ingiza jina na jina la ukoo" };
  return { valid: true, error: "" };
}

/** Get suggestions from mock data based on partial input */
export function getSuggestions(query: string, type: "plate" | "license" | "nida" | "name" | "mobile" | "serial"): string[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  if (type === "plate") return MOCK_VEHICLES.map((v) => v.plate).filter((p) => p.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, ""))).slice(0, 4);
  if (type === "license") return MOCK_CITIZENS.map((c) => c.licenseNo).filter((l) => l.toLowerCase().includes(q)).slice(0, 4);
  if (type === "nida") return MOCK_CITIZENS.map((c) => c.nida).filter((n) => n.includes(q)).slice(0, 4);
  if (type === "name") return MOCK_CITIZENS.map((c) => c.name).filter((n) => n.toLowerCase().includes(q)).slice(0, 5);
  if (type === "mobile") return MOCK_CITIZENS.map((c) => c.mobile).filter((m) => m.replace(/\s/g, "").includes(q.replace(/\s/g, ""))).slice(0, 4);
  if (type === "serial") {
    const sn = MOCK_DEVICES.map((d) => d.serialNo).filter((s) => s.toLowerCase().includes(q));
    const imei = MOCK_DEVICES.map((d) => d.imei).filter((i) => i !== "N/A" && i.includes(q));
    return [...sn, ...imei].slice(0, 4);
  }
  return [];
}
