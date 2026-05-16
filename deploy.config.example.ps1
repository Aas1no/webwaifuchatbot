# Copy this file to deploy.config.ps1, then fill in your server details.
# deploy.config.ps1 is ignored by Git because it may contain private server info.

$DeployHost = "your.server.ip"
$DeployUser = "root"
$DeployPort = 22

# Use a dedicated app directory on the server. The deploy script manages:
#   /opt/personachat/releases
#   /opt/personachat/shared
#   /opt/personachat/current
$DeployPath = "/opt/personachat"

$AppPort = 8787

# RestartMode can be:
#   pm2      - start/restart with PM2
#   systemd  - restart an existing systemd service
#   none     - upload and switch files only; you restart manually
$RestartMode = "pm2"
$Pm2Name = "personachat"
$SystemdService = "personachat"

# Persistent data and optional environment file on the server.
$DataDir = "$DeployPath/shared/data"
$EnvFile = "$DeployPath/shared/.env"
