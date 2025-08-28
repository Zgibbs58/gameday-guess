"use client";

import { deleteUserAndScore, updateWinner, getInitialData, endCurrentGame, createNewGame, clearAllGuesses } from "../actions";
import { useState, useEffect, useCallback } from "react";
import TeamScoreUpdate from "../components/TeamScoreUpdate";
import PlayerCountUpdate from "../components/PlayerCountUpdate";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GameTimerUpdate from "../components/GameTimerUpdate";
import { useGameStore } from "@/context/GameContext";

interface Player {
  name: string;
  score: number | undefined;
  id: number;
  winner?: boolean;
}

export default function Page() {
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { setGameEnded, gameEnded, fetchInitialData } = useGameStore();
  const [showNewGameForm, setShowNewGameForm] = useState<boolean>(false);
  const [newGameName, setNewGameName] = useState<string>("");
  const [newGameDate, setNewGameDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { players, teamScore, totalPlayers } = await getInitialData(); // Batch data fetch
        setPlayers(players);
        setTeamScore(teamScore);
        setTotalPlayers(totalPlayers);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useCallback: The handleDelete function is created once during the initial render and reused across renders. Since the dependency array is empty [], React knows that the function doesn't depend on any state or props that might change. As a result, it won't recreate the function during future re-renders unless you update the code or add dependencies.
  const handleDelete = useCallback(async (id: number) => {
    // Show confirmation dialog
    const confirmed: boolean = window.confirm("Are you sure you want to delete this item?");

    if (confirmed) {
      try {
        await deleteUserAndScore(id); // Proceed with deletion if confirmed
        toast.success("User successfuly deleted!"); // Notify user of success
      } catch (error: any) {
        console.error("Failed to delete item:", error);
        toast.error("Failed to delete user."); // Notify user of failure
      }
    }
  }, []);

  const toggleWinner = async (id: number) => {
    setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === id ? { ...player, winner: !player.winner } : player)));
    try {
      await updateWinner(id);

      // If making someone a winner, end the game
      const player = players.find((p) => p.id === id);
      if (player && !player.winner) {
        setGameEnded(true);
        toast.success(`${player.name} is now the winner! Game ended.`);
      }
    } catch (error) {
      console.error("Failed to toggle winner:", error);
      // Revert winner status if update fails
      setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === id ? { ...player, winner: !player.winner } : player)));
      toast.error("Failed to toggle winner.");
    }
  };

  const handleEndGame = async () => {
    const confirmed = window.confirm("Are you sure you want to end the current game?");
    if (confirmed) {
      try {
        await endCurrentGame(teamScore);
        setGameEnded(true);
        toast.success("Game ended successfully!");
      } catch (error) {
        console.error("Failed to end game:", error);
        toast.error("Failed to end game.");
      }
    }
  };

  const handleCreateNewGame = async () => {
    if (!newGameName || !newGameDate) {
      toast.error("Please fill in all fields for the new game.");
      return;
    }

    try {
      const result = await createNewGame(newGameName, newGameDate);
      setGameEnded(false);
      setShowNewGameForm(false);
      setNewGameName("");
      setNewGameDate("");
      toast.success(result.message);

      // Refresh both local and global state
      await fetchInitialData();
      const { players: updatedPlayers, teamScore: updatedScore, totalPlayers: updatedTotal } = await getInitialData();
      setPlayers(updatedPlayers);
      setTeamScore(updatedScore);
      setTotalPlayers(updatedTotal);
      
    } catch (error) {
      console.error("Failed to create new game:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create new game: ${errorMessage}`);
    }
  };

  const handleClearAllGuesses = async () => {
    const confirmed = window.confirm("Are you sure you want to clear all player guesses? This cannot be undone.");
    if (confirmed) {
      try {
        await clearAllGuesses();
        toast.success("All guesses cleared successfully!");
        
        // Refresh the data to show empty list
        const { players: updatedPlayers, teamScore: updatedScore, totalPlayers: updatedTotal } = await getInitialData();
        setPlayers(updatedPlayers);
        setTeamScore(updatedScore);
        setTotalPlayers(updatedTotal);
      } catch (error) {
        console.error("Failed to clear guesses:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Failed to clear guesses: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container flex flex-col gap-2">
        <Image className="loading-image" src="/images/gamedayLogo.png" alt="Loading" width={200} height={200} />
        <p className="text-tenOrange text-2xl loading-image font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-24">
      <ToastContainer />
      <h1 className="text-3xl font-bold">Admin Page</h1>
      <div className="flex flex-col justify-center items-center gap-6">
        {players.map((player) => (
          <div className="space-x-2 text-center" key={player.id}>
            <p>
              {player.name} - {player.score}
            </p>
            <button onClick={() => handleDelete(player.id)} className="bg-red-500 rounded-md text-white p-2">
              Delete {player.name}
            </button>
            {player.winner ? (
              <button onClick={() => toggleWinner(player.id)} className="bg-red-500 rounded-md text-white p-2">
                Make {player.name} a loser
              </button>
            ) : (
              <button onClick={() => toggleWinner(player.id)} className="bg-green-500 rounded-md text-white p-2">
                Make {player.name} a winner
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Game Management Controls */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Game Management</h2>

        {!gameEnded ? (
          <button onClick={handleEndGame} className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
            End Current Game
          </button>
        ) : (
          <div className="text-green-600 font-semibold">Game Ended</div>
        )}

        <button onClick={() => setShowNewGameForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Create New Game
        </button>
        
        <button onClick={handleClearAllGuesses} className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700">
          Clear All Guesses
        </button>
      </div>

      {/* New Game Form Modal */}
      {showNewGameForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Game</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-smokeGray">Game Name</label>
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder="e.g., Tennessee vs Alabama"
                  className="w-full p-2 border rounded-lg text-smokeGray"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-smokeGray">Game Date & Time</label>
                <input
                  type="datetime-local"
                  value={newGameDate}
                  onChange={(e) => setNewGameDate(e.target.value)}
                  className="w-full p-2 border rounded-lg text-smokeGray"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateNewGame} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Create Game
                </button>
                <button onClick={() => setShowNewGameForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TeamScoreUpdate teamScore={teamScore} />
      <PlayerCountUpdate totalPlayers={totalPlayers} />
      <GameTimerUpdate />
    </div>
  );
}
