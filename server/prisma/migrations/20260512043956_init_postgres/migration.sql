-- CreateTable
CREATE TABLE "CoffeeEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roaster" TEXT NOT NULL,
    "coffee" TEXT NOT NULL,
    "brewMethod" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CoffeeEntry_pkey" PRIMARY KEY ("id")
);
