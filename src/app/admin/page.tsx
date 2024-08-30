"use client";

import { getPlayersAndScores, deleteUserAndScore } from "../actions";
import { useState, useEffect, use } from "react";
import TeamScoreUpdate from "../components/TeamScoreUpdate";

interface Player {
  name: string;
  score: number | undefined;
  id: number;
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const data = await getPlayersAndScores();
      setPlayers(data);
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

  return (
    <div className="flex flex-col items-center gap-24">
      <h1 className="text-3xl font-bold">Admin Page</h1>
      <div className="flex flex-col justify-center items-center gap-6">
        {players.map((player) => (
          <button onClick={() => handleDelete(player.id)} className="bg-red-500 rounded-md text-white p-2" key={player.id}>
            {player.name} - {player.score}
          </button>
        ))}
      </div>
      <TeamScoreUpdate />
    </div>
  );
}
