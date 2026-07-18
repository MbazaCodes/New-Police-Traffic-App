// ============================================================
// TZ POLICE MOCK ENGINE — SINGLE SOURCE OF TRUTH
// Role Engine + Session Storage + Simulation
// DO NOT CREATE NEW DATA — reads existing mock databases only.
// ============================================================

import { MOCK_CITIZENS, MOCK_VEHICLES, MOCK_DEVICES } from "./mock-database";

export type AppRole =
  | "officer-traffic" | "officer-general" | "admin" | "commander"
  | "national-commissioner" | "regional-commissioner"
  | "district-commissioner" | "station-commissioner" | "post-officer"
  | "cid-officer" | "cyber-crime" | "immigration-liaison" | "prison-liaison"
  | "emergency-dispatcher" | "evidence-officer" | "investigation-supervisor"
  | "audit-officer" | "dig";

// ── ROLE USERS (source of truth — no hardcoding) ─────────────
export interface RoleUser {
  id: string; name: string; shortName: string; username: string; mobile: string;
  role: AppRole; rank: string; rankShort: string; station: string; stationId: string;
  region: string; unit: string; photo: string; email: string; badgeNo: string;
  status: "active"|"break"|"off-duty"|"patrol"; joined: string;
}

function av(name: string, gender: "Mme"|"Mke" = "Mme"): string {
  const initials = name.split(" ").slice(0,2).map((w) => w[0].toUpperCase()).join("");
  const bg = gender === "Mke" ? "880E4F" : "1E3A8A";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=128&bold=true&font-size=0.45`;
}

export const ROLE_USERS: RoleUser[] = [
  { id:"TP001", name:"Cprl. Juma Khamis Mwinyi",     shortName:"Cprl. Juma",    username:"juma.mwinyi",     mobile:"0712 345 678", role:"officer-traffic",       rank:"Corporal",                        rankShort:"Cprl.", station:"Kituo Kikuu cha Polisi DSM",  stationId:"ST-001", region:"Dar es Salaam", unit:"Trafiki - Ilala Zone",         status:"active",    photo:av("Juma Mwinyi"),           email:"juma.mwinyi@polisi.go.tz",   badgeNo:"TP123456", joined:"15 Mar 2019" },
  { id:"TP002", name:"Sgt. Ali Hassan Salum",         shortName:"Sgt. Ali",      username:"ali.hassan",      mobile:"0788 123 456", role:"officer-traffic",       rank:"Sergeant",                        rankShort:"Sgt.", station:"Kituo cha Polisi Ilala",      stationId:"ST-002", region:"Dar es Salaam", unit:"Trafiki - Ilala Zone",         status:"active",    photo:av("Ali Hassan"),            email:"ali.hassan@polisi.go.tz",    badgeNo:"TP234567", joined:"02 Jun 2017" },
  { id:"TP003", name:"Sgt. Fatuma Hassan Komba",      shortName:"Sgt. Fatuma",   username:"fatuma.hassan",   mobile:"0722 777 888", role:"officer-traffic",       rank:"Sergeant",                        rankShort:"Sgt.", station:"Kituo cha Polisi Kinondoni",  stationId:"ST-003", region:"Dar es Salaam", unit:"Trafiki - Kinondoni Zone",     status:"patrol",    photo:av("Fatuma Hassan","Mke"),   email:"fatuma.hassan@polisi.go.tz", badgeNo:"TP345678", joined:"10 Jan 2020" },
  { id:"TP004", name:"Cprl. Saidi Juma Bakari",       shortName:"Cprl. Saidi",   username:"saidi.juma",      mobile:"0755 111 222", role:"officer-traffic",       rank:"Corporal",                        rankShort:"Cprl.", station:"Kituo cha Polisi Temeke",     stationId:"ST-004", region:"Dar es Salaam", unit:"Trafiki - Temeke Zone",        status:"break",     photo:av("Saidi Juma"),            email:"saidi.juma@polisi.go.tz",    badgeNo:"TP456789", joined:"07 Aug 2021" },
  { id:"TP005", name:"Cpl. Mariamu Ally Komba",       shortName:"Cpl. Mariamu",  username:"mariamu.ally",    mobile:"0744 333 444", role:"officer-traffic",       rank:"Corporal",                        rankShort:"Cpl.", station:"Kituo cha Polisi Ubungo",     stationId:"ST-005", region:"Dar es Salaam", unit:"Trafiki - Ubungo Zone",        status:"active",    photo:av("Mariamu Ally","Mke"),    email:"mariamu.ally@polisi.go.tz",  badgeNo:"TP567890", joined:"20 Feb 2022" },
  { id:"GO001", name:"Insp. Grace Amina Mushi",       shortName:"Insp. Grace",   username:"grace.mushi",     mobile:"0766 987 654", role:"officer-general",       rank:"Inspector",                       rankShort:"Insp.", station:"Kituo cha Polisi Kinondoni", stationId:"ST-003", region:"Dar es Salaam", unit:"Uhalifu - Kinondoni Zone",     status:"active",    photo:av("Grace Mushi","Mke"),     email:"grace.mushi@polisi.go.tz",   badgeNo:"GO123456", joined:"12 Sep 2016" },
  { id:"GO002", name:"Insp. Hamisi Rashid Omar",      shortName:"Insp. Hamisi",  username:"hamisi.rashid",   mobile:"0733 555 666", role:"officer-general",       rank:"Inspector",                       rankShort:"Insp.", station:"Kituo cha Polisi Ubungo",    stationId:"ST-005", region:"Dar es Salaam", unit:"Uhalifu - Ubungo Zone",        status:"off-duty",  photo:av("Hamisi Rashid"),         email:"hamisi.rashid@polisi.go.tz", badgeNo:"GO234567", joined:"03 Apr 2015" },
  { id:"GO003", name:"Cprl. Emmanuel Joseph Mapunda", shortName:"Cprl. Emmanuel",username:"emmanuel.joseph", mobile:"0711 999 000", role:"officer-general",       rank:"Corporal",                        rankShort:"Cprl.", station:"Kituo cha Polisi Ilala",     stationId:"ST-002", region:"Dar es Salaam", unit:"Doria - Ilala Zone",           status:"patrol",    photo:av("Emmanuel Joseph"),       email:"emmanuel.joseph@polisi.go.tz",badgeNo:"GO345678",joined:"18 Nov 2020" },
  { id:"GO004", name:"Cprl. Zawadi Kimani Ochieng",   shortName:"Cprl. Zawadi",  username:"zawadi.kimani",   mobile:"0712 111 333", role:"officer-general",       rank:"Corporal",                        rankShort:"Cprl.", station:"Kituo Kikuu cha Polisi DSM", stationId:"ST-001", region:"Dar es Salaam", unit:"Doria - Ilala Zone",           status:"active",    photo:av("Zawadi Kimani","Mke"),   email:"zawadi.kimani@polisi.go.tz", badgeNo:"GO456789", joined:"25 Jul 2021" },
  { id:"GO005", name:"Cst. Baraka John Mwanga",       shortName:"Cst. Baraka",   username:"baraka.john",     mobile:"0788 654 321", role:"officer-general",       rank:"Constable",                       rankShort:"Cst.", station:"Kituo cha Polisi Temeke",    stationId:"ST-004", region:"Dar es Salaam", unit:"Uhalifu - Temeke Zone",        status:"active",    photo:av("Baraka John"),           email:"baraka.john@polisi.go.tz",   badgeNo:"GO567890", joined:"09 Mar 2023" },
  { id:"ADM001",name:"ACP. Mariam Juma Ally",         shortName:"ACP. Mariam",   username:"mariam.juma",     mobile:"0766 100 200", role:"admin",                 rank:"Assistant Commissioner of Police",rankShort:"ACP.", station:"Makao Makuu - DSM",           stationId:"ST-HQ",  region:"Makao Makuu",   unit:"Usimamizi wa Mfumo",           status:"active",    photo:av("Mariam Juma","Mke"),     email:"mariam.juma@polisi.go.tz",   badgeNo:"ADM-002",  joined:"01 Jan 2014" },
  { id:"NC001", name:"IGP. Saidi Hassan Waziri",      shortName:"IGP. Waziri",   username:"igp.waziri",      mobile:"0766 000 001", role:"national-commissioner", rank:"Inspector General of Police",     rankShort:"IGP.", station:"Makao Makuu ya Polisi DSM",  stationId:"ST-HQ",  region:"Taifa",         unit:"Uongozi wa Kitaifa",           status:"active",    photo:av("Saidi Waziri"),          email:"igp@polisi.go.tz",           badgeNo:"IGP-001",  joined:"15 Feb 2012" },
  { id:"RC001", name:"CP. Omari Hassan Kitwana",      shortName:"CP. DSM",       username:"cp.dsm",          mobile:"0766 001 001", role:"regional-commissioner", rank:"Commissioner of Police",          rankShort:"CP.",  station:"Makao Makuu - DSM",           stationId:"ST-R01", region:"Dar es Salaam", unit:"Uongozi wa Mkoa - DSM",        status:"active",    photo:av("Omari Kitwana"),         email:"cp.dsm@polisi.go.tz",        badgeNo:"CP-DSM",   joined:"10 Mar 2015" },
  { id:"RC002", name:"CP. Pendo Mkwawa Haji",         shortName:"CP. Arusha",    username:"cp.arusha",       mobile:"0766 002 001", role:"regional-commissioner", rank:"Commissioner of Police",          rankShort:"CP.",  station:"Makao Makuu - Arusha",        stationId:"ST-R02", region:"Arusha",        unit:"Uongozi wa Mkoa - Arusha",     status:"active",    photo:av("Pendo Mkwawa","Mke"),    email:"cp.arusha@polisi.go.tz",     badgeNo:"CP-ARU",   joined:"05 Jul 2016" },
  { id:"RC003", name:"CP. Masoud Ally Mapunda",       shortName:"CP. Mwanza",    username:"cp.mwanza",       mobile:"0766 003 001", role:"regional-commissioner", rank:"Commissioner of Police",          rankShort:"CP.",  station:"Makao Makuu - Mwanza",        stationId:"ST-R03", region:"Mwanza",        unit:"Uongozi wa Mkoa - Mwanza",     status:"active",    photo:av("Masoud Ally"),           email:"cp.mwanza@polisi.go.tz",     badgeNo:"CP-MWZ",   joined:"20 Jan 2017" },
  { id:"RC004", name:"CP. Nassoro Kombo Mataka",      shortName:"CP. Dodoma",    username:"cp.dodoma",       mobile:"0766 004 001", role:"regional-commissioner", rank:"Commissioner of Police",          rankShort:"CP.",  station:"Makao Makuu - Dodoma",        stationId:"ST-R04", region:"Dodoma",        unit:"Uongozi wa Mkoa - Dodoma",     status:"active",    photo:av("Nassoro Kombo"),         email:"cp.dodoma@polisi.go.tz",     badgeNo:"CP-DOD",   joined:"14 Aug 2018" },
  { id:"RC005", name:"CP. Hidaya Ramadhani Chiku",    shortName:"CP. Iringa",    username:"cp.iringa",       mobile:"0766 005 001", role:"regional-commissioner", rank:"Commissioner of Police",          rankShort:"CP.",  station:"Makao Makuu - Iringa",        stationId:"ST-R05", region:"Iringa",        unit:"Uongozi wa Mkoa - Iringa",     status:"active",    photo:av("Hidaya Chiku","Mke"),    email:"cp.iringa@polisi.go.tz",     badgeNo:"CP-IRI",   joined:"30 Sep 2019" },
  { id:"SC001", name:"CSP. Yusuph Issa Majaliwa",     shortName:"CSP. Yusuph",   username:"csp.kikuu",       mobile:"0712 030 001", role:"station-commissioner",  rank:"Chief Superintendent",            rankShort:"CSP.", station:"Kituo Kikuu cha Polisi DSM",  stationId:"ST-001", region:"Dar es Salaam", unit:"Uongozi wa Kituo - Kikuu",     status:"active",    photo:av("Yusuph Majaliwa"),       email:"csp.kikuu@polisi.go.tz",     badgeNo:"CSP-001",  joined:"22 Mar 2014" },
  { id:"SC002", name:"CSP. Sikudhani Mwema Nyota",    shortName:"CSP. Sikudhani",username:"csp.ilala",       mobile:"0755 030 002", role:"station-commissioner",  rank:"Chief Superintendent",            rankShort:"CSP.", station:"Kituo cha Polisi Ilala",      stationId:"ST-002", region:"Dar es Salaam", unit:"Uongozi wa Kituo - Ilala",     status:"active",    photo:av("Sikudhani Mwema","Mke"), email:"csp.ilala@polisi.go.tz",     badgeNo:"CSP-002",  joined:"16 Jul 2015" },
  { id:"PO001", name:"Insp. Rashid Omari Said",       shortName:"Insp. Rashid",  username:"insp.mwenge",     mobile:"0755 040 001", role:"post-officer",           rank:"Inspector",                       rankShort:"Insp.", station:"Posti ya Mwenge",            stationId:"PT-001", region:"Dar es Salaam", unit:"Posti - Mwenge",               status:"active",    photo:av("Rashid Omari"),          email:"rashid.mwenge@polisi.go.tz", badgeNo:"PO-001",   joined:"05 Feb 2018" },
  { id:"PO002", name:"Sgt. Amina Said Juma",          shortName:"Sgt. Amina",    username:"sgt.ubungo",      mobile:"0755 040 002", role:"post-officer",           rank:"Sergeant",                        rankShort:"Sgt.", station:"Posti ya Ubungo",            stationId:"PT-002", region:"Dar es Salaam", unit:"Posti - Ubungo Terminal",      status:"patrol",    photo:av("Amina Said","Mke"),      email:"amina.ubungo@polisi.go.tz",  badgeNo:"PO-002",   joined:"11 Oct 2019" },
];

export function lookupRoleUser(identifier: string): RoleUser | null {
  const q = identifier.trim().toLowerCase().replace(/\s/g, "");
  return ROLE_USERS.find((u) =>
    u.username.toLowerCase() === q ||
    u.mobile.replace(/\s/g, "") === q ||
    u.email.toLowerCase() === q ||
    u.badgeNo.toLowerCase() === q
  ) ?? null;
}

// ── REGIONS ───────────────────────────────────────────────────
export const REGIONS = [
  { id:"R-DSM", name:"Dar es Salaam", commissioner:"CP. Omari Hassan Kitwana",  officers:147, stations:5, incidents:34, citations:89 },
  { id:"R-ARU", name:"Arusha",        commissioner:"CP. Pendo Mkwawa Haji",     officers:62,  stations:4, incidents:12, citations:24 },
  { id:"R-MWZ", name:"Mwanza",        commissioner:"CP. Masoud Ally Mapunda",   officers:58,  stations:3, incidents:15, citations:31 },
  { id:"R-DOD", name:"Dodoma",        commissioner:"CP. Nassoro Kombo Mataka",  officers:45,  stations:3, incidents:8,  citations:18 },
  { id:"R-IRI", name:"Iringa",        commissioner:"CP. Hidaya Ramadhani Chiku",officers:38,  stations:2, incidents:6,  citations:14 },
];

// ── STATIONS ──────────────────────────────────────────────────
export const ADMIN_STATIONS = [
  { id:"ST-001", name:"Kituo Kikuu cha Polisi DSM",     region:"Dar es Salaam", district:"Ilala",       address:"Sokoine Drive, DSM",          phone:"022 211 0001", commissioner:"CSP. Yusuph Issa Majaliwa",  officersCount:42, postsCount:6, status:"active",      established:"1961" },
  { id:"ST-002", name:"Kituo cha Polisi Ilala",          region:"Dar es Salaam", district:"Ilala",       address:"Mwembe Chai, Kariakoo, DSM",  phone:"022 218 5544", commissioner:"CSP. Sikudhani Mwema Nyota", officersCount:28, postsCount:4, status:"active",      established:"1972" },
  { id:"ST-003", name:"Kituo cha Polisi Kinondoni",      region:"Dar es Salaam", district:"Kinondoni",   address:"Mwenge, Kinondoni, DSM",      phone:"022 277 3311", commissioner:"Insp. Grace Mushi",          officersCount:35, postsCount:5, status:"active",      established:"1975" },
  { id:"ST-004", name:"Kituo cha Polisi Temeke",         region:"Dar es Salaam", district:"Temeke",      address:"Temeke Street, DSM",          phone:"022 285 9922", commissioner:"Insp. Baraka John",          officersCount:22, postsCount:3, status:"active",      established:"1978" },
  { id:"ST-005", name:"Kituo cha Polisi Ubungo",         region:"Dar es Salaam", district:"Kinondoni",   address:"Ubungo Terminal, DSM",        phone:"022 243 7788", commissioner:"Sgt. Amina Said",            officersCount:20, postsCount:4, status:"maintenance", established:"1985" },
  { id:"ST-006", name:"Kituo cha Polisi Arusha Mkoani",  region:"Arusha",        district:"Arusha",      address:"Fire Road, Arusha",           phone:"027 250 1100", commissioner:"CSP. Hamisi Ally",           officersCount:38, postsCount:5, status:"active",      established:"1963" },
  { id:"ST-007", name:"Kituo cha Polisi Mwanza",         region:"Mwanza",        district:"Nyamagana",   address:"Kenyatta Road, Mwanza",       phone:"028 250 2200", commissioner:"SP. Grace Mapunda",          officersCount:31, postsCount:4, status:"active",      established:"1965" },
  { id:"ST-008", name:"Kituo cha Polisi Dodoma",         region:"Dodoma",        district:"Dodoma",      address:"Dodoma Central, Dodoma",      phone:"026 232 1100", commissioner:"CSP. Saidi Ally",            officersCount:29, postsCount:3, status:"active",      established:"1970" },
  { id:"ST-009", name:"Kituo cha Polisi Iringa",         region:"Iringa",        district:"Iringa",      address:"Iringa Town, Iringa",         phone:"026 270 1100", commissioner:"SP. Fatuma Kimaro",          officersCount:24, postsCount:3, status:"active",      established:"1968" },
  { id:"ST-010", name:"Kituo cha Polisi Iringa Vijijini",region:"Iringa",        district:"Iringa Rural", address:"Kalenga, Iringa Vijijini",   phone:"026 270 2200", commissioner:"Insp. Rashid Sanga",         officersCount:14, postsCount:2, status:"active",      established:"1980" },
];

// ── POSTS ─────────────────────────────────────────────────────
export const ADMIN_POSTS = [
  { id:"PT-001", name:"Posti ya Mwenge",          stationId:"ST-003", stationName:"Kituo cha Polisi Kinondoni", location:"Mwenge Bus Terminal",    type:"Traffic", officersCount:4, status:"active",   shift:"24/7",         officer:"Insp. Rashid Omari Said" },
  { id:"PT-002", name:"Posti ya Ubungo Terminal", stationId:"ST-005", stationName:"Kituo cha Polisi Ubungo",   location:"Ubungo Terminal",        type:"Traffic", officersCount:6, status:"active",   shift:"24/7",         officer:"Sgt. Amina Said Juma" },
  { id:"PT-003", name:"Posti ya Kariakoo Market", stationId:"ST-002", stationName:"Kituo cha Polisi Ilala",    location:"Kariakoo Market",        type:"Patrol",  officersCount:3, status:"active",   shift:"06:00-22:00",  officer:"Cprl. Emmanuel Joseph" },
  { id:"PT-004", name:"Posti ya Samora Avenue",   stationId:"ST-001", stationName:"Kituo Kikuu cha Polisi DSM",location:"Samora Avenue Junction", type:"Traffic", officersCount:5, status:"active",   shift:"24/7",         officer:"Sgt. Ali Hassan" },
  { id:"PT-005", name:"Posti ya Mbezi Beach",     stationId:"ST-003", stationName:"Kituo cha Polisi Kinondoni",location:"Mbezi Beach Road",       type:"Patrol",  officersCount:2, status:"active",   shift:"06:00-18:00",  officer:"Cpl. Mariamu Ally" },
  { id:"PT-006", name:"Posti ya Temeke Terminal", stationId:"ST-004", stationName:"Kituo cha Polisi Temeke",   location:"Temeke Bus Terminal",    type:"Traffic", officersCount:4, status:"active",   shift:"24/7",         officer:"Cprl. Saidi Juma" },
  { id:"PT-007", name:"Posti ya Mnazi Mmoja",     stationId:"ST-001", stationName:"Kituo Kikuu cha Polisi DSM",location:"Mnazi Mmoja Grounds",    type:"Patrol",  officersCount:3, status:"active",   shift:"18:00-06:00",  officer:"Cst. Baraka John" },
  { id:"PT-008", name:"Posti ya Posta Mpya",      stationId:"ST-002", stationName:"Kituo cha Polisi Ilala",    location:"Posta Mpya Junction",    type:"Traffic", officersCount:2, status:"inactive", shift:"07:00-19:00",  officer:"Cprl. Zawadi Kimani" },
];

// ── MISSING RECORDS ───────────────────────────────────────────
export interface MissingRecord {
  id:string; type:"person"|"car"|"device"; title:string; identifier:string;
  details:string; photo:string; lastSeen:string; lastSeenLocation:string;
  reportedBy:string; reportedDate:string; station:string; status:"active"|"found"|"closed";
  rewardAmount?:string; caseNo:string;
  // Person-specific
  age?:number; gender?:"Mme"|"Mke"; guardianName?:string; guardianPhone?:string;
  contactPhone?:string; riskLevel?:"high"|"medium"|"low";
  // Wanted-specific
  crime?:string; issuedDate?:string; assignedOfficer?:string;
}

export const MISSING_RECORDS: MissingRecord[] = [
  { id:"MS-001", type:"person", title:"Mtoto Aliyepotea — Amani John Mwanga",       identifier:"NIDA: Bado — Umri: Miaka 8",
    age:8, gender:"Mme", guardianName:"Baraka John Mwanga", guardianPhone:"0788 654 321", contactPhone:"0788 654 321", riskLevel:"high" as const,              details:"Mvulana mdogo, nguo za bluu na nyeupe, kiatu nyekundu. Alipotea Kariakoo Market tarehe 13 Mei 2026.",          photo:av("Amani Mwanga"),        lastSeen:"13 Mei 2026 • 15:00", lastSeenLocation:"Kariakoo Market, Ilala, DSM",       reportedBy:"Baraka John Mwanga",   reportedDate:"13 Mei 2026", station:"Kituo cha Polisi Ilala",      status:"active", caseNo:"MP-2026-0031" },
  { id:"MS-002", type:"person", title:"Mtu Anayetafutwa — Nassoro Kombo Mataka",    identifier:"NIDA: 198905231234584",
    age:37, gender:"Mme", guardianName:"N/A", guardianPhone:"N/A", contactPhone:"0766 004 001", riskLevel:"high" as const, crime:"Wizi wa Benki", issuedDate:"11 Mei 2026", assignedOfficer:"Insp. Grace Mushi",                   details:"Mshukiwa wa kesi ya wizi wa benki. Msomi mrefu, nywele fupi, ana kovu shavuni mwa kushoto.",                    photo:av("Nassoro Kombo"),       lastSeen:"10 Mei 2026 • 22:30", lastSeenLocation:"Sinza, Kinondoni, DSM",             reportedBy:"Insp. Grace Mushi",    reportedDate:"11 Mei 2026", station:"Kituo cha Polisi Kinondoni", status:"active", caseNo:"MW-2026-0029" },
  { id:"MS-003", type:"car",    title:"Gari Lililobiwa — Toyota Hiace",             identifier:"Plate: T 003 GHI",                        details:"Toyota Hiace ya rangi ya fedha, mwaka 2018. Ilibiwa Magomeni usiku wa Mei 9.",                                   photo:av("T003 GHI"),            lastSeen:"09 Mei 2026 • 23:00", lastSeenLocation:"Magomeni, Kinondoni, DSM",          reportedBy:"Ali Mohamed Salum",    reportedDate:"10 Mei 2026", station:"Kituo cha Polisi Kinondoni", status:"active", caseNo:"MV-2026-0022" },
  { id:"MS-004", type:"car",    title:"Gari Lililobiwa — Toyota Land Cruiser",      identifier:"Plate: T 005 MNO",                        details:"Land Cruiser nyeusi, mwaka 2016. Thamani USD 35,000. Ilibiwa Temeke usiku wa Mei 7.",                           photo:av("T005 MNO"),            lastSeen:"07 Mei 2026 • 02:15", lastSeenLocation:"Temeke Street, Temeke, DSM",        reportedBy:"Saidi Omari Bakari",   reportedDate:"07 Mei 2026", station:"Kituo cha Polisi Temeke",    status:"active", caseNo:"MV-2026-0018", rewardAmount:"TZS 500,000" },
  { id:"MS-005", type:"device", title:"Simu Iliyobiwa — iPhone 15 Pro",             identifier:"S/N: DNPXK-TZ-002 • IMEI: 352098103456002",details:"iPhone 15 Pro ya rangi ya dhahabu. Ilibiwa Mikocheni tarehe 10 Mei. Mmiliki: Fatuma Hassan Mwanga.",           photo:av("FH iPhone"),           lastSeen:"10 Mei 2026 • 14:30", lastSeenLocation:"Mikocheni, Kinondoni, DSM",         reportedBy:"Fatuma Hassan Mwanga", reportedDate:"10 Mei 2026", station:"Kituo cha Polisi Kinondoni", status:"active", caseNo:"MD-2026-0045" },
  { id:"MS-006", type:"device", title:"Laptop Iliyobiwa — HP 15s",                 identifier:"S/N: CNF-HP-TZ-005",                      details:"HP Laptop 15s ya rangi ya fedha. Ndani yake data muhimu za biashara. Ilibiwa kwenye gari la T 005 MNO.",       photo:av("HP Laptop"),           lastSeen:"07 Mei 2026 • 02:15", lastSeenLocation:"Temeke Street, Temeke, DSM",        reportedBy:"Saidi Omari Bakari",   reportedDate:"07 Mei 2026", station:"Kituo cha Polisi Temeke",    status:"active", caseNo:"MD-2026-0038" },
  { id:"MS-007", type:"device", title:"Simu Iliyobiwa — iPhone 14",                identifier:"S/N: DNPXK-TZ-009 • IMEI: 352098103456009",details:"iPhone 14 ya midnait nyeusi. Ilibiwa Kariakoo saa 10 usiku. Mmiliki: Hamisi Rashid Omar.",                    photo:av("HRO iPhone"),          lastSeen:"15 Mar 2026 • 22:00", lastSeenLocation:"Kariakoo Market, Ilala, DSM",       reportedBy:"Hamisi Rashid Omar",   reportedDate:"15 Mar 2026", station:"Kituo cha Polisi Ilala",      status:"active", caseNo:"MD-2026-0019" },
  { id:"MS-008", type:"person", title:"Mzee Aliyepotea — Yusuph Issa Majaliwa",    identifier:"NIDA: 197001171234580",                   details:"Mzee mwenye umri wa miaka 56, mstaafu wa polisi. Ana ugonjwa wa kisukari. Aliondoka asubuhi.",                 photo:av("Yusuph Majaliwa"),     lastSeen:"12 Mei 2026 • 07:00", lastSeenLocation:"Buguruni, Ilala, DSM",              reportedBy:"Familia ya Majaliwa",  reportedDate:"12 Mei 2026", station:"Kituo cha Polisi Ilala",      status:"found",  caseNo:"MP-2026-0028" },
];

// ── DASHBOARD DATA (derived from existing mock databases) ─────
export function getDashboardData(role: AppRole, region?: string) {
  const officers = ROLE_USERS.filter((u) => ["officer-traffic","officer-general","post-officer"].includes(u.role));
  const regionOfficers = region ? officers.filter((u) => u.region === region) : officers;
  const regionStations = region ? ADMIN_STATIONS.filter((s) => s.region === region) : ADMIN_STATIONS;
  return {
    kpis: [
      { label:"Maofisa Walioko Kazini",  value:String(officers.filter((u) => u.status==="active"||u.status==="patrol").length), sub:`kati ya ${officers.length}`,      color:"#2196F3" },
      { label:"Wanaotafutwa",            value:String(MISSING_RECORDS.filter((m) => m.status==="active").length),                sub:"watu, magari, vifaa",             color:"#EF4444" },
      { label:"Vituo vya Polisi",        value:String(regionStations.length),                                                    sub:`${ADMIN_POSTS.length} posti`,     color:"#1E3A8A" },
      { label:"Mkoa Huu — Maofisa",      value:String(regionOfficers.length),                                                    sub:region ?? "Jumla",                 color:"#10B981" },
    ],
    officers: regionOfficers,
    stations: regionStations,
    regions:  REGIONS,
    missing:  MISSING_RECORDS.filter((m) => m.status==="active").slice(0,5),
  };
}

// ── REPORT DATA (Traffic vs General) ─────────────────────────
export type ReportType = "all" | "traffic" | "general";

export function getReportData(reportType: ReportType) {
  // Dynamically import to avoid circular deps
  const { CITATION_HISTORY, ARREST_RECORDS, WARNING_RECORDS, GENERAL_INCIDENTS } = require("./police-data");
  const traffic = CITATION_HISTORY as {id:string;plate:string;offense:string;driver:string;fine:string;status:string;date:string;time:string;location:string;deductedPoints:number}[];
  const incidents = GENERAL_INCIDENTS as {id:number;title:string;type:string;status:string;statusColor:string;date:string;time:string;location:string;description:string;casualties:number;officer:string}[];
  const arrests  = ARREST_RECORDS as {id:string;suspect:string;offense:string;arrestDate:string;status:string}[];
  const warnings = WARNING_RECORDS as {id:string;recipient:string;offense:string;date:string;acknowledged:boolean}[];

  if (reportType === "traffic") return { title:"Ripoti ya Trafiki",          citations:traffic, incidents:[], arrests:[], warnings:[], totalFines: traffic.reduce((s,c)=>s+parseInt(c.fine.replace(/[^\d]/g,""),10),0), unpaidFines: traffic.filter((c)=>c.status==="Hajalipwa").reduce((s,c)=>s+parseInt(c.fine.replace(/[^\d]/g,""),10),0) };
  if (reportType === "general") return { title:"Ripoti ya Polisi Jumla",     citations:[],      incidents, arrests, warnings,        totalFines:0, unpaidFines:0 };
  return                               { title:"Ripoti ya Jumla",             citations:traffic, incidents, arrests, warnings,        totalFines: traffic.reduce((s,c)=>s+parseInt(c.fine.replace(/[^\d]/g,""),10),0), unpaidFines: traffic.filter((c)=>c.status==="Hajalipwa").reduce((s,c)=>s+parseInt(c.fine.replace(/[^\d]/g,""),10),0) };
}

export function avatarUrl(name: string, bg = "1E3A8A"): string {
  const initials = name.split(" ").filter(Boolean).slice(0,2).map((w) => w[0].toUpperCase()).join("");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=128&bold=true&font-size=0.45`;
}

export const ADMIN_KPIS = {
  officersActive: ROLE_USERS.filter((u) => u.status==="active"||u.status==="patrol").length,
  totalOfficers: ROLE_USERS.filter((u) => ["officer-traffic","officer-general","post-officer"].includes(u.role)).length,
  totalStations: ADMIN_STATIONS.length,
  totalPosts: ADMIN_POSTS.length,
  totalMissing: MISSING_RECORDS.filter((m) => m.status==="active").length,
  totalRegions: REGIONS.length,
  trafficOfficers: ROLE_USERS.filter((u) => u.role==="officer-traffic").length,
  generalOfficers: ROLE_USERS.filter((u) => u.role==="officer-general").length,
};
