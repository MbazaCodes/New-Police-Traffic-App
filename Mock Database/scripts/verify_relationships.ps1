Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$citizens = Import-Csv -Path (Join-Path $paths.Csv 'citizens.csv')
$vehicles = Import-Csv -Path (Join-Path $paths.Csv 'vehicles.csv')
$licenses = Import-Csv -Path (Join-Path $paths.Csv 'licenses.csv')
$fines = Import-Csv -Path (Join-Path $paths.Csv 'fines.csv')
$cases = Import-Csv -Path (Join-Path $paths.Csv 'cases.csv')

$citizenIds = $citizens | ForEach-Object { [int]$_.id }
$citizenLookup = @{}
foreach ($id in $citizenIds) { $citizenLookup[$id] = $true }

$invalidVehicles = ($vehicles | Where-Object { -not $citizenLookup.ContainsKey([int]$_.current_owner_citizen_id) } | Measure-Object).Count
$invalidLicenses = ($licenses | Where-Object { -not $citizenLookup.ContainsKey([int]$_.citizen_id) } | Measure-Object).Count
$invalidFines = ($fines | Where-Object { -not $citizenLookup.ContainsKey([int]$_.citizen_id) } | Measure-Object).Count
$invalidCases = ($cases | Where-Object { -not $citizenLookup.ContainsKey([int]$_.citizen_id) } | Measure-Object).Count

$indexFile = Join-Path $root 'schema/019_indexes.sql'
$indexCount = 0
if (Test-Path $indexFile) {
    $indexCount = (Select-String -Path $indexFile -Pattern '^CREATE INDEX\s+' | Measure-Object).Count
}

$totalSeedSizeMb = [math]::Round(((Get-ChildItem -Path (Join-Path $root 'seeds') -Filter '*.sql' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB), 2)
$performanceReadiness = if ($totalSeedSizeMb -ge 50) { 'HIGH' } elseif ($totalSeedSizeMb -ge 10) { 'MEDIUM' } else { 'LOW' }

$qaReport = Join-Path $paths.Reports 'qa_report.md'
$relationshipPenalty = ($invalidVehicles + $invalidLicenses + $invalidFines + $invalidCases) * 5
$indexPenalty = if ($indexCount -lt 15) { 15 } else { 0 }
$perfPenalty = if ($performanceReadiness -eq 'LOW') { 10 } elseif ($performanceReadiness -eq 'MEDIUM') { 5 } else { 0 }

$score = 100 - ($relationshipPenalty + $indexPenalty + $perfPenalty)
if ($score -lt 0) { $score = 0 }

Set-Content -Path $qaReport -Encoding UTF8 -Value @(
    '# QA Relationship Report',
    '',
    ('Profile: {0}' -f $manifest.profile),
    ('Citizens sample exported: {0}' -f $citizens.Count),
    '',
    '## Relationship Validation',
    ('- Vehicles with missing citizen owner refs: {0}' -f $invalidVehicles),
    ('- Licenses with missing citizen refs: {0}' -f $invalidLicenses),
    ('- Fines with missing citizen refs: {0}' -f $invalidFines),
    ('- Cases with missing citizen refs: {0}' -f $invalidCases),
    ('- Index statements discovered: {0}' -f $indexCount),
    ('- Seed volume (MB): {0}' -f $totalSeedSizeMb),
    ('- Performance readiness: {0}' -f $performanceReadiness),
    '',
    '## Final Simulation Score',
    ('- Score: {0}/100' -f $score)
)

$erdPath = Join-Path $paths.Reports 'ERD.md'
Set-Content -Path $erdPath -Encoding UTF8 -Value @(
    '# ERD (Textual)',
    '',
    'citizens -> licenses',
    'citizens -> vehicles',
    'citizens -> fines',
    'citizens -> cases',
    'citizens -> wanted_persons',
    'stations -> officers',
    'officers -> fines',
    'officers -> cases',
    'officers -> audit_logs',
    'fines -> payments',
    'cases -> evidence -> attachments',
    'cases -> court_records',
    'vehicles -> insurance_policies',
    'vehicles/officers -> gps_logs',
    'stations -> cctv_events'
)

Write-Log -Paths $paths -Message ('Relationship verification completed. Score=' + $score)
