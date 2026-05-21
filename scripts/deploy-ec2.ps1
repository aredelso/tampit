# First-time deploy to AWS EC2 (us-east-2, t2.micro free tier)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\deploy-ec2.ps1
param()
$ErrorActionPreference = 'Stop'

$Region   = 'us-east-2'
$KeyName  = 'coffee-tracker-key'
$SgName   = 'coffee-tracker-sg'
$Root     = Split-Path -Parent $PSScriptRoot
$KeyFile  = "$env:USERPROFILE\.ssh\$KeyName.pem"
$Ssh      = { param($Cmd) ssh -i $KeyFile -o StrictHostKeyChecking=no "ec2-user@$PublicIp" $Cmd }

# ── AMI ────────────────────────────────────────────────────────────────────────
Write-Host '→ Getting latest Amazon Linux 2023 AMI...'
$AmiId = aws ssm get-parameter `
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 `
  --region $Region --query Parameter.Value --output text
Write-Host "  $AmiId"

# ── Key pair ───────────────────────────────────────────────────────────────────
if (-not (Test-Path $KeyFile)) {
  Write-Host '→ Creating key pair...'
  New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
  aws ec2 create-key-pair --key-name $KeyName --region $Region `
    --query KeyMaterial --output text | Set-Content -Path $KeyFile -Encoding ascii -NoNewline
  & icacls $KeyFile /inheritance:r /grant:r "${env:USERNAME}:R" | Out-Null
  Write-Host "  Saved to $KeyFile"
} else {
  Write-Host "→ Using existing key pair at $KeyFile"
}

# ── Security group ─────────────────────────────────────────────────────────────
Write-Host '→ Setting up security group...'
$SgId = aws ec2 describe-security-groups `
  --filters "Name=group-name,Values=$SgName" `
  --region $Region --query 'SecurityGroups[0].GroupId' --output text 2>$null

if (-not $SgId -or $SgId -eq 'None') {
  $SgId = aws ec2 create-security-group `
    --group-name $SgName --description 'Coffee Tracker' `
    --region $Region --query GroupId --output text
}

foreach ($Port in @(22, 3000, 4000)) {
  aws ec2 authorize-security-group-ingress `
    --group-id $SgId --protocol tcp --port $Port --cidr 0.0.0.0/0 `
    --region $Region 2>$null
}
Write-Host "  $SgId (ports 22, 3000, 4000)"

# ── JWT secret ─────────────────────────────────────────────────────────────────
$JwtSecret = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })

# ── Launch instance ────────────────────────────────────────────────────────────
Write-Host '→ Launching t2.micro...'
$UserDataFile = "$PSScriptRoot\aws-userdata.sh"
$InstanceId = aws ec2 run-instances `
  --image-id $AmiId `
  --instance-type t2.micro `
  --key-name $KeyName `
  --security-group-ids $SgId `
  --region $Region `
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20}}]' `
  --user-data "file://$UserDataFile" `
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=coffee-tracker}]' `
  --query 'Instances[0].InstanceId' --output text
Write-Host "  $InstanceId"

Write-Host '→ Waiting for instance to run...'
aws ec2 wait instance-running --instance-ids $InstanceId --region $Region

$PublicIp = aws ec2 describe-instances `
  --instance-ids $InstanceId --region $Region `
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
Write-Host "  Public IP: $PublicIp"

# ── Wait for SSH ───────────────────────────────────────────────────────────────
Write-Host '→ Waiting for SSH...'
do {
  Start-Sleep 5
  $out = ssh -i $KeyFile -o StrictHostKeyChecking=no -o ConnectTimeout=5 `
    "ec2-user@$PublicIp" 'echo ok' 2>$null
} until ($out -eq 'ok')

Write-Host '→ Waiting for Docker (user-data still running)...'
do {
  Start-Sleep 5
  ssh -i $KeyFile -o StrictHostKeyChecking=no "ec2-user@$PublicIp" 'docker info' 2>$null
} until ($LASTEXITCODE -eq 0)

# ── Copy code via tar pipe ─────────────────────────────────────────────────────
Write-Host '→ Copying code...'
ssh -i $KeyFile -o StrictHostKeyChecking=no "ec2-user@$PublicIp" `
  'mkdir -p ~/app/server ~/app/shared ~/app/client'

# Windows tar supports --exclude; pipe through SSH
$TarCmd = "tar -czf - --exclude=node_modules --exclude=.next --exclude=build --exclude=generated -C `"$Root`" server shared client"
$SshCmd  = "ssh -i `"$KeyFile`" -o StrictHostKeyChecking=no ec2-user@$PublicIp `"tar -xzf - -C ~/app`""
cmd /c "$TarCmd | $SshCmd"

# ── Write docker-compose on remote ────────────────────────────────────────────
Write-Host '→ Writing docker-compose.yml...'
$Compose = @'
services:
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: coffee_tracker
    volumes:
      - db_data:/var/lib/postgresql/data

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    entrypoint: ['/usr/src/app/docker-entrypoint.sh']
    command: ['npm', 'run', 'dev']
    restart: unless-stopped
    environment:
      DATABASE_URL: 'postgresql://postgres:postgres@db:5432/coffee_tracker'
      PORT: '4000'
      NODE_ENV: development
      JWT_SECRET: '__JWT_SECRET__'
      CLIENT_ORIGIN: 'http://__PUBLIC_IP__:3000'
      CHOKIDAR_USEPOLLING: 'true'
    depends_on:
      - db
    ports:
      - '4000:4000'
    volumes:
      - ./server:/usr/src/app
      - /usr/src/app/node_modules
      - uploads:/usr/src/app/uploads

  client:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    restart: unless-stopped
    environment:
      API_URL: 'http://__PUBLIC_IP__:4000'
      NODE_ENV: development
      WATCHPACK_POLLING: 'true'
      NEXT_DISABLE_TURBOPACK: '1'
    ports:
      - '3000:3000'
    depends_on:
      - server
    volumes:
      - ./client:/app
      - ./shared:/app/../shared
      - /app/node_modules

volumes:
  db_data:
  uploads:
'@
$Compose = $Compose.Replace('__JWT_SECRET__', $JwtSecret)
$Compose = $Compose.Replace('__PUBLIC_IP__', $PublicIp)

$Compose | ssh -i $KeyFile -o StrictHostKeyChecking=no "ec2-user@$PublicIp" 'cat > ~/app/docker-compose.yml'

# ── Start services ─────────────────────────────────────────────────────────────
Write-Host '→ Starting services (first run ~3 min)...'
ssh -i $KeyFile -o StrictHostKeyChecking=no "ec2-user@$PublicIp" `
  'cd ~/app && docker compose up -d --build'

# ── Save instance info ─────────────────────────────────────────────────────────
@'
INSTANCE_ID=$InstanceId
PUBLIC_IP=$PublicIp
KEY_FILE=$KeyFile
REGION=$Region
JWT_SECRET=$JwtSecret
'@ | Set-Content -Path "$Root\.ec2-instance" -Encoding utf8

Write-Host ''
Write-Host '✓ Deployed!'
Write-Host "  Client:  http://${PublicIp}:3000"
Write-Host "  API:     http://${PublicIp}:4000"
Write-Host "  SSH:     ssh -i $KeyFile ec2-user@$PublicIp"
Write-Host "  Logs:    ssh -i `"$KeyFile`" ec2-user@$PublicIp 'cd ~/app && docker compose logs -f'"
Write-Host ''
Write-Host '  Instance info saved to .ec2-instance'
