"use client";

import { getPlayersAndScores, deleteUserAndScore, updateWinner, getWinner } from "../actions";
import { useState, useEffect, use } from "react";
import TeamScoreUpdate from "../components/TeamScoreUpdate";
import PlayerCountUpdate from "../components/PlayerCountUpdate";

interface Player {
  name: string;
  score: number | undefined;
  id: number;
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchPlayers = async () => {
      const winner = await getWinner();
      // console.log(winner);
      const data = await getPlayersAndScores();
      setPlayers(data);
      setWinner(winner?.id);
    };

    fetchPlayers();
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
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
  };

  const toggleWinner = async (id: number): Promise<void> => {
    try {
      await updateWinner(id);
      const winner = await getWinner();
      setWinner(winner?.id);
    } catch (error: any) {
      console.error("Failed to toggle winner:", error);
      window.alert("Failed to toggle winner.");
    }
  };

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
            {player.id === winner ? (
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
      <TeamScoreUpdate />
      <PlayerCountUpdate />
    </div>
  );
}
