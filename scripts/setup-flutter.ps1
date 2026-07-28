# ============================================================
# TZ Police Digital Platform — Flutter Officer App Setup
# Run from repo root: .\scripts\setup-flutter.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TZ Police — Flutter App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Flutter ─────────────────────────────────────────
$hasFlutter = $null -ne (Get-Command flutter -ErrorAction SilentlyContinue)

if (-not $hasFlutter) {
    Write-Host "ERROR: Flutter SDK not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Flutter:" -ForegroundColor Yellow
    Write-Host "  1. Download from https://flutter.dev/docs/get-started/install/windows" -ForegroundColor White
    Write-Host "  2. Extract to C:\flutter" -ForegroundColor White
    Write-Host "  3. Add C:\flutter\bin to your PATH" -ForegroundColor White
    Write-Host "  4. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use winget:" -ForegroundColor Yellow
    Write-Host "  winget install Google.Flutter" -ForegroundColor White
    exit 1
}

# ── 2. Flutter doctor ────────────────────────────────────────
Write-Host "Running flutter doctor..." -ForegroundColor Cyan
flutter doctor --android-licenses 2>&1 | Out-Null
flutter doctor

Write-Host ""
Write-Host "Note: Ignore web/Chrome warnings — we only need Android/iOS." -ForegroundColor Yellow
Write-Host ""

# ── 3. Go to officer-mobile ──────────────────────────────────
$flutterPath = Join-Path $PSScriptRoot "..\apps\officer-mobile"
$flutterPath = Resolve-Path $flutterPath

if (-not (Test-Path $flutterPath)) {
    Write-Host "ERROR: apps/officer-mobile not found." -ForegroundColor Red
    exit 1
}

Set-Location $flutterPath
Write-Host "Working directory: $flutterPath" -ForegroundColor Gray

# ── 4. Get packages ──────────────────────────────────────────
Write-Host ""
Write-Host "Getting Flutter packages..." -ForegroundColor Cyan
flutter pub get

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: flutter pub get failed." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Packages installed" -ForegroundColor Green

# ── 5. Check connected devices ───────────────────────────────
Write-Host ""
Write-Host "Checking connected devices..." -ForegroundColor Cyan
flutter devices

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Run the app:" -ForegroundColor White
Write-Host ""
Write-Host "  cd apps\officer-mobile" -ForegroundColor Yellow
Write-Host ""
Write-Host "  flutter run                     # auto-select device" -ForegroundColor Yellow
Write-Host "  flutter run -d chrome           # web browser" -ForegroundColor Yellow
Write-Host "  flutter run -d emulator-5554    # Android emulator" -ForegroundColor Yellow
Write-Host "  flutter run -d windows          # Windows desktop" -ForegroundColor Yellow
Write-Host ""
Write-Host "Build APK (Android):" -ForegroundColor White
Write-Host "  flutter build apk --release" -ForegroundColor Yellow
Write-Host ""
Write-Host "Build for Windows desktop:" -ForegroundColor White
Write-Host "  flutter build windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "SCREENS AVAILABLE:" -ForegroundColor Cyan
Write-Host "  Login → Home → Traffic → Patrol → Alerts → Profile" -ForegroundColor White
Write-Host "  Search Results → Accident Report → Vehicle Inspection" -ForegroundColor White
Write-Host "  PF3 Form → Citation → History" -ForegroundColor White
Write-Host ""
