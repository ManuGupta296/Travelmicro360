$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$logDir = Join-Path $root 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$services = @(
    @{ Name = 'config-server';        Wait = 40 },
    @{ Name = 'eureka-server';        Wait = 30 },
    @{ Name = 'auth-service';         Wait = 18 },
    @{ Name = 'inventory-service';    Wait = 15 },
    @{ Name = 'customer-service';     Wait = 15 },
    @{ Name = 'notification-service'; Wait = 15 },
    @{ Name = 'compliance-service';   Wait = 15 },
    @{ Name = 'payment-service';      Wait = 15 },
    @{ Name = 'booking-service';      Wait = 18 },
    @{ Name = 'api-gateway';          Wait = 15 }
)

$i = 0
foreach ($svc in $services) {
    $i++
    $name = $svc.Name
    $jar  = Join-Path $root "$name\target\$name-1.0.0.jar"
    if (-not (Test-Path $jar)) { Write-Host "[$i/10] ${name}: JAR MISSING - skipping" -ForegroundColor Red; continue }
    $out = Join-Path $logDir "$name.out.log"
    $err = Join-Path $logDir "$name.err.log"
    Write-Host "[$i/10] Starting $name -> $jar"
    Start-Process -FilePath "java" -ArgumentList "-jar", "`"$jar`"" `
        -WorkingDirectory (Join-Path $root $name) `
        -WindowStyle Hidden `
        -RedirectStandardOutput $out `
        -RedirectStandardError  $err | Out-Null
    Start-Sleep -Seconds $svc.Wait
}

Write-Host "All launch commands issued. Logs in $logDir"
