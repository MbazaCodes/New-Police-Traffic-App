Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedPath = Join-Path $paths.Seeds 'notifications/notifications.sql'
$count = [int]$manifest.counts.notifications
$random = [System.Random]::new([int]$manifest.seed + 500)
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)
$rows = New-Object System.Collections.Generic.List[object]

$writer = [System.IO.StreamWriter]::new($seedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated notifications')
    $writer.WriteLine('BEGIN;')

    for ($i = 1; $i -le $count; $i++) {
        $status = if ($i % 17 -eq 0) { 'FAILED' } elseif ($i % 13 -eq 0) { 'QUEUED' } else { 'SENT' }

        $citizenId = (($i - 1) % [int]$manifest.counts.citizens) + 1
        $officerId = (($i - 1) % [int]$manifest.counts.officers) + 1
        $channel = Escape-Sql @('SMS','EMAIL','APP','PRINT')[($i - 1) % 4]
        $type = Escape-Sql @('FINE_NOTICE','COURT_REMINDER','LICENSE_RENEWAL','CASE_UPDATE')[($i - 1) % 4]
        $payload = Escape-Sql ('{"notificationId":' + $i + ',"profile":"' + $manifest.profile + '"}')
        $statusSql = Escape-Sql $status
        $sentAt = To-SqlTs $startDate.AddDays($random.Next(0, [int]$manifest.counts.years * 365))

        $writer.WriteLine("INSERT INTO notifications (citizen_id, officer_id, channel, notification_type, payload, delivery_status, sent_at) VALUES ($citizenId, $officerId, $channel, $type, $payload::jsonb, $statusSql, $sentAt);")

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ id = $i; delivery_status = $status })
        }
    }

    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

Export-ModuleData -Paths $paths -Module 'notifications' -Rows $rows
Write-Log -Paths $paths -Message ('Notifications generated: {0}' -f $count)
