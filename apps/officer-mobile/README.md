# Officer Mobile — TZ Police Digital Platform

Flutter mobile application for Tanzania Police Force officers. Provides OTP login,
dashboard, traffic management, patrols, alerts, profile, search results, accident
reports, vehicle inspections, PF3 forms, citations, and citation history.

## Tech Stack

- Flutter 3.27+ / Dart 3.5+
- Riverpod (state management)
- GoRouter (navigation, `StatefulShellRoute` for bottom-nav tabs)
- Material 3 (`useMaterial3: true`, light + dark themes)
- Hive (local storage)
- google_fonts (Inter)
- lucide_icons (matches the PWA icon set)
- flutter_svg

## Folder Structure

```
lib/
  main.dart              # entry — init Hive + runApp(ProviderScope)
  app.dart               # MaterialApp.router with light/dark themes
  core/
    theme/app_theme.dart     # light + dark ThemeData
    theme/app_colors.dart    # color constants
    router/app_router.dart   # GoRouter config
    constants/app_constants.dart
  providers/
    auth_provider.dart       # auth state (login/logout)
    theme_provider.dart      # theme mode (system/light/dark)
    navigation_provider.dart # current tab state
  services/storage_service.dart  # Hive wrapper
  models/                    # officer, offense, citation, alert, pf3, ...
  data/mock_data.dart        # all Swahili mock data
  screens/                   # 12 screens (login + 5 tabs + 6 pushed)
  widgets/                   # bottom_nav_bar, top_app_bar, section_card, ...
assets/
  police-logo.png            # Tanzania Police Force logo (from /public)
```

## Routes (GoRouter)

| Route                  | Screen                  | Notes              |
|------------------------|-------------------------|--------------------|
| `/login`               | LoginScreen             | initial, OTP flow  |
| `/home`                | HomeScreen              | bottom-nav tab 1   |
| `/traffic`             | TrafficScreen           | bottom-nav tab 2   |
| `/patrol`              | PatrolScreen            | bottom-nav tab 3   |
| `/alerts`              | AlertsScreen            | bottom-nav tab 4   |
| `/profile`             | ProfileScreen           | bottom-nav tab 5   |
| `/search-results`      | SearchResultsScreen     | pushed             |
| `/accident-report`     | AccidentReportScreen    | pushed             |
| `/vehicle-inspection`  | VehicleInspectionScreen | pushed             |
| `/pf3`                 | Pf3Screen               | pushed             |
| `/citation`            | CitationScreen          | pushed             |
| `/history`             | HistoryScreen           | pushed             |

The 5 bottom-nav tabs are wrapped in a `StatefulShellRoute.indexedStack` so each
tab preserves its scroll/state. Login is the initial route; when `authProvider`
becomes authenticated the router redirects to `/home`, and logging out returns
to `/login`.

## Build & Run

```bash
# 1. Install dependencies
flutter pub get

# 2. Run on a connected device/emulator
flutter run

# 3. Run on a specific device
flutter devices
flutter run -d <device-id>
```

## Build for release

```bash
# Android APK
flutter build apk --release

# Android App Bundle (Play Store)
flutter build appbundle --release

# iOS (requires macOS + Xcode)
flutter build ios --release
```

APK output: `build/app/outputs/flutter-apk/app-release.apk`
AAB output: `build/app/outputs/bundle/release/app-release.aab`

## Assets

- `assets/police-logo.png` — Tanzania Police Force logo (copied from the PWA's
  `/public/police-logo.png`). It is bundled in the APK/AAB and loaded via
  `Image.asset('assets/police-logo.png')`.

## Notes

- All UI text is in Swahili, matching the Next.js PWA at
  `src/components/police/screens/`.
- Light + dark themes are provided; default is `ThemeMode.system`. Use the
  Profile screen to toggle.
- This package contains source code only. Flutter/Dart are not bundled.
