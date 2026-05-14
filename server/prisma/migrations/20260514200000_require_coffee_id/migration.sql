-- Remove legacy rows that have no coffeeId (they will be re-seeded)
DELETE FROM "CoffeeEntry" WHERE "coffeeId" IS NULL;

-- Make coffeeId NOT NULL
ALTER TABLE "CoffeeEntry" ALTER COLUMN "coffeeId" SET NOT NULL;

-- Drop the legacy coffee text column if it still exists
ALTER TABLE "CoffeeEntry" DROP COLUMN IF EXISTS "coffee";
