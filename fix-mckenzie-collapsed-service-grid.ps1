[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Users\techn\heather-massage-site",
  [switch]$NoBuild,
  [switch]$StartDev
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)

  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkGreen
  Write-Host $Message -ForegroundColor Green
  Write-Host "============================================================" -ForegroundColor DarkGreen
}

function Assert-ExitCode {
  param([string]$CommandName)

  if ($LASTEXITCODE -ne 0) {
    throw "$CommandName failed with exit code $LASTEXITCODE."
  }
}

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [string]$Content
  )

  $Encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$CssPath = Join-Path $ProjectRoot "src\app\globals.css"
$PagePath = Join-Path $ProjectRoot "src\app\page.tsx"
$SitePath = Join-Path $ProjectRoot "src\lib\site.ts"
$PackagePath = Join-Path $ProjectRoot "package.json"

Write-Step "McKenzie House Massage - collapsed service-grid repair"

foreach ($RequiredPath in @(
  $CssPath,
  $PagePath,
  $SitePath,
  $PackagePath
)) {
  if (-not (Test-Path -LiteralPath $RequiredPath -PathType Leaf)) {
    throw "Required project file was not found: $RequiredPath"
  }
}

$Package = Get-Content -LiteralPath $PackagePath -Raw |
  ConvertFrom-Json

if ($Package.name -ne "heather-massage-site") {
  throw "Wrong project detected. Expected heather-massage-site but found $($Package.name)."
}

$PageText = Get-Content -LiteralPath $PagePath -Raw
$SiteText = Get-Content -LiteralPath $SitePath -Raw

if ($PageText -notmatch 'service-card--\$\{service\.slug\}') {
  throw "The dynamic service-specific card class was not found in page.tsx."
}

if ($PageText -notmatch 'service-card--signature') {
  throw "The signature-service card class was not found in page.tsx."
}

foreach ($RequiredSlug in @(
  "massage",
  "sensory-massage",
  "relaxation-massage",
  "seasonal-body-renewal",
  "active-recovery-cupping"
)) {
  $SlugPattern =
    'slug:\s*"' +
    [Regex]::Escape($RequiredSlug) +
    '"'

  if ($SiteText -notmatch $SlugPattern) {
    throw "The expected service slug '$RequiredSlug' was not found in site.ts."
  }
}

Set-Location -LiteralPath $ProjectRoot

Write-Step "1. Creating a timestamped stylesheet backup"

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = "$CssPath.backup-grid-fix-$Timestamp"

Copy-Item `
  -LiteralPath $CssPath `
  -Destination $BackupPath `
  -Force

Write-Host "Backup created:" -ForegroundColor Cyan
Write-Host $BackupPath

Write-Step "2. Replacing the broken grid override"

$CssText = Get-Content -LiteralPath $CssPath -Raw

$PatchText = [System.Text.Encoding]::UTF8.GetString(
  [System.Convert]::FromBase64String(
    "LyogTUhNX1NFUlZJQ0VfR1JJRF9DT0xMQVBTRV9GSVhfU1RBUlQgKi8KCi8qCiAqIFRoZSBlYXJsaWVyIGxheW91dCBjcmVhdGVkIGEgdHdlbHZlLWNvbHVtbiBkZXNrdG9wIGdyaWQsIGJ1dCBhIGxlZ2FjeQogKiBydWxlIHdpdGggaGlnaGVyIHNwZWNpZmljaXR5IHN0aWxsIGZvcmNlZCBldmVyeSBjYXJkIHRvOgogKgogKiBncmlkLWNvbHVtbjogYXV0byAhaW1wb3J0YW50OwogKgogKiBFYWNoIGNhcmQgdGhlcmVmb3JlIG9jY3VwaWVkIG9uZSBuYXJyb3cgY29sdW1uLiBUaGVzZSBzZWxlY3RvcnMgaW5jbHVkZQogKiBib3RoIHRoZSBiYXNlIGNhcmQgY2xhc3MgYW5kIHRoZSBzZXJ2aWNlLXNwZWNpZmljIGNsYXNzIHNvIHRoZXkgb3V0cmFuawogKiB0aGF0IGxlZ2FjeSBydWxlIHdpdGhvdXQgY2hhbmdpbmcgYW55IHNlcnZpY2UgY29udGVudC4KICovCgpAbWVkaWEgKG1pbi13aWR0aDogMTI4MXB4KSB7CiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24gLnNlcnZpY2UtZ3JpZCB7CiAgICBkaXNwbGF5OiBncmlkICFpbXBvcnRhbnQ7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6CiAgICAgIHJlcGVhdCgxMiwgbWlubWF4KDAsIDFmcikpICFpbXBvcnRhbnQ7CiAgICBncmlkLWF1dG8tZmxvdzogcm93ICFpbXBvcnRhbnQ7CiAgICBnYXA6IGNsYW1wKDFyZW0sIDEuNHZ3LCAxLjM1cmVtKSAhaW1wb3J0YW50OwogICAgd2lkdGg6IG1pbigxMDAlLCAxNDQwcHgpICFpbXBvcnRhbnQ7CiAgICBtYXgtd2lkdGg6IDE0NDBweCAhaW1wb3J0YW50OwogICAgbWFyZ2luLWlubGluZTogYXV0byAhaW1wb3J0YW50OwogICAgYWxpZ24taXRlbXM6IHN0cmV0Y2ggIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1ncmlkCiAgICA+IC5zZXJ2aWNlLWNhcmQuc2VydmljZS1jYXJkLS1tYXNzYWdlIHsKICAgIGdyaWQtY29sdW1uOiAxIC8gc3BhbiA0ICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMSAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDsKICAgIG1pbi13aWR0aDogMCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLXNlbnNvcnktbWFzc2FnZSB7CiAgICBncmlkLWNvbHVtbjogNSAvIHNwYW4gNCAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDEgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDsKICAgIHRvcDogLTAuNDVyZW07CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtZ3JpZAogICAgPiAuc2VydmljZS1jYXJkLnNlcnZpY2UtY2FyZC0tcmVsYXhhdGlvbi1tYXNzYWdlIHsKICAgIGdyaWQtY29sdW1uOiA5IC8gc3BhbiA0ICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMSAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDsKICAgIG1pbi13aWR0aDogMCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLXNlYXNvbmFsLWJvZHktcmVuZXdhbCB7CiAgICBncmlkLWNvbHVtbjogMiAvIHNwYW4gNSAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDIgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1ncmlkCiAgICA+IC5zZXJ2aWNlLWNhcmQuc2VydmljZS1jYXJkLS1hY3RpdmUtcmVjb3ZlcnktY3VwcGluZyB7CiAgICBncmlkLWNvbHVtbjogNyAvIHNwYW4gNSAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDIgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDsKICB9Cn0KCkBtZWRpYSAobWluLXdpZHRoOiA3NjFweCkgYW5kIChtYXgtd2lkdGg6IDEyODBweCkgewogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uIC5zZXJ2aWNlLWdyaWQgewogICAgZGlzcGxheTogZ3JpZCAhaW1wb3J0YW50OwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOgogICAgICByZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpICFpbXBvcnRhbnQ7CiAgICBncmlkLWF1dG8tZmxvdzogcm93ICFpbXBvcnRhbnQ7CiAgICBnYXA6IGNsYW1wKDAuOTVyZW0sIDJ2dywgMS4yNXJlbSkgIWltcG9ydGFudDsKICAgIHdpZHRoOiBtaW4oMTAwJSwgOTYwcHgpICFpbXBvcnRhbnQ7CiAgICBtYXJnaW4taW5saW5lOiBhdXRvICFpbXBvcnRhbnQ7CiAgICBhbGlnbi1pdGVtczogc3RyZXRjaCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLXNlbnNvcnktbWFzc2FnZSB7CiAgICBncmlkLWNvbHVtbjogMSAvIC0xICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMSAhaW1wb3J0YW50OwogICAgd2lkdGg6IG1pbigxMDAlLCA2MjBweCkgIWltcG9ydGFudDsKICAgIG1pbi13aWR0aDogMCAhaW1wb3J0YW50OwogICAganVzdGlmeS1zZWxmOiBjZW50ZXIgIWltcG9ydGFudDsKICAgIHRvcDogMCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLW1hc3NhZ2UgewogICAgZ3JpZC1jb2x1bW46IDEgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiAyICFpbXBvcnRhbnQ7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50OwogICAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtZ3JpZAogICAgPiAuc2VydmljZS1jYXJkLnNlcnZpY2UtY2FyZC0tcmVsYXhhdGlvbi1tYXNzYWdlIHsKICAgIGdyaWQtY29sdW1uOiAyICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMiAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDsKICAgIG1pbi13aWR0aDogMCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLXNlYXNvbmFsLWJvZHktcmVuZXdhbCB7CiAgICBncmlkLWNvbHVtbjogMSAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDMgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1ncmlkCiAgICA+IC5zZXJ2aWNlLWNhcmQuc2VydmljZS1jYXJkLS1hY3RpdmUtcmVjb3ZlcnktY3VwcGluZyB7CiAgICBncmlkLWNvbHVtbjogMiAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDMgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDsKICB9Cn0KCkBtZWRpYSAobWF4LXdpZHRoOiA3NjBweCkgewogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uIC5zZXJ2aWNlLWdyaWQgewogICAgZGlzcGxheTogZ3JpZCAhaW1wb3J0YW50OwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgIWltcG9ydGFudDsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBtYXJnaW4taW5saW5lOiBhdXRvICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtZ3JpZAogICAgPiAuc2VydmljZS1jYXJkIHsKICAgIGdyaWQtY29sdW1uOiAxIC8gLTEgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiBhdXRvICFpbXBvcnRhbnQ7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50OwogICAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7CiAgICB0b3A6IDAgIWltcG9ydGFudDsKICB9Cn0KCkBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7CiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZC5zZXJ2aWNlLWNhcmQtLXNlbnNvcnktbWFzc2FnZSB7CiAgICB0b3A6IDAgIWltcG9ydGFudDsKICB9Cn0KCi8qIE1ITV9TRVJWSUNFX0dSSURfQ09MTEFQU0VfRklYX0VORCAqLwo="
  )
)

$ExistingPatchPattern =
  '(?s)/\* MHM_SERVICE_GRID_COLLAPSE_FIX_START \*/.*?/\* MHM_SERVICE_GRID_COLLAPSE_FIX_END \*/\s*'

$CssText = [Regex]::Replace(
  $CssText,
  $ExistingPatchPattern,
  ""
)

$CssText =
  $CssText.TrimEnd() +
  [Environment]::NewLine +
  [Environment]::NewLine +
  $PatchText.Trim() +
  [Environment]::NewLine

Write-Utf8NoBom `
  -Path $CssPath `
  -Content $CssText

Write-Host "Installed the high-specificity five-card grid rules." -ForegroundColor Cyan
Write-Host ""
Write-Host "Desktop layout:" -ForegroundColor Cyan
Write-Host "  Massage | Sensory Massage | Relaxation Massage"
Write-Host "      Body Renewal | Active Recovery Cupping"

Write-Step "3. Stopping this project's development server and clearing .next"

try {
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
      $_.CommandLine -and
      $_.CommandLine.IndexOf(
        $ProjectRoot,
        [System.StringComparison]::OrdinalIgnoreCase
      ) -ge 0
    } |
    ForEach-Object {
      Write-Host "Stopping Node process $($_.ProcessId)..." -ForegroundColor Yellow

      Stop-Process `
        -Id $_.ProcessId `
        -Force `
        -ErrorAction SilentlyContinue
    }
}
catch {
  Write-Warning "Could not inspect existing Node processes: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 700

Remove-Item `
  -LiteralPath (Join-Path $ProjectRoot ".next") `
  -Recurse `
  -Force `
  -ErrorAction SilentlyContinue

if (-not $NoBuild) {
  Write-Step "4. Running the production build"

  & npm.cmd run build
  Assert-ExitCode "Production build"

  Write-Host ""
  Write-Host "Service-grid repair installed and validated successfully." -ForegroundColor Green
}
else {
  Write-Host ""
  Write-Host "Repair installed without a production build because -NoBuild was supplied." -ForegroundColor Yellow
}

if ($StartDev) {
  Write-Step "Starting the development server"
  & npm.cmd run dev
}
else {
  Write-Host ""
  Write-Host "Start the website with:" -ForegroundColor Cyan
  Write-Host "npm run dev"
}
