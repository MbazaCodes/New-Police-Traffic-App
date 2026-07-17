Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedPath = Join-Path $paths.Seeds 'cctv/cctv.sql'
$count = [int]$manifest.counts.cctv
$random = [System.Random]::new([int]$manifest.seed + 300)
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)
$rows = New-Object System.Collections.Generic.List[object]

$writer = [System.IO.StreamWriter]::new($seedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated CCTV events')
    $writer.WriteLine('BEGIN;')

    for ($i = 1; $i -le $count; $i++) {
        $eventType = @('SPEED_TRIGGER','RED_LIGHT','COLLISION','TRACKING','OFFLINE','MANUAL_REVIEW')[($i - 1) % 6]
        $offline = if ($eventType -eq 'OFFLINE' -or $i % 50 -eq 0) { 'TRUE' } else { 'FALSE' }
        $eventTime = To-SqlTs $startDate.AddDays($random.Next(0, [int]$manifest.counts.years * 365)).AddMinutes($random.Next(0, 1440))

        $stationId = (($i - 1) % 20) + 1
        $cameraId = Escape-Sql ('CCTV-' + (($i % 200) + 1).ToString('D4'))
        $citizenId = (($i - 1) % [int]$manifest.counts.citizens) + 1
        $vehicleId = (($i - 1) % [int]$manifest.counts.vehicles) + 1
        $eventTypeSql = Escape-Sql $eventType
        $score = ('{0:N2}' -f (55 + ($i % 45))).Replace(',', '')
        $image = Escape-Sql ('/mock/cctv/frame-' + $i + '.jpg')

        $writer.WriteLine("INSERT INTO cctv_events (station_id, camera_id, citizen_id, vehicle_id, event_type, confidence_score, event_time, image_path, is_device_offline) VALUES ($stationId, $cameraId, $citizenId, $vehicleId, $eventTypeSql, $score, $eventTime, $image, $offline);")

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ camera_id = ('CCTV-' + (($i % 200) + 1).ToString('D4')); event_type = $eventType; is_device_offline = ($offline -eq 'TRUE') })
        }
    }

    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

Export-ModuleData -Paths $paths -Module 'cctv_events' -Rows $rows
Write-Log -Paths $paths -Message ('CCTV events generated: {0}' -f $count)
