Set-Location $PSScriptRoot
$env:PERSONACHAT_DATA_DIR = Join-Path $PSScriptRoot "local-runtime\data"
$logDir = Join-Path $PSScriptRoot "local-runtime\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
node .\server.js *> (Join-Path $logDir "server.full.log")
