Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-SimulationPaths {
    param([string]$Root)

    return [ordered]@{
        Root = $Root
        Schema = Join-Path $Root 'schema'
        Seeds = Join-Path $Root 'seeds'
        Exports = Join-Path $Root 'exports'
        Csv = Join-Path $Root 'exports/csv'
        Json = Join-Path $Root 'exports/json'
        Backups = Join-Path $Root 'backups'
        Reports = Join-Path $Root 'docs/reports'
        Logs = Join-Path $Root 'backups/logs'
        Manifest = Join-Path $Root 'backups/generation_manifest.json'
    }
}

function Ensure-Directories {
    param([hashtable]$Paths)

    foreach ($path in @($Paths.Seeds, $Paths.Exports, $Paths.Csv, $Paths.Json, $Paths.Backups, $Paths.Reports, $Paths.Logs)) {
        if (-not (Test-Path $path)) {
            New-Item -Path $path -ItemType Directory -Force | Out-Null
        }
    }
}

function Write-Log {
    param(
        [hashtable]$Paths,
        [string]$Message,
        [string]$Level = 'INFO'
    )

    $line = ('{0} [{1}] {2}' -f (Get-Date).ToString('yyyy-MM-dd HH:mm:ss'), $Level, $Message)
    Write-Host $line
    Add-Content -Path (Join-Path $Paths.Logs 'simulation.log') -Value $line
}

function Invoke-WithRetry {
    param(
        [scriptblock]$Operation,
        [int]$MaxRetries = 3,
        [int]$DelaySeconds = 2
    )

    $attempt = 0
    while ($attempt -lt $MaxRetries) {
        try {
            $attempt++
            return (& $Operation)
        }
        catch {
            if ($attempt -ge $MaxRetries) {
                throw
            }
            Start-Sleep -Seconds $DelaySeconds
        }
    }
}

function New-SimulationProfile {
    param(
        [ValidateSet('QA','UAT','Performance','Stress')]
        [string]$Profile,
        [int]$Years,
        [int]$Seed
    )

    $citizensByProfile = @{
        QA = 5000
        UAT = 50000
        Performance = 500000
        Stress = 5000000
    }

    $citizens = $citizensByProfile[$Profile]

    $counts = [ordered]@{
        years = $Years
        citizens = $citizens
        officers = [int][math]::Ceiling($citizens * 0.03)
        vehicles = [int][math]::Ceiling($citizens * 0.50)
        licenses = [int][math]::Ceiling($citizens * 0.40)
        fines = [int][math]::Ceiling($citizens * 2.20)
        cases = [int][math]::Ceiling($citizens * 0.55)
        wanted = [int][math]::Ceiling($citizens * 0.05)
        insurance = [int][math]::Ceiling($citizens * 0.50)
        payments = [int][math]::Ceiling($citizens * 1.90)
        cctv = [int][math]::Ceiling($citizens * 2.50)
        gps = [int][math]::Ceiling($citizens * 8.00)
        notifications = [int][math]::Ceiling($citizens * 3.00)
        audit_logs = [int][math]::Ceiling($citizens * 12.00)
        sessions = [int][math]::Ceiling($citizens * 0.65)
        evidence = [int][math]::Ceiling($citizens * 0.70)
        courts = [int][math]::Ceiling($citizens * 0.35)
    }

    return [ordered]@{
        profile = $Profile
        seed = $Seed
        started_at = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
        distribution = [ordered]@{
            valid = 85
            warning = 10
            corrupted = 5
        }
        counts = $counts
    }
}

function Get-QualityStatus {
    param(
        [System.Random]$Random
    )

    $roll = $Random.Next(1, 101)
    if ($roll -le 85) { return 'VALID' }
    if ($roll -le 95) { return 'WARNING' }
    return 'CORRUPTED'
}

function Escape-Sql {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return 'NULL'
    }

    return "'" + ($Value -replace "'", "''") + "'"
}

function To-SqlDate {
    param([datetime]$Value)
    return "'" + $Value.ToString('yyyy-MM-dd') + "'"
}

function To-SqlTs {
    param([datetime]$Value)
    return "'" + $Value.ToString('yyyy-MM-dd HH:mm:ss') + "'"
}

function Write-SqlSeedFile {
    param(
        [string]$Path,
        [string[]]$Statements
    )

    $content = @('-- Auto-generated simulation seed', 'BEGIN;') + $Statements + @('COMMIT;')
    Set-Content -Path $Path -Value $content -Encoding UTF8
}

function Export-ModuleData {
    param(
        [hashtable]$Paths,
        [string]$Module,
        [object[]]$Rows
    )

    $csvPath = Join-Path $Paths.Csv ($Module + '.csv')
    $jsonPath = Join-Path $Paths.Json ($Module + '.json')

    $Rows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
    $Rows | ConvertTo-Json -Depth 5 | Set-Content -Path $jsonPath -Encoding UTF8
}

function Save-Manifest {
    param(
        [hashtable]$Paths,
        [hashtable]$Manifest
    )

    $Manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $Paths.Manifest -Encoding UTF8
}
