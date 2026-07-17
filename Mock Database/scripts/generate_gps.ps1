Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedPath = Join-Path $paths.Seeds 'gps/gps.sql'
$count = [int]$manifest.counts.gps
$random = [System.Random]::new([int]$manifest.seed + 400)
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)
$rows = New-Object System.Collections.Generic.List[object]

$writer = [System.IO.StreamWriter]::new($seedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated GPS logs')
    $writer.WriteLine('BEGIN;')

    for ($i = 1; $i -le $count; $i++) {
        $gpsStatus = if ($i % 70 -eq 0) { 'SIGNAL_LOST' } elseif ($i % 130 -eq 0) { 'OFFLINE' } else { 'OK' }
        $lat = -6.8 + ($random.NextDouble() * 0.9)
        $lon = 39.1 + ($random.NextDouble() * 1.2)
        if ($gpsStatus -ne 'OK') { $lat = 0; $lon = 0 }

        $deviceCode = Escape-Sql ('GPS-' + (($i % 10000) + 1).ToString('D5'))
        $vehicleId = (($i - 1) % [int]$manifest.counts.vehicles) + 1
        $officerId = (($i - 1) % [int]$manifest.counts.officers) + 1
        $latSql = ('{0:N7}' -f $lat).Replace(',', '')
        $lonSql = ('{0:N7}' -f $lon).Replace(',', '')
        $speed = ('{0:N2}' -f ($random.Next(0, 160))).Replace(',', '')
        $logged = To-SqlTs $startDate.AddMinutes($i % ([int]$manifest.counts.years * 525600))
        $statusSql = Escape-Sql $gpsStatus
        $reasonSql = Escape-Sql $(if ($gpsStatus -eq 'OK') { $null } else { 'GPS failure simulated' })

        $writer.WriteLine("INSERT INTO gps_logs (device_code, vehicle_id, officer_id, latitude, longitude, speed_kmh, logged_at, gps_status, failure_reason) VALUES ($deviceCode, $vehicleId, $officerId, $latSql, $lonSql, $speed, $logged, $statusSql, $reasonSql);")

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ device_code = ('GPS-' + (($i % 10000) + 1).ToString('D5')); gps_status = $gpsStatus })
        }
    }

    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

Export-ModuleData -Paths $paths -Module 'gps_logs' -Rows $rows
Write-Log -Paths $paths -Message ('GPS logs generated: {0}' -f $count)
