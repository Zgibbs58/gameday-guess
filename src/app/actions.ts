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
        score,
      },
    });
  }

  return { message: "Score submitted successfully!" };
};

export const getPlayersAndScores = async () => {
  const players = await prisma.user.findMany();

  // Flatten the structure if necessary
  interface PlayerData {
    name: string;
    score: number;
    id: number;
  }

  const playerData: PlayerData[] = players.map((player) => ({
    name: player.name,
    score: player.score,
    id: player.id,
  }));

  return playerData;
};

export const deleteUserAndScore = async (id: number) => {
  // Delete the user

  try {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.error("Failed to delete item:", error);
    window.alert("Failed to delete item.");
  }
  return { message: "User deleted successfully!" };
};

export const getTeamScore = async () => {
  const teamScore = await prisma.teamScore.findFirst({
    orderBy: {
      id: "desc", // Order by id in descending order to get the last entered score
    },
  });

  return teamScore?.score || 0; // Return the score or 0 if no score exists
};

export const updateScore = async (newScore: number) => {
  if (isNaN(newScore)) {
    throw new Error("Score must be a valid number.");
  }

  const teamScore = await prisma.teamScore.create({
    data: {
      score: newScore,
    },
  });

  return teamScore;
};
