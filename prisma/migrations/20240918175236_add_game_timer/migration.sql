-- CreateTable
CREATE TABLE "GameTimer" (
    "id" SERIAL NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameTimer_pkey" PRIMARY KEY ("id")
);
