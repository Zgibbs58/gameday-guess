"use client";
import React, { useState, useEffect } from "react";
import ScoreBoard from "./ScoreBoard";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getPlayersAndScores, getTeamScore, getTotalPlayers } from "../actions";
import Image from "next/image";

interface Player {
  name: string;
  score: number;
}

const ParentComponent = () => {
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const totalPlayers = await getTotalPlayers(); // Assuming this function fetches the total number of players
      const playerData = await getPlayersAndScores(); // Assuming this function fetches players
      const teamScore = await getTeamScore(); // Assuming this function fetches the team score
      setTotalPlayers(totalPlayers);
      setPlayers(playerData);
      setTeamScore(teamScore);
      setLoading(false); // Set loading to false after data is fetched
    };

    fetchPlayers();
  }, []);

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Image className="loading-image" src="/images/gamedayLogo.png" alt="Loading" width={200} height={200} />
      </div>
    ); // Display a loading indicator while data is being fetched
  }

  const placeholders = totalPlayers - players.length;

  return (
    <div className="flex flex-col gap-12">
      {players.length <= totalPlayers ? <UserForm onAddPlayer={handleAddPlayer} /> : null}
      {players.length <= totalPlayers ? (
        <div>
          <h2 className="text-2xl text-tenOrange text-center">Waiting on {placeholders} More Players</h2>
          <ul className="text-center">
            {players.map((player, index) => (
              <li key={index}>{player.name}</li>
            ))}
            {Array.from({ length: placeholders }).map((_, index) => (
              <li key={`placeholder-${index}`}>????</li>
            ))}
          </ul>
        </div>
      ) : (
        <ScoreBoard players={players} teamScore={teamScore} />
      )}
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
