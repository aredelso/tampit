/*
  Warnings:

  - Made the column `userId` on table `CoffeeEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CoffeeEntry" DROP CONSTRAINT "CoffeeEntry_userId_fkey";

-- AlterTable
ALTER TABLE "CoffeeEntry" ALTER COLUMN "dose" DROP NOT NULL,
ALTER COLUMN "waterMl" DROP NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CoffeeEntry" ADD CONSTRAINT "CoffeeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
