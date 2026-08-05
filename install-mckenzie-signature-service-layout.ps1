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

function Decode-Text {
  param([string]$Value)

  return [System.Text.Encoding]::UTF8.GetString(
    [System.Convert]::FromBase64String($Value)
  )
}

function Set-ServiceProperty {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text,

    [Parameter(Mandatory = $true)]
    [string]$Slug,

    [Parameter(Mandatory = $true)]
    [string]$Property,

    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $Pattern =
    '(?s)(slug:\s*"' +
    [Regex]::Escape($Slug) +
    '".*?' +
    [Regex]::Escape($Property) +
    ':\s*)(?:\d+|true|false)'

  $Regex = New-Object System.Text.RegularExpressions.Regex($Pattern)
  $Matches = $Regex.Matches($Text)

  if ($Matches.Count -ne 1) {
    throw "Expected exactly one '$Property' value for service '$Slug'; found $($Matches.Count)."
  }

  return $Regex.Replace(
    $Text,
    '${1}' + $Value,
    1
  )
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$PagePath = Join-Path $ProjectRoot "src\app\page.tsx"
$CssPath = Join-Path $ProjectRoot "src\app\globals.css"
$SitePath = Join-Path $ProjectRoot "src\lib\site.ts"
$PackagePath = Join-Path $ProjectRoot "package.json"

Write-Step "McKenzie House Massage - signature service layout"

foreach ($RequiredPath in @(
  $PagePath,
  $CssPath,
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

Set-Location -LiteralPath $ProjectRoot

Write-Step "1. Creating timestamped backups"

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

foreach ($Path in @($PagePath, $CssPath, $SitePath)) {
  $BackupPath = "$Path.backup-$Timestamp"
  Copy-Item -LiteralPath $Path -Destination $BackupPath -Force
  Write-Host "Backed up: $BackupPath" -ForegroundColor Cyan
}

Write-Step "2. Reordering services around the signature treatment"

$SiteText = Get-Content -LiteralPath $SitePath -Raw

if (
  $SiteText -notmatch 'slug:\s*"sensory-massage"' -or
  $SiteText -notmatch 'slug:\s*"active-recovery-cupping"'
) {
  throw "The five-service menu update is not installed. Sensory Massage or Active Recovery Cupping was not found in site.ts."
}

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "massage" `
  -Property "displayOrder" `
  -Value "1"

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "sensory-massage" `
  -Property "displayOrder" `
  -Value "2"

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "sensory-massage" `
  -Property "isSignature" `
  -Value "true"

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "relaxation-massage" `
  -Property "displayOrder" `
  -Value "3"

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "seasonal-body-renewal" `
  -Property "displayOrder" `
  -Value "4"

$SiteText = Set-ServiceProperty `
  -Text $SiteText `
  -Slug "active-recovery-cupping" `
  -Property "displayOrder" `
  -Value "5"

Write-Utf8NoBom -Path $SitePath -Content $SiteText

Write-Host "Desktop order:" -ForegroundColor Cyan
Write-Host "  Massage | Sensory Massage | Relaxation Massage"
Write-Host "  Seasonal Body Renewal | Active Recovery Cupping"

Write-Step "3. Adding service-specific classes and signature badge"

$PageText = Get-Content -LiteralPath $PagePath -Raw
$ClassReplacement = Decode-Text "Y2xhc3NOYW1lPXtbCiAgICAgICAgICAgICAgICAgICAgICAic2VydmljZS1jYXJkIiwKICAgICAgICAgICAgICAgICAgICAgICJzZXJ2aWNlLWNhcmQtbGluayIsCiAgICAgICAgICAgICAgICAgICAgICBgc2VydmljZS1jYXJkLS0ke3NlcnZpY2Uuc2x1Z31gLAogICAgICAgICAgICAgICAgICAgICAgc2VydmljZS5pc1NpZ25hdHVyZQogICAgICAgICAgICAgICAgICAgICAgICA/ICJzZXJ2aWNlLWNhcmQtLXNpZ25hdHVyZSIKICAgICAgICAgICAgICAgICAgICAgICAgOiAiIiwKICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pCiAgICAgICAgICAgICAgICAgICAgICAuam9pbigiICIpfQ=="
$BadgeSnippet = Decode-Text "ICAgICAgICAgICAgICAgICAgICB7c2VydmljZS5pc1NpZ25hdHVyZSA/ICgKICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0ic2VydmljZS1jYXJkX19zaWduYXR1cmUtYmFkZ2UiPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj0idHJ1ZSI+4pymPC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICBTaWduYXR1cmUgU2VydmljZQogICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPgogICAgICAgICAgICAgICAgICAgICkgOiBudWxsfQoK"

if ($PageText -notmatch 'service-card--\$\{service\.slug\}') {
  $ClassPattern =
    '(?m)^\s*className="service-card service-card-link"\s*$'

  $ClassRegex = New-Object System.Text.RegularExpressions.Regex($ClassPattern)
  $ClassMatches = $ClassRegex.Matches($PageText)

  if ($ClassMatches.Count -ne 1) {
    throw "Expected one homepage service-card class declaration; found $($ClassMatches.Count)."
  }

  $PageText = $ClassRegex.Replace(
    $PageText,
    "                    $ClassReplacement",
    1
  )
}

if ($PageText -notmatch 'service-card__signature-badge') {
  $ImagePattern =
    '(?m)^\s*<div className="service-image">\s*$'

  $ImageRegex = New-Object System.Text.RegularExpressions.Regex($ImagePattern)
  $ImageMatches = $ImageRegex.Matches($PageText)

  if ($ImageMatches.Count -lt 1) {
    throw "The homepage service image block was not found."
  }

  $PageText = $ImageRegex.Replace(
    $PageText,
    $BadgeSnippet +
      '                    <div className="service-image">',
    1
  )
}

Write-Utf8NoBom -Path $PagePath -Content $PageText

Write-Step "4. Installing the balanced five-card layout"

$CssText = Get-Content -LiteralPath $CssPath -Raw
$CssBlock = Decode-Text "LyogTUhNX1NJR05BVFVSRV9TRVJWSUNFX0xBWU9VVF9TVEFSVCAqLwoKLyoKICogUHJlbWl1bSBmaXZlLWNhcmQgc2VydmljZXMgY29tcG9zaXRpb246CiAqCiAqIERlc2t0b3A6CiAqIE1hc3NhZ2UgfCBTZW5zb3J5IE1hc3NhZ2UgfCBSZWxheGF0aW9uIE1hc3NhZ2UKICogICAgICBTZWFzb25hbCBCb2R5IFJlbmV3YWwgfCBBY3RpdmUgUmVjb3ZlcnkgQ3VwcGluZwogKgogKiBTZW5zb3J5IE1hc3NhZ2UgaXMgdmlzdWFsbHkgaWRlbnRpZmllZCBhcyBIZWF0aGVyJ3Mgc2lnbmF0dXJlIHNlcnZpY2UuCiAqLwojc2VydmljZXMuc2VydmljZXMtc2VjdGlvbiAuc2VydmljZS1jYXJkX19zaWduYXR1cmUtYmFkZ2UgewogIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICB0b3A6IDFyZW07CiAgcmlnaHQ6IDFyZW07CiAgei1pbmRleDogODsKICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICBhbGlnbi1pdGVtczogY2VudGVyOwogIGdhcDogMC40MnJlbTsKICBtYXgtd2lkdGg6IGNhbGMoMTAwJSAtIDJyZW0pOwogIHBhZGRpbmc6IDAuNThyZW0gMC43OHJlbTsKICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI0NiwgMjI2LCAxNjYsIDAuNDQpOwogIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogIGJhY2tncm91bmQ6CiAgICBsaW5lYXItZ3JhZGllbnQoCiAgICAgIDEzNWRlZywKICAgICAgcmdiYSgyMCwgNDIsIDIzLCAwLjk2KSwKICAgICAgcmdiYSg1MywgODIsIDUyLCAwLjk2KQogICAgKTsKICBjb2xvcjogI2ZmZmFmMDsKICBmb250LXNpemU6IDAuNjZyZW07CiAgZm9udC13ZWlnaHQ6IDk1MDsKICBsaW5lLWhlaWdodDogMTsKICBsZXR0ZXItc3BhY2luZzogMC4xM2VtOwogIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgYm94LXNoYWRvdzoKICAgIDAgMTJweCAzMHB4IHJnYmEoMTQsIDM1LCAxOCwgMC4yNiksCiAgICBpbnNldCAwIDFweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNik7CiAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEycHgpOwogIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEycHgpOwogIHBvaW50ZXItZXZlbnRzOiBub25lOwp9Cgojc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogIC5zZXJ2aWNlLWNhcmRfX3NpZ25hdHVyZS1iYWRnZQogID4gc3BhbiB7CiAgY29sb3I6ICNlY2QxODg7CiAgZm9udC1zaXplOiAwLjgycmVtOwogIGxpbmUtaGVpZ2h0OiAxOwp9Cgojc2VydmljZXMuc2VydmljZXMtc2VjdGlvbiAuc2VydmljZS1jYXJkLS1zaWduYXR1cmUgewogIHotaW5kZXg6IDI7CiAgYm9yZGVyLWNvbG9yOiByZ2JhKDE4MywgMTQ1LCA1OSwgMC41NikgIWltcG9ydGFudDsKICBiYWNrZ3JvdW5kOgogICAgcmFkaWFsLWdyYWRpZW50KAogICAgICBjaXJjbGUgYXQgODQlIDEzJSwKICAgICAgcmdiYSgyMjYsIDE5NCwgMTExLCAwLjIyKSwKICAgICAgdHJhbnNwYXJlbnQgMTdyZW0KICAgICksCiAgICByYWRpYWwtZ3JhZGllbnQoCiAgICAgIGNpcmNsZSBhdCAxMiUgODglLAogICAgICByZ2JhKDc0LCAxMTEsIDczLCAwLjEzKSwKICAgICAgdHJhbnNwYXJlbnQgMjByZW0KICAgICksCiAgICBsaW5lYXItZ3JhZGllbnQoCiAgICAgIDE0NWRlZywKICAgICAgcmdiYSgyNTUsIDI1MywgMjQ3LCAwLjk5KSwKICAgICAgcmdiYSgyNDQsIDIzMywgMjAzLCAwLjk4KQogICAgKSAhaW1wb3J0YW50OwogIGJveC1zaGFkb3c6CiAgICAwIDM0cHggMTAwcHggcmdiYSg1NywgNzQsIDQ4LCAwLjE4KSwKICAgIDAgMCAwIDFweCByZ2JhKDIxMiwgMTc3LCA5MCwgMC4xNiksCiAgICBpbnNldCAwIDFweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43MikgIWltcG9ydGFudDsKfQoKI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAuc2VydmljZS1jYXJkLS1zaWduYXR1cmUKICAuc2VydmljZS1pbWFnZSB7CiAgYm9yZGVyLWNvbG9yOiByZ2JhKDIxMCwgMTc2LCA4OSwgMC4zOCkgIWltcG9ydGFudDsKICBib3gtc2hhZG93OgogICAgMCAyMnB4IDUwcHggcmdiYSg0NCwgNTUsIDM2LCAwLjE4KSwKICAgIDAgMCAwIDFweCByZ2JhKDIyOCwgMjAyLCAxMzcsIDAuMTIpICFpbXBvcnRhbnQ7Cn0KCiNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgLnNlcnZpY2UtY2FyZC0tc2lnbmF0dXJlCiAgLnNlcnZpY2UtY29udGVudAogIGgzIHsKICBjb2xvcjogIzFkMzcxZiAhaW1wb3J0YW50Owp9Cgojc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogIC5zZXJ2aWNlLWNhcmQtLXNpZ25hdHVyZQogIC5zZXJ2aWNlLWxpbmstdGV4dCB7CiAgY29sb3I6ICMyYzUxMmUgIWltcG9ydGFudDsKfQoKQG1lZGlhIChob3ZlcjogaG92ZXIpIGFuZCAocG9pbnRlcjogZmluZSkgewogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uIC5zZXJ2aWNlLWNhcmQtLXNpZ25hdHVyZTpob3ZlciB7CiAgICBib3JkZXItY29sb3I6IHJnYmEoMTgzLCAxNDUsIDU5LCAwLjc4KSAhaW1wb3J0YW50OwogICAgYm94LXNoYWRvdzoKICAgICAgMCA0NHB4IDEyMHB4IHJnYmEoNTcsIDc0LCA0OCwgMC4yMyksCiAgICAgIDAgMCAwIDFweCByZ2JhKDIxMiwgMTc3LCA5MCwgMC4yNCksCiAgICAgIGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc2KSAhaW1wb3J0YW50OwogIH0KfQoKQG1lZGlhIChtaW4td2lkdGg6IDEyODFweCkgewogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uIC5zZXJ2aWNlLWdyaWQgewogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOgogICAgICByZXBlYXQoMTIsIG1pbm1heCgwLCAxZnIpKSAhaW1wb3J0YW50OwogICAgZ3JpZC1hdXRvLWZsb3c6IHJvdyAhaW1wb3J0YW50OwogICAgZ2FwOiBjbGFtcCgxcmVtLCAxLjR2dywgMS4zNXJlbSkgIWltcG9ydGFudDsKICAgIHdpZHRoOiBtaW4oMTAwJSwgMTQ0MHB4KSAhaW1wb3J0YW50OwogICAgbWF4LXdpZHRoOiAxNDQwcHggIWltcG9ydGFudDsKICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtZ3JpZAogICAgPiAuc2VydmljZS1jYXJkIHsKICAgIGFsaWduLXNlbGY6IHN0cmV0Y2ggIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uIC5zZXJ2aWNlLWNhcmQtLW1hc3NhZ2UgewogICAgZ3JpZC1jb2x1bW46IDEgLyBzcGFuIDQgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiAxICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtY2FyZC0tc2Vuc29yeS1tYXNzYWdlIHsKICAgIGdyaWQtY29sdW1uOiA1IC8gc3BhbiA0ICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMSAhaW1wb3J0YW50OwogICAgdG9wOiAtMC40NXJlbTsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1jYXJkLS1yZWxheGF0aW9uLW1hc3NhZ2UgewogICAgZ3JpZC1jb2x1bW46IDkgLyBzcGFuIDQgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiAxICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtY2FyZC0tc2Vhc29uYWwtYm9keS1yZW5ld2FsIHsKICAgIGdyaWQtY29sdW1uOiAyIC8gc3BhbiA1ICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMiAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWNhcmQtLWFjdGl2ZS1yZWNvdmVyeS1jdXBwaW5nIHsKICAgIGdyaWQtY29sdW1uOiA3IC8gc3BhbiA1ICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMiAhaW1wb3J0YW50OwogIH0KfQoKQG1lZGlhIChtaW4td2lkdGg6IDc2MXB4KSBhbmQgKG1heC13aWR0aDogMTI4MHB4KSB7CiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24gLnNlcnZpY2UtZ3JpZCB7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6CiAgICAgIHJlcGVhdCgyLCBtaW5tYXgoMCwgMWZyKSkgIWltcG9ydGFudDsKICAgIGdyaWQtYXV0by1mbG93OiByb3cgIWltcG9ydGFudDsKICAgIHdpZHRoOiBtaW4oMTAwJSwgOTYwcHgpICFpbXBvcnRhbnQ7CiAgICBnYXA6IGNsYW1wKDAuOTVyZW0sIDJ2dywgMS4yNXJlbSkgIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1jYXJkLS1zZW5zb3J5LW1hc3NhZ2UgewogICAgZ3JpZC1jb2x1bW46IDEgLyAtMSAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDEgIWltcG9ydGFudDsKICAgIHdpZHRoOiBtaW4oMTAwJSwgNjIwcHgpOwogICAganVzdGlmeS1zZWxmOiBjZW50ZXI7CiAgICB0b3A6IDA7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbiAuc2VydmljZS1jYXJkLS1tYXNzYWdlIHsKICAgIGdyaWQtY29sdW1uOiAxICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogMiAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWNhcmQtLXJlbGF4YXRpb24tbWFzc2FnZSB7CiAgICBncmlkLWNvbHVtbjogMiAhaW1wb3J0YW50OwogICAgZ3JpZC1yb3c6IDIgIWltcG9ydGFudDsKICB9CgogICNzZXJ2aWNlcy5zZXJ2aWNlcy1zZWN0aW9uCiAgICAuc2VydmljZS1jYXJkLS1zZWFzb25hbC1ib2R5LXJlbmV3YWwgewogICAgZ3JpZC1jb2x1bW46IDEgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiAzICFpbXBvcnRhbnQ7CiAgfQoKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbgogICAgLnNlcnZpY2UtY2FyZC0tYWN0aXZlLXJlY292ZXJ5LWN1cHBpbmcgewogICAgZ3JpZC1jb2x1bW46IDIgIWltcG9ydGFudDsKICAgIGdyaWQtcm93OiAzICFpbXBvcnRhbnQ7CiAgfQp9CgpAbWVkaWEgKG1heC13aWR0aDogNzYwcHgpIHsKICAjc2VydmljZXMuc2VydmljZXMtc2VjdGlvbiAuc2VydmljZS1ncmlkIHsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyICFpbXBvcnRhbnQ7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWdyaWQKICAgID4gLnNlcnZpY2UtY2FyZCB7CiAgICBncmlkLWNvbHVtbjogMSAvIC0xICFpbXBvcnRhbnQ7CiAgICBncmlkLXJvdzogYXV0byAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDsKICAgIHRvcDogMCAhaW1wb3J0YW50OwogIH0KCiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWNhcmRfX3NpZ25hdHVyZS1iYWRnZSB7CiAgICB0b3A6IDAuODVyZW07CiAgICByaWdodDogMC44NXJlbTsKICAgIHBhZGRpbmc6IDAuNTJyZW0gMC42OHJlbTsKICAgIGZvbnQtc2l6ZTogMC42MXJlbTsKICB9Cn0KCkBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7CiAgI3NlcnZpY2VzLnNlcnZpY2VzLXNlY3Rpb24KICAgIC5zZXJ2aWNlLWNhcmQtLXNlbnNvcnktbWFzc2FnZSB7CiAgICB0b3A6IDAgIWltcG9ydGFudDsKICB9Cn0KCi8qIE1ITV9TSUdOQVRVUkVfU0VSVklDRV9MQVlPVVRfRU5EICovCg=="

$ExistingBlockPattern =
  '(?s)/\* MHM_SIGNATURE_SERVICE_LAYOUT_START \*/.*?/\* MHM_SIGNATURE_SERVICE_LAYOUT_END \*/\s*'

$CssText = [Regex]::Replace(
  $CssText,
  $ExistingBlockPattern,
  ""
)

$CssText =
  $CssText.TrimEnd() +
  [Environment]::NewLine +
  [Environment]::NewLine +
  $CssBlock.Trim() +
  [Environment]::NewLine

Write-Utf8NoBom -Path $CssPath -Content $CssText

Write-Step "5. Clearing stale Next.js output"

Remove-Item `
  -LiteralPath (Join-Path $ProjectRoot ".next") `
  -Recurse `
  -Force `
  -ErrorAction SilentlyContinue

if (-not $NoBuild) {
  Write-Step "6. Running TypeScript validation"

  if ($Package.scripts.PSObject.Properties.Name -contains "typecheck") {
    & npm.cmd run typecheck
  }
  else {
    & npx.cmd tsc --noEmit
  }

  Assert-ExitCode "TypeScript validation"

  Write-Step "7. Running the production build"

  & npm.cmd run build
  Assert-ExitCode "Production build"

  Write-Host ""
  Write-Host "Signature-service layout installed successfully." -ForegroundColor Green
}
else {
  Write-Host ""
  Write-Host "Update installed without validation because -NoBuild was supplied." -ForegroundColor Yellow
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
