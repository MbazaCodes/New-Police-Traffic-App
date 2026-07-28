# Officer Flutter App

The Flutter app is an alternative native mobile client for officers,
targeting Android and iOS. It shares the same PostgreSQL backend and
REST API as the Next.js PWA but provides a more native feel and access
to platform APIs that are restricted in browsers (e.g. background
location, system-wide shortcuts).

> **Status:** The Flutter app is currently in maintenance mode. New
> features ship to the Next.js PWA first. The Flutter app is kept in
> parity for officers on devices where the PWA doesn't perform well
> (older Androids with limited Chrome support).

## 1. Repository location

The Flutter source lives at `packages/officer-flutter/`. It is a
self-contained Flutter project with its own `pubspec.yaml` and is not
built by the Next.js build pipeline.

## 2. Architecture

The Flutter app uses a layered architecture:

```
packages/officer-flutter/
├── lib/
│   ├── main.dart              # Entry point
│   ├── app/                   # App-level config (themes, routing)
│   ├── data/                  # API client, repositories
│   │   ├── api_client.dart    # Dio HTTP client + auth interceptor
│   │   ├── repositories/      # One repository per resource
│   │   └── models/            # JSON-serializable data classes
│   ├── domain/                # Business logic (use cases)
│   ├── presentation/          # UI (screens, widgets)
│   │   ├── screens/           # One folder per screen
│   │   ├── widgets/           # Reusable widgets
│   │   └── theme/             # Flutter theme data
│   └── core/                  # Cross-cutting (logging, error handling)
├── assets/                    # Images, fonts
├── android/                   # Android-specific config
├── ios/                       # iOS-specific config
└── pubspec.yaml
```

State management uses Riverpod. Routing uses go_router.

## 3. API integration

The Flutter app talks to the same `/api/*` endpoints as the Next.js PWA.
The base URL is configurable via `--dart-define=API_BASE_URL=...`:

```bash
flutter run \
  --dart-define=API_BASE_URL=https://police.example.gov \
  --dart-define=API_TIMEOUT_SECONDS=30
```

Authentication uses NextAuth's credentials flow — the app POSTs to
`/api/auth/callback/credentials` and stores the resulting JWT cookie in
secure storage (`flutter_secure_storage`). All subsequent requests
include the cookie.

## 4. Offline support

The Flutter app uses `sqflite` for local persistence. Key tables cached
locally:

- `officer_profile` — current officer's profile
- `recent_citations` — last 50 citations issued by this officer
- `recent_arrests` — last 20 arrests
- `draft_citations` — citations started offline, pending sync

When the app detects network connectivity (via `connectivity_plus`),
it pushes draft mutations to the server via a background isolate.
Conflicts are resolved server-side — the server is the source of truth.

## 5. Platform-specific features

### Android

- **Background location** — patrol tracking continues when the app is
  backgrounded (uses `flutter_background_geolocation`).
- **System shortcuts** — long-press the app icon to show "Issue
  Citation", "Start Patrol" shortcuts.
- **Notifications** — uses Firebase Cloud Messaging for push (the PWA
  uses Web Push).
- **NFC** — on supported devices, can read NIDA cards via NFC.

### iOS

- **Background location** — same as Android but with iOS background
  modes.
- **Apple Push Notification Service (APNs)** — used instead of FCM.
- **Face ID / Touch ID** — used for biometric login (the JWT is stored
  in the Keychain and unlocked with biometrics).
- **Shortcuts** — Siri shortcuts for "Issue Citation" etc.

## 6. Building

### Android APK

```bash
cd packages/officer-flutter
flutter pub get
flutter build apk --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

The APK is at `build/app/outputs/flutter-apk/app-release.apk`.

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

The AAB is at `build/app/outputs/bundle/release/app-release.aab`.

### iOS IPA

```bash
flutter build ipa --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

The IPA is at `build/ios/ipa/police_app.ipa`. Requires a Mac with Xcode
and a valid Apple Developer account.

See `docs/flutter-build.md` for detailed build instructions.

## 7. Distribution

- **Android** — distributed via a private MDM (Mobile Device Management)
  server. Not on the Play Store for general public — only police-issued
  devices can install it.
- **iOS** — distributed via Apple Business Manager + MDM. Not on the
  App Store for general public.

This private distribution model ensures only authorized devices can
access the API. Device IDs are registered in the `device_registrations`
table and checked at login.

## 8. Maintenance policy

The Flutter app receives:

- **Security fixes** — within 7 days of CVE disclosure.
- **Bug fixes** — monthly release cadence.
- **New features** — only after the PWA version has been validated in
  production for at least 30 days.

If a feature is too complex to port to Flutter within 90 days of the
PWA release, officers are advised to use the PWA via mobile Chrome /
Safari for that feature.
