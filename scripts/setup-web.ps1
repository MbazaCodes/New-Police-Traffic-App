# ============================================================
# TZ Police Digital Platform — Next.js PWA Setup
# Run from repo root: .\scripts\setup-web.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TZ Police — Next.js PWA Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Node / Bun ──────────────────────────────────────
$hasBun = $null -ne (Get-Command bun -ErrorAction SilentlyContinue)
$hasNode = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
$hasNpm = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)

if (-not $hasNode -and -not $hasBun) {
    Write-Host "ERROR: Node.js or Bun is required." -ForegroundColor Red
    Write-Host "Install Node.js from https://nodejs.org  (LTS, 20+)" -ForegroundColor Yellow
    Write-Host "Or install Bun: powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor Yellow
    exit 1
}

if ($hasBun) {
    Write-Host "✓ Bun detected" -ForegroundColor Green
    $pm = "bun"
    $pmRun = "bun run"
    $pmInstall = "bun install"
} else {
    Write-Host "✓ Node.js detected — using npm" -ForegroundColor Green
    $pm = "npm"
    $pmRun = "npm run"
    $pmInstall = "npm install"
}

# ── 2. Environment file ──────────────────────────────────────
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "WARNING: No .env file found. Create one from .env.example" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

# ── 3. Install dependencies ──────────────────────────────────
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
Invoke-Expression $pmInstall

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Dependency install failed." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# ── 4. Create db directory ───────────────────────────────────
if (-not (Test-Path "db")) {
    New-Item -ItemType Directory -Path "db" | Out-Null
    Write-Host "✓ Created db/ directory" -ForegroundColor Green
}

# ── 5. Done ──────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start dev server:" -ForegroundColor White
if ($hasBun) {
    Write-Host "  bun dev" -ForegroundColor Yellow
} else {
    Write-Host "  npm run dev" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Open in browser:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "LOGIN ROLES (mock — no password needed):" -ForegroundColor Cyan
Write-Host "  officer-traffic  → PWA (citations, vehicle search, PF3)" -ForegroundColor White
Write-Host "  officer-general  → PWA (citizen search, patrols)" -ForegroundColor White
Write-Host "  admin            → Admin panel (users, stations, posts)" -ForegroundColor White
Write-Host "  commander        → Command Center (live map, dispatch)" -ForegroundColor White
Write-Host ""
