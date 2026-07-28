# Flutter Build Guide

This guide covers building the Officer Flutter app for Android (APK/AAB)
and iOS (IPA). It assumes you have a working Flutter development
environment set up.

## 1. Prerequisites

### Common (both platforms)

- Flutter 3.19+ (`flutter --version` to check)
- Dart 3.3+
- The repo cloned and `flutter pub get` run in `packages/officer-flutter/`

### Android

- Android Studio (or just the Android SDK command-line tools)
- Java 17 (bundled with Android Studio)
- An Android device or emulator for testing
- A keystore for release signing (see section 3)

### iOS

- A Mac running macOS 13+
- Xcode 15+
- CocoaPods (`sudo gem install cocoapods`)
- An Apple Developer account (paid, $99/year)
- A valid provisioning profile and signing certificate

## 2. Configure environment

Create `packages/officer-flutter/.env` (gitignored) with:

```
API_BASE_URL=https://police.example.gov
API_TIMEOUT_SECONDS=30
SENTRY_DSN=
```

Or pass via `--dart-define` at build time (recommended for CI).

## 3. Android release signing

Generate a keystore (one-time):

```bash
keytool -genkey -v \
  -keystore ~/keystores/police-app-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias police-app
```

Store the keystore password, alias, and key password in your password
manager. **If you lose the keystore, you cannot push updates to the
same app installation** — keep multiple backups.

Create `packages/officer-flutter/android/key.properties` (gitignored):

```properties
storePassword=********
keyPassword=********
keyAlias=police-app
storeFile=/Users/you/keystores/police-app-release.jks
```

The `android/app/build.gradle` reads this file and signs the release
build automatically.

## 4. Build the Android APK

```bash
cd packages/officer-flutter
flutter pub get
flutter build apk --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

To build a fat APK (single APK for all ABIs):

```bash
flutter build apk --release --target-platform android-arm,android-arm64,android-x64
```

To build split APKs (smaller per-architecture):

```bash
flutter build apk --release --split-per-abi
```

## 5. Build the Android App Bundle (Play Store / MDM)

```bash
flutter build appbundle --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

Output: `build/app/outputs/bundle/release/app-release.aab`

The AAB is required for Play Store distribution. For MDM distribution,
either use the AAB with `bundletool` to generate device-specific APKs,
or just use the fat APK from section 4.

## 6. Build the iOS IPA

Open `packages/officer-flutter/ios/Runner.xcworkspace` in Xcode:

```bash
open ios/Runner.xcworkspace
```

In Xcode:

1. Select the `Runner` target.
2. Under **Signing & Capabilities**, select your team and provisioning
   profile.
3. Set the bundle identifier to `gov.tanzania.police.app` (or whatever
   is registered in your Apple Developer account).
4. Close Xcode.

Build the IPA:

```bash
flutter build ipa --release \
  --dart-define=API_BASE_URL=https://police.example.gov
```

Output: `build/ios/ipa/police_app.ipa`

## 7. Test installation

### Android

```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

Or transfer the APK to the device and install via file manager (enable
"Install from unknown sources" first).

### iOS

Use Apple Configurator 2 (Mac) or distribute via TestFlight for
internal testing.

## 8. Version management

Update `pubspec.yaml` version before each release:

```yaml
version: 1.2.0+45    # major.minor.patch+buildNumber
```

The build number must monotonically increase for each upload to the
Play Store / App Store / MDM.

## 9. CI integration (optional)

For automated builds, use GitHub Actions with the `subosito/flutter-action`:

```yaml
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'
      - run: flutter pub get
        working-directory: packages/officer-flutter
      - run: flutter build apk --release
        working-directory: packages/officer-flutter
      - uses: actions/upload-artifact@v4
        with:
          name: apk
          path: packages/officer-flutter/build/app/outputs/flutter-apk/app-release.apk
```

The keystore should be base64-encoded and stored as a GitHub Actions
secret. Decode it in the workflow before building.

## 10. Troubleshooting

### "Keystore file not set for signing config release"

Check that `android/key.properties` exists and `storeFile` points to a
valid keystore path.

### iOS build fails with "No profiles for ... were found"

Open Xcode and let it auto-create a provisioning profile, or manually
create one in the Apple Developer portal and select it in Xcode.

### Gradle build OOMs on CI

Add to `android/gradle.properties`:

```
org.gradle.jvmargs=-Xmx2g
```

### Flutter version mismatch

The repo is pinned to a specific Flutter version via `pubspec.yaml`'s
`environment.sdk` constraint. Use `fvm` (Flutter Version Management) to
install the exact version.
