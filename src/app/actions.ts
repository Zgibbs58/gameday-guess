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

  // Check if the score has already been used
  const existingUserWithScore = await prisma.user.findFirst({
    where: { score },
  });

  if (existingUserWithScore) {
    throw new Error(`Score ${score} is already in use by another user.`);
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
  // code to allow user to update their score but also anybody can update their score
  // else {
  //   // Update the user's score if they already exist
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: { score },
  //   });
  // }

  return { message: "Score submitted successfully!" };
};

// New API for batch fetching data
export const getInitialData = async () => {
  const [players, teamScore, totalPlayers] = await Promise.all([
    prisma.user.findMany(), // Get players and scores
    prisma.teamScore.findFirst(), // Get team score
    prisma.totalPlayers.findFirst(), // Get total players
  ]);

  return {
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      winner: player.winner,
    })),
    teamScore: teamScore?.score || 0,
    totalPlayers: totalPlayers?.value || 0,
  };
};

export const getPlayersAndScores = async () => {
  const players = await prisma.user.findMany();

  // Flatten the structure if necessary
  interface PlayerData {
    name: string;
    score: number;
    id: number;
    winner?: boolean;
  }

  const playerData: PlayerData[] = players.map((player) => ({
    name: player.name,
    score: player.score,
    id: player.id,
    winner: player.winner,
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
  const teamScore = await prisma.teamScore.findFirst();

  return teamScore?.score || 0; // Return the score or 0 if no score exists
};

export const updateScore = async (newScore: number) => {
  if (isNaN(newScore)) {
    throw new Error("Score must be a valid number.");
  }

  // Check if there's already a score in the database
  const existingScore = await prisma.teamScore.findFirst();

  let updatedTeamScore;

  if (existingScore) {
    // Update the existing score
    updatedTeamScore = await prisma.teamScore.update({
      where: {
        id: existingScore.id,
      },
      data: {
        score: newScore,
      },
    });
  } else {
    // Create a new score if none exists
    updatedTeamScore = await prisma.teamScore.create({
      data: {
        score: newScore,
      },
    });
  }

  return updatedTeamScore;
};

export const getTotalPlayers = async () => {
  const totalPlayers = await prisma.totalPlayers.findFirst();

  return totalPlayers?.value || 0;
};

export const updateTotalPlayers = async (totalPlayers: number) => {
  if (isNaN(totalPlayers)) {
    throw new Error("Total players must be a valid number.");
  }

  // Check if there's already a totalPlayers in the database
  const existingTotalPlayers = await prisma.totalPlayers.findFirst();

  let updatedTotalPlayers;

  if (existingTotalPlayers) {
    // Update the existing totalPlayers
    updatedTotalPlayers = await prisma.totalPlayers.update({
      where: {
        id: existingTotalPlayers.id,
      },
      data: {
        value: totalPlayers,
      },
    });
  } else {
    // Create a new totalPlayers if none exists
    updatedTotalPlayers = await prisma.totalPlayers.create({
      data: {
        value: totalPlayers,
      },
    });
  }

  return updatedTotalPlayers;
};

export const updateWinner = async (id: number) => {
  // Fetch the current value of the winner field
  const user = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Toggle the winner field
  const newWinnerStatus = !user.winner;

  // Update the winner field in the database
  await prisma.user.update({
    where: { id: id },
    data: { winner: newWinnerStatus },
  });

  return { message: "Winner status updated successfully!" };
};

export const updateGameTimer = async (targetDateUTC: string, isActive: boolean) => {
  await prisma.gameTimer.update({
    where: { id: 1 },
    data: {
      targetDate: targetDateUTC,
      isActive: isActive,
    },
  });
};
