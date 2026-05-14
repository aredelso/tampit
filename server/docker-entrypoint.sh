#!/bin/sh
set -e

until pg_isready -h db -p 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

npx prisma generate

# If the DB already has tables but no migration history (P3005), baseline first
npx prisma migrate deploy || {
  echo "Baselining existing schema..."
  npx prisma migrate resolve --applied "20260512000000_init"
  npx prisma migrate deploy
}

exec "$@"
