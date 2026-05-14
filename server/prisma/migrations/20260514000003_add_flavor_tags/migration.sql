CREATE TABLE "FlavorTag" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "FlavorTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FlavorTag_name_key" ON "FlavorTag"("name");

-- Seed from existing entry flavor notes
INSERT INTO "FlavorTag" ("name")
SELECT DISTINCT unnest("flavorNotes") FROM "CoffeeEntry"
WHERE array_length("flavorNotes", 1) > 0
ON CONFLICT ("name") DO NOTHING;
