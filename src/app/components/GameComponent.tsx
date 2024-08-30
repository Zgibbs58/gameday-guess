"use client";
import React, { useState, useEffect } from "react";
import ScoreBoard from "./ScoreBoard";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getPlayersAndScores } from "../actions";

interface Player {
  name: string;
  score: number;
}

const ParentComponent = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamScore, setTeamScore] = useState<number>(0);

  useEffect(() => {
    const fetchPlayers = async () => {
      const data = await getPlayersAndScores(); // Assuming this function fetches players
      setPlayers(data);
    };

    fetchPlayers();
  }, []);

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  return (
    <div>
      <UserForm onAddPlayer={handleAddPlayer} />
      <ScoreBoard players={players} teamScore={50} />
    </div>
  );
};

export default ParentComponent;
