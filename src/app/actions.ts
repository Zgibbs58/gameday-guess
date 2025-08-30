"use server";

import { PrismaClient } from "@prisma/client";
import { getServerAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const saveUserGuess = async (formData: FormData, gameId?: string) => {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      return { error: "You must be logged in to submit a guess." };
    }

    // Debug logging for production
    console.log("Session user ID:", session.user.id);
    console.log("Session user:", session.user);

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      return { error: `User with ID ${session.user.id} not found in database. Please sign out and sign in again.` };
    }

    const score = parseInt(formData.get("score")?.toString() || "0", 10);
    
    if (isNaN(score)) {
      return { error: "Score is required." };
    }

    // Check if the score has already been used for this game
    const existingGuessWithScore = await prisma.guess.findFirst({
      where: { 
        score,
        gameId: gameId || null,
      },
    });

    if (existingGuessWithScore) {
      return { error: `Score ${score} is already in use for this game. Please choose a different number.` };
    }

    // Check if user already has a guess for this game
    const existingUserGuess = await prisma.guess.findFirst({
      where: {
        userId: session.user.id,
        gameId: gameId || null,
      },
    });

    if (existingUserGuess) {
      return { error: "You have already submitted a guess for this game." };
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

    return { success: true, message: "Guess submitted successfully!", guessId: guess.id };
  } catch (error) {
    console.error("Error in saveUserGuess:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
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
  // Ensure the date string is properly formatted for Prisma
  const targetDate = new Date(targetDateUTC).toISOString();
  
  const gameTimer = await prisma.gameTimer.findFirst();

  if (!gameTimer) {
    await prisma.gameTimer.create({
      data: {
        targetDate: targetDate,
        isActive: isActive,
      },
    });
  } else {
    await prisma.gameTimer.update({
      where: { id: gameTimer.id }, // Use the actual ID instead of hardcoded 1
      data: {
        targetDate: targetDate,
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

export const endCurrentGame = async (finalScore: number) => {
  // Update the team score to final score
  await updateScore(finalScore);
  
  // Mark current game as ended
  await prisma.games.updateMany({
    where: { isCurrent: true },
    data: { 
      game_ended: true,
      final_score: finalScore 
    }
  });
  
  // Set game timer to inactive
  await updateGameTimer(new Date().toISOString(), false);
  
  return { message: "Game ended successfully!", finalScore };
};

export const createNewGame = async (name: string, targetDate: string) => {
  try {
    // Archive current game by setting isCurrent to false for all games
    await prisma.games.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false }
    });
    
    // Parse and validate the target date
    // datetime-local format: "2025-08-27T22:54" needs to be converted to full ISO
    let gameDate: Date;
    
    if (targetDate.includes('T')) {
      // Add seconds if missing from datetime-local input
      const dateTimeString = targetDate.includes(':00') ? targetDate : targetDate + ':00';
      
      // Treat the input as Central Time and convert to UTC
      // Import zonedTimeToUtc at the top of the file if not already imported
      const { zonedTimeToUtc } = await import("date-fns-tz");
      const centralTimeZone = "America/Chicago";
      
      // Parse as if it's in Central Time
      const localDate = new Date(dateTimeString);
      gameDate = zonedTimeToUtc(localDate, centralTimeZone);
    } else {
      gameDate = new Date(targetDate);
    }
    
    if (isNaN(gameDate.getTime())) {
      throw new Error("Invalid date format provided");
    }
    
    // Create new game
    const newGame = await prisma.games.create({
      data: {
        id: `game_${Date.now()}`,
        name,
        targetDate: gameDate,
        isActive: false,
        isCurrent: true,
        game_started: false,
        game_ended: false,
      },
    });
    
    // Clear all existing guesses from previous games
    await prisma.guess.deleteMany({
      where: {
        gameId: null, // Clear guesses not associated with specific games
      },
    });
    
    // Reset team score
    await updateScore(0);
    
    // Set game timer to active so it shows on main page
    await updateGameTimer(gameDate.toISOString(), true);
    
    return { message: "New game created successfully!", gameId: newGame.id };
  } catch (error) {
    console.error("Error creating new game:", error);
    throw new Error(`Failed to create new game: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const clearAllGuesses = async () => {
  try {
    await prisma.guess.deleteMany({
      where: {
        gameId: null, // Only clear guesses not associated with specific archived games
      },
    });
    return { message: "All guesses cleared successfully!" };
  } catch (error) {
    console.error("Error clearing guesses:", error);
    throw new Error(`Failed to clear guesses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            guesses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  try {
    if (!newPassword || newPassword.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully!" };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error(`Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    // Delete user's related data first (foreign key constraints)
    await prisma.guess.deleteMany({
      where: { userId },
    });
    
    await prisma.userStats.deleteMany({
      where: { userId },
    });
    
    await prisma.session.deleteMany({
      where: { userId },
    });
    
    await prisma.account.deleteMany({
      where: { userId },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully!" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateUserName = async (newName: string) => {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      throw new Error("You must be logged in to update your name.");
    }

    if (!newName || newName.trim().length === 0) {
      throw new Error("Name cannot be empty.");
    }

    if (newName.trim().length > 50) {
      throw new Error("Name must be 50 characters or less.");
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newName.trim() },
    });

    return { message: "Name updated successfully!" };
  } catch (error) {
    console.error("Error updating user name:", error);
    throw new Error(`Failed to update name: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
