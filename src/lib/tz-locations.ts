// Tanzania Police Force — Zones, Regions & Districts
// Shared cascading location data: Zone → Region → District
// Used by Add Officer modal, Create Station page, and filters.

export const TZ_ZONES: Record<string, string[]> = {
  "Makao Makuu (HQ)": ["Makao Makuu"],
  "Kanda ya Mashariki (Eastern)": ["Dar es Salaam", "Pwani", "Morogoro"],
  "Kanda ya Kaskazini (Northern)": ["Arusha", "Kilimanjaro", "Manyara", "Tanga"],
  "Kanda ya Ziwa (Lake)": ["Mwanza", "Geita", "Kagera", "Mara", "Shinyanga", "Simiyu"],
  "Kanda ya Kati (Central)": ["Dodoma", "Singida"],
  "Kanda ya Magharibi (Western)": ["Tabora", "Kigoma", "Katavi"],
  "Nyanda za Juu Kusini (Southern Highlands)": ["Mbeya", "Iringa", "Njombe", "Rukwa", "Songwe"],
  "Kanda ya Kusini (Southern)": ["Lindi", "Mtwara", "Ruvuma"],
  "Zanzibar": [
    "Zanzibar Mjini Magharibi",
    "Zanzibar Kaskazini Unguja",
    "Zanzibar Kusini Unguja",
    "Zanzibar Kaskazini Pemba",
    "Zanzibar Kusini Pemba",
  ],
};

export const TZ_DISTRICTS: Record<string, string[]> = {
  "Makao Makuu": ["HQ Dodoma"],
  "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
  "Pwani": ["Kibaha Mji", "Kibaha", "Bagamoyo", "Chalinze", "Kisarawe", "Mkuranga", "Rufiji", "Kibiti", "Mafia"],
  "Morogoro": ["Morogoro Manispaa", "Morogoro", "Kilosa", "Kilombero", "Ifakara Mji", "Ulanga", "Mvomero", "Gairo", "Malinyi"],
  "Arusha": ["Arusha Jiji", "Arusha", "Meru", "Karatu", "Longido", "Monduli", "Ngorongoro"],
  "Kilimanjaro": ["Moshi Manispaa", "Moshi", "Hai", "Siha", "Rombo", "Mwanga", "Same"],
  "Manyara": ["Babati Mji", "Babati", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
  "Tanga": ["Tanga Jiji", "Korogwe Mji", "Korogwe", "Lushoto", "Bumbuli", "Muheza", "Handeni Mji", "Handeni", "Kilindi", "Pangani", "Mkinga"],
  "Mwanza": ["Nyamagana", "Ilemela", "Magu", "Misungwi", "Kwimba", "Sengerema", "Buchosa", "Ukerewe"],
  "Geita": ["Geita Mji", "Geita", "Bukombe", "Chato", "Mbogwe", "Nyang'hwale"],
  "Kagera": ["Bukoba Manispaa", "Bukoba", "Muleba", "Karagwe", "Kyerwa", "Missenyi", "Biharamulo", "Ngara"],
  "Mara": ["Musoma Manispaa", "Musoma", "Bunda Mji", "Bunda", "Butiama", "Rorya", "Serengeti", "Tarime Mji", "Tarime"],
  "Shinyanga": ["Shinyanga Manispaa", "Shinyanga", "Kahama Mji", "Msalala", "Ushetu", "Kishapu"],
  "Simiyu": ["Bariadi Mji", "Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
  "Dodoma": ["Dodoma Jiji", "Bahi", "Chamwino", "Chemba", "Kondoa Mji", "Kondoa", "Kongwa", "Mpwapwa"],
  "Singida": ["Singida Manispaa", "Singida", "Iramba", "Ikungi", "Manyoni", "Mkalama", "Itigi"],
  "Tabora": ["Tabora Manispaa", "Igunga", "Nzega Mji", "Nzega", "Sikonge", "Urambo", "Uyui", "Kaliua"],
  "Kigoma": ["Kigoma Manispaa", "Kigoma", "Kasulu Mji", "Kasulu", "Kibondo", "Kakonko", "Buhigwe", "Uvinza"],
  "Katavi": ["Mpanda Manispaa", "Nsimbo", "Mlele", "Tanganyika", "Mpimbwe"],
  "Mbeya": ["Mbeya Jiji", "Mbeya", "Chunya", "Kyela", "Mbarali", "Rungwe", "Busokelo"],
  "Iringa": ["Iringa Manispaa", "Iringa", "Kilolo", "Mufindi", "Mafinga Mji"],
  "Njombe": ["Njombe Mji", "Njombe", "Wanging'ombe", "Makete", "Ludewa", "Makambako Mji"],
  "Rukwa": ["Sumbawanga Manispaa", "Sumbawanga", "Kalambo", "Nkasi"],
  "Songwe": ["Mbozi", "Ileje", "Momba", "Songwe", "Tunduma Mji"],
  "Lindi": ["Lindi Manispaa", "Lindi", "Kilwa", "Liwale", "Nachingwea", "Ruangwa"],
  "Mtwara": ["Mtwara Manispaa", "Mtwara", "Masasi Mji", "Masasi", "Nanyumbu", "Newala Mji", "Newala", "Tandahimba", "Nanyamba Mji"],
  "Ruvuma": ["Songea Manispaa", "Songea", "Mbinga Mji", "Mbinga", "Nyasa", "Tunduru", "Namtumbo", "Madaba"],
  "Zanzibar Mjini Magharibi": ["Mjini", "Magharibi A", "Magharibi B"],
  "Zanzibar Kaskazini Unguja": ["Kaskazini A", "Kaskazini B"],
  "Zanzibar Kusini Unguja": ["Kati", "Kusini"],
  "Zanzibar Kaskazini Pemba": ["Wete", "Micheweni"],
  "Zanzibar Kusini Pemba": ["Chake Chake", "Mkoani"],
};

export const TZ_ZONE_NAMES = Object.keys(TZ_ZONES);

export const TZ_ALL_REGIONS = Object.values(TZ_ZONES).flat().sort();

export function regionsForZone(zone: string): string[] {
  return TZ_ZONES[zone] ?? TZ_ALL_REGIONS;
}

export function districtsForRegion(region: string): string[] {
  return TZ_DISTRICTS[region] ?? [];
}

export function zoneForRegion(region: string): string | undefined {
  return TZ_ZONE_NAMES.find((z) => TZ_ZONES[z].includes(region));
}

// Police ranks — lowest to highest
export const TZ_POLICE_RANKS = [
  "Constable",
  "Corporal",
  "Sergeant",
  "Staff Sergeant",
  "Assistant Inspector",
  "Inspector",
  "Chief Inspector",
  "Assistant Superintendent (ASP)",
  "Superintendent (SP)",
  "Senior Superintendent (SSP)",
  "Assistant Commissioner (ACP)",
  "Deputy Commissioner (DCP)",
  "Commissioner of Police (CP)",
  "Deputy Inspector General (DIG)",
  "Inspector General of Police (IGP)",
] as const;
