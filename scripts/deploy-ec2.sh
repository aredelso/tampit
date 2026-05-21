#!/usr/bin/env bash
# First-time deploy to AWS EC2 (us-east-2, t2.micro free tier)
# Usage: bash scripts/deploy-ec2.sh
set -e

REGION="us-east-2"
KEY_NAME="coffee-tracker-key"
SG_NAME="coffee-tracker-sg"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
KEY_FILE="$HOME/.ssh/$KEY_NAME.pem"

# ── AMI ────────────────────────────────────────────────────────────────────────
echo "→ Getting latest Amazon Linux 2023 AMI..."
AMI_ID=$(aws ssm get-parameter \
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --region "$REGION" --query 'Parameter.Value' --output text)
echo "  $AMI_ID"

# ── Key pair ───────────────────────────────────────────────────────────────────
if [ ! -f "$KEY_FILE" ]; then
  echo "→ Creating key pair..."
  aws ec2 create-key-pair \
    --key-name "$KEY_NAME" --region "$REGION" \
    --query 'KeyMaterial' --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
  echo "  Saved to $KEY_FILE"
else
  echo "→ Using existing key pair at $KEY_FILE"
fi

# ── Security group ─────────────────────────────────────────────────────────────
echo "→ Setting up security group..."
SG_ID=$(aws ec2 create-security-group \
  --group-name "$SG_NAME" --description "Coffee Tracker" \
  --region "$REGION" --query 'GroupId' --output text 2>/dev/null) || \
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SG_NAME" \
  --region "$REGION" --query 'SecurityGroups[0].GroupId' --output text)

for PORT in 22 3000 4000; do
  aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" --protocol tcp --port "$PORT" --cidr 0.0.0.0/0 \
    --region "$REGION" 2>/dev/null || true
done
echo "  $SG_ID (ports 22, 3000, 4000 open)"

# ── Launch instance ────────────────────────────────────────────────────────────
JWT_SECRET=$(openssl rand -hex 32)

echo "→ Launching t2.micro..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type t2.micro \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --region "$REGION" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20}}]' \
  --user-data "file://$SCRIPT_DIR/aws-userdata.sh" \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=coffee-tracker}]' \
  --query 'Instances[0].InstanceId' --output text)
echo "  $INSTANCE_ID"

echo "→ Waiting for instance to run..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "  Public IP: $PUBLIC_IP"

# ── Wait for SSH ───────────────────────────────────────────────────────────────
echo "→ Waiting for SSH..."
until ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=5 \
  ec2-user@"$PUBLIC_IP" "echo ok" 2>/dev/null; do sleep 5; done

echo "→ Waiting for Docker (user-data may still be running)..."
until ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no \
  ec2-user@"$PUBLIC_IP" "docker info" 2>/dev/null; do sleep 5; done

# ── Sync code ─────────────────────────────────────────────────────────────────
echo "→ Syncing code..."
rsync -az --exclude node_modules --exclude build --exclude generated \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/server/" ec2-user@"$PUBLIC_IP":~/app/server/

rsync -az \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/shared/" ec2-user@"$PUBLIC_IP":~/app/shared/

rsync -az --exclude node_modules --exclude .next \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/client/" ec2-user@"$PUBLIC_IP":~/app/client/

# ── Write docker-compose on remote ────────────────────────────────────────────
echo "→ Writing docker-compose.yml..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" \
  "cat > ~/app/docker-compose.yml" <<EOF
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
      JWT_SECRET: '$JWT_SECRET'
      CLIENT_ORIGIN: 'http://$PUBLIC_IP:3000'
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
      API_URL: 'http://$PUBLIC_IP:4000'
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
EOF

# ── Start services ─────────────────────────────────────────────────────────────
echo "→ Starting services (first run takes ~3 min)..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" \
  "cd ~/app && docker compose up -d --build"

# ── Save instance info ─────────────────────────────────────────────────────────
cat > "$ROOT_DIR/.ec2-instance" <<INFO
INSTANCE_ID=$INSTANCE_ID
PUBLIC_IP=$PUBLIC_IP
KEY_FILE=$KEY_FILE
REGION=$REGION
JWT_SECRET=$JWT_SECRET
INFO

echo ""
echo "✓ Deployed!"
echo "  Client:  http://$PUBLIC_IP:3000"
echo "  API:     http://$PUBLIC_IP:4000"
echo "  SSH:     ssh -i $KEY_FILE ec2-user@$PUBLIC_IP"
echo "  Logs:    ssh -i $KEY_FILE ec2-user@$PUBLIC_IP 'cd ~/app && docker compose logs -f'"
echo ""
echo "  Startup is still running — client will be ready in ~3 minutes."
echo "  Instance info saved to .ec2-instance"
