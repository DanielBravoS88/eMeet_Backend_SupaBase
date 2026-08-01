param(
  [string]$TargetHost = 'host.docker.internal',
  [int]$TargetPort = 4000,
  [string]$ZapHome = $env:ZAP_HOME
)

$ErrorActionPreference = 'Stop'
$allowedHosts = @('localhost', '127.0.0.1', 'host.docker.internal')

if ($TargetHost -notin $allowedHosts -or $TargetPort -ne 4000) {
  throw 'Objetivo rechazado. DAST backend solo permite hosts locales en el puerto 4000.'
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$reportsDir = Join-Path $PSScriptRoot 'reports'
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
if ($IsLinux) {
  & chmod 777 $reportsDir
}

$specPath = Join-Path $PSScriptRoot 'openapi-safe.yaml'
$specContent = Get-Content -Raw $specPath
if ($specContent -notmatch 'url:\s+http://host\.docker\.internal:4000') {
  throw 'La especificacion OpenAPI no conserva el servidor local permitido.'
}

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerCommand) {
  & docker version *> $null
  if ($LASTEXITCODE -eq 0) {
    $dockerArgs = @(
      'run', '--rm',
      '--add-host=host.docker.internal:host-gateway',
      '-v', "${repoRoot}:/zap/wrk:rw",
      '-t', 'ghcr.io/zaproxy/zaproxy:stable',
      'zap-api-scan.py',
      '-t', '/zap/wrk/dast/openapi-safe.yaml',
      '-f', 'openapi',
      '-S',
      '-O', "${TargetHost}:${TargetPort}",
      '-r', 'dast/reports/backend-api-baseline.html',
      '-J', 'dast/reports/backend-api-baseline.json',
      '-w', 'dast/reports/backend-api-baseline.md'
    )

    & docker @dockerArgs
    exit $LASTEXITCODE
  }
}

if (-not $ZapHome) {
  $ZapHome = 'C:\tmp\ZAP_2.17.0'
}

$zapBat = Join-Path $ZapHome 'zap.bat'
if (-not (Test-Path $zapBat)) {
  throw "No se encontro Docker operativo ni ZAP portable en $ZapHome."
}

$nativeHost = if ($TargetHost -eq 'host.docker.internal') { '127.0.0.1' } else { $TargetHost }
$env:DAST_TARGET = "http://${nativeHost}:${TargetPort}"
$env:DAST_REPORT_DIR = $reportsDir
$env:DAST_OPENAPI_FILE = $specPath
$planPath = (Resolve-Path (Join-Path $PSScriptRoot 'zap-native-api-baseline.yaml')).Path
$zapUserDir = Join-Path $env:TEMP 'emeet-zap-backend'

Push-Location $ZapHome
try {
  & $zapBat '-cmd' '-silent' '-dir' $zapUserDir `
    '-config' 'autoupdate.checkOnStart=false' `
    '-config' 'autoupdate.downloadNewRelease=false' `
    '-config' 'autoupdate.installAddonUpdates=false' `
    '-autorun' $planPath
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

exit $exitCode
