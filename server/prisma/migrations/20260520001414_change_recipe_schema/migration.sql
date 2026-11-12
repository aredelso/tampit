/*
  Warnings:

  - You are about to drop the column `coffeeDose` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "coffeeDose",
ADD COLUMN     "dose" INTEGER,
ADD COLUMN     "waterMl" INTEGER;
