-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);
