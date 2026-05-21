#!/usr/bin/env bash
# Push code changes to the running EC2 instance.
# Usage: bash scripts/redeploy-ec2.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
INSTANCE_FILE="$ROOT_DIR/.ec2-instance"

if [ ! -f "$INSTANCE_FILE" ]; then
  echo "Error: .ec2-instance not found. Run deploy-ec2.sh first."
  exit 1
fi

# shellcheck source=/dev/null
source "$INSTANCE_FILE"

echo "→ Syncing code to $PUBLIC_IP..."
rsync -az --exclude node_modules --exclude build --exclude generated \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/server/" ec2-user@"$PUBLIC_IP":~/app/server/

rsync -az \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/shared/" ec2-user@"$PUBLIC_IP":~/app/shared/

rsync -az --exclude node_modules --exclude .next \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  "$ROOT_DIR/client/" ec2-user@"$PUBLIC_IP":~/app/client/

echo "→ Restarting server and client..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@"$PUBLIC_IP" \
  "cd ~/app && docker compose restart server client"

echo ""
echo "✓ Redeployed to http://$PUBLIC_IP:3000"
