param(
	[string]$AppFolderPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot

if ([string]::IsNullOrWhiteSpace($AppFolderPath)) {
	$AppFolderPath = Join-Path $root 'app/mock-database'
}

if (-not (Test-Path $AppFolderPath)) {
	New-Item -Path $AppFolderPath -ItemType Directory -Force | Out-Null
}

$foldersToCopy = @('schema', 'seeds', 'exports', 'docs', 'tests', 'backups')

Write-Host ('Publishing mock database assets to app folder: {0}' -f $AppFolderPath)
foreach ($folder in $foldersToCopy) {
	$source = Join-Path $root $folder
	if (-not (Test-Path $source)) {
		throw ('Missing required source folder: {0}' -f $source)
	}

	$destination = Join-Path $AppFolderPath $folder
	if (Test-Path $destination) {
		Remove-Item -Path $destination -Recurse -Force
	}

	Copy-Item -Path $source -Destination $destination -Recurse -Force
	Write-Host ('  copied: {0}' -f $folder)
}

Write-Host 'Local publish complete. Your app can now look up mock data directly from this folder.'
