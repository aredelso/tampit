-- CreateTable
CREATE TABLE "Roaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Roaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roaster_name_key" ON "Roaster"("name");

-- Seed sample roasters
INSERT INTO "Roaster" ("name") VALUES
    ('Blue Bottle Coffee'),
    ('Stumptown Coffee Roasters'),
    ('Intelligentsia Coffee'),
    ('Counter Culture Coffee'),
    ('La Colombe Coffee'),
    ('Verve Coffee Roasters'),
    ('Sightglass Coffee'),
    ('Heart Coffee Roasters'),
    ('Onyx Coffee Lab'),
    ('George Howell Coffee');

-- AlterTable: add nullable FK column
ALTER TABLE "CoffeeEntry" ADD COLUMN "roasterId" INTEGER;

-- Migrate existing roaster strings to FK rows
DO $$
DECLARE
    r TEXT;
    rid INTEGER;
BEGIN
    FOR r IN SELECT DISTINCT "roaster" FROM "CoffeeEntry" WHERE "roaster" IS NOT NULL AND "roaster" != '' LOOP
        INSERT INTO "Roaster" ("name") VALUES (r) ON CONFLICT ("name") DO NOTHING;
        SELECT "id" INTO rid FROM "Roaster" WHERE "name" = r;
        UPDATE "CoffeeEntry" SET "roasterId" = rid WHERE "roaster" = r;
    END LOOP;
END $$;

-- AlterTable: drop old string column
ALTER TABLE "CoffeeEntry" DROP COLUMN "roaster";

-- AddForeignKey
ALTER TABLE "CoffeeEntry" ADD CONSTRAINT "CoffeeEntry_roasterId_fkey"
    FOREIGN KEY ("roasterId") REFERENCES "Roaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
