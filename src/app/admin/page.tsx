"use client";

import { getPlayersAndScores, deleteUserAndScore, updateWinner, getInitialData } from "../actions";
import { useState, useEffect, useCallback } from "react";
import TeamScoreUpdate from "../components/TeamScoreUpdate";
import PlayerCountUpdate from "../components/PlayerCountUpdate";
import Image from "next/image";

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
        window.alert("Item successfully deleted!"); // Notify user of success
      } catch (error: any) {
        console.error("Failed to delete item:", error);
        window.alert("Failed to delete item."); // Notify user of failure
      }
    }
  }, []);

  const toggleWinner = async (id: number) => {
    setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === id ? { ...player, winner: !player.winner } : player)));
    try {
      await updateWinner(id);
    } catch (error) {
      console.error("Failed to toggle winner:", error);
      // Revert winner status if update fails
      setPlayers((prevPlayers) => prevPlayers.map((player) => (player.id === id ? { ...player, winner: !player.winner } : player)));
      window.alert("Failed to toggle winner.");
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
      <TeamScoreUpdate teamScore={teamScore} />
      <PlayerCountUpdate totalPlayers={totalPlayers} />
    </div>
  );
}
