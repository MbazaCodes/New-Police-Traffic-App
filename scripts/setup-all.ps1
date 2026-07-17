# ============================================================
# TZ Police Digital Platform — Master Setup Script
# Run from repo root: .\scripts\setup-all.ps1
# ============================================================

$root = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TZ Police Digital Platform" -ForegroundColor Cyan
Write-Host "  Master Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Platform    Status" -ForegroundColor White
Write-Host "----------  ------" -ForegroundColor Gray

# ── Check Node/Bun ───────────────────────────────────────────
$hasBun     = $null -ne (Get-Command bun -ErrorAction SilentlyContinue)
$hasNode    = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
$hasFlutter = $null -ne (Get-Command flutter -ErrorAction SilentlyContinue)
$hasGit     = $null -ne (Get-Command git -ErrorAction SilentlyContinue)

$webReady     = $hasBun -or $hasNode
$flutterReady = $hasFlutter

if ($hasGit)     { Write-Host "Git         ✓ installed" -ForegroundColor Green }
else             { Write-Host "Git         ✗ missing — install from https://git-scm.com" -ForegroundColor Red }

if ($hasBun)     { Write-Host "Bun         ✓ installed" -ForegroundColor Green }
elseif ($hasNode){ Write-Host "Node.js     ✓ installed (npm will be used)" -ForegroundColor Green }
else             { Write-Host "Node/Bun    ✗ missing" -ForegroundColor Red }

if ($hasFlutter) { Write-Host "Flutter     ✓ installed" -ForegroundColor Green }
else             { Write-Host "Flutter     ✗ missing — see scripts\setup-flutter.ps1" -ForegroundColor Yellow }

Write-Host ""

# ── Option menu ──────────────────────────────────────────────
Write-Host "What would you like to set up?" -ForegroundColor White
Write-Host "  [1] Next.js PWA only (web + admin + command center)" -ForegroundColor Yellow
Write-Host "  [2] Flutter app only" -ForegroundColor Yellow
Write-Host "  [3] Both" -ForegroundColor Yellow
Write-Host "  [Q] Quit" -ForegroundColor Gray
Write-Host ""
$choice = Read-Host "Enter choice"

switch ($choice.ToUpper()) {
    "1" {
        Set-Location $root
        & "$PSScriptRoot\setup-web.ps1"
    }
    "2" {
        Set-Location $root
        & "$PSScriptRoot\setup-flutter.ps1"
    }
    "3" {
        Set-Location $root
        & "$PSScriptRoot\setup-web.ps1"
        Set-Location $root
        & "$PSScriptRoot\setup-flutter.ps1"
    }
    "Q" { Write-Host "Bye." -ForegroundColor Gray; exit 0 }
    default { Write-Host "Invalid choice." -ForegroundColor Red; exit 1 }
}

# ── Summary ──────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ALL DONE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick reference:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next.js (from repo root):" -ForegroundColor White
if ($hasBun) {
    Write-Host "    bun dev                   → http://localhost:3000" -ForegroundColor Yellow
} else {
    Write-Host "    npm run dev               → http://localhost:3000" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Flutter (from apps\officer-mobile):" -ForegroundColor White
Write-Host "    flutter run               → auto-pick device" -ForegroundColor Yellow
Write-Host "    flutter run -d chrome     → browser" -ForegroundColor Yellow
Write-Host "    flutter run -d windows    → desktop app" -ForegroundColor Yellow
Write-Host ""
Write-Host "  GitHub repo:" -ForegroundColor White
Write-Host "    https://github.com/MbazaCodes/New-Police-Traffic-App" -ForegroundColor Yellow
Write-Host ""
