Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
if (-not (Test-Path $paths.Manifest)) { throw 'generation_manifest.json not found. Run generate_mock_data.ps1 first.' }
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$timelinePath = Join-Path $paths.Seeds 'cases/timeline_events.sql'
$rows = New-Object System.Collections.Generic.List[object]
$random = [System.Random]::new([int]$manifest.seed + 100)
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)

$eventsPerCitizen = 6
$totalEvents = [int]$manifest.counts.citizens * $eventsPerCitizen
$eventSteps = @('Citizen Birth','NIDA Issued','License Issued','Vehicle Purchase','Insurance Activated','Fine Issued','Payment Attempted','Accident Logged','Investigation Opened','Court Hearing','Resolution Closed')

$writer = [System.IO.StreamWriter]::new($timelinePath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated timeline events')
    $writer.WriteLine('BEGIN;')

    for ($i = 1; $i -le $totalEvents; $i++) {
        $citizen = (($i - 1) % [int]$manifest.counts.citizens) + 1
        $eventType = $eventSteps[($i - 1) % $eventSteps.Count]
        $eventTime = $startDate.AddDays($random.Next(0, [int]$manifest.counts.years * 365)).AddHours($random.Next(0, 24))
        $relatedCase = (($i - 1) % [int]$manifest.counts.cases) + 1
        $relatedFine = (($i - 1) % [int]$manifest.counts.fines) + 1

        $writer.WriteLine(
            ('INSERT INTO simulation_timeline_events (citizen_id, event_type, event_time, related_case_id, related_fine_id, narrative) VALUES ({0}, {1}, {2}, {3}, {4}, {5});' -f
            $citizen,
            (Escape-Sql $eventType),
            (To-SqlTs $eventTime),
            $relatedCase,
            $relatedFine,
            (Escape-Sql ('Timeline event ' + $i)))
        )

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ citizen_id = $citizen; event_type = $eventType; event_time = $eventTime })
        }
    }

    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

Export-ModuleData -Paths $paths -Module 'timeline_events' -Rows $rows
Write-Log -Paths $paths -Message ('Timeline events generated: {0}' -f $totalEvents)
