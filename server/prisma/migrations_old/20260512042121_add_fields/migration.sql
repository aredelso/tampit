/*
  Warnings:

  - You are about to drop the column `beans` on the `CoffeeEntry` table. All the data in the column will be lost.
  - Added the required column `brewMethod` to the `CoffeeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coffee` to the `CoffeeEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roaster` to the `CoffeeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoffeeEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roaster" TEXT NOT NULL,
    "coffee" TEXT NOT NULL,
    "brewMethod" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "notes" TEXT
);
INSERT INTO "new_CoffeeEntry" ("amountMl", "createdAt", "id", "notes") SELECT "amountMl", "createdAt", "id", "notes" FROM "CoffeeEntry";
DROP TABLE "CoffeeEntry";
ALTER TABLE "new_CoffeeEntry" RENAME TO "CoffeeEntry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
