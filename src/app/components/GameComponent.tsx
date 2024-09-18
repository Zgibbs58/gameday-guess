"use client";
import React, { useState, useEffect } from "react";
import PlayerTable from "./PlayerTable";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getInitialData } from "../actions";
import Image from "next/image";
import { useGameStore } from "@/context/GameContext";
import GameTimer from "./GameTimer";

interface Player {
  name: string;
  score: number;
  winner?: boolean;
}

const ParentComponent = () => {
  // const [totalPlayers, setTotalPlayers] = useState<number>(0);
  // const [players, setPlayers] = useState<Player[]>([]);
  // const [teamScore, setTeamScore] = useState<number>(0);
  // const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);
  const [showScoreboard, setShowScoreboard] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false); // New state for initialization of timer

  const { players, teamScore, totalPlayers, loading, gameTimer, fetchInitialData, updatePlayers } = useGameStore();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { players, teamScore, totalPlayers } = await getInitialData(); // Batch data fetch
  //       setPlayers(players);
  //       setTeamScore(teamScore);
  //       setTotalPlayers(totalPlayers);
  //     } catch (error) {
  //       console.error("Failed to fetch initial data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const gameTime = new Date();
    gameTime.setFullYear(2024); // Set the year
    gameTime.setMonth(8); // Set the month (September is 8 because months are zero-based)
    gameTime.setDate(14); // Set the day
    gameTime.setHours(18, 45, 0); // Set the time to 6:45 PM (18:45) and seconds to 0

    const interval = setInterval(() => {
      const now = new Date();
      const difference = gameTime.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        // setShowScoreboard(true); // Show scoreboard when countdown ends
      } else {
        setCountdown(difference);
      }
    }, 1000);

    // Set initialized to true after the first interval check
    setInitialized(true);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  // const handleAddPlayer = (newPlayer: Player) => {
  //   setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  // };

  useEffect(() => {
    // Fetch initial data and update global state
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAddPlayer = (newPlayer: Player) => {
    updatePlayers([...players, newPlayer]); // Update global state with new player
  };

  // Format the countdown as hours, minutes, and seconds
  const formatCountdown = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
      <div className="flex flex-col gap-8">
        {/* TODO fix the timer to not reset after a new day */}
        {gameTimer.isActive && <GameTimer targetDate={gameTimer.targetDate} />}
        {players.length >= totalPlayers || showScoreboard ? null : <UserForm onAddPlayer={handleAddPlayer} />}
        {players.length === 0 ? null : players.length >= totalPlayers || showScoreboard ? (
          <PlayerTable players={players} teamScore={teamScore} />
        ) : (
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
        )}
        {showScoreboard && (
          <div className="bg-tenOrange rounded-lg shadow-lg p-6 text-center text-white">
            <h3 className="text-2xl font-bold">UT Volunteers</h3>
            <h3 className="text-2xl font-bold mb-4">Current Score</h3>
            <div className="flex items-center justify-center bg-smokeGray rounded-lg py-3 px-5">
              <span className="text-5xl font-extrabold">{teamScore}</span>
            </div>
          </div>
        )}
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
