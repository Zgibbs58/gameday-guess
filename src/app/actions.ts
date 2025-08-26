"use server";

import { PrismaClient } from "@prisma/client";
import { getServerAuthSession } from "@/lib/auth";

const prisma = new PrismaClient();

export const saveUserGuess = async (formData: FormData, gameId?: string) => {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    throw new Error("You must be logged in to submit a guess.");
  }

  const score = parseInt(formData.get("score")?.toString() || "0", 10);
  
  if (isNaN(score)) {
    throw new Error("Score is required.");
  }

  // Check if the score has already been used for this game
  const existingGuessWithScore = await prisma.guess.findFirst({
    where: { 
      score,
      gameId: gameId || null,
    },
  });

  if (existingGuessWithScore) {
    throw new Error(`Score ${score} is already in use for this game.`);
  }

  // Check if user already has a guess for this game
  const existingUserGuess = await prisma.guess.findFirst({
    where: {
      userId: session.user.id,
      gameId: gameId || null,
    },
  });

  if (existingUserGuess) {
    throw new Error("You have already submitted a guess for this game.");
  }

  // Create the guess
  const guess = await prisma.guess.create({
    data: {
      userId: session.user.id,
      score,
      gameId: gameId || null,
    },
  });

  // Update user stats
  await prisma.userStats.upsert({
    where: { userId: session.user.id },
    update: {
      totalGames: { increment: 1 },
      lastPlayed: new Date(),
    },
    create: {
      userId: session.user.id,
      totalGames: 1,
      totalWins: 0,
      lastPlayed: new Date(),
    },
  });

  return { message: "Guess submitted successfully!", guessId: guess.id };
};

// Legacy function for backward compatibility
export const saveUserAndScore = async (formData: FormData) => {
  return saveUserGuess(formData);
};

// New API for batch fetching data
export const getInitialData = async (gameId?: string) => {
  const [guesses, teamScore, totalPlayers, gameTimer] = await Promise.all([
    prisma.guess.findMany({
      where: { gameId: gameId || null },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.teamScore.findFirst(),
    prisma.totalPlayers.findFirst(),
    prisma.gameTimer.findFirst(),
  ]);

  return {
    players: guesses.map((guess) => ({
      id: guess.id,
      name: guess.user.name || "Anonymous",
      score: guess.score,
      winner: guess.isWinner,
    })),
    teamScore: teamScore?.score || 0,
    totalPlayers: totalPlayers?.value || 0,
    gameTimer: gameTimer || { targetDate: new Date().toISOString(), isActive: false },
  };
};

export const getPlayersAndScores = async (gameId?: string) => {
  const guesses = await prisma.guess.findMany({
    where: { gameId: gameId || null },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  interface PlayerData {
    name: string;
    score: number;
    id: number;
    winner?: boolean;
  }

  const playerData: PlayerData[] = guesses.map((guess) => ({
    name: guess.user.name || "Anonymous",
    score: guess.score,
    id: guess.id,
    winner: guess.isWinner,
  }));

  return playerData;
};

export const deleteUserGuess = async (guessId: number) => {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    throw new Error("You must be logged in to delete a guess.");
  }

  // Verify the guess belongs to the current user or user is admin
  const guess = await prisma.guess.findUnique({
    where: { id: guessId },
  });

  if (!guess) {
    throw new Error("Guess not found.");
  }

  if (guess.userId !== session.user.id) {
    throw new Error("You can only delete your own guesses.");
  }

  try {
    await prisma.guess.delete({
      where: {
        id: guessId,
      },
    });
  } catch (error) {
    console.error("Failed to delete guess:", error);
    throw new Error("Failed to delete guess.");
  }
  
  return { message: "Guess deleted successfully!" };
};

// Legacy function for backward compatibility
export const deleteUserAndScore = async (id: number) => {
  return deleteUserGuess(id);
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

export const updateGuessWinner = async (guessId: number) => {
  const guess = await prisma.guess.findUnique({
    where: { id: guessId },
  });

  if (!guess) {
    throw new Error("Guess not found");
  }

  const newWinnerStatus = !guess.isWinner;

  await prisma.guess.update({
    where: { id: guessId },
    data: { isWinner: newWinnerStatus },
  });

  // Update user stats if marking as winner
  if (newWinnerStatus) {
    await prisma.userStats.upsert({
      where: { userId: guess.userId },
      update: {
        totalWins: { increment: 1 },
        bestScore: guess.score,
      },
      create: {
        userId: guess.userId,
        totalGames: 1,
        totalWins: 1,
        bestScore: guess.score,
      },
    });
  } else {
    // Decrement wins if removing winner status
    await prisma.userStats.update({
      where: { userId: guess.userId },
      data: {
        totalWins: { decrement: 1 },
      },
    });
  }

  return { message: "Winner status updated successfully!" };
};

// Legacy function for backward compatibility
export const updateWinner = async (id: number) => {
  return updateGuessWinner(id);
};

export const updateGameTimer = async (targetDateUTC: string, isActive: boolean) => {
  const gameTimer = await prisma.gameTimer.findFirst();

  if (!gameTimer) {
    await prisma.gameTimer.create({
      data: {
        targetDate: targetDateUTC,
        isActive: isActive,
      },
    });
  } else {
    await prisma.gameTimer.update({
      where: { id: 1 },
      data: {
        targetDate: targetDateUTC,
        isActive: isActive,
      },
    });
  }
};

export const getUserStats = async (userId: string) => {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!stats) {
    return null;
  }

  return {
    totalGames: stats.totalGames,
    totalWins: stats.totalWins,
    bestScore: stats.bestScore,
    lastPlayed: stats.lastPlayed,
    winRate: stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0,
    user: stats.user,
  };
};

export const getUserGuesses = async (userId: string, limit = 10) => {
  const guesses = await prisma.guess.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return guesses.map((guess) => ({
    id: guess.id,
    score: guess.score,
    isWinner: guess.isWinner,
    gameId: guess.gameId,
    createdAt: guess.createdAt,
  }));
};
