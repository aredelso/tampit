# Push code changes to the running EC2 instance.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\redeploy-ec2.ps1
param()
$ErrorActionPreference = 'Stop'

$Root         = Split-Path -Parent $PSScriptRoot
$InstanceFile = "$Root\.ec2-instance"

if (-not (Test-Path $InstanceFile)) {
  Write-Error '.ec2-instance not found. Run deploy-ec2.ps1 first.'
  exit 1
}

# Parse the instance file (KEY=VALUE format)
Get-Content $InstanceFile | ForEach-Object {
  if ($_ -match '^(\w+)=(.+)$') {
    Set-Variable -Name $Matches[1] -Value $Matches[2]
  }
}

Write-Host "→ Syncing code to $PUBLIC_IP..."
$TarCmd = "tar -czf - --exclude=node_modules --exclude=.next --exclude=build --exclude=generated -C `"$Root`" server shared client"
$SshCmd  = "ssh -i `"$KEY_FILE`" -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP `"tar -xzf - -C ~/app`""
cmd /c "$TarCmd | $SshCmd"

Write-Host '→ Restarting server and client...'
ssh -i $KEY_FILE -o StrictHostKeyChecking=no "ec2-user@$PUBLIC_IP" `
  'cd ~/app && docker compose restart server client'

Write-Host ''
Write-Host "✓ Redeployed to http://${PUBLIC_IP}:3000"
