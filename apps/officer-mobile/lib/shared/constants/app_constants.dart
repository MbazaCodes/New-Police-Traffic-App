// ===== TZ Police Digital Platform — Shared Constants (Dart mirror) =====
//
// Mirror of `packages/shared/src/constants/index.ts`.
// Used by: PWA (Next.js), Web (Next.js), Flutter (Dart — this file).
//
// All values are static `const` so they resolve at compile-time, exactly
// like the TypeScript `as const` literals.

/// Top-level app strings — mirrors `APP_NAME`, `APP_TAGLINE`, etc.
class AppInfo {
  AppInfo._();

  static const String appName = 'TZ Police Digital Platform';
  static const String tagline = 'USALAMA WETU, JUKUMU LETU';
  static const String org = 'TANZANIA POLICE FORCE';
  static const String copyright = '© 2026 Tanzania Police Force';
  static const String footer = 'Mfumo salama wa Jeshi la Polisi Tanzania';
}

/// User role identifiers used throughout the platform.
enum UserRole {
  officerTraffic,
  officerGeneral,
  admin,
  commander,
}

/// Extension methods on [UserRole] for ergonomics.
extension UserRoleX on UserRole {
  /// String id matching the TypeScript `UserRole` union
  /// (`"officer-traffic"` | `"officer-general"` | `"admin"` | `"commander"`).
  String get id {
    switch (this) {
      case UserRole.officerTraffic:
        return 'officer-traffic';
      case UserRole.officerGeneral:
        return 'officer-general';
      case UserRole.admin:
        return 'admin';
      case UserRole.commander:
        return 'commander';
    }
  }

  /// Parse a role id string back into a [UserRole].
  static UserRole fromId(String id) {
    switch (id) {
      case 'officer-traffic':
        return UserRole.officerTraffic;
      case 'officer-general':
        return UserRole.officerGeneral;
      case 'admin':
        return UserRole.admin;
      case 'commander':
        return UserRole.commander;
      default:
        return UserRole.officerTraffic;
    }
  }
}

/// A role definition — mirrors `ROLES` entries.
class RoleDefinition {
  const RoleDefinition({
    required this.id,
    required this.label,
    required this.sublabel,
    required this.appType,
  });

  final UserRole id;
  final String label;
  final String sublabel;

  /// `"mobile"` or `"web"` — mirrors the TypeScript `appType` literal.
  final String appType;
}

/// All role definitions — mirrors the TypeScript `ROLES` array.
class AppRoles {
  AppRoles._();

  static const List<RoleDefinition> all = [
    RoleDefinition(
      id: UserRole.officerTraffic,
      label: 'Afisa Trafiki',
      sublabel: 'Traffic Officer',
      appType: 'mobile',
    ),
    RoleDefinition(
      id: UserRole.officerGeneral,
      label: 'Afisa Polisi',
      sublabel: 'General Officer',
      appType: 'mobile',
    ),
    RoleDefinition(
      id: UserRole.admin,
      label: 'Admin',
      sublabel: 'Users & Stations',
      appType: 'web',
    ),
    RoleDefinition(
      id: UserRole.commander,
      label: 'Kamanda',
      sublabel: 'Command Center',
      appType: 'web',
    ),
  ];
}

/// A bottom-nav / sidebar item — `{ id, label }`.
class NavItem {
  const NavItem({required this.id, required this.label});

  final String id;
  final String label;
}

/// Mobile bottom-nav for the Traffic Officer role.
class TrafficOfficerNav {
  TrafficOfficerNav._();

  static const List<NavItem> items = [
    NavItem(id: 'home', label: 'Nyumbani'),
    NavItem(id: 'traffic', label: 'Trafiki'),
    NavItem(id: 'patrol', label: 'Patroli'),
    NavItem(id: 'alerts', label: 'Arifa'),
    NavItem(id: 'profile', label: 'Akaunti'),
  ];
}

/// Mobile bottom-nav for the General Officer role.
/// Note: the second tab is labelled "Polisi" (not "Trafiki") per the
/// platform's role-dedicated pages.
class GeneralOfficerNav {
  GeneralOfficerNav._();

  static const List<NavItem> items = [
    NavItem(id: 'home', label: 'Nyumbani'),
    NavItem(id: 'traffic', label: 'Polisi'),
    NavItem(id: 'patrol', label: 'Patroli'),
    NavItem(id: 'alerts', label: 'Arifa'),
    NavItem(id: 'profile', label: 'Akaunti'),
  ];
}

/// Admin (web) sidebar — focused on user / station / post management.
class AdminNav {
  AdminNav._();

  static const List<NavItem> items = [
    NavItem(id: 'users', label: 'Watumiaji'),
    NavItem(id: 'stations', label: 'Vituo'),
    NavItem(id: 'posts', label: 'Posti'),
    NavItem(id: 'assignments', label: 'Mgao'),
    NavItem(id: 'settings', label: 'Mipangilio'),
  ];
}

/// Commander (web) sidebar — full command center (all 12 screens).
class CommanderNav {
  CommanderNav._();

  static const List<NavItem> items = [
    NavItem(id: 'dashboard', label: 'Dashboard'),
    NavItem(id: 'officers', label: 'Maofisa'),
    NavItem(id: 'incidents', label: 'Matukio'),
    NavItem(id: 'citations', label: 'Citations'),
    NavItem(id: 'patrols', label: 'Patroli'),
    NavItem(id: 'alerts', label: 'Arifa'),
    NavItem(id: 'reports', label: 'Ripoti'),
    NavItem(id: 'users', label: 'Watumiaji'),
    NavItem(id: 'stations', label: 'Vituo'),
    NavItem(id: 'posts', label: 'Posti'),
    NavItem(id: 'assignments', label: 'Mgao'),
    NavItem(id: 'settings', label: 'Mipangilio'),
  ];
}

/// A search-tab definition — `{ id, label, placeholder }`.
class SearchTab {
  const SearchTab({
    required this.id,
    required this.label,
    required this.placeholder,
  });

  final String id;
  final String label;
  final String placeholder;
}

/// Vehicle search tabs (plate / license / NIDA).
class VehicleSearchTabs {
  VehicleSearchTabs._();

  static const List<SearchTab> items = [
    SearchTab(id: 'plate', label: 'Namba ya Gari', placeholder: 'T123ABC'),
    SearchTab(id: 'license', label: 'Leseni', placeholder: 'DL123456789TZ'),
    SearchTab(id: 'nida', label: 'NIDA', placeholder: '1990123456789'),
  ];
}

/// Citizen search tabs (name / NIDA / mobile).
class CitizenSearchTabs {
  CitizenSearchTabs._();

  static const List<SearchTab> items = [
    SearchTab(id: 'name', label: 'Jina', placeholder: 'Juma Mwinyi'),
    SearchTab(id: 'nida', label: 'NIDA', placeholder: '1990123456789'),
    SearchTab(id: 'mobile', label: 'Simu', placeholder: '0712345678'),
  ];
}

/// Offense type options for the Citation form.
class OffenseTypes {
  OffenseTypes._();

  static const List<String> items = [
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
}

/// Vehicle type options for the Citation form.
class VehicleTypes {
  VehicleTypes._();

  static const List<String> items = [
    'Saloon',
    'Pick Up',
    'Minibus',
    'Lori',
    'Pikipiki',
    'Bajaji',
    'Basila',
  ];
}

/// A filter-tab definition — `{ id, label }`.
class FilterItem {
  const FilterItem({required this.id, required this.label});

  final String id;
  final String label;
}

/// Alert page filter tabs.
class AlertFilters {
  AlertFilters._();

  static const List<FilterItem> items = [
    FilterItem(id: 'all', label: 'Yote'),
    FilterItem(id: 'mine', label: 'Kesi Zangu'),
    FilterItem(id: 'important', label: 'Muhimu'),
  ];
}

/// Citation history filter tabs.
class CitationFilters {
  CitationFilters._();

  static const List<FilterItem> items = [
    FilterItem(id: 'all', label: 'Zote'),
    FilterItem(id: 'unpaid', label: 'Haijalipwa'),
    FilterItem(id: 'paid', label: 'Imelipwa'),
  ];
}
