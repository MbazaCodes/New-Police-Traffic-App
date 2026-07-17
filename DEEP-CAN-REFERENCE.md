# DEEP CAN — Tanzania Police Force Digital Platform
## Complete Reference Document

**Repository:** `MbazaCodes/New-Police-Traffic-App`
**Stack:** Next.js 16 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Zustand · Recharts · next-themes
**Language:** Swahili (primary) + English
**Total Files:** 1,673 | **TS/TSX Files:** 259

---

## 1. PROJECT OVERVIEW

DEEP CAN is a comprehensive **police traffic management system** for the Tanzania Police Force (Jeshi la Polisi Tanzania). It consists of:

- **Officer PWA** (`/`) — Mobile-first app for field officers (traffic & general)
- **Admin Panel** (`/admin`) — Station/user/station management
- **Command Center** (`/command`) — Real-time dashboard for commanders

### Tagline
> *"USALAMA WETU, JUKUMU LETU"* (Our Safety, Our Responsibility)

---

## 2. USER ROLES

| Role | ID | Description | Nav |
|------|-----|-------------|-----|
| Traffic Officer | `officer-traffic` | Handles traffic violations, citations, vehicle inspections | 5-tab bottom nav |
| General Officer | `officer-general` | Handles general crime, incidents, arrests | 4-tab bottom nav |
| Admin | `admin` | Manages users, stations, posts, assignments | Desktop sidebar (5 items) |
| Commander | `commander` | Full command center with live dashboard | Desktop sidebar (13 items) |

---

## 3. DESIGN SYSTEM

### 3.1 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--police-bg` | `#F5F5F5` | `#0B1120` | Page background |
| `--police-card` | `#FFFFFF` | `#1E293B` | Card/panel backgrounds |
| `--police-card-muted` | `#F9FAFB` | `#334155` | Muted card areas |
| `--police-text` | `#1A1A1A` | `#F1F5F9` | Primary text |
| `--police-text-muted` | `#6B7280` | `#94A3B8` | Secondary text |
| `--police-text-faint` | `#9CA3AF` | `#64748B` | Placeholder/tertiary text |
| `--police-navy` | `#1A237E` | `#93C5FD` | Brand navy / headings |
| `--police-navy-2` | `#002B5C` | `#BFDBFE` | Deep navy accent |
| `--police-border` | `#E5E7EB` | `#334155` | Borders |
| `--police-border-soft` | `#F3F4F6` | `#1E293B` | Subtle borders |
| `--police-input` | `#F9FAFB` | `#0F172A` | Input backgrounds |

### 3.2 Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2196F3` | Active states, links, primary actions |
| Deep Blue | `#0070C0` | Login buttons, accents |
| Navy | `#1A237E` | Headings, important text, citation buttons |
| Red | `#F44336` / `#EF4444` | Errors, urgent alerts, unpaid, SOS, danger |
| Green | `#10B981` / `#4CAF50` | Success, paid, valid, online status |
| Orange | `#FF9800` / `#F97316` | Warnings, pending, active incidents |
| Purple | `#7C3AED` / `#9C27B0` | Arrest, arrests, special badges |
| Violet | `#8B5CF6` | Search, secondary actions |

### 3.3 Typography Scale (Mobile-First)

| Size | Class | Usage |
|------|-------|-------|
| 8px | `text-[8px]` | Sub-labels, faint text |
| 9px | `text-[9px]` | Badges, timestamps, fine print |
| 10px | `text-[10px]` | Secondary info, metadata |
| 11px | `text-[11px]` | Labels, muted descriptions |
| 12px | `text-[12px]` | Body text, form labels |
| 13px | `text-[13px]` | Primary body, list items |
| 14px | `text-[14px]` | Section headings |
| 15px | `text-[15px]` | Buttons, input text |
| 16px | `text-[16px]` | Card values, stat numbers |
| 17px | `text-[17px]` | Page titles |
| 18px | `text-[18px]` | Large numbers, stat values |
| 19px | `text-[19px]` | Modal titles |
| 20px | `text-[20px]` | Hero text, officer name |
| 22px | `text-[22px]` | App name on login |
| 40px | `text-[40px]` | Patrol timer |
| 48px | `text-[48px]` | Loading icons |

### 3.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Small elements, buttons, inputs |
| `rounded-xl` | 12px | Cards, form fields, chips |
| `rounded-2xl` | 16px | Major cards, sections, modals |
| `rounded-full` | 9999px | Avatars, badges, status dots |

### 3.5 Shadows

| Pattern | Usage |
|---------|-------|
| `shadow-sm` | Cards, list items |
| `shadow-md` | Buttons, elevated cards |
| `shadow-lg` | Modals, hero sections |
| `shadow-[0_4px_16px_rgba(0,0,0,0.08)]` | Elevated card with custom shadow |
| `shadow-[0_4px_12px_rgba(0,0,0,0.06)]` | Subtle card elevation |
| `shadow-[#color]/30` | Colored glow (e.g., `shadow-[#2196F3]/30`) |

### 3.6 Custom Tailwind Utilities

```css
@utility bg-police { background-color: var(--police-bg); }
@utility bg-police-card { background-color: var(--police-card); }
@utility bg-police-muted { background-color: var(--police-card-muted); }
@utility bg-police-input { background-color: var(--police-input); }
@utility text-police { color: var(--police-text); }
@utility text-police-muted { color: var(--police-text-muted); }
@utility text-police-faint { color: var(--police-text-faint); }
@utility text-police-navy { color: var(--police-navy); }
@utility text-police-navy2 { color: var(--police-navy-2); }
@utility border-police { border-color: var(--police-border); }
@utility border-police-soft { border-color: var(--police-border-soft); }
```

### 3.7 Animations

```css
/* Screen transition */
.police-screen-enter {
  animation: policeFadeIn 0.25s ease-out;
}
@keyframes policeFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hidden scrollbar for app-like feel */
.app-scroll::-webkit-scrollbar { width: 0; height: 0; }
.app-scroll { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## 4. NAVIGATION ARCHITECTURE

### 4.1 Officer PWA — Traffic Officer Bottom Nav

| Tab | Screen ID | Swahili Label | Icon |
|-----|-----------|---------------|------|
| Home | `home` | Nyumbani | `Home` |
| Traffic | `traffic` | Trafiki | `Car` |
| Patrol | `patrol` | Patroli | `Shield` |
| Alerts | `alerts` | Arifa | `Bell` |
| Profile | `profile` | Akaunti | `User` |

### 4.2 Officer PWA — General Officer Bottom Nav

| Tab | Screen ID | Swahili Label | Icon |
|-----|-----------|---------------|------|
| Home | `home` | Nyumbani | `Home` |
| Police | `traffic` | Polisi | `Shield` |
| Alerts | `alerts` | Arifa | `Bell` |
| Profile | `profile` | Akaunti | `User` |

### 4.3 Admin Sidebar

| Screen | Swahili Label | Icon |
|--------|---------------|------|
| `users` | Watumiaji | `Users` |
| `stations` | Vituo | `Building2` |
| `posts` | Posti | `Network` |
| `assignments` | Mgao | `ArrowRightLeft` |
| `settings` | Mipangilio | `Settings` |

### 4.4 Commander Sidebar

| Screen | Swahili Label | Icon | Badge |
|--------|---------------|------|-------|
| `dashboard` | Dashboard | `LayoutDashboard` | — |
| `officers` | Maofisa | `Users` | — |
| `incidents` | Matukio | `AlertTriangle` | 5 |
| `citations` | Citations | `FileText` | — |
| `patrols` | Patroli | `Shield` | 5 |
| `alerts` | Arifa | `Bell` | 3 |
| `reports` | Ripoti | `BarChart3` | — |
| `detained-citizens` | Wafungwa | `Shield` | 3 |
| `users` | Watumiaji | `Users` | — |
| `stations` | Vituo | `Building2` | — |
| `posts` | Posti | `Network` | 1 |
| `assignments` | Mgao | `ArrowRightLeft` | 3 |
| `settings` | Mipangilio | `Settings` | — |

### 4.5 Screens Without Bottom Nav

These screens hide the bottom navigation:
```
login, accident-report, vehicle-inspection, search-results,
pf3, citation, history, citizen-search-results,
arrest-form, warning-form, lost-property, driver-points,
incident-detail, offense-detail, citation-detail, edit-profile,
sos-request, incident-view, citizen-detail, add-vehicle, add-citizen
```

---

## 5. ALL OFFICER PWA SCREENS (27)

### 5.1 Login Screen (`login`)
- **File:** `src/components/police/screens/login-screen.tsx`
- **Mode:** `officer` (default) or `admin`
- **Features:**
  - Role selector (Traffic Officer / General Officer / Admin / Commander)
  - Login method toggle (Username / Mobile Number)
  - 3-step flow: Credentials → OTP → Success
  - OTP: 6-digit input with auto-advance, paste support, 45s resend timer
  - Background SVG cityscape overlay
  - Police logo (112×112)
  - Cross-app links (Officer ↔ Admin/Command)
  - Footer text: "Mfumo salama wa Jeshi la Polisi Tanzania"

### 5.2 Home Screen (`home`)
- **File:** `src/components/police/screens/home-screen.tsx`
- **Features:**
  - Gradient header (Navy → Blue) with officer welcome
  - Alert bell with unread badge
  - Hero card with police logo and motto
  - 4 stat cards (Makosa Yangu, Haijalipwa, Kizuizini, Patroli Leo)
  - 2 quick action buttons (Camera OCR Scan, QR Scan)
  - Tabbed search: Namba Gari (Plate) | Leseni (License) | NIDA
  - Real-time validation with error messages
  - Auto-suggestions dropdown
  - Search button with loading state
  - Recent offenses list (3 items, clickable → offense-detail)
  - Navigates to `search-results` or `citizen-search-results`

### 5.3 Traffic Screen (`traffic`)
- **File:** `src/components/police/screens/traffic-screen.tsx`
- **Features:**
  - TopAppBar with theme toggle
  - 4 stat cards in grid (Jumla ya Makosa, Inasubiri, Imelipwa, Jumla ya Faini)
  - 6 quick action buttons in 3×2 grid:
    1. Ripoti Tukio → `incident-detail`
    2. Tafuta Raia → `citizen-search-results`
    3. Rekodi Taarifa → `citation`
    4. Kamata Mtuhumiwa → `arrest-form`
    5. Ripoti Ajali → `accident-report`
    6. Historia → `history`
  - Recent offenses list (clickable → offense-detail)
  - "Angalia Zote" link → history

### 5.4 Patrol Screen (`patrol`)
- **File:** `src/components/police/screens/patrol-screen.tsx`
- **Features:**
  - Live patrol timer (HH:MM:SS) with start/stop
  - Green pulsing dot when active
  - Patrol type selector: 🚗 Gari | 🚶 Miguu | 🚲 Baiskeli
  - Stats: Today's patrols, Total, Time today, Photos
  - Stop → Report form:
    - Date/Time (auto-filled)
    - Area/Zone (required, with MapPin icon)
    - Patrol Objective
    - Events observed (textarea)
    - Photo evidence upload (multi-file, preview, delete)
    - Submit button → saves PatrolRecord
  - Patrol history list (area, date, duration, photos)
  - Success banner after submission

### 5.5 Alerts Screen (`alerts`)
- **File:** `src/components/police/screens/alerts-screen.tsx`
- **Features:**
  - 3 stat cards (Jumla, Haijasomwa, Kesi Zangu)
  - 2 action buttons: SOS (red) | Kikosi Chat (green)
  - Filter tabs: Yote | Zangu | Muhimu
  - "Soma Zote" (Mark All Read) button
  - Expandable alert cards with:
    - Color-coded left border for unread
    - Icon, title, time, message preview
    - Source with colored dot
    - Expand/collapse with chevron rotation
    - Full message + metadata when expanded
    - "MUHIMU" badge for important alerts
  - **SOS Modal** (bottom sheet):
    - Type selector: Msaada wa Ziada | Dharura ya Matibabu | Tishio la Usalama | Ajali
    - Location input (required)
    - Additional notes
    - Send with animation
  - **Squad Chat** (full-screen modal):
    - Chat header with message count
    - Message bubbles (mine = blue right, others = card left)
    - Sender name in orange
    - Timestamp
    - Message input with send button
    - Auto-scroll to bottom

### 5.6 Profile Screen (`profile`)
- **File:** `src/components/police/screens/profile-screen.tsx`
- **Features:**
  - Profile header: avatar, name, online status badge, ID number
  - "Hariri Profaili" link → edit-profile
  - Detail rows: Nafasi, Kitengo, Kituo, Namba ya Simu, Barua Pepe
  - Dashboard stats grid (2×2 + 1): Patrols, Citations, Offenses, Hours, Distance
  - "Pakua Ripoti" empty card
  - Recent activities list (5 items with icons, colors, timestamps)
  - Theme toggle (light/dark)
  - Settings list: Profaili Yangu, Mipangilio, Usalama, Pakua Ripoti, Historia ya Shughuli, Msaada
  - "Pakua Ripoti Kuu" blue button
  - Logout button (red border)

### 5.7 Citation Screen (`citation`)
- **File:** `src/components/police/screens/citation-screen.tsx`
- **Features:**
  - Prefill banner (blue info box) when data from search
  - Citation header: auto-generated number + officer name
  - **Vehicle section** (read-only if prefilled): Plate, Type (dropdown), Model, Color
  - **Driver section** (editable):
    - "Dereva ni mwenye gari?" toggle switch
    - Orange warning when driver ≠ owner
    - Name, License, Phone, NIDA fields (blue-bordered editable)
  - **Offense section**: Offense type dropdown (14 types), Date/Time/Location (auto), Notes
  - **Fine section**: Amount (TZS 50,000), Payment status
  - **Evidence section**: Photo upload area
  - Save (outline) + Submit (filled) buttons
  - Uses `useRecordsStore` for persistence

### 5.8 Search Results Screen (`search-results`)
- **File:** `src/components/police/screens/search-results-screen.tsx`
- **Features:**
  - 3 states: Searching (spinner) | Not Found (with add options) | Found
  - **Found state shows:**
    - Plate header with yellow border, clean/fine badge
    - Alert box (red) for missing persons/criminal flags
    - Risk score progress bar (green/orange/red) with percentage
    - 3 action buttons: Citation (blue) | Warning (orange) | Arrest (red)
    - Insurance section: company, policy, expiry, valid/invalid badge
    - Driver section: name, gender, DOB, license, NIDA, phone, address
    - Vehicle section: model, type, year, color, inspection/registration expiry, accident flag
    - Fines section: outstanding amount, violation list with paid/unpaid status
    - Criminal record section (if applicable): cases, convictions, history
  - **Not found state:**
    - Traffic officer: "Sajili Gari Jipya" → add-vehicle
    - General officer: "Ongeza Raia Mpya" → incident-detail or arrest-form
  - Share button in header

### 5.9 History Screen (`history`)
- **File:** `src/components/police/screens/history-screen.tsx`
- **Features:**
  - 2 summary cards: Total Fines, Unpaid Fines
  - 4 tabs: Citations | Makamato | Maonyo | Patroli (with counts)
  - Search input
  - **Citations tab:**
    - Filter: Zote | Haijalipwa | Imelipwa
    - List items: plate badge, status badge, offense, driver, date/time/location, fine
    - Clickable → citation-detail
  - **Arrests tab:** suspect, status badge (Kizuizini/Ameachiwa/Ameshtakiwa), ID, offense, date
  - **Warnings tab:** recipient, acknowledged badge, ID, offense, date
  - **Patrols tab:** area, date, duration, events, photos count

### 5.10 Accident Report Screen (`accident-report`)
- **File:** `src/components/police/screens/accident-report-screen.tsx`
- Uses `ACCIDENT_VEHICLES`, `ACCIDENT_PEOPLE`, `ACCIDENT_EVIDENCE` data

### 5.11 Vehicle Inspection Screen (`vehicle-inspection`)
- **File:** `src/components/police/screens/vehicle-inspection-screen.tsx`
- Uses `VEHICLE_INSPECTION` data
- Checklist: 5 documents + 10 mechanical items with pass/fail

### 5.12 PF3 Screen (`pf3`)
- **File:** `src/components/police/screens/pf3-screen.tsx`
- Official PF3 accident report form
- Uses `PF3_FORM` data: reference, region, district, vehicles, casualties, witnesses

### 5.13 Arrest Form Screen (`arrest-form`)
- **File:** `src/components/police/screens/arrest-form-screen.tsx`
- Suspect details, offense, evidence, prefill support from search

### 5.14 Warning Form Screen (`warning-form`)
- **File:** `src/components/police/screens/warning-form-screen.tsx`
- Recipient info, offense, notes, prefill support

### 5.15 Lost Property Screen (`lost-property`)
- **File:** `src/components/police/screens/lost-property-screen.tsx`
- Uses `LOST_PROPERTIES` data: phones, laptops, documents, other items

### 5.16 Driver Points Screen (`driver-points`)
- **File:** `src/components/police/screens/driver-points-screen.tsx`
- Uses `DRIVER_POINTS` data: license, name, plate, points/100, violations, status

### 5.17 Incident Detail Screen (`incident-detail`)
- **File:** `src/components/police/screens/incident-detail-screen.tsx`
- Incident report form

### 5.18 Incident View Screen (`incident-view`)
- **File:** `src/components/police/screens/incident-view-screen.tsx`
- Incident list view

### 5.19 Offense Detail Screen (`offense-detail`)
- **File:** `src/components/police/screens/offense-detail-screen.tsx`
- Single offense detail

### 5.20 Citation Detail Screen (`citation-detail`)
- **File:** `src/components/police/screens/citation-detail-screen.tsx`
- Single citation detail

### 5.21 Edit Profile Screen (`edit-profile`)
- **File:** `src/components/police/screens/edit-profile-screen.tsx`
- Profile editing form

### 5.22 Add Vehicle Screen (`add-vehicle`)
- **File:** `src/components/police/screens/add-vehicle-screen.tsx`
- New vehicle registration form

### 5.23 Add Citizen Screen (`add-citizen`)
- **File:** `src/components/police/screens/add-citizen-screen.tsx`
- New citizen registration form

### 5.24 General Home Screen (`general-home-screen`)
- **File:** `src/components/police/screens/general-home-screen.tsx`
- General officer's home (non-traffic focused)

### 5.25 General Police Screen (`general-police-screen`)
- **File:** `src/components/police/screens/general-police-screen.tsx`
- General officer's incident list

### 5.26 Citizen Search Results Screen (`citizen-search-results`)
- **File:** `src/components/police/screens/citizen-search-results-screen.tsx`
- Citizen-focused search results (name/NIDA/phone search)

### 5.27 SOS Request Screen (`sos-request`)
- **File:** `src/components/police/screens/sos-request-screen.tsx` (referenced but modal-based in alerts)

---

## 6. ALL ADMIN/COMMAND SCREENS (13)

### 6.1 Admin Dashboard (`dashboard`)
- **File:** `src/components/admin/screens/admin-dashboard.tsx`
- **Features:**
  - 6 simulation/DB status cards (Simulation, Mock DB, Online Officers, Open Cases, Today's Fines, Sync Status)
  - 4 KPI cards with trend indicators (Officers Active, Active Patrols, Today's Incidents, Today's Citations)
  - Admin Operations quick links grid (6 buttons)
  - Area chart: Incident + Citation trends (7 days)
  - Pie chart: Offense distribution
  - Live incidents list with status badges (MUHIMU/Haijatatuliwa/Imetatuliwa)
  - Region stats table (5 regions)
  - Live indicator: "Mfumo wa Moja kwa Moja"

### 6.2 Admin Officers (`officers`)
- **File:** `src/components/admin/screens/admin-officers.tsx`
- Officer management with profiles

### 6.3 Admin Incidents (`incidents`)
- **File:** `src/components/admin/screens/admin-incidents.tsx`
- Incident management with filtering

### 6.4 Admin Citations (`citations`)
- **File:** `src/components/admin/screens/admin-citations.tsx`
- Citation management

### 6.5 Admin Patrols (`patrols`)
- **File:** `src/components/admin/screens/admin-patrols.tsx`
- Active patrol tracking

### 6.6 Admin Alerts (`alerts`)
- **File:** `src/components/admin/screens/admin-alerts.tsx`
- Broadcast alert management

### 6.7 Admin Reports (`reports`)
- **File:** `src/components/admin/screens/admin-reports.tsx`
- Analytics and reports

### 6.8 Admin Users (`users`)
- **File:** `src/components/admin/screens/admin-users.tsx`
- System user management (create, edit, suspend)

### 6.9 Admin Stations (`stations`)
- **File:** `src/components/admin/screens/admin-stations.tsx`
- Police station management

### 6.10 Admin Posts (`posts`)
- **File:** `src/components/admin/screens/admin-posts.tsx`
- Police post management

### 6.11 Admin Assignments (`assignments`)
- **File:** `src/components/admin/screens/admin-assignments.tsx`
- Officer-to-post/station assignments

### 6.12 Detained Citizens (`detained-citizens`)
- **File:** `src/components/admin/screens/detained-citizens-screen.tsx`
- Detention management

### 6.13 Admin Settings (`settings`)
- **File:** `src/components/admin/screens/admin-settings.tsx`
- System configuration

---

## 7. DATA MODELS

### 7.1 MockCitizen
```typescript
interface MockCitizen {
  name: string;
  nida: string;           // National ID (15 digits)
  mobile: string;         // Phone: 07XX XXX XXX
  gender: "Mme" | "Mke";  // Male / Female
  dob: string;            // Date of birth
  age: number;
  address: string;
  occupation: string;
  status: string;
  statusColor: string;
  criminalRecord: { hasRecord: boolean; cases: number; convictions: number };
  alerts: string[];
  licenseNo: string;
  licenseExpiry: string;
  licenseClass: string;
  passportNo: string;
  passportExpiry: string;
  vehicles: MockVehicle[];
  devices: MockDevice[];
  history: { date: string; type: string; case: string; station: string }[];
  riskScore: number;      // 0-100
  riskLevel: string;      // "Low" / "Medium" / "High"
}
```

### 7.2 MockVehicle
```typescript
interface MockVehicle {
  plate: string;          // T123ABC format
  model: string;
  type: string;           // Saloon, Pick Up, Minibus, Lori, Pikipiki, Bajaji, Basila
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
```

### 7.3 MockDevice
```typescript
interface MockDevice {
  serialNo: string;
  imei: string;
  type: string;           // simu, kompyuta, hati, etc.
  model: string;
  ownerNida: string;
  ownerName: string;
}
```

### 7.4 Officer (Admin)
```typescript
{
  id: string;             // TP123456
  name: string;
  rank: string;           // Constable, Corporal, Sergeant, Inspector, etc.
  unit: string;
  station: string;
  status: string;         // active, break, off-duty, patrol
  patrols: number;
  citations: number;
  incidents: number;
  hoursToday: number;
  phone: string;
}
```

### 7.5 Incident
```typescript
{
  id: string;             // INC-2026-0341
  type: string;           // Ajali ya Gari, Kosa la Trafiki, Wizi wa Gari, Mgogoro wa Trafiki
  location: string;
  date: string;
  time: string;
  status: string;         // urgent, active, resolved, investigating
  priority: string;       // high, medium, low
  assignedTo: string;
  description: string;
  lat?: number;
  lng?: number;
}
```

### 7.6 Citation
```typescript
{
  id: string;             // CT-2026-0451
  plate: string;
  offense: string;
  driver: string;
  date: string;
  time?: string;
  location?: string;
  amount: string;         // "150,000"
  status: string;         // paid, unpaid, Hajalipwa, Imelipwa
  officer: string;
  statusColor: string;
  deductedPoints: number;
}
```

### 7.7 Patrol Record (Zustand)
```typescript
interface PatrolRecord {
  id: string;
  date: string;
  area: string;
  duration: string;       // "00:12:34"
  durationSecs: number;
  events: string;
  photos: number;
}
```

### 7.8 Alert
```typescript
{
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  time: string;
  message: string;
  source: string;
  sourceBg: string;
  dotColor: string;
  borderColor: string;
  unread: boolean;
  category: "all" | "mine";
  important: boolean;
}
```

### 7.9 Arrest Record
```typescript
{
  id: string;             // AR-2026-0045
  suspect: string;
  nida: string;
  dob: string;
  gender: "Mme" | "Mke";
  offense: string;
  offenseCategory: "criminal" | "traffic";
  arrestDate: string;
  arrestTime: string;
  arrestLocation: string;
  station: string;
  holdingCell: string;
  arrestingOfficer: string;
  status: "held" | "released" | "charged";
  courtDate: string;
  notes: string;
}
```

### 7.10 Driver Points
```typescript
{
  id: string;             // License number
  name: string;
  plate: string;
  points: number;         // 0-100
  violations: number;
  lastViolation: string;
  status: "good" | "warning" | "critical";
}
```

### 7.11 Violation Points Table
```typescript
VIOLATION_POINTS: Record<string, number> = {
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
}
```

### 7.12 Lost Property
```typescript
{
  id: string;
  category: string;       // simu, kompyuta, hati, mali-nyingine
  description: string;
  serialNo: string;
  deviceNo: string;       // IMEI
  owner: string;
  ownerPhone: string;
  ownerNida: string;
  reportedDate: string;
  reportedStation: string;
  status: "found" | "searching" | "returned";
  foundDate: string | null;
  foundLocation: string | null;
  notes: string;
}
```

### 7.13 Detained Citizen
```typescript
{
  id: string;
  fullName: string;
  nida: string;
  dob: string;
  gender: "Mme" | "Mke";
  address: string;
  phone: string;
  occupation: string;
  reason: string;
  detainedDate: string;
  detainedTime: string;
  cell: string;           // B-3, A-1, etc.
  station: string;
  officer: string;
  type: "arrested" | "traffic" | "detained";
  status: "held" | "released";
  courtDate: string;
  medicalStatus: string;
  nextOfKin: string;
  lawyer: string;
}
```

---

## 8. ZUSTAND STORE STATE

### 8.1 State Shape (`police-store.ts`)

```typescript
interface PoliceState {
  // Auth
  isAuthenticated: boolean;
  userRole: UserRole;      // "officer-traffic" | "officer-general" | "admin" | "commander"
  login: (role?) => void;
  logout: () => void;

  // Navigation
  activeTab: ScreenId;
  currentScreen: ScreenId;
  history: ScreenId[];
  navigate: (screen) => void;
  setTab: (tab) => void;
  goBack: () => void;

  // Admin
  adminScreen: AdminScreen;
  setAdminScreen: (s) => void;

  // Search
  searchTab: "plate" | "license" | "nida" | "serial";
  citizenSearchType: "name" | "nida" | "mobile";
  alertFilter: "all" | "mine" | "important";

  // Alerts
  readAlertIds: number[];
  markAlertRead: (id) => void;
  markAllAlertsRead: () => void;
  unreadAlertCount: () => number;

  // Search State
  searchQuery: string;
  searchEntity: "person" | "car" | "device";
  searchStatus: "idle" | "searching" | "found" | "not-found";
  runSearch: (query) => void;

  // Prefills
  citationPrefill: CitationPrefill | null;
  arrestPrefill: ArrestPrefill | null;
  warningPrefill: WarningPrefill | null;
  incidentPrefill: IncidentPrefill | null;

  // Scanner
  scannerOpen: boolean;
  scannerMode: "qr" | "ocr";

  // Patrol
  patrolActive: boolean;
  patrolElapsed: number;
  patrolRecords: PatrolRecord[];
  startPatrol: () => void;
  endPatrol: () => void;
  tickPatrol: () => void;

  // Selections
  selectedOffenseId: number | null;
  selectedCitationId: string | null;
  selectedIncidentId: number | null;
}
```

### 8.2 Records Store (`records-store.ts`)
- `addCitation(data)` — persists citations

---

## 9. MOCK DATABASE

### 9.1 Data Scale
- **20 Citizens** — fully cross-linked
- **20 Vehicles** — linked to citizens via NIDA
- **20 Licenses** — linked to citizens
- **20 NIDs** — linked to citizens
- **20 Phones** — linked to citizens
- **20 Serial Numbers** — linked to devices

### 9.2 Search Functions
- `validatePlate(plate)` — validates T-plate format
- `validateLicense(license)` — validates DL format
- `validateNida(nida)` — validates 15-digit NIDA
- `getSuggestions(query, type)` — auto-complete suggestions
- `universalSearch(query)` — searches across all data types
- `lookupCitizen(query)` — citizen-specific search
- `findMatchingMissingAlerts(query, entity)` — cross-references alerts

---

## 10. API ROUTES (30+)

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api` | Root API |
| GET/POST | `/api/incidents` | Incident CRUD |
| GET/PUT/DELETE | `/api/incidents/[id]` | Single incident |
| GET/POST | `/api/citations` | Citation CRUD |
| GET/PUT/DELETE | `/api/citations/[id]` | Single citation |
| GET/POST | `/api/officers` | Officer CRUD |
| GET/PUT/DELETE | `/api/officers/[id]` | Single officer |
| GET/POST | `/api/stations` | Station CRUD |
| GET/PUT/DELETE | `/api/stations/[id]` | Single station |
| GET/POST | `/api/users` | User CRUD |
| GET/PUT/DELETE | `/api/users/[id]` | Single user |
| GET/POST | `/api/posts` | Post CRUD |
| GET/PUT/DELETE | `/api/posts/[id]` | Single post |
| GET/POST | `/api/assignments` | Assignment CRUD |
| GET/PUT/DELETE | `/api/assignments/[id]` | Single assignment |
| GET/POST | `/api/patrols` | Patrol CRUD |
| GET/PUT/DELETE | `/api/patrols/[id]` | Single patrol |
| GET | `/api/alerts` | Alert list |
| GET | `/api/audit-logs` | Audit log |
| GET | `/api/reports/summary` | Report summary |
| GET | `/api/search` | Universal search |
| GET | `/api/search/vehicle` | Vehicle search |
| GET | `/api/search/citizen` | Citizen search |
| GET/POST | `/api/simulation/start` | Start simulation |
| POST | `/api/simulation/stop` | Stop simulation |
| GET | `/api/simulation/status` | Simulation status |
| POST | `/api/mock-db/refresh` | Refresh mock DB |
| GET | `/api/inspections` | Inspection data |
| GET/POST | `/api/pf3` | PF3 forms |
| GET/PUT/DELETE | `/api/pf3/[id]` | Single PF3 |
| GET | `/api/download` | File download |
| POST | `/api/auth/send-otp` | Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| ALL | `/api/auth/[...nextauth]` | NextAuth |

---

## 11. COMPONENT ARCHITECTURE

### 11.1 Officer PWA Components

```
MobileShell
├── StatusBar (fake phone status bar)
├── TopAppBar (title, subtitle, back, bell, logo, theme toggle)
├── BottomNav (5 tabs for traffic officer)
├── GeneralBottomNav (4 tabs for general officer)
├── CameraScannerModal (QR/OCR scanner)
└── [Screen Components] (27 screens)
```

### 11.2 Admin/Command Components

```
AdminWebShell
├── LoginScreen (mode="admin")
└── AdminShell
    ├── Sidebar (dark navy, logo, nav items, user card)
    ├── Top Bar (menu, search, theme, notifications, user chip)
    └── [Admin Screen Components] (13 screens)
```

### 11.3 Shared Components
- `PoliceIcon` — Dynamic icon renderer from string name → Lucide icon
- `ThemeToggle` — Light/dark mode switcher
- `CameraScannerModal` — QR/OCR scanner overlay

### 11.4 UI Components (shadcn/ui)
Full set in `src/components/ui/`:
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip

---

## 12. COMMON UI PATTERNS

### 12.1 Card Pattern
```tsx
<div className="rounded-2xl bg-police-card p-4 shadow-sm">
  <h3 className="text-[14px] font-bold text-police-navy">Title</h3>
  {/* content */}
</div>
```

### 12.2 Stat Card Pattern
```tsx
<div className="flex flex-col items-center rounded-xl bg-police-card p-2.5 shadow-sm">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
    <Icon size={18} />
  </div>
  <span className="mt-1 text-[16px] font-bold" style={{ color }}>{value}</span>
  <span className="mt-1 text-center text-[8px] text-police-muted">{label}</span>
</div>
```

### 12.3 List Item Pattern
```tsx
<button className="flex w-full items-center gap-3 rounded-xl border border-police-soft p-2.5 text-left active:scale-[0.99]">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18` }}>
    <Icon size={20} />
  </div>
  <div className="min-w-0 flex-1">
    <p className="text-[13px] font-bold text-police">{title}</p>
    <p className="text-[10px] text-police-muted">{subtitle}</p>
  </div>
  <ChevronRight size={16} className="text-police-faint" />
</button>
```

### 12.4 Status Badge Pattern
```tsx
<span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
  {status}
</span>
```

### 12.5 Section Header Pattern
```tsx
<div className="mb-3 flex items-center justify-between">
  <h3 className="text-[16px] font-bold text-police">Title</h3>
  <button className="text-[13px] font-medium text-[#2563EB]">Action</button>
</div>
```

### 12.6 Form Input Pattern
```tsx
<div className="flex items-center gap-2 rounded-xl border border-police bg-police-input px-3 focus-within:border-[#2196F3]">
  <Icon size={14} className="text-police-faint" />
  <input className="h-10 flex-1 bg-transparent text-[13px] text-police placeholder:text-police-faint focus:outline-none" />
</div>
```

### 12.7 Primary Button Pattern
```tsx
<button className="w-full rounded-xl bg-[#2196F3] py-3 text-[15px] font-bold text-white shadow-md active:scale-[0.98]">
  Label
</button>
```

### 12.8 Gradient Header Pattern
```tsx
<div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] px-4 pb-16 pt-2">
  {/* content */}
</div>
```

---

## 13. SWAHILI GLOSSARY

| Swahili | English | Context |
|---------|---------|---------|
| Nyumbani | Home | Tab label |
| Trafiki | Traffic | Tab label |
| Patroli | Patrol | Tab label |
| Arifa | Alerts | Tab label |
| Akaunti | Account | Tab label |
| Polisi | Police | Tab label |
| Maofisa | Officers | Admin nav |
| Matukio | Incidents | Admin nav |
| Wafungwa | Detained | Admin nav |
| Watumiaji | Users | Admin nav |
| Vituo | Stations | Admin nav |
| Posti | Posts | Admin nav |
| Mgao | Assignments | Admin nav |
| Mipangilio | Settings | Admin nav |
| Ripoti | Report | Admin nav |
| Makosa | Offenses | General |
| Faini | Fine | General |
| Hajalipwa | Unpaid | Citation status |
| Imelipwa | Paid | Citation status |
| Inasubiri | Pending | General |
| Kizuizini | Detained/Held | Arrest status |
| Ameachiwa | Released | Arrest status |
| Ameshtakiwa | Charged | Arrest status |
| Tafuta | Search | General |
| Matokeo | Results | General |
| Onyo | Warning | General |
| Kamata | Arrest | General |
| Soma Nambari | Read Number | Camera OCR |
| Eneo | Area/Location | General |
| Muda | Time | General |
| Tarehe | Date | General |
| Dereva | Driver | General |
| Gari | Car/Vehicle | General |
| Leseni | License | General |
| Barua Pepe | Email | General |
| Namba ya Simu | Phone Number | General |
| Jina | Name | General |
| Usalama | Safety | General |
| Dharura | Emergency | SOS |
| Msaada | Help | SOS |
| Tahadhari | Warning/Alert | General |
| Muhtasari | Summary | General |
| Shughuli | Activities | General |
| Mfumo | System | General |
| Moja kwa Moja | Real-time | General |

---

## 14. FILE STRUCTURE

```
src/
├── app/
│   ├── globals.css          # Tailwind 4 + custom police theme
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Entry point → MobileShell
│   ├── icon.tsx             # App icon
│   ├── favicon.ico/route.ts
│   ├── admin/
│   │   ├── page.tsx         # Admin entry
│   │   ├── users/[id]/page.tsx
│   │   ├── users/create/page.tsx
│   │   ├── stations/[id]/page.tsx
│   │   ├── officers/[id]/page.tsx
│   │   ├── incidents/[id]/page.tsx
│   │   ├── citations/[id]/page.tsx
│   │   ├── posts/[id]/page.tsx
│   │   ├── posts/create/page.tsx
│   │   └── assignments/[id]/page.tsx
│   ├── command/
│   │   ├── page.tsx         # Command entry
│   │   ├── users/[id]/page.tsx
│   │   ├── users/create/page.tsx
│   │   ├── stations/[id]/page.tsx
│   │   ├── officers/[id]/page.tsx
│   │   ├── incidents/[id]/page.tsx
│   │   ├── citations/[id]/page.tsx
│   │   ├── posts/[id]/page.tsx
│   │   ├── posts/create/page.tsx
│   │   └── assignments/[id]/page.tsx
│   └── api/
│       ├── incidents/[id]/route.ts
│       ├── incidents/route.ts
│       ├── citations/[id]/route.ts
│       ├── citations/route.ts
│       ├── officers/[id]/route.ts
│       ├── officers/route.ts
│       ├── stations/[id]/route.ts
│       ├── stations/route.ts
│       ├── users/[id]/route.ts
│       ├── users/route.ts
│       ├── posts/[id]/route.ts
│       ├── posts/route.ts
│       ├── assignments/[id]/route.ts
│       ├── assignments/route.ts
│       ├── patrols/[id]/route.ts
│       ├── patrols/route.ts
│       ├── alerts/route.ts
│       ├── audit-logs/route.ts
│       ├── reports/summary/route.ts
│       ├── search/route.ts
│       ├── search/vehicle/route.ts
│       ├── search/citizen/route.ts
│       ├── simulation/start/route.ts
│       ├── simulation/stop/route.ts
│       ├── simulation/status/route.ts
│       ├── mock-db/refresh/route.ts
│       ├── inspections/route.ts
│       ├── pf3/[id]/route.ts
│       ├── pf3/route.ts
│       ├── download/route.ts
│       ├── auth/send-otp/route.ts
│       ├── auth/verify-otp/route.ts
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── police/
│   │   ├── mobile-shell.tsx
│   │   ├── top-app-bar.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── general-bottom-nav.tsx
│   │   ├── status-bar.tsx
│   │   ├── police-icons.tsx
│   │   ├── camera-scanner-modal.tsx
│   │   ├── theme-toggle.tsx
│   │   └── screens/
│   │       ├── login-screen.tsx
│   │       ├── home-screen.tsx
│   │       ├── traffic-screen.tsx
│   │       ├── patrol-screen.tsx
│   │       ├── alerts-screen.tsx
│   │       ├── profile-screen.tsx
│   │       ├── citation-screen.tsx
│   │       ├── search-results-screen.tsx
│   │       ├── citizen-search-results-screen.tsx
│   │       ├── history-screen.tsx
│   │       ├── accident-report-screen.tsx
│   │       ├── vehicle-inspection-screen.tsx
│   │       ├── pf3-screen.tsx
│   │       ├── arrest-form-screen.tsx
│   │       ├── warning-form-screen.tsx
│   │       ├── lost-property-screen.tsx
│   │       ├── driver-points-screen.tsx
│   │       ├── incident-detail-screen.tsx
│   │       ├── incident-view-screen.tsx
│   │       ├── offense-detail-screen.tsx
│   │       ├── citation-detail-screen.tsx
│   │       ├── edit-profile-screen.tsx
│   │       ├── add-vehicle-screen.tsx
│   │       ├── add-citizen-screen.tsx
│   │       ├── general-home-screen.tsx
│   │       └── general-police-screen.tsx
│   ├── admin/
│   │   ├── admin-web-shell.tsx
│   │   ├── admin-shell.tsx
│   │   ├── assignment-detail-page.tsx
│   │   ├── citation-detail-page.tsx
│   │   ├── create-post-page.tsx
│   │   ├── create-user-page.tsx
│   │   ├── incident-detail-page.tsx
│   │   ├── officer-profile-page.tsx
│   │   ├── post-detail-page.tsx
│   │   ├── station-detail-page.tsx
│   │   ├── user-detail-page.tsx
│   │   └── screens/
│   │       ├── admin-dashboard.tsx
│   │       ├── admin-officers.tsx
│   │       ├── admin-incidents.tsx
│   │       ├── admin-citations.tsx
│   │       ├── admin-patrols.tsx
│   │       ├── admin-alerts.tsx
│   │       ├── admin-reports.tsx
│   │       ├── admin-users.tsx
│   │       ├── admin-settings.tsx
│   │       ├── admin-stations.tsx
│   │       ├── admin-posts.tsx
│   │       ├── admin-assignments.tsx
│   │       ├── command-center.tsx
│   │       └── detained-citizens-screen.tsx
│   ├── ui/                  # 50+ shadcn/ui components
│   └── pwa-register.tsx
├── lib/
│   ├── police-data.ts       # All mock data & types
│   ├── mock-database.ts     # 20 citizens/vehicles search system
│   ├── admin-data.ts        # Admin/command mock data
│   ├── admin-navigation.ts  # Path helpers
│   ├── admin-mgmt-data.ts   # Admin management data
│   ├── admin-data.ts        # Admin data
│   ├── utils.ts             # Utility functions
│   ├── db.ts                # Database client
│   ├── auth.ts              # Auth utilities
│   ├── rbac.ts              # Role-based access control
│   ├── simulation-state.ts  # Simulation engine state
│   ├── audit-log.ts         # Audit logging
│   └── shared-missing-alerts.ts  # Missing person alerts
├── store/
│   ├── police-store.ts      # Main Zustand store
│   └── records-store.ts     # Citation records store
├── services/
│   └── mock-db.service.ts   # Mock DB service
├── hooks/
│   ├── use-mobile.ts        # Mobile detection
│   └── use-toast.ts         # Toast notifications
└── bootstrap.ts             # App bootstrap
```

---

## 15. KEY DEPENDENCIES

| Package | Purpose |
|---------|---------|
| `next` (16) | Framework |
| `react` / `react-dom` | UI library |
| `typescript` | Type safety |
| `tailwindcss` (4) | Styling |
| `tw-animate-css` | Animations |
| `zustand` | State management |
| `recharts` | Charts (Area, Pie) |
| `next-themes` | Dark/light mode |
| `lucide-react` | Icons |
| `next-auth` (v4) | Authentication |
| `prisma` | ORM |
| `framer-motion` | Transitions |
| `sonner` | Toast notifications |

---

*Generated from repository scan — DEEP CAN Reference Document v1.0*