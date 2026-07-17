Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$seedPath = Join-Path $paths.Seeds 'payments/payments.sql'
$count = [int]$manifest.counts.payments
$random = [System.Random]::new([int]$manifest.seed + 200)
$startDate = (Get-Date).AddYears(-1 * [int]$manifest.counts.years)
$rows = New-Object System.Collections.Generic.List[object]

$writer = [System.IO.StreamWriter]::new($seedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated payments')
    $writer.WriteLine('BEGIN;')

    for ($i = 1; $i -le $count; $i++) {
        $status = if ($i % 20 -eq 0) { 'FAILED' } elseif ($i % 9 -eq 0) { 'PENDING' } else { 'SUCCESS' }
        $paidAt = if ($status -eq 'SUCCESS') { To-SqlTs $startDate.AddDays($random.Next(0, [int]$manifest.counts.years * 365)) } else { 'NULL' }
        $failure = Escape-Sql $(if ($status -eq 'FAILED') { 'Insufficient funds' } else { $null })

        $paymentRef = Escape-Sql ('PMT-' + $i.ToString('D12'))
        $fineId = (($i - 1) % [int]$manifest.counts.fines) + 1
        $citizenId = (($i - 1) % [int]$manifest.counts.citizens) + 1
        $amount = ('{0:N2}' -f (15000 + (($i % 12) * 9000))).Replace(',', '')
        $channel = Escape-Sql @('MOBILE_MONEY','BANK','CARD','CASH')[($i - 1) % 4]
        $statusSql = Escape-Sql $status

        $writer.WriteLine("INSERT INTO payments (payment_ref, fine_id, citizen_id, amount, payment_channel, payment_status, paid_at, failure_reason) VALUES ($paymentRef, $fineId, $citizenId, $amount, $channel, $statusSql, $paidAt, $failure);")

        if ($rows.Count -lt 100000) {
            $rows.Add([pscustomobject]@{ payment_ref = ('PMT-' + $i.ToString('D12')); payment_status = $status })
        }
    }

    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

Export-ModuleData -Paths $paths -Module 'payments' -Rows $rows
Write-Log -Paths $paths -Message ('Payments generated: {0}' -f $count)
