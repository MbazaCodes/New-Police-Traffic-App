Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedPath = Join-Path $paths.Seeds 'audit_logs/audit_logs.sql'
$deviceSeedPath = Join-Path $paths.Seeds 'devices/device_logs.sql'
$count = [int]$manifest.counts.audit_logs
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)
$rows = New-Object System.Collections.Generic.List[object]

$writer = [System.IO.StreamWriter]::new($seedPath, $false, [System.Text.UTF8Encoding]::new($false))
$deviceWriter = [System.IO.StreamWriter]::new($deviceSeedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated audit logs')
    $writer.WriteLine('BEGIN;')
    $deviceWriter.WriteLine('-- Auto-generated device logs')
    $deviceWriter.WriteLine('BEGIN;')

    for ($i = 1; $i -le $count; $i++) {
        $status = if ($i % 31 -eq 0) { 'FAILED' } elseif ($i % 14 -eq 0) { 'WARNING' } else { 'SUCCESS' }

        $officerId = (($i - 1) % [int]$manifest.counts.officers) + 1
        $sessionId = (($i - 1) % [int]$manifest.counts.sessions) + 1
        $action = Escape-Sql @('INSERT','UPDATE','DELETE','VIEW','EXPORT','LOGIN')[($i - 1) % 6]
        $target = Escape-Sql @('citizens','vehicles','licenses','fines','cases','payments')[($i - 1) % 6]
        $targetId = (($i - 1) % [int]$manifest.counts.citizens) + 1
        $statusSql = Escape-Sql $status
        $ip = Escape-Sql ('10.20.' + ($i % 255) + '.' + (($i * 7) % 255))
        $meta = Escape-Sql ('{"sequence":' + $i + ',"status":"' + $status + '"}')
        $eventTime = To-SqlTs $startDate.AddMinutes($i % ([int]$manifest.counts.years * 525600))

        $writer.WriteLine("INSERT INTO audit_logs (actor_officer_id, actor_user_session_id, action_name, target_table, target_id, action_status, ip_address, metadata, event_time) VALUES ($officerId, $sessionId, $action, $target, $targetId, $statusSql, $ip, $meta::jsonb, $eventTime);")

        if ($i % 3 -eq 0) {
            $deviceCode = Escape-Sql ('DEV-' + (($i % 7000) + 1).ToString('D7'))
            $stationId = (($i - 1) % 20) + 1
            $level = Escape-Sql @('INFO','WARN','ERROR')[($i - 1) % 3]
            $message = Escape-Sql 'Synthetic device diagnostic log'
            $offline = if ($i % 45 -eq 0) { 'TRUE' } else { 'FALSE' }
            $deviceWriter.WriteLine("INSERT INTO device_logs (device_code, station_id, officer_id, log_level, log_message, is_offline, logged_at) VALUES ($deviceCode, $stationId, $officerId, $level, $message, $offline, $eventTime);")
        }

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ id = $i; action_status = $status })
        }
    }

    $writer.WriteLine('COMMIT;')
    $deviceWriter.WriteLine('COMMIT;')
}
finally {
    $writer.Flush(); $writer.Dispose()
    $deviceWriter.Flush(); $deviceWriter.Dispose()
}

Export-ModuleData -Paths $paths -Module 'audit_logs' -Rows $rows
Write-Log -Paths $paths -Message ('Audit logs generated: {0}' -f $count)
