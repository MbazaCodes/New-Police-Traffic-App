# TZ Police Digital Platform — Testing Guide
# Source: Mock Database — DO NOT EDIT — DO NOT CREATE NEW DATA

## AUTHENTICATION

OTP: Any 6 digits (demo mode)

### Officer PWA (tz-police-pwa.vercel.app)

| Role | Username | Mobile |
|------|----------|--------|
| Afisa Trafiki | juma.mwinyi | 0712 345 678 |
| Afisa Trafiki | ali.hassan | 0788 123 456 |
| Afisa Trafiki | fatuma.hassan | 0722 777 888 |
| Afisa Trafiki | saidi.juma | 0755 111 222 |
| Afisa Trafiki | mariamu.ally | 0744 333 444 |
| Afisa Jumla | grace.mushi | 0766 987 654 |
| Afisa Jumla | hamisi.rashid | 0733 555 666 |
| Afisa Jumla | emmanuel.joseph | 0711 999 000 |
| Afisa Jumla | zawadi.kimani | 0712 111 333 |
| Afisa Jumla | baraka.john | 0788 654 321 |

### Admin/Command Web (tz-police-admin-web.vercel.app/admin)

| Role | Username | Mobile |
|------|----------|--------|
| Admin | mariam.juma | 0766 100 200 |
| IGP (National) | igp.waziri | 0766 000 001 |
| CP DSM | cp.dsm | 0766 001 001 |
| CP Arusha | cp.arusha | 0766 002 001 |
| CP Mwanza | cp.mwanza | 0766 003 001 |
| CP Dodoma | cp.dodoma | 0766 004 001 |
| CP Iringa | cp.iringa | 0766 005 001 |
| Station Commissioner | csp.kikuu | 0712 030 001 |

## SEARCH INPUTS

### Traffic Officer Searches
- T 001 ABC → Toyota Corolla, Juma Mwinyi, SAFI
- T 003 GHI → Toyota Hiace, Ali Salum, FAINI + BIMA
- T 005 MNO → Land Cruiser, Saidi Bakari, TZS 300k FAINI
- T 009 YZA → Bajaji, Hamisi Rashid, TZS 250k FAINI
- DL001001TZ → Juma Mwinyi, Leseni Sahihi
- DL009009TZ → Hamisi Rashid, HATARI

### General Officer Searches
- Juma Khamis → citizen profile + gari T 001 ABC
- Hamisi Rashid → rekodi ya uhalifu, 91% hatari
- 197805091234575 → Hamisi Rashid Omar
- 0712 345 678 → Juma Khamis Mwinyi
- SM-S928B-TZ-001 → Samsung S24, SAFI
- DNPXK-TZ-002 → iPhone 15 Pro, ILIBIWA
- CNF-HP-TZ-005 → HP Laptop, ILIBIWA

## WANAOTAFUTWA (Admin)
- MP-2026-0031 → Mtoto Amani Mwanga (Inatafutwa)
- MW-2026-0029 → Nassoro Kombo Mataka (Inatafutwa)
- MV-2026-0022 → T 003 GHI Toyota Hiace (Inatafutwa)
- MV-2026-0018 → T 005 MNO Land Cruiser (Tuzo 500k)
- MD-2026-0045 → iPhone 15 Pro DNPXK-TZ-002 (Inatafutwa)
- MP-2026-0028 → Yusuph Majaliwa (✅ Amepatikana)

## 20 MAGARI
T 001 ABC thru T 020 FGH — see MOCK_DATA_REFERENCE.md

## 20 VIFAA
SM-S928B-TZ-001 thru REAL-TZ-020 — see MOCK_DATA_REFERENCE.md
