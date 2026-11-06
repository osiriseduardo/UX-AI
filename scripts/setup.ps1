<#
.SYNOPSIS
    UX-AI environment setup for Windows.

.DESCRIPTION
    Checks that the UX-AI toolchain (git, uv, Python, Node.js) is installed and
    installs anything missing or outdated with winget, then installs project
    dependencies when ml/ or web/ exist. Minimum versions live in
    scripts/tool-versions.txt. macOS and Linux users: run scripts/setup.sh.

.PARAMETER Check
    Only report status; install nothing. Exits 1 if anything is missing or outdated.

.PARAMETER Yes
    Install without asking for confirmation.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -Check
#>
[CmdletBinding()]
param(
    [switch]$Check,
    [switch]$Yes,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Printed directly: Get-Help can block on an Update-Help prompt on fresh installs.
if ($Help) {
    Write-Host @'
Usage: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 [options]

Checks that the UX-AI toolchain (git, uv, Python, Node.js) is installed
and installs anything missing or outdated with winget, then installs
project dependencies when ml/ or web/ exist.

Options:
  -Check   Only report status; install nothing. Exits 1 if anything is
           missing or outdated.
  -Yes     Install without asking for confirmation.
  -Help    Show this help.

Minimum versions live in scripts\tool-versions.txt.
macOS and Linux users: run scripts/setup.sh instead.
'@
    exit 0
}

$RepoRoot = Split-Path -Parent $PSScriptRoot
$VersionsFile = Join-Path $PSScriptRoot 'tool-versions.txt'
$Tools = @('git', 'uv', 'python', 'node')  # order matters: python is installed through uv
$WingetIds = @{
    git  = 'Git.Git'
    uv   = 'astral-sh.uv'
    node = 'OpenJS.NodeJS.LTS'
}

if (-not (Test-Path $VersionsFile)) {
    Write-Error "Missing $VersionsFile"
}

function Get-MinVersion([string]$Tool) {
    foreach ($line in Get-Content $VersionsFile) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
        $parts = $trimmed -split '\s+'
        if ($parts[0] -eq $Tool) { return $parts[1] }
    }
    throw "No minimum version for '$Tool' in $VersionsFile"
}

function ConvertTo-Version([string]$Text) {
    $match = [regex]::Match($Text, '\d+(\.\d+)+')
    if (-not $match.Success) { return $null }
    $parts = @($match.Value.Split('.') | Select-Object -First 3)
    return [version]($parts -join '.')
}

# Runs a native command and returns its output, or $null when it is missing or fails.
function Invoke-Quiet([string]$Exe, [string[]]$Arguments) {
    if (-not (Get-Command $Exe -ErrorAction SilentlyContinue)) { return $null }
    $ErrorActionPreference = 'Continue'
    try {
        # stdout only: a warning on stderr would corrupt paths such as `uv python find`.
        $output = & $Exe @Arguments 2>$null | Out-String
    } catch {
        return $null
    }
    if ($LASTEXITCODE -ne 0) { return $null }
    return $output.Trim()
}

function Get-ToolVersion([string]$Tool) {
    $output = $null
    switch ($Tool) {
        'git'  { $output = Invoke-Quiet 'git' @('--version') }
        'uv'   { $output = Invoke-Quiet 'uv' @('--version') }
        'node' { $output = Invoke-Quiet 'node' @('--version') }
        'python' {
            $python = Invoke-Quiet 'uv' @('python', 'find', ">=$(Get-MinVersion 'python')")
            if ($python) { $output = Invoke-Quiet $python @('--version') }
        }
    }
    if (-not $output) { return $null }
    return ConvertTo-Version $output
}

function Test-AllTools {
    $missing = @()
    foreach ($tool in $Tools) {
        $min = Get-MinVersion $tool
        $current = Get-ToolVersion $tool
        if ($null -eq $current) {
            Write-Host ('  [MISSING]  {0,-7} (needs >= {1})' -f $tool, $min)
            $missing += $tool
        } elseif ($current -lt (ConvertTo-Version $min)) {
            Write-Host ('  [OUTDATED] {0,-7} {1} (needs >= {2})' -f $tool, $current, $min)
            $missing += $tool
        } else {
            Write-Host ('  [OK]       {0,-7} {1} (>= {2})' -f $tool, $current, $min)
        }
    }
    return , $missing
}

# Appends entries from $Additions that are not already in $Current (case-insensitive),
# keeping the order and every entry of $Current.
function Merge-PathEntries([string]$Current, [string[]]$Additions) {
    $entries = @($Current -split ';' | Where-Object { $_ })
    foreach ($addition in $Additions) {
        foreach ($entry in ($addition -split ';')) {
            if ($entry -and ($entries -notcontains $entry)) { $entries += $entry }
        }
    }
    return ($entries -join ';')
}

# winget updates PATH in the registry; add the new entries to this session
# without dropping session-only entries (e.g. Node managers set up by a profile).
function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = Merge-PathEntries $env:Path @($machine, $user)
}

function Install-WithWinget([string]$Tool) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget was not found. Install 'App Installer' from the Microsoft Store (https://apps.microsoft.com/detail/9NBLGGH4NNS1) and re-run."
    }
    $id = $WingetIds[$Tool]
    $verb = 'install'
    if ($null -ne (Get-ToolVersion $Tool)) { $verb = 'upgrade' }
    & winget $verb --id $id --exact --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "winget $verb $id exited with code $LASTEXITCODE; the re-check below will confirm the result."
    }
    Update-SessionPath
}

function Install-Tool([string]$Tool) {
    if ($Tool -eq 'python') {
        if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { throw 'uv is required to install Python.' }
        & uv python install (Get-MinVersion 'python')
        if ($LASTEXITCODE -ne 0) { throw 'uv python install failed.' }
        return
    }
    Install-WithWinget $Tool
}

function Install-ProjectDependencies {
    $mlProject = Join-Path $RepoRoot 'ml\pyproject.toml'
    if (Test-Path $mlProject) {
        Write-Host 'Installing Python dependencies (ml/)...'
        Push-Location (Join-Path $RepoRoot 'ml')
        try { & uv sync; if ($LASTEXITCODE -ne 0) { throw 'uv sync failed.' } } finally { Pop-Location }
    } else {
        Write-Host '  ml/pyproject.toml not found yet - skipping Python dependencies.'
    }

    $webPackage = Join-Path $RepoRoot 'web\package.json'
    if (Test-Path $webPackage) {
        Write-Host 'Installing Node.js dependencies (web/)...'
        Push-Location (Join-Path $RepoRoot 'web')
        try {
            if (Test-Path 'package-lock.json') { & npm ci } else { & npm install }
            if ($LASTEXITCODE -ne 0) { throw 'npm failed.' }
        } finally { Pop-Location }
    } else {
        Write-Host '  web/package.json not found yet - skipping Node.js dependencies.'
    }
}

function Confirm-Install([string]$Message) {
    if ($Yes) { return $true }
    if (-not [Environment]::UserInteractive) {
        throw 'Not running interactively. Re-run with -Yes to install.'
    }
    try {
        $answer = Read-Host "$Message [y/N]"
    } catch {
        throw 'Could not read an answer. Re-run with -Yes to install.'
    }
    if ($null -eq $answer) { return $false }
    return @('y', 'yes', 's', 'si') -contains $answer.Trim().ToLower()
}

Write-Host 'UX-AI setup - Windows (package manager: winget)'
Write-Host 'Checking tools:'
$missing = Test-AllTools

if ($missing.Count -gt 0) {
    if ($Check) {
        Write-Host "Missing or outdated: $($missing -join ' ')"
        Write-Host 'Run scripts\setup.ps1 to install them.'
        exit 1
    }
    try {
        $confirmed = Confirm-Install "Install or upgrade: $($missing -join ' ')?"
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
        exit 1
    }
    if (-not $confirmed) {
        Write-Host 'Cancelled. Nothing was installed.'
        exit 1
    }
    try {
        foreach ($tool in $missing) {
            Write-Host ''
            Write-Host "==> Installing $tool"
            Install-Tool $tool
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
        exit 1
    }
    Write-Host ''
    Write-Host 'Re-checking tools:'
    $missing = Test-AllTools
    if ($missing.Count -gt 0) {
        Write-Host "ERROR: Still missing or outdated: $($missing -join ' '). See the messages above."
        exit 1
    }
} else {
    Write-Host 'All tools are installed.'
}

if ($Check) { exit 0 }
try {
    Install-ProjectDependencies
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    exit 1
}
Write-Host ''
Write-Host 'Done. Open a new terminal so PATH changes take effect.'
