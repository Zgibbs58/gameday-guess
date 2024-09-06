"use client";
import React, { useState, useEffect } from "react";
import PlayerTable from "./PlayerTable";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getInitialData } from "../actions";
import Image from "next/image";

interface Player {
  name: string;
  score: number;
  winner?: boolean;
}

const ParentComponent = () => {
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

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  //If you want to update the score of an existing player, you can use the following code:
  // const handleAddPlayer = (newPlayer: Player) => {
  //   setPlayers((prevPlayers) => {
  //     // Check if the player already exists
  //     const playerExists = prevPlayers.some((player) => player.name === newPlayer.name);

  //     if (playerExists) {
  //       // Update the score of the existing player
  //       return prevPlayers.map((player) => (player.name === newPlayer.name ? { ...player, score: newPlayer.score } : player));
  //     } else {
  //       // Add the new player
  //       return [...prevPlayers, newPlayer];
  //     }
  //   });
  // };

  if (loading) {
    return (
      <div className="loading-container flex flex-col gap-2">
        <Image className="loading-image" src="/images/gamedayLogo.png" alt="Loading" width={200} height={200} />
        <p className="text-tenOrange text-2xl loading-image font-semibold">Loading...</p>
      </div>
    );
  }

  const playersNeeded = totalPlayers - players.length;

  return (
    <>
      <div className="flex flex-col gap-12">
        {players.length < totalPlayers ? <UserForm onAddPlayer={handleAddPlayer} /> : null}
        {players.length === 0 ? null : players.length < totalPlayers ? (
          <div>
            <h2 className="text-2xl text-tenOrange text-center mb-2">
              Waiting on {playersNeeded} More Player{playersNeeded > 1 ? "s" : ""}
            </h2>
            <ul className="text-center">
              {players.map((player, index) => (
                <li key={index}>
                  <span className="text-tenOrange font-semibold">{player.name}</span> is locked in
                </li>
              ))}
              {/* {Array.from({ length: playersNeeded }).map((_, index) => (
              <li key={`playersNeeded-${index}`}>????</li>
            ))} */}
            </ul>
          </div>
        ) : (
          <PlayerTable players={players} teamScore={teamScore} />
        )}
        <div className="bg-tenOrange rounded-lg shadow-lg p-6 text-center text-white">
          <h3 className="text-2xl font-bold">UT Volunteers</h3>
          <h3 className="text-2xl font-bold mb-4">Current Score</h3>
          <div className="flex items-center justify-center bg-smokeGray rounded-lg py-3 px-5">
            <span className="text-5xl font-extrabold">{teamScore}</span>
          </div>
        </div>
      </div>
      <details className="bg-tenOrange text-white p-2 rounded-lg">
        <summary className="hover:cursor-pointer">Click for game rules</summary>
        <ol className="list-decimal list-inside text-centlefter mt-2 space-y-2">
          <li>Enter the amount of points UT will score in this game.</li>
          <li>If UT&apos;s score gets higher than your guess, you lose.</li>
          <li>Closest score still in play at the end wins.</li>
        </ol>
      </details>
    </>
  );
};

export default ParentComponent;
