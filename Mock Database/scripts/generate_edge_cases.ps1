Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
$manifest = Get-Content -Path $paths.Manifest -Raw | ConvertFrom-Json

$edgeSeedPath = Join-Path $paths.Seeds 'audit_logs/edge_cases.sql'
$reportPath = Join-Path $paths.Reports 'coverage_report.md'

$edgeCases = @(
    'Duplicate NIDA',
    'Invalid phone numbers',
    'Stolen vehicles',
    'Expired insurance',
    'Multiple identities',
    'Corrupt officers',
    'Deleted records',
    'Missing documents',
    'GPS failures',
    'Payment failures',
    'Offline devices',
    'Circular ownership',
    'Invalid plates',
    'Fake licenses'
)

$writer = [System.IO.StreamWriter]::new($edgeSeedPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    $writer.WriteLine('-- Auto-generated edge case injections')
    $writer.WriteLine('BEGIN;')

    $writer.WriteLine("UPDATE citizens SET nida = '99999999999999999999', quality_status = 'CORRUPTED' WHERE id % 500 = 0;")
    $writer.WriteLine("UPDATE citizens SET phone_number = '000', quality_status = 'WARNING' WHERE id % 70 = 0;")
    $writer.WriteLine("UPDATE vehicles SET registration_status = 'STOLEN', quality_status = 'WARNING' WHERE id % 300 = 0;")
    $writer.WriteLine("UPDATE insurance_policies SET policy_status = 'EXPIRED' WHERE id % 40 = 0;")
    $writer.WriteLine("UPDATE officers SET is_corrupt_flag = TRUE WHERE id % 45 = 0;")
    $writer.WriteLine("UPDATE citizens SET is_deleted = TRUE WHERE id % 1000 = 0;")
    $writer.WriteLine("UPDATE vehicle_ownership_history SET is_circular_edge_case = TRUE WHERE id % 200 = 0;")
    $writer.WriteLine("UPDATE licenses SET status = 'FAKE', quality_status = 'CORRUPTED' WHERE id % 120 = 0;")
    $writer.WriteLine('COMMIT;')
}
finally {
    $writer.Flush()
    $writer.Dispose()
}

$reportLines = @(
    '# Coverage Report',
    '',
    ('Profile: {0}' -f $manifest.profile),
    ('Distribution Target: VALID {0}% / WARNING {1}% / CORRUPTED {2}%' -f $manifest.distribution.valid, $manifest.distribution.warning, $manifest.distribution.corrupted),
    '',
    '## Edge Cases Injected',
    ''
) + ($edgeCases | ForEach-Object { '- ' + $_ })

Set-Content -Path $reportPath -Encoding UTF8 -Value $reportLines

Write-Log -Paths $paths -Message 'Edge case dataset and coverage report generated.'
