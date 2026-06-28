param(
  [string]$TargetHost = 'host.docker.internal',
  [int]$TargetPort = 4000
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

& docker version | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw 'Docker no esta disponible.'
}

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
