"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveUserAndScore = async (formData: FormData) => {
  const name = formData.get("name")?.toString() || "";
  const score = parseInt(formData.get("score")?.toString() || "0", 10);
  console.log(name, score);

  if (!name || isNaN(score)) {
    throw new Error("Name and score are required.");
  }

  //check if user exists
  let user = await prisma.user.findFirst({
    where: { name },
  });

  if (!user) {
    // if user does not exist, create user
    user = await prisma.user.create({
      data: {
        name,
      },
    });
  }

  // Add the score to the user
  await prisma.score.create({
    data: {
      value: score,
      userId: user.id,
    },
  });

  return { message: "Score submitted successfully!" };
};

export const getPlayersAndScores = async () => {
  const players = await prisma.user.findMany({
    include: {
      scores: true,
    },
  });

  // Flatten the structure if necessary
  interface PlayerData {
    name: string;
    score: number;
  }

  const playerData: PlayerData[] = players.map((player) => ({
    name: player.name || "",
    score: player.scores.reduce((total, score) => total + score.value, 0),
  }));

  return playerData;
};
