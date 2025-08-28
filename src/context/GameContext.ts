// store.ts
import { create } from "zustand";
import { getInitialData } from "../app/actions"; // Your data-fetching logic

interface Player {
  name: string;
  score: number;
  winner?: boolean;
  isEliminated?: boolean;
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
  gameStarted: boolean;
  gameEnded: boolean;
  isPolling: boolean;
  fetchInitialData: () => Promise<void>;
  updatePlayers: (players: Player[]) => void;
  updateTeamScore: (score: number) => void;
  updateTotalPlayers: (total: number) => void;
  updateGameTimer: (timer: { targetDate: Date; isActive: boolean }) => void;
  setGameStarted: (started: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  startScorePolling: () => void;
  stopScorePolling: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  teamScore: 0,
  totalPlayers: 0,
  gameTimer: {
    targetDate: new Date(),
    isActive: false,
  },
  gameStarted: false,
  gameEnded: false,
  isPolling: false,
  loading: true,
  
  fetchInitialData: async () => {
    try {
      const { players, teamScore, totalPlayers, gameTimer } = await getInitialData();
      const now = new Date();
      const gameStarted = !gameTimer.isActive && now >= new Date(gameTimer.targetDate);
      
      set({
        players,
        teamScore,
        totalPlayers,
        gameTimer: { targetDate: new Date(gameTimer.targetDate), isActive: gameTimer.isActive },
        gameStarted,
        loading: false,
      });
      
      // Start polling if game has started but not ended
      if (gameStarted && !get().gameEnded) {
        get().startScorePolling();
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      set({ loading: false });
    }
  },
  
  updatePlayers: (players: Player[]) => set({ players }),
  updateTeamScore: (teamScore: number) => set({ teamScore }),
  updateTotalPlayers: (totalPlayers: number) => set({ totalPlayers }),
  updateGameTimer: (gameTimer) => {
    const now = new Date();
    const gameStarted = !gameTimer.isActive && now >= gameTimer.targetDate;
    set({ 
      gameTimer, 
      gameStarted,
      gameEnded: false // Reset game ended state when timer updates
    });
  },
  setGameStarted: (started: boolean) => set({ gameStarted: started }),
  setGameEnded: (ended: boolean) => {
    set({ gameEnded: ended });
    if (ended) {
      get().stopScorePolling();
    }
  },
  
  startScorePolling: () => {
    const { isPolling } = get();
    if (isPolling) return;
    
    set({ isPolling: true });
    
    const pollInterval = setInterval(async () => {
      const { gameEnded } = get();
      if (gameEnded) {
        clearInterval(pollInterval);
        set({ isPolling: false });
        return;
      }
      
      try {
        const { players, teamScore } = await getInitialData();
        // Auto-eliminate players whose guesses are exceeded by team score
        const updatedPlayers = players.map(player => ({
          ...player,
          isEliminated: teamScore > player.score,
        }));
        
        set({ 
          players: updatedPlayers, 
          teamScore,
        });
      } catch (error) {
        console.error("Failed to poll data:", error);
      }
    }, 10000); // Poll every 10 seconds
  },
  
  stopScorePolling: () => {
    set({ isPolling: false });
  },
}));
