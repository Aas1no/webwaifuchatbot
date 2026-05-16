Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $Root "deploy.config.ps1"
$RemoteScript = Join-Path $Root "scripts\remote-deploy.sh"

function Get-ConfigValue {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [object]$DefaultValue = $null
    )

    $variable = Get-Variable -Name $Name -Scope Script -ErrorAction SilentlyContinue
    if ($null -eq $variable -or $null -eq $variable.Value) {
        return $DefaultValue
    }

    if ($variable.Value -is [string] -and [string]::IsNullOrWhiteSpace($variable.Value)) {
        return $DefaultValue
    }

    return $variable.Value
}

function Assert-Command {
    param([Parameter(Mandatory = $true)][string]$Name)

    $command = Get-Command "$Name.exe" -ErrorAction SilentlyContinue
    if (-not $command) {
        $command = Get-Command $Name -ErrorAction SilentlyContinue
    }

    if (-not $command) {
        throw "Missing command '$Name'. Install OpenSSH Client or add it to PATH."
    }

    return $command.Source
}

function Quote-Bash {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return "''"
    }

    return "'" + $Value.Replace("'", "'\''") + "'"
}

if (-not (Test-Path $ConfigPath)) {
    throw "Missing deploy.config.ps1. Copy deploy.config.example.ps1 to deploy.config.ps1, then fill in your server details."
}

if (-not (Test-Path $RemoteScript)) {
    throw "Missing remote deploy script: $RemoteScript"
}

. $ConfigPath

$DeployHost = Get-ConfigValue "DeployHost"
$DeployUser = Get-ConfigValue "DeployUser"
$DeployPort = Get-ConfigValue "DeployPort" 22
$DeployPath = Get-ConfigValue "DeployPath"
$AppPort = Get-ConfigValue "AppPort" 8787
$RestartMode = Get-ConfigValue "RestartMode" "pm2"
$Pm2Name = Get-ConfigValue "Pm2Name" "personachat"
$SystemdService = Get-ConfigValue "SystemdService" "personachat"
$DataDir = Get-ConfigValue "DataDir" "$DeployPath/shared/data"
$EnvFile = Get-ConfigValue "EnvFile" "$DeployPath/shared/.env"

foreach ($required in @("DeployHost", "DeployUser", "DeployPath")) {
    $value = Get-ConfigValue $required
    if ([string]::IsNullOrWhiteSpace([string]$value)) {
        throw "Config value '$required' is required in deploy.config.ps1."
    }
}

$scp = Assert-Command "scp"
$ssh = Assert-Command "ssh"

$packageJsonPath = Join-Path $Root "package.json"
$packageInfo = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$safeVersion = ([string]$packageInfo.version) -replace "[^0-9A-Za-z._-]", "-"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "personachat-$safeVersion-$stamp.zip"
$distDir = Join-Path $Root "dist"
$archivePath = Join-Path $distDir $archiveName

$packageItems = @(
    "server.js",
    "index.html",
    "app.js",
    "styles.css",
    "anju-avatar.png",
    "package.json",
    "README.md",
    "start-server.ps1",
    ".gitignore",
    "scripts"
)

$existingItems = @()
foreach ($item in $packageItems) {
    $path = Join-Path $Root $item
    if (Test-Path $path) {
        $existingItems += $path
    }
}

if ($existingItems.Count -eq 0) {
    throw "No package files found."
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
if (Test-Path $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

Write-Host "Packing $archiveName ..."
Compress-Archive -LiteralPath $existingItems -DestinationPath $archivePath -CompressionLevel Optimal

$target = "$DeployUser@$DeployHost"
$remoteZip = "/tmp/$archiveName"
$remoteTarget = "${target}:$remoteZip"

Write-Host "Uploading to $remoteTarget ..."
& $scp -P $DeployPort $archivePath $remoteTarget
if ($LASTEXITCODE -ne 0) {
    throw "Upload failed."
}

$remoteVars = @(
    "DEPLOY_PATH=$(Quote-Bash $DeployPath)",
    "UPLOAD_ZIP=$(Quote-Bash $remoteZip)",
    "APP_PORT=$(Quote-Bash ([string]$AppPort))",
    "RESTART_MODE=$(Quote-Bash $RestartMode)",
    "PM2_NAME=$(Quote-Bash $Pm2Name)",
    "SYSTEMD_SERVICE=$(Quote-Bash $SystemdService)",
    "DATA_DIR=$(Quote-Bash $DataDir)",
    "ENV_FILE=$(Quote-Bash $EnvFile)"
)
$remoteCommand = ($remoteVars -join " ") + " bash -s"

Write-Host "Deploying on $target ..."
Get-Content -Raw $RemoteScript | & $ssh -p $DeployPort $target $remoteCommand
if ($LASTEXITCODE -ne 0) {
    throw "Remote deploy failed."
}

Write-Host "Deploy complete."
