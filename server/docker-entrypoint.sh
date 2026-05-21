#!/bin/sh

until pg_isready -h db -p 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "Generating Prisma client..."
rm -rf generated
npx prisma generate
if [ $? -ne 0 ]; then
  echo "Warning: Prisma generate had issues, continuing anyway..."
fi

# If the DB already has tables but no migration history (P3005), baseline first
npx prisma migrate deploy || {
  echo "Baselining existing schema..."
  npx prisma migrate resolve --applied "20260512000000_init" || true
  npx prisma migrate deploy || true
}

exec "$@"
