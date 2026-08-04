[CmdletBinding()]
param(
  [string]$ProjectRoot = "C:\Users\techn\heather-massage-site",
  [switch]$NoStart,
  [switch]$ForceWebpack
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$TargetNextVersion = "16.2.11"
$MinimumNodeVersion = [version]"20.9.0"

function Write-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  Write-Host ""
  Write-Host "============================================================" -ForegroundColor DarkGreen
  Write-Host $Message -ForegroundColor Green
  Write-Host "============================================================" -ForegroundColor DarkGreen
}

function Invoke-NativeChecked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Description,

    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host ">> $Description" -ForegroundColor Cyan

  $global:LASTEXITCODE = 0
  & $Command
  $exitCode = $global:LASTEXITCODE

  if ($exitCode -ne 0) {
    throw "$Description failed with exit code $exitCode."
  }
}

function Remove-PathRobust {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  try {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
  }
  catch {
    Write-Warning "Normal removal failed for '$Path'. Trying the Windows command processor."

    $command = 'rmdir /s /q "{0}"' -f $Path
    & cmd.exe /d /s /c $command | Out-Null

    if (Test-Path -LiteralPath $Path) {
      throw "Unable to remove '$Path'. Close any editor or terminal using the project and run this script again."
    }
  }
}

function Stop-ProjectNodeProcesses {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Root
  )

  Write-Host "Checking for Node.js processes tied to this project..." -ForegroundColor DarkGray

  try {
    $processes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
      Where-Object {
        $_.CommandLine -and
        $_.CommandLine.IndexOf(
          $Root,
          [System.StringComparison]::OrdinalIgnoreCase
        ) -ge 0
      }

    foreach ($process in $processes) {
      Write-Host "Stopping project Node process $($process.ProcessId)..." -ForegroundColor Yellow
      Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
  catch {
    Write-Warning "Could not inspect project Node processes automatically: $($_.Exception.Message)"
  }
}

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $true)]
    [string]$Content
  )

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$PackageJsonPath = Join-Path $ProjectRoot "package.json"
$PackageLockPath = Join-Path $ProjectRoot "package-lock.json"
$NextConfigPath = Join-Path $ProjectRoot "next.config.ts"
$NodeModulesPath = Join-Path $ProjectRoot "node_modules"
$NextBuildPath = Join-Path $ProjectRoot ".next"
$BackupRoot = Join-Path $ProjectRoot ".repair-backups"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = Join-Path $BackupRoot $Timestamp

Write-Step "McKenzie House Massage — Next.js Runtime Repair"

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
  throw "Project folder not found: $ProjectRoot"
}

if (-not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)) {
  throw "package.json was not found at: $PackageJsonPath"
}

foreach ($commandName in @("node", "npm")) {
  if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
    throw "'$commandName' is not available in PATH."
  }
}

Set-Location -LiteralPath $ProjectRoot

$nodeVersionText = (& node -p "process.versions.node").Trim()
$nodeVersion = [version]$nodeVersionText

Write-Host "Project: $ProjectRoot"
Write-Host "Node.js: $nodeVersionText"

if ($nodeVersion -lt $MinimumNodeVersion) {
  throw "Next.js 16 requires Node.js $MinimumNodeVersion or newer. Installed: $nodeVersionText"
}

Stop-ProjectNodeProcesses -Root $ProjectRoot

Write-Step "1 of 8 — Backing up project configuration"

New-Item -ItemType Directory -Force -Path $BackupPath | Out-Null

foreach ($fileName in @("next.config.ts", "package.json", "package-lock.json")) {
  $sourcePath = Join-Path $ProjectRoot $fileName

  if (Test-Path -LiteralPath $sourcePath -PathType Leaf) {
    Copy-Item -LiteralPath $sourcePath -Destination $BackupPath -Force
    Write-Host "Backed up $fileName"
  }
}

$gitIgnorePath = Join-Path $ProjectRoot ".gitignore"
$gitIgnoreEntry = ".repair-backups/"

if (Test-Path -LiteralPath $gitIgnorePath -PathType Leaf) {
  $gitIgnoreContent = Get-Content -LiteralPath $gitIgnorePath -Raw

  if ($gitIgnoreContent -notmatch "(?m)^\.repair-backups/$") {
    $separator = if ($gitIgnoreContent.EndsWith("`n")) { "" } else { [Environment]::NewLine }

    [System.IO.File]::AppendAllText(
      $gitIgnorePath,
      "$separator$gitIgnoreEntry$([Environment]::NewLine)",
      (New-Object System.Text.UTF8Encoding($false))
    )
  }
}
else {
  Write-Utf8NoBom -Path $gitIgnorePath -Content "$gitIgnoreEntry$([Environment]::NewLine)"
}

Write-Step "2 of 8 — Installing the corrected Next.js configuration"

$nextConfig = @'
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const projectRoot = process.cwd();

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  isDevelopment ? "'unsafe-eval'" : "",
  "https://vercel.live",
].filter(Boolean);

const connectSources = [
  "'self'",
  "https:",
  isDevelopment ? "http:" : "",
  isDevelopment ? "ws:" : "",
  isDevelopment ? "wss:" : "",
].filter(Boolean);

const frameSources = [
  "'self'",
  "https://vercel.live",
];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  `connect-src ${connectSources.join(" ")}`,
  `frame-src ${frameSources.join(" ")}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(self), bluetooth=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), serial=(), usb=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  ...(!isDevelopment
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,

  turbopack: {
    root: projectRoot,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 84, 88, 92],
    minimumCacheTTL: 14_400,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/contact",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
'@

Write-Utf8NoBom -Path $NextConfigPath -Content $nextConfig
Write-Host "Replaced next.config.ts with the project-specific configuration."

Write-Step "3 of 8 — Standardizing package.json scripts"

$packagePatchPath = Join-Path $BackupPath "patch-package.cjs"

$packagePatch = @'
const fs = require("node:fs");
const path = require("node:path");

const packagePath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

pkg.scripts = {
  ...(pkg.scripts || {}),
  dev: "next dev",
  "dev:clean": "npm run clean && next dev",
  "dev:webpack": "npm run clean && next dev --webpack",
  build: "next build",
  "build:webpack": "npm run clean && next build --webpack",
  start: "next start",
  typecheck: "tsc --noEmit",
  check: "npm run typecheck && npm run build",
  clean:
    "node -e \"const fs=require('node:fs'); for (const p of ['.next','out','dist','build','tsconfig.tsbuildinfo']) fs.rmSync(p,{recursive:true,force:true});\"",
  info: "next info --verbose"
};

pkg.engines = {
  ...(pkg.engines || {}),
  node: ">=20.9.0"
};

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
'@

Write-Utf8NoBom -Path $packagePatchPath -Content $packagePatch
Invoke-NativeChecked -Description "Updating package.json scripts without changing application dependencies" -Command {
  & node $packagePatchPath
}
Remove-Item -LiteralPath $packagePatchPath -Force -ErrorAction SilentlyContinue

Write-Step "4 of 8 — Removing stale build output and corrupted dependencies"

foreach ($path in @(
  $NextBuildPath,
  (Join-Path $ProjectRoot ".turbo"),
  (Join-Path $ProjectRoot "tsconfig.tsbuildinfo"),
  (Join-Path $ProjectRoot "node_modules\.cache")
)) {
  Remove-PathRobust -Path $path
}

Remove-PathRobust -Path $NodeModulesPath

Write-Step "5 of 8 — Reinstalling a clean, supported dependency tree"

Invoke-NativeChecked -Description "Verifying the npm cache" -Command {
  & npm cache verify
}

if (Test-Path -LiteralPath $PackageLockPath -PathType Leaf) {
  Invoke-NativeChecked -Description "Installing dependencies from package-lock.json" -Command {
    & npm ci
  }
}
else {
  Write-Warning "package-lock.json is missing. Running npm install instead of npm ci."

  Invoke-NativeChecked -Description "Installing dependencies and creating package-lock.json" -Command {
    & npm install
  }
}

Invoke-NativeChecked -Description "Updating Next.js to the July 2026 Active LTS security patch" -Command {
  & npm install --save-exact "next@$TargetNextVersion"
}

$packageData = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

$hasDependencies =
  $packageData.PSObject.Properties.Name -contains "dependencies"

$hasDevDependencies =
  $packageData.PSObject.Properties.Name -contains "devDependencies"

$hasEslintConfigNext =
  ($hasDependencies -and
    $packageData.dependencies.PSObject.Properties.Name -contains "eslint-config-next") -or
  ($hasDevDependencies -and
    $packageData.devDependencies.PSObject.Properties.Name -contains "eslint-config-next")

if ($hasEslintConfigNext) {
  Invoke-NativeChecked -Description "Aligning eslint-config-next with Next.js $TargetNextVersion" -Command {
    & npm install --save-dev --save-exact "eslint-config-next@$TargetNextVersion"
  }
}

$swcHelpersRange = (& node -p "require('./node_modules/next/package.json').dependencies['@swc/helpers'] || ''").Trim()

if ([string]::IsNullOrWhiteSpace($swcHelpersRange)) {
  throw "The installed Next.js package did not declare @swc/helpers."
}

Invoke-NativeChecked -Description "Installing the exact SWC helper runtime required by Next.js" -Command {
  & npm install --save-exact "@swc/helpers@$swcHelpersRange"
}

Remove-PathRobust -Path $NextBuildPath

Write-Step "6 of 8 — Verifying package resolution"

Invoke-NativeChecked -Description "Resolving the SWC interop helper that previously failed" -Command {
  & node -e "console.log(require.resolve('@swc/helpers/_/_interop_require_default'))"
}

Invoke-NativeChecked -Description "Checking the installed framework dependency versions" -Command {
  & npm ls next react react-dom @swc/helpers --depth=0
}

$parentLockfile = Join-Path (Split-Path -Parent $ProjectRoot) "package-lock.json"

if (Test-Path -LiteralPath $parentLockfile -PathType Leaf) {
  Write-Host ""
  Write-Host "Parent lockfile detected: $parentLockfile" -ForegroundColor Yellow
  Write-Host "It is being left untouched. turbopack.root now prevents it from changing this project's workspace root." -ForegroundColor Yellow
}

Write-Step "7 of 8 — Running TypeScript and production-build validation"

Invoke-NativeChecked -Description "TypeScript validation" -Command {
  & npm run typecheck
}

$startWithWebpack = [bool]$ForceWebpack

if (-not $ForceWebpack) {
  Write-Host ""
  Write-Host ">> Production build with Turbopack" -ForegroundColor Cyan

  $global:LASTEXITCODE = 0
  & npm run build
  $turbopackBuildExitCode = $global:LASTEXITCODE

  if ($turbopackBuildExitCode -ne 0) {
    Write-Warning "The Turbopack build failed. Retrying once with Webpack to separate bundler problems from application-code problems."

    Remove-PathRobust -Path $NextBuildPath

    Invoke-NativeChecked -Description "Production build with Webpack fallback" -Command {
      & npm run build:webpack
    }

    $startWithWebpack = $true
  }
}
else {
  Invoke-NativeChecked -Description "Production build with Webpack" -Command {
    & npm run build:webpack
  }
}

Write-Step "8 of 8 — Repair complete"

Write-Host "Backup: $BackupPath" -ForegroundColor DarkGray
Write-Host "Next.js: $TargetNextVersion"
Write-Host "Turbopack root: $ProjectRoot"
Write-Host "Image qualities: 75, 84, 88, 92"
Write-Host "The unrelated Retro TV redirect and one-year public-asset cache override are removed."
Write-Host ""
Write-Host "Local URL:   http://localhost:3000" -ForegroundColor Green
Write-Host "Contact URL: http://localhost:3000/contact" -ForegroundColor Green

if ($NoStart) {
  Write-Host ""
  Write-Host "Development server was not started because -NoStart was supplied."
  exit 0
}

Write-Host ""
Write-Host "Starting the development server. Press Ctrl+C to stop it." -ForegroundColor Cyan

if ($startWithWebpack) {
  & npm run dev:webpack
}
else {
  & npm run dev
}

exit $global:LASTEXITCODE
