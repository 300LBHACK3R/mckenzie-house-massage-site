[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Users\techn\heather-massage-site",
  [switch]$NoStart,
  [switch]$UseWebpack
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
  param([string]$Text)

  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkGreen
  Write-Host $Text -ForegroundColor Green
  Write-Host "============================================================" -ForegroundColor DarkGreen
}

function Assert-ExitCode {
  param([string]$CommandName)

  if ($LASTEXITCODE -ne 0) {
    throw "$CommandName failed with exit code $LASTEXITCODE."
  }
}

function Remove-DirectorySafe {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  try {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
  }
  catch {
    Write-Warning "Normal removal failed for $Path. Retrying with cmd.exe."
    & cmd.exe /d /s /c "rmdir /s /q `"$Path`""
  }

  if (Test-Path -LiteralPath $Path) {
    throw "Could not remove $Path. Close any editor or terminal using the project and run this script again."
  }
}

function Write-Utf8NoBom {
  param(
    [string]$Path,
    [string]$Content
  )

  $Encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$PackageJsonPath = Join-Path $ProjectRoot "package.json"
$PackageLockPath = Join-Path $ProjectRoot "package-lock.json"
$NextConfigPath = Join-Path $ProjectRoot "next.config.ts"
$NextOutputPath = Join-Path $ProjectRoot ".next"
$NodeModulesPath = Join-Path $ProjectRoot "node_modules"
$BackupRoot = Join-Path $ProjectRoot ".repair-backups"
$BackupPath = Join-Path $BackupRoot (Get-Date -Format "yyyyMMdd-HHmmss")

Write-Step "McKenzie House Massage - Next.js runtime repair v3"

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
  throw "Project folder not found: $ProjectRoot"
}

if (-not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)) {
  throw "package.json was not found in $ProjectRoot"
}

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found in PATH."
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw "npm was not found in PATH."
}

Set-Location -LiteralPath $ProjectRoot

$PackageJson = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

if ($PackageJson.name -ne "heather-massage-site") {
  throw "Wrong project detected. Expected heather-massage-site but found $($PackageJson.name)."
}

$NodeVersionText = (& node.exe -p "process.versions.node").Trim()
$NodeVersion = [version]$NodeVersionText

if ($NodeVersion -lt [version]"20.9.0") {
  throw "Next.js 16 requires Node.js 20.9.0 or newer. Installed: $NodeVersionText"
}

Write-Host "Project: $ProjectRoot" -ForegroundColor Cyan
Write-Host "Node.js: $NodeVersionText" -ForegroundColor Cyan

Write-Step "1 of 9 - Stopping Node processes tied to this project"

try {
  $ProjectProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
      $_.CommandLine -and
      $_.CommandLine.IndexOf(
        $ProjectRoot,
        [System.StringComparison]::OrdinalIgnoreCase
      ) -ge 0
    }

  foreach ($Process in $ProjectProcesses) {
    Write-Host "Stopping Node process $($Process.ProcessId)..." -ForegroundColor Yellow
    Stop-Process -Id $Process.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
catch {
  Write-Warning "Could not inspect Node processes automatically: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 600

Write-Step "2 of 9 - Backing up project configuration"

New-Item -ItemType Directory -Force -Path $BackupPath | Out-Null

foreach ($FileName in @("next.config.ts", "package.json", "package-lock.json")) {
  $Source = Join-Path $ProjectRoot $FileName

  if (Test-Path -LiteralPath $Source -PathType Leaf) {
    Copy-Item -LiteralPath $Source -Destination $BackupPath -Force
    Write-Host "Backed up $FileName"
  }
}

$GitIgnorePath = Join-Path $ProjectRoot ".gitignore"
$GitIgnoreEntry = ".repair-backups/"

if (Test-Path -LiteralPath $GitIgnorePath -PathType Leaf) {
  $GitIgnoreText = Get-Content -LiteralPath $GitIgnorePath -Raw

  if ($GitIgnoreText -notmatch "(?m)^\.repair-backups/$") {
    Add-Content -LiteralPath $GitIgnorePath -Value $GitIgnoreEntry
  }
}
else {
  Write-Utf8NoBom -Path $GitIgnorePath -Content "$GitIgnoreEntry`r`n"
}

Write-Host "Backup folder: $BackupPath" -ForegroundColor Cyan

Write-Step "3 of 9 - Writing the corrected next.config.ts"

$ConfigBase64 = "aW1wb3J0IHR5cGUgeyBOZXh0Q29uZmlnIH0gZnJvbSAibmV4dCI7Cgpjb25zdCBpc1Byb2R1Y3Rpb24gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gInByb2R1Y3Rpb24iOwoKY29uc3QgY29tbW9uU2VjdXJpdHlIZWFkZXJzID0gWwogIHsKICAgIGtleTogIlJlZmVycmVyLVBvbGljeSIsCiAgICB2YWx1ZTogInN0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW4iLAogIH0sCiAgewogICAga2V5OiAiWC1Db250ZW50LVR5cGUtT3B0aW9ucyIsCiAgICB2YWx1ZTogIm5vc25pZmYiLAogIH0sCiAgewogICAga2V5OiAiWC1GcmFtZS1PcHRpb25zIiwKICAgIHZhbHVlOiAiREVOWSIsCiAgfSwKICB7CiAgICBrZXk6ICJYLUROUy1QcmVmZXRjaC1Db250cm9sIiwKICAgIHZhbHVlOiAib24iLAogIH0sCiAgewogICAga2V5OiAiUGVybWlzc2lvbnMtUG9saWN5IiwKICAgIHZhbHVlOgogICAgICAiY2FtZXJhPSgpLCBtaWNyb3Bob25lPSgpLCBnZW9sb2NhdGlvbj0oKSwgcGF5bWVudD0oKSwgdXNiPSgpLCBzZXJpYWw9KCksIGJsdWV0b290aD0oKSwgYnJvd3NpbmctdG9waWNzPSgpIiwKICB9LAogIHsKICAgIGtleTogIlgtUGVybWl0dGVkLUNyb3NzLURvbWFpbi1Qb2xpY2llcyIsCiAgICB2YWx1ZTogIm5vbmUiLAogIH0sCl07Cgpjb25zdCBwcm9kdWN0aW9uU2VjdXJpdHlIZWFkZXJzID0gaXNQcm9kdWN0aW9uCiAgPyBbCiAgICAgIHsKICAgICAgICBrZXk6ICJTdHJpY3QtVHJhbnNwb3J0LVNlY3VyaXR5IiwKICAgICAgICB2YWx1ZTogIm1heC1hZ2U9NjMwNzIwMDA7IGluY2x1ZGVTdWJEb21haW5zOyBwcmVsb2FkIiwKICAgICAgfSwKICAgIF0KICA6IFtdOwoKY29uc3QgbmV4dENvbmZpZzogTmV4dENvbmZpZyA9IHsKICBwb3dlcmVkQnlIZWFkZXI6IGZhbHNlLAogIHJlYWN0U3RyaWN0TW9kZTogdHJ1ZSwKICBjb21wcmVzczogdHJ1ZSwKICBwcm9kdWN0aW9uQnJvd3NlclNvdXJjZU1hcHM6IGZhbHNlLAoKICB0dXJib3BhY2s6IHsKICAgIHJvb3Q6IHByb2Nlc3MuY3dkKCksCiAgfSwKCiAgaW1hZ2VzOiB7CiAgICBmb3JtYXRzOiBbImltYWdlL2F2aWYiLCAiaW1hZ2Uvd2VicCJdLAogICAgcXVhbGl0aWVzOiBbNzUsIDg0LCA4OCwgOTJdLAogICAgbWluaW11bUNhY2hlVFRMOiAxNF80MDAsCiAgfSwKCiAgYXN5bmMgaGVhZGVycygpIHsKICAgIHJldHVybiBbCiAgICAgIHsKICAgICAgICBzb3VyY2U6ICIvOnBhdGgqIiwKICAgICAgICBoZWFkZXJzOiBbCiAgICAgICAgICAuLi5jb21tb25TZWN1cml0eUhlYWRlcnMsCiAgICAgICAgICAuLi5wcm9kdWN0aW9uU2VjdXJpdHlIZWFkZXJzLAogICAgICAgIF0sCiAgICAgIH0sCiAgICAgIHsKICAgICAgICBzb3VyY2U6ICIvYXBpLzpwYXRoKiIsCiAgICAgICAgaGVhZGVyczogWwogICAgICAgICAgewogICAgICAgICAgICBrZXk6ICJDYWNoZS1Db250cm9sIiwKICAgICAgICAgICAgdmFsdWU6ICJuby1zdG9yZSwgbWF4LWFnZT0wIiwKICAgICAgICAgIH0sCiAgICAgICAgICB7CiAgICAgICAgICAgIGtleTogIlByYWdtYSIsCiAgICAgICAgICAgIHZhbHVlOiAibm8tY2FjaGUiLAogICAgICAgICAgfSwKICAgICAgICAgIHsKICAgICAgICAgICAga2V5OiAiWC1Sb2JvdHMtVGFnIiwKICAgICAgICAgICAgdmFsdWU6ICJub2luZGV4LCBub2ZvbGxvdywgbm9hcmNoaXZlIiwKICAgICAgICAgIH0sCiAgICAgICAgXSwKICAgICAgfSwKICAgIF07CiAgfSwKfTsKCmV4cG9ydCBkZWZhdWx0IG5leHRDb25maWc7Cg=="
$ConfigText = [System.Text.Encoding]::UTF8.GetString(
  [System.Convert]::FromBase64String($ConfigBase64)
)

Write-Utf8NoBom -Path $NextConfigPath -Content $ConfigText

Write-Host "Installed next.config.ts with:" -ForegroundColor Cyan
Write-Host "  - turbopack.root fixed to the project directory"
Write-Host "  - image qualities 75, 84, 88, and 92"
Write-Host "  - safe security and no-cache API headers"

Write-Step "4 of 9 - Removing corrupted build output and dependencies"

Remove-DirectorySafe -Path $NextOutputPath
Remove-DirectorySafe -Path (Join-Path $ProjectRoot ".turbo")
Remove-DirectorySafe -Path (Join-Path $ProjectRoot "out")
Remove-DirectorySafe -Path (Join-Path $ProjectRoot "dist")
Remove-DirectorySafe -Path (Join-Path $ProjectRoot "build")
Remove-DirectorySafe -Path $NodeModulesPath

$TsBuildInfo = Join-Path $ProjectRoot "tsconfig.tsbuildinfo"

if (Test-Path -LiteralPath $TsBuildInfo) {
  Remove-Item -LiteralPath $TsBuildInfo -Force
}

Write-Step "5 of 9 - Verifying the npm cache"

& npm.cmd cache verify
Assert-ExitCode "npm cache verify"

Write-Step "6 of 9 - Reinstalling the dependency tree"

if (Test-Path -LiteralPath $PackageLockPath -PathType Leaf) {
  & npm.cmd ci
  Assert-ExitCode "npm ci"
}
else {
  & npm.cmd install
  Assert-ExitCode "npm install"
}

Write-Step "7 of 9 - Repairing and verifying the SWC helper runtime"

$SwcHelpersVersion = (
  & node.exe -p "require('./node_modules/next/package.json').dependencies['@swc/helpers']"
).Trim()

Assert-ExitCode "reading the Next.js SWC helper dependency"

if ([string]::IsNullOrWhiteSpace($SwcHelpersVersion)) {
  throw "Next.js did not report an @swc/helpers dependency."
}

Write-Host "Next.js requires @swc/helpers $SwcHelpersVersion" -ForegroundColor Cyan

& npm.cmd install --save-exact "@swc/helpers@$SwcHelpersVersion"
Assert-ExitCode "installing @swc/helpers"

& node.exe -e "console.log(require.resolve('@swc/helpers/_/_interop_require_default'))"
Assert-ExitCode "resolving @swc/helpers/_/_interop_require_default"

Remove-DirectorySafe -Path $NextOutputPath

Write-Step "8 of 9 - Running TypeScript and production-build validation"

$ScriptNames = @()

if ($PackageJson.scripts) {
  $ScriptNames = @($PackageJson.scripts.PSObject.Properties.Name)
}

if ($ScriptNames -contains "typecheck") {
  & npm.cmd run typecheck
  Assert-ExitCode "npm run typecheck"
}
else {
  & npx.cmd tsc --noEmit
  Assert-ExitCode "npx tsc --noEmit"
}

$StartWithWebpack = [bool]$UseWebpack

if ($UseWebpack) {
  & npx.cmd next build --webpack
  Assert-ExitCode "next build --webpack"
}
else {
  & npm.cmd run build

  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Turbopack build failed. Retrying with Webpack."

    Remove-DirectorySafe -Path $NextOutputPath

    & npx.cmd next build --webpack
    Assert-ExitCode "next build --webpack"

    $StartWithWebpack = $true
  }
}

Write-Step "9 of 9 - Repair completed successfully"

Write-Host "The parser error is removed." -ForegroundColor Green
Write-Host "The stale .next output was rebuilt." -ForegroundColor Green
Write-Host "The SWC helper runtime resolves correctly." -ForegroundColor Green
Write-Host "The production build passed." -ForegroundColor Green
Write-Host ""
Write-Host "Local URL: http://localhost:3000" -ForegroundColor Cyan

$ParentLockfile = Join-Path (Split-Path -Parent $ProjectRoot) "package-lock.json"

if (Test-Path -LiteralPath $ParentLockfile -PathType Leaf) {
  Write-Host ""
  Write-Host "Parent lockfile left untouched: $ParentLockfile" -ForegroundColor Yellow
  Write-Host "turbopack.root now prevents it from changing this project's root." -ForegroundColor Yellow
}

if ($NoStart) {
  exit 0
}

Write-Host ""
Write-Host "Starting the development server. Press Ctrl+C to stop it." -ForegroundColor Cyan

if ($StartWithWebpack) {
  & npx.cmd next dev --webpack
}
else {
  & npm.cmd run dev
}

exit $LASTEXITCODE
