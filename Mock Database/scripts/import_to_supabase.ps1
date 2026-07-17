param(
	[string]$AppFolderPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$newScript = Join-Path $scriptRoot 'publish_to_app_folder.ps1'

if (-not (Test-Path $newScript)) {
	throw 'publish_to_app_folder.ps1 was not found in scripts folder.'
}

Write-Host 'import_to_supabase.ps1 is deprecated. Redirecting to publish_to_app_folder.ps1...'
& $newScript -AppFolderPath $AppFolderPath

