Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root

$targets = @(
    (Join-Path $paths.Seeds '*.sql'),
    (Join-Path $paths.Seeds '*\*.sql'),
    (Join-Path $paths.Csv '*.csv'),
    (Join-Path $paths.Json '*.json'),
    (Join-Path $paths.Backups 'generation_manifest.json'),
    (Join-Path $paths.Backups 'initial_seed.sql'),
    (Join-Path $paths.Logs '*.log'),
    (Join-Path $paths.Reports '*.md')
)

foreach ($pattern in $targets) {
    Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Remove-Item -Force
}

Write-Host 'Simulation artifacts reset complete.'
