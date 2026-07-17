Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
if (-not (Test-Path $paths.Manifest)) { throw 'generation_manifest.json is missing.' }
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedMap = [ordered]@{
    citizens = Join-Path $paths.Seeds 'citizens/citizens.sql'
    officers = Join-Path $paths.Seeds 'officers/officers.sql'
    vehicles = Join-Path $paths.Seeds 'vehicles/vehicles.sql'
    licenses = Join-Path $paths.Seeds 'licenses/licenses.sql'
    fines = Join-Path $paths.Seeds 'fines/fines.sql'
    cases = Join-Path $paths.Seeds 'cases/cases.sql'
    wanted = Join-Path $paths.Seeds 'wanted/wanted.sql'
    insurance = Join-Path $paths.Seeds 'insurance/insurance.sql'
    payments = Join-Path $paths.Seeds 'payments/payments.sql'
    cctv = Join-Path $paths.Seeds 'cctv/cctv.sql'
    gps = Join-Path $paths.Seeds 'gps/gps.sql'
    notifications = Join-Path $paths.Seeds 'notifications/notifications.sql'
    audit_logs = Join-Path $paths.Seeds 'audit_logs/audit_logs.sql'
    sessions = Join-Path $paths.Seeds 'sessions/sessions.sql'
    evidence = Join-Path $paths.Seeds 'evidence/evidence.sql'
    courts = Join-Path $paths.Seeds 'courts/courts.sql'
}

$failed = $false
foreach ($k in $seedMap.Keys) {
    $path = $seedMap[$k]
    if (-not (Test-Path $path)) {
        Write-Host ('{0,-14} status=FAIL reason=missing file' -f $k)
        $failed = $true
        continue
    }

    $count = (Select-String -Path $path -Pattern '^INSERT INTO\s+' | Measure-Object).Count
    if ($k -eq 'evidence') {
        $expected = [int]$manifest.counts.evidence
    }
    elseif ($k -eq 'courts') {
        $expected = [int]$manifest.counts.courts
    }
    else {
        $expected = [int]$manifest.counts.$k
    }
    $ok = $count -ge $expected
    Write-Host ('{0,-14} expected>={1,10} actual={2,10} status={3}' -f $k, $expected, $count, ($(if ($ok) { 'OK' } else { 'FAIL' })))
    if (-not $ok) { $failed = $true }
}

if ($failed) {
    throw 'Count verification failed.'
}

Write-Host 'All generated seed counts passed.'
