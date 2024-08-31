"use client";
import React, { useState, useEffect } from "react";
import ScoreBoard from "./ScoreBoard";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getPlayersAndScores, getTeamScore } from "../actions";

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
      const teamScore = await getTeamScore(); // Assuming this function fetches the team score
      setPlayers(data);
      setTeamScore(teamScore);
    };

    fetchPlayers();
  }, []);

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  return (
    <div className="flex flex-col gap-12">
      {players.length < 6 ? <UserForm onAddPlayer={handleAddPlayer} /> : null}
      <ScoreBoard players={players} teamScore={teamScore} />
      <div className="bg-tenOrange rounded-lg shadow-lg p-6 text-center text-white">
        <h3 className="text-2xl font-bold">UT Volunteers</h3>
        <h3 className="text-2xl font-bold mb-4">Current Score</h3>
        <div className="flex items-center justify-center bg-smokeGray rounded-lg py-3 px-5">
          <span className="text-5xl font-extrabold">{teamScore}</span>
        </div>
      </div>
    </div>
  );
};

export default ParentComponent;
