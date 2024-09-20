// store.ts
import { create } from "zustand";
import { getInitialData } from "../app/actions"; // Your data-fetching logic

interface Player {
  name: string;
  score: number;
  winner?: boolean;
}

interface GameState {
  players: Player[];
  teamScore: number;
  totalPlayers: number;
  loading: boolean;
  gameTimer: {
    targetDate: Date;
    isActive: boolean;
  };
  fetchInitialData: () => Promise<void>;
  updatePlayers: (players: Player[]) => void;
  updateTeamScore: (score: number) => void;
  updateTotalPlayers: (total: number) => void;
  updateGameTimer: (timer: { targetDate: Date; isActive: boolean }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  teamScore: 0,
  totalPlayers: 0,
  gameTimer: {
    targetDate: new Date(),
    isActive: false,
  },
  loading: true,
  fetchInitialData: async () => {
    try {
      const { players, teamScore, totalPlayers, gameTimer } = await getInitialData();
      set({
        players,
        teamScore,
        totalPlayers,
        gameTimer: { targetDate: new Date(gameTimer.targetDate), isActive: gameTimer.isActive },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      set({ loading: false });
    }
  },
  updatePlayers: (players: Player[]) => set({ players }),
  updateTeamScore: (teamScore: number) => set({ teamScore }),
  updateTotalPlayers: (totalPlayers: number) => set({ totalPlayers }),
  updateGameTimer: (gameTimer) => set({ gameTimer }),
}));
