#!/usr/bin/env bash
# Usage:
#   ./scripts/migrate.sh                    — rebuild all containers (entrypoint runs generate + migrate deploy)
#   ./scripts/migrate.sh add_rating_field   — create migration inside container, then rebuild all containers

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

MIGRATION_NAME="${1:-}"

cd "$ROOT_DIR"

# Create a new migration inside the container (Node 22, avoids ERR_REQUIRE_ESM on older host Node).
# The server bind-mount means the new migration file appears on the host immediately.
if [ -n "$MIGRATION_NAME" ]; then
  echo "→ Creating migration: $MIGRATION_NAME"
  docker compose exec -T server npx prisma migrate dev --name "$MIGRATION_NAME"
fi

# Restart (or rebuild) the server container.
# The entrypoint runs prisma generate (writes to ./server/generated/ via bind-mount)
# then prisma migrate deploy to apply any pending migrations.
echo "→ Rebuilding and restarting all containers..."
docker compose up -d --build

echo "✓ Done. Generated types will be updated in ./server/generated/ once the container is healthy."
