-- CreateTable
CREATE TABLE "CoffeeInventory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeId" INTEGER NOT NULL,
    "roastDate" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "CoffeeInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoffeeInventory_userId_idx" ON "CoffeeInventory"("userId");

-- CreateIndex
CREATE INDEX "CoffeeInventory_coffeeId_idx" ON "CoffeeInventory"("coffeeId");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeInventory_userId_coffeeId_key" ON "CoffeeInventory"("userId", "coffeeId");

-- AddForeignKey
ALTER TABLE "CoffeeInventory" ADD CONSTRAINT "CoffeeInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeInventory" ADD CONSTRAINT "CoffeeInventory_coffeeId_fkey" FOREIGN KEY ("coffeeId") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
