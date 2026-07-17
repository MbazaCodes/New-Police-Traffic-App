param(
    [string]$ConnectionString = $env:SUPABASE_DB_URL,
    [switch]$ApplyLegacySchema
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    throw 'Provide SUPABASE_DB_URL env var or pass -ConnectionString.'
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found in PATH.'
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot

$schemaPattern = if ($ApplyLegacySchema) { '*.sql' } else { '0*.sql' }
$schemaFiles = Get-ChildItem -Path (Join-Path $root 'schema') -Filter $schemaPattern | Sort-Object Name
$seedFiles = Get-ChildItem -Path (Join-Path $root 'seeds') -Filter '*.sql' -Recurse | Sort-Object FullName

foreach ($file in $schemaFiles) {
    Write-Host ('Applying schema: {0}' -f $file.Name)
    & psql $ConnectionString -v ON_ERROR_STOP=1 -f $file.FullName | Out-Host
}

foreach ($file in $seedFiles) {
    Write-Host ('Applying seed: {0}' -f $file.FullName)
    & psql $ConnectionString -v ON_ERROR_STOP=1 -f $file.FullName | Out-Host
}

Write-Host 'Supabase publish completed.'
