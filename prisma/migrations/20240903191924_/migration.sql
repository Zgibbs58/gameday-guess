-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "winner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalPlayers" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TotalPlayers_pkey" PRIMARY KEY ("id")
);
