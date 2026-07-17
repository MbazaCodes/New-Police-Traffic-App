param(
    [ValidateSet('QA','UAT','Performance','Stress')]
    [string]$Profile = 'QA',
    [int]$Years = 10,
    [int]$Seed = 2601,
    [int]$CitizensOverride = 0,
    [int]$ExportSampleLimit = 200000,
    [switch]$EnableParallel,
    [switch]$Clean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptRoot
. (Join-Path $scriptRoot 'lib/simulation_common.ps1')

$paths = Get-SimulationPaths -Root $root
Ensure-Directories -Paths $paths

if ($Clean) {
    Get-ChildItem -Path $paths.Seeds -Filter '*.sql' -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -Path $paths.Csv -Filter '*.csv' -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -Path $paths.Json -Filter '*.json' -ErrorAction SilentlyContinue | Remove-Item -Force
}

$manifest = New-SimulationProfile -Profile $Profile -Years $Years -Seed $Seed

if ($CitizensOverride -gt 0) {
    $manifest.counts.citizens = $CitizensOverride
    $manifest.counts.officers = [int][math]::Ceiling($CitizensOverride * 0.03)
    $manifest.counts.vehicles = [int][math]::Ceiling($CitizensOverride * 0.50)
    $manifest.counts.licenses = [int][math]::Ceiling($CitizensOverride * 0.40)
    $manifest.counts.fines = [int][math]::Ceiling($CitizensOverride * 2.20)
    $manifest.counts.cases = [int][math]::Ceiling($CitizensOverride * 0.55)
    $manifest.counts.wanted = [int][math]::Ceiling($CitizensOverride * 0.05)
    $manifest.counts.insurance = [int][math]::Ceiling($CitizensOverride * 0.50)
    $manifest.counts.payments = [int][math]::Ceiling($CitizensOverride * 1.90)
    $manifest.counts.cctv = [int][math]::Ceiling($CitizensOverride * 2.50)
    $manifest.counts.gps = [int][math]::Ceiling($CitizensOverride * 8.00)
    $manifest.counts.notifications = [int][math]::Ceiling($CitizensOverride * 3.00)
    $manifest.counts.audit_logs = [int][math]::Ceiling($CitizensOverride * 12.00)
    $manifest.counts.sessions = [int][math]::Ceiling($CitizensOverride * 0.65)
    $manifest.counts.evidence = [int][math]::Ceiling($CitizensOverride * 0.70)
    $manifest.counts.courts = [int][math]::Ceiling($CitizensOverride * 0.35)
}

Save-Manifest -Paths $paths -Manifest $manifest

$random = [System.Random]::new($Seed)
$startDate = (Get-Date).AddYears(-1 * $Years)

$firstNames = @('Asha','Neema','Rehema','Zawadi','Farida','Amina','Zainabu','Saada','Grace','Janeth','Martha','Halima','Agnes','Maria','Beatrice','Hawa','Juma','Joseph','John','Peter','Emmanuel','Baraka','Moses','Hassan','Ibrahim','Kelvin')
$lastNames = @('Mushi','Mwaipopo','Msuya','Nyerere','Massawe','Mwakalinga','Mhando','Mollel','Lema','Komba','Kassim','Mrope','Mrema','Mfaume','Mwaisaka','Mtui','Mboya','Mtei','Shao','Shabani','Banzi','Ngowi','Mwita','Manyama','Mbise')
$ranks = @('Constable','Corporal','Sergeant','Inspector','Assistant Inspector','Traffic Commander')
$makes = @('Toyota','Nissan','Isuzu','Mitsubishi','Suzuki','Honda','Ford','Volkswagen','Hyundai','Kia')
$models = @('Corolla','Hilux','Noah','RAV4','Premio','Canter','Alto','Vitz','Polo','Rio')
$offenses = @('SPEEDING','DRUNK_DRIVING','PARKING','SEAT_BELT','RED_LIGHT')

function Get-PlateNumber {
    param([int]$Index)

    $number = (($Index - 1) % 999) + 1
    $suffixOffset = [math]::Floor(($Index - 1) / 999)

    $a = 0
    $b = 1
    $c = 2

    $c = ($c + $suffixOffset) % 26
    $carry = [math]::Floor(($suffixOffset + 2) / 26)
    $b = ($b + $carry) % 26
    $carry = [math]::Floor(($carry + 1) / 26)
    $a = ($a + $carry) % 26

    return ('T{0:D3}{1}{2}{3}' -f $number, [char]([int](65 + $a)), [char]([int](65 + $b)), [char]([int](65 + $c)))
}

function New-Writer {
    param([string]$Path)

    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }

    $writer = [System.IO.StreamWriter]::new($Path, $false, [System.Text.UTF8Encoding]::new($false))
    return $writer
}

function Close-Writer {
    param($Writer)
    if ($null -ne $Writer) {
        $Writer.Flush()
        $Writer.Dispose()
    }
}

function Add-SampledRow {
    param(
        [System.Collections.Generic.List[object]]$Buffer,
        [object]$Row,
        [int]$Limit
    )

    if ($Buffer.Count -lt $Limit) {
        $Buffer.Add($Row)
    }
}

Write-Log -Paths $paths -Message ('Starting simulation generation. Profile={0}, Citizens={1}' -f $Profile, $manifest.counts.citizens)

$citizenSeedPath = Join-Path $paths.Seeds 'citizens/citizens.sql'
$officerSeedPath = Join-Path $paths.Seeds 'officers/officers.sql'
$vehicleSeedPath = Join-Path $paths.Seeds 'vehicles/vehicles.sql'
$licenseSeedPath = Join-Path $paths.Seeds 'licenses/licenses.sql'
$fineSeedPath = Join-Path $paths.Seeds 'fines/fines.sql'
$caseSeedPath = Join-Path $paths.Seeds 'cases/cases.sql'
$wantedSeedPath = Join-Path $paths.Seeds 'wanted/wanted.sql'
$insuranceSeedPath = Join-Path $paths.Seeds 'insurance/insurance.sql'
$courtSeedPath = Join-Path $paths.Seeds 'courts/courts.sql'
$evidenceSeedPath = Join-Path $paths.Seeds 'evidence/evidence.sql'
$sessionSeedPath = Join-Path $paths.Seeds 'sessions/sessions.sql'

$citizenSample = New-Object System.Collections.Generic.List[object]
$officerSample = New-Object System.Collections.Generic.List[object]
$vehicleSample = New-Object System.Collections.Generic.List[object]
$licenseSample = New-Object System.Collections.Generic.List[object]
$fineSample = New-Object System.Collections.Generic.List[object]
$caseSample = New-Object System.Collections.Generic.List[object]

$writers = @{}
try {
    $writers.citizens = New-Writer -Path $citizenSeedPath
    $writers.officers = New-Writer -Path $officerSeedPath
    $writers.vehicles = New-Writer -Path $vehicleSeedPath
    $writers.licenses = New-Writer -Path $licenseSeedPath
    $writers.fines = New-Writer -Path $fineSeedPath
    $writers.cases = New-Writer -Path $caseSeedPath
    $writers.wanted = New-Writer -Path $wantedSeedPath
    $writers.insurance = New-Writer -Path $insuranceSeedPath
    $writers.courts = New-Writer -Path $courtSeedPath
    $writers.evidence = New-Writer -Path $evidenceSeedPath
    $writers.sessions = New-Writer -Path $sessionSeedPath

    foreach ($w in $writers.Values) {
        $w.WriteLine('-- Auto-generated simulation seed')
        $w.WriteLine('BEGIN;')
    }

    $totalSteps = 11
    $step = 0

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Officers' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.officers; $i++) {
        $mmic = ('{0}{1:D4}' -f @('F','G','H','J','K')[($i - 1) % 5], (1000 + $i))
        $stationId = (($i - 1) % 20) + 1
        $status = if ($i % 40 -eq 0) { 'SUSPENDED' } else { 'ACTIVE' }
        $isCorrupt = if ($i % 50 -eq 0) { 'TRUE' } else { 'FALSE' }

        $writers.officers.WriteLine(
            ('INSERT INTO officers (mmic_number, station_id, first_name, last_name, rank_title, shift_code, employment_status, is_corrupt_flag) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7});' -f
            (Escape-Sql $mmic),
            $stationId,
            (Escape-Sql $firstNames[$random.Next(0, $firstNames.Count)]),
            (Escape-Sql $lastNames[$random.Next(0, $lastNames.Count)]),
            (Escape-Sql $ranks[$random.Next(0, $ranks.Count)]),
            (Escape-Sql ('SHIFT-{0}' -f (($i % 3) + 1))),
            (Escape-Sql $status),
            $isCorrupt)
        )

        Add-SampledRow -Buffer $officerSample -Row ([pscustomobject]@{ id = $i; mmic_number = $mmic; station_id = $stationId; employment_status = $status }) -Limit $ExportSampleLimit
    }

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Citizens + family + addresses' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.citizens; $i++) {
        $dob = (Get-Date '1960-01-01').AddDays($random.Next(0, 22000))
        $quality = Get-QualityStatus -Random $random
        $isDeleted = if ($quality -eq 'CORRUPTED' -and $i % 7 -eq 0) { 'TRUE' } else { 'FALSE' }
        $nida = $dob.ToString('yyyyMMdd') + ('{0:D12}' -f $i)
        if ($quality -eq 'CORRUPTED' -and $i % 20 -eq 0) { $nida = '00000000000000000000' }

        $phone = ('+2557{0:D8}' -f (10000000 + ($i % 90000000)))
        if ($quality -eq 'WARNING' -and $i % 15 -eq 0) { $phone = '07123' }

        $writers.citizens.WriteLine(
            ('INSERT INTO citizens (nida, first_name, middle_name, last_name, date_of_birth, gender, phone_number, current_address, region_id, quality_status, is_deleted) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10});' -f
            (Escape-Sql $nida),
            (Escape-Sql $firstNames[$random.Next(0, $firstNames.Count)]),
            (Escape-Sql $firstNames[$random.Next(0, $firstNames.Count)]),
            (Escape-Sql $lastNames[$random.Next(0, $lastNames.Count)]),
            (To-SqlDate $dob),
            (Escape-Sql $(if ($i % 2 -eq 0) { 'F' } else { 'M' })),
            (Escape-Sql $phone),
            (Escape-Sql ('Block {0}, Street {1}, Ward {2}' -f (($i % 50) + 1), (($i % 400) + 1), (($i % 20) + 1))),
            (($i % 19) + 1),
            (Escape-Sql $quality),
            $isDeleted)
        )

        if ($i % 3 -eq 0) {
            $relative = if ($i -gt 1) { $i - 1 } else { 1 }
            $writers.citizens.WriteLine(
                ('INSERT INTO citizen_relationships (citizen_id, related_citizen_id, relationship_type, start_date) VALUES ({0}, {1}, {2}, {3});' -f
                $i,
                $relative,
                (Escape-Sql 'SIBLING'),
                (To-SqlDate $dob.AddYears(10)))
            )
        }

        if ($i % 4 -eq 0) {
            $writers.citizens.WriteLine(
                ('INSERT INTO citizen_address_history (citizen_id, address_text, region_id, valid_from, is_current) VALUES ({0}, {1}, {2}, {3}, TRUE);' -f
                $i,
                (Escape-Sql ('History Address {0}' -f $i)),
                (($i % 19) + 1),
                (To-SqlDate $startDate.AddDays($random.Next(0, 3650))))
            )
        }

        Add-SampledRow -Buffer $citizenSample -Row ([pscustomobject]@{ id = $i; nida = $nida; phone_number = $phone; quality_status = $quality }) -Limit $ExportSampleLimit

        if ($i % 50000 -eq 0) {
            Write-Log -Paths $paths -Message ('Citizens generated: {0}' -f $i)
        }
    }

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Vehicles + ownership' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.vehicles; $i++) {
        $owner = (($i - 1) % $manifest.counts.citizens) + 1
        $quality = Get-QualityStatus -Random $random
        $plate = Get-PlateNumber -Index $i
        if ($quality -eq 'CORRUPTED' -and $i % 30 -eq 0) { $plate = 'INVALIDPLATE' }
        $status = if ($i % 41 -eq 0) { 'STOLEN' } else { 'ACTIVE' }

        $writers.vehicles.WriteLine(
            ('INSERT INTO vehicles (current_owner_citizen_id, plate_number, vin, make, model, color, manufacture_year, import_date, insurance_status, registration_status, quality_status) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10});' -f
            $owner,
            (Escape-Sql $plate),
            (Escape-Sql ('VIN{0:D12}' -f $i)),
            (Escape-Sql $makes[$random.Next(0, $makes.Count)]),
            (Escape-Sql $models[$random.Next(0, $models.Count)]),
            (Escape-Sql @('White','Black','Blue','Silver','Gray')[$random.Next(0, 5)]),
            (1998 + ($i % 27)),
            (To-SqlDate $startDate.AddDays($random.Next(0, $Years * 365))),
            (Escape-Sql $(if ($i % 8 -eq 0) { 'EXPIRED' } else { 'ACTIVE' })),
            (Escape-Sql $status),
            (Escape-Sql $quality))
        )

        $writers.vehicles.WriteLine(
            ('INSERT INTO vehicle_ownership_history (vehicle_id, owner_citizen_id, from_date, transfer_type, is_circular_edge_case) VALUES ({0}, {1}, {2}, {3}, {4});' -f
            $i,
            $owner,
            (To-SqlDate $startDate.AddDays($random.Next(0, $Years * 365))),
            (Escape-Sql 'FIRST_REGISTRATION'),
            ($(if ($quality -eq 'CORRUPTED' -and $i % 70 -eq 0) { 'TRUE' } else { 'FALSE' })))
        )

        Add-SampledRow -Buffer $vehicleSample -Row ([pscustomobject]@{ id = $i; current_owner_citizen_id = $owner; plate_number = $plate; registration_status = $status }) -Limit $ExportSampleLimit
    }

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Licenses + renewals' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.licenses; $i++) {
        $citizen = (($i - 1) % $manifest.counts.citizens) + 1
        $issued = $startDate.AddDays($random.Next(0, ($Years * 365) - 180))
        $expiry = $issued.AddYears(5)
        $status = if ($expiry -lt (Get-Date)) { 'EXPIRED' } else { 'ACTIVE' }
        if ($i % 43 -eq 0) { $status = 'SUSPENDED' }
        if ($i % 89 -eq 0) { $status = 'REVOKED' }
        if ($i % 101 -eq 0) { $status = 'FAKE' }

        $writers.licenses.WriteLine(
            ('INSERT INTO licenses (citizen_id, license_number, class_code, issue_date, expiry_date, status, issuing_station_id, quality_status) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7});' -f
            $citizen,
            (Escape-Sql ('4{0:D9}' -f $i)),
            (Escape-Sql @('A','B','C','D')[($i - 1) % 4]),
            (To-SqlDate $issued),
            (To-SqlDate $expiry),
            (Escape-Sql $status),
            (($i % 20) + 1),
            (Escape-Sql (Get-QualityStatus -Random $random)))
        )

        if ($i % 6 -eq 0) {
            $writers.licenses.WriteLine(
                ('INSERT INTO license_renewals (license_id, renewal_date, previous_expiry, new_expiry, processed_by_officer_id, notes) VALUES ({0}, {1}, {2}, {3}, {4}, {5});' -f
                $i,
                (To-SqlDate $expiry.AddDays(-20)),
                (To-SqlDate $expiry),
                (To-SqlDate $expiry.AddYears(5)),
                (($i % $manifest.counts.officers) + 1),
                (Escape-Sql 'Scheduled renewal'))
            )
        }

        Add-SampledRow -Buffer $licenseSample -Row ([pscustomobject]@{ id = $i; citizen_id = $citizen; status = $status }) -Limit $ExportSampleLimit
    }

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Fines + cases + wanted' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.fines; $i++) {
        $citizen = (($i - 1) % $manifest.counts.citizens) + 1
        $officer = (($i - 1) % $manifest.counts.officers) + 1
        $vehicle = (($i - 1) % $manifest.counts.vehicles) + 1
        $issued = $startDate.AddDays($random.Next(0, $Years * 365)).AddHours($random.Next(0, 24))
        $due = $issued.Date.AddDays(30)
        $status = if ($i % 7 -eq 0) { 'PAID' } elseif ($i % 19 -eq 0) { 'FAILED' } else { 'PENDING' }

        $writers.fines.WriteLine(
            ('INSERT INTO fines (fine_number, citizen_id, officer_id, vehicle_id, violation_type, amount, issued_at, due_date, status, quality_status) VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9});' -f
            (Escape-Sql ('FN-{0}-{1:D6}' -f $issued.Year, $i)),
            $citizen,
            $officer,
            $vehicle,
            (Escape-Sql $offenses[($i - 1) % $offenses.Count]),
            ('{0:N2}' -f (30000 + (($i % 8) * 10000))).Replace(',', ''),
            (To-SqlTs $issued),
            (To-SqlDate $due),
            (Escape-Sql $status),
            (Escape-Sql (Get-QualityStatus -Random $random)))
        )

        Add-SampledRow -Buffer $fineSample -Row ([pscustomobject]@{ id = $i; citizen_id = $citizen; status = $status; issued_at = $issued }) -Limit $ExportSampleLimit
    }

    for ($i = 1; $i -le $manifest.counts.cases; $i++) {
        $opened = $startDate.AddDays($random.Next(0, $Years * 365)).AddHours($random.Next(0, 24))
        $status = @('OPEN','CLOSED','UNDER_INVESTIGATION')[($i - 1) % 3]
        $closedSql = 'NULL'
        if ($status -eq 'CLOSED') {
            $closedSql = To-SqlTs $opened.AddDays($random.Next(5, 120))
        }

        $caseNumberSql = Escape-Sql ('TZP-{0}-{1:D6}' -f $opened.Year, $i)
        $citizenId = (($i - 1) % $manifest.counts.citizens) + 1
        $officerId = (($i - 1) % $manifest.counts.officers) + 1
        $stationId = (($i - 1) % 20) + 1
        $fineId = (($i - 1) % $manifest.counts.fines) + 1
        $caseTypeSql = Escape-Sql @('Accident','Fraud','Reckless Driving','Hit and Run')[($i - 1) % 4]
        $statusSql = Escape-Sql $status
        $openedSql = To-SqlTs $opened
        $summarySql = Escape-Sql ('Case summary ' + $i)

        $writers.cases.WriteLine("INSERT INTO cases (case_number, citizen_id, officer_id, station_id, related_fine_id, case_type, status, opened_at, closed_at, summary) VALUES ($caseNumberSql, $citizenId, $officerId, $stationId, $fineId, $caseTypeSql, $statusSql, $openedSql, $closedSql, $summarySql);")

        Add-SampledRow -Buffer $caseSample -Row ([pscustomobject]@{ id = $i; citizen_id = $citizenId; status = $status; opened_at = $opened }) -Limit $ExportSampleLimit
    }

    for ($i = 1; $i -le $manifest.counts.wanted; $i++) {
        $listed = $startDate.AddDays($random.Next(0, $Years * 365))
        $wCitizen = (($i - 1) % $manifest.counts.citizens) + 1
        $wCase = (($i - 1) % $manifest.counts.cases) + 1
        $wRisk = Escape-Sql @('LOW','MEDIUM','HIGH','CRITICAL')[($i - 1) % 4]
        $wLocation = Escape-Sql ('Ward-' + (($i % 100) + 1))
        $wListed = To-SqlTs $listed
        $writers.wanted.WriteLine("INSERT INTO wanted_persons (citizen_id, case_id, risk_level, last_seen_location, listed_at, is_active) VALUES ($wCitizen, $wCase, $wRisk, $wLocation, $wListed, TRUE);")
    }

    $step++
    Write-Progress -Activity 'Simulation generation' -Status 'Insurance + court + evidence + sessions' -PercentComplete (($step / $totalSteps) * 100)
    for ($i = 1; $i -le $manifest.counts.insurance; $i++) {
        $sDate = $startDate.AddDays($random.Next(0, $Years * 365))
        $eDate = $sDate.AddYears(1)
        $policyNo = Escape-Sql ('POL-' + $i.ToString('D10'))
        $vehId = (($i - 1) % $manifest.counts.vehicles) + 1
        $provider = Escape-Sql @('NIC Tanzania','Jubilee Tanzania','Alliance','Sanlam')[($i - 1) % 4]
        $policyStatus = Escape-Sql $(if ($i % 6 -eq 0) { 'EXPIRED' } else { 'ACTIVE' })
        $sDateSql = To-SqlDate $sDate
        $eDateSql = To-SqlDate $eDate
        $premium = ('{0:N2}' -f (250000 + (($i % 6) * 75000))).Replace(',', '')
        $writers.insurance.WriteLine("INSERT INTO insurance_policies (policy_number, vehicle_id, provider_name, policy_status, start_date, end_date, premium_amount) VALUES ($policyNo, $vehId, $provider, $policyStatus, $sDateSql, $eDateSql, $premium);")
    }

    for ($i = 1; $i -le $manifest.counts.courts; $i++) {
        $courtCase = (($i - 1) % $manifest.counts.cases) + 1
        $courtName = Escape-Sql @('Kisutu Resident Magistrate Court','Kinondoni Court','Ilala Court')[($i - 1) % 3]
        $hearingDate = To-SqlDate $startDate.AddDays($random.Next(0, $Years * 365))
        $verdict = Escape-Sql @('PENDING','DISMISSED','CONVICTED','SETTLED')[($i - 1) % 4]
        $penalty = ('{0:N2}' -f (50000 + (($i % 9) * 35000))).Replace(',', '')
        $remarks = Escape-Sql 'Automated synthetic hearing'
        $writers.courts.WriteLine("INSERT INTO court_records (case_id, court_name, hearing_date, verdict_status, penalty_amount, remarks) VALUES ($courtCase, $courtName, $hearingDate, $verdict, $penalty, $remarks);")
    }

    for ($i = 1; $i -le $manifest.counts.evidence; $i++) {
        $collected = $startDate.AddDays($random.Next(0, $Years * 365)).AddHours($random.Next(0, 24))
        $eCase = (($i - 1) % $manifest.counts.cases) + 1
        $source = Escape-Sql @('CCTV','GPS','PHOTO','DOCUMENT','WITNESS')[($i - 1) % 5]
        $eOfficer = (($i - 1) % $manifest.counts.officers) + 1
        $collectedSql = To-SqlTs $collected
        $coc = Escape-Sql ('COC-' + $i.ToString('D8'))
        $hash = Escape-Sql ('hash-' + $i.ToString('x8'))
        $isMissing = $(if ($i % 25 -eq 0) { 'TRUE' } else { 'FALSE' })
        $noteSql = Escape-Sql 'Synthetic evidence item'
        $writers.evidence.WriteLine("INSERT INTO evidence (case_id, source_type, collected_by_officer_id, collected_at, chain_of_custody_ref, integrity_hash, is_missing, notes) VALUES ($eCase, $source, $eOfficer, $collectedSql, $coc, $hash, $isMissing, $noteSql);")

        if ($i % 2 -eq 0) {
            $fileName = Escape-Sql ('evidence-' + $i + '.jpg')
            $fileType = Escape-Sql 'image/jpeg'
            $fileSize = 200000 + ($i % 900000)
            $storagePath = Escape-Sql ('/mock/attachments/evidence-' + $i + '.jpg')
            $writers.evidence.WriteLine("INSERT INTO attachments (evidence_id, file_name, content_type, file_size_bytes, storage_path) VALUES ($i, $fileName, $fileType, $fileSize, $storagePath);")
        }
    }

    for ($i = 1; $i -le $manifest.counts.sessions; $i++) {
        $started = $startDate.AddDays($random.Next(0, $Years * 365)).AddHours($random.Next(0, 24))
        $ended = $started.AddMinutes($random.Next(5, 720))
        $sessionOfficer = (($i - 1) % $manifest.counts.officers) + 1
        $deviceCode = Escape-Sql ('DEV-' + $i.ToString('D7'))
        $startedSql = To-SqlTs $started
        $endedSql = To-SqlTs $ended
        $authMethod = Escape-Sql @('PASSWORD','SSO','TOKEN','MFA')[($i - 1) % 4]
        $sessionStatus = Escape-Sql @('ACTIVE','EXPIRED','TERMINATED')[($i - 1) % 3]
        $writers.sessions.WriteLine("INSERT INTO user_sessions (officer_id, device_id, started_at, ended_at, auth_method, session_status) VALUES ($sessionOfficer, $deviceCode, $startedSql, $endedSql, $authMethod, $sessionStatus);")
    }

    foreach ($w in $writers.Values) {
        $w.WriteLine('COMMIT;')
    }
}
finally {
    foreach ($w in $writers.Values) {
        Close-Writer -Writer $w
    }
}

Export-ModuleData -Paths $paths -Module 'citizens' -Rows $citizenSample
Export-ModuleData -Paths $paths -Module 'officers' -Rows $officerSample
Export-ModuleData -Paths $paths -Module 'vehicles' -Rows $vehicleSample
Export-ModuleData -Paths $paths -Module 'licenses' -Rows $licenseSample
Export-ModuleData -Paths $paths -Module 'fines' -Rows $fineSample
Export-ModuleData -Paths $paths -Module 'cases' -Rows $caseSample

$step++
Write-Progress -Activity 'Simulation generation' -Status 'Timeline + module scripts' -PercentComplete (($step / $totalSteps) * 100)

$moduleScripts = @(
    'generate_full_timeline.ps1',
    'generate_payments.ps1',
    'generate_cctv.ps1',
    'generate_gps.ps1',
    'generate_notifications.ps1',
    'generate_audit_logs.ps1',
    'generate_edge_cases.ps1'
)

if ($EnableParallel) {
    $jobs = @()
    foreach ($scriptName in $moduleScripts) {
        $scriptPath = Join-Path $scriptRoot $scriptName
        $jobs += Start-Job -ScriptBlock {
            param($Path)
            & $Path
        } -ArgumentList $scriptPath
    }

    Wait-Job -Job $jobs | Out-Null
    $jobFailures = $jobs | Where-Object { $_.State -ne 'Completed' }
    if ($jobFailures.Count -gt 0) {
        throw 'One or more module jobs failed.'
    }

    foreach ($job in $jobs) {
        Receive-Job -Job $job | Out-Host
        Remove-Job -Job $job | Out-Null
    }
}
else {
    foreach ($scriptName in $moduleScripts) {
        $scriptPath = Join-Path $scriptRoot $scriptName
        Invoke-WithRetry -Operation { & $scriptPath } -MaxRetries 3 -DelaySeconds 2
    }
}

$step++
Write-Progress -Activity 'Simulation generation' -Status 'Reporting' -PercentComplete (($step / $totalSteps) * 100)

Set-Content -Path (Join-Path $paths.Reports 'seed_report.md') -Encoding UTF8 -Value @(
    '# Seed Report',
    '',
    ('Profile: {0}' -f $manifest.profile),
    ('Years Simulated: {0}' -f $manifest.counts.years),
    ('Citizens: {0}' -f $manifest.counts.citizens),
    ('Vehicles: {0}' -f $manifest.counts.vehicles),
    ('Licenses: {0}' -f $manifest.counts.licenses),
    ('Officers: {0}' -f $manifest.counts.officers),
    ('Fines: {0}' -f $manifest.counts.fines),
    ('Cases: {0}' -f $manifest.counts.cases),
    ('Wanted: {0}' -f $manifest.counts.wanted),
    ('Payments: {0}' -f $manifest.counts.payments),
    ('CCTV: {0}' -f $manifest.counts.cctv),
    ('GPS Logs: {0}' -f $manifest.counts.gps),
    ('Notifications: {0}' -f $manifest.counts.notifications),
    ('Audit Logs: {0}' -f $manifest.counts.audit_logs)
)

Write-Progress -Activity 'Simulation generation' -Completed
Write-Log -Paths $paths -Message 'Simulation generation completed successfully.'
