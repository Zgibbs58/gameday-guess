"use client";

import { get } from "http";
import { getPlayersAndScores } from "../actions";
import { useState, useEffect } from "react";

interface Player {
  name: string;
  score: number | undefined;
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

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Page</h1>
      <p className="text-lg">This is an admin page</p>
      {players.map((player, index) => (
        <div key={index}>
          <h2>{player.name}</h2>
          <p>{player.score}</p>
        </div>
      ))}
    </div>
  );
}
