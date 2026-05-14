CREATE TABLE "Coffee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "roasterId" INTEGER NOT NULL,
    CONSTRAINT "Coffee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coffee_name_roasterId_key" ON "Coffee"("name", "roasterId");

ALTER TABLE "Coffee" ADD CONSTRAINT "Coffee_roasterId_fkey"
    FOREIGN KEY ("roasterId") REFERENCES "Roaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CoffeeEntry" ADD COLUMN "coffeeId" INTEGER;

ALTER TABLE "CoffeeEntry" ADD CONSTRAINT "CoffeeEntry_coffeeId_fkey"
    FOREIGN KEY ("coffeeId") REFERENCES "Coffee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
