"use client";
import React, { useState, useEffect, useRef } from "react";
import PlayerTable from "./PlayerTable";
import UserForm from "./UserForm"; // Assuming you have a form component
import { getInitialData } from "../actions";
import Image from "next/image";
import { useGameStore } from "@/context/GameContext";
import GameTimer from "./GameTimer";
import ScoreAlertModal from "./ScoreAlertModal";
import { Noto_Serif_Armenian } from "next/font/google";
import Confetti from "react-confetti";

const serif = Noto_Serif_Armenian({ subsets: ["latin"] });

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
  const { players, teamScore, totalPlayers, loading, gameTimer, gameStarted, gameEnded, fetchInitialData, updatePlayers } = useGameStore();
  const [showScoreAlert, setShowScoreAlert] = useState<boolean>(false);
  const [newScore, setNewScore] = useState<number | null>(null);
  const [firstLoad, setFirstLoad] = useState<boolean>(true); // Track first load
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  // useRef for storing the audio object
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

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
    // Initialize the audio object when the component mounts
    audioRef.current = new Audio("/audio/rockyTop_short.mp3");
    // Fetch initial data and update global state
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    // Handle localStorage only after the initial fetch is done
    if (!loading && teamScore !== undefined) {
      const storedScore = localStorage.getItem("previousTeamScore");

      if (storedScore !== null) {
        const previousScore = parseInt(storedScore, 10);

        if (previousScore !== teamScore && teamScore !== 0 && !firstLoad) {
          // Show modal only if score has changed
          setNewScore(teamScore);
          setShowScoreAlert(true);
        }
      }

      localStorage.setItem("previousTeamScore", teamScore.toString());
    }

    // After initial load, disable firstLoad state
    setFirstLoad(false);
  }, [teamScore, loading, firstLoad]);

  const handleAddPlayer = (newPlayer: Player) => {
    updatePlayers([...players, newPlayer]); // Update global state with new player
  };

  const handlePlayTheme = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => console.error("Failed to play audio:", error));
    }
    setShowScoreAlert(false); // Close the modal after playing theme
    setShowConfetti(true); // Show confetti when theme is played

    // Hide confetti after a few seconds (optional)
    setTimeout(() => {
      setShowConfetti(false);
    }, 14000);
  };

  const handleDismissAlert = () => {
    setShowScoreAlert(false); // Close the modal without playing theme
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
        {/* Show timer only during guessing phase */}
        {gameTimer.isActive && !gameStarted && <GameTimer isActive={gameTimer.isActive} targetDate={gameTimer.targetDate} />}
        
        {/* Show UserForm only if game hasn't started and timer is active (guessing phase) */}
        {!gameStarted && gameTimer.isActive && <UserForm onAddPlayer={handleAddPlayer} />}
        
        {/* Show different content based on game state */}
        {gameStarted ? (
          <PlayerTable players={players} teamScore={teamScore} />
        ) : players.length > 0 ? (
          <div>
            <h2 className="text-2xl text-tenOrange text-center mb-2">
              {totalPlayers > 0 && players.length < totalPlayers 
                ? `Waiting on ${playersNeeded} More Player${playersNeeded > 1 ? "s" : ""}` 
                : `${players.length} Player${players.length > 1 ? "s" : ""} Locked In`}
            </h2>
            <ul className="text-center">
              {players.map((player, index) => (
                <li key={index}>
                  <span className="text-tenOrange font-semibold">{player.name}</span> is locked in
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        
        {/* Show scoreboard when game has started */}
        {gameStarted && (
          <div className="flex flex-col items-center shadow-2xl">
            {/* Stadium Header */}
            <h3 className="relative text-lg font-extrabold text-center bg-tenOrange px-4 text-white rounded-t-lg border border-b-1 dark:border-smokeGray">
              NEYLAND <span className={`text-5xl text-white ${serif.className}`}>T</span> STADIUM
            </h3>
            {/* Score Box */}
            <div className="bg-tenOrange rounded-lg p-6 text-center text-white border-white">
              <h3 className="text-3xl font-bold mb-6 uppercase tracking-wider">
                {gameEnded ? "FINAL SCORE" : "CURRENT SCORE"}
              </h3>

              {/* Animated Border with Tracing Effect */}
              <div className="relative flex justify-center items-center">
                <div className="inline-flex items-center justify-center bg-smokeGray rounded-lg border-transparent animate-border-trace py-3 px-8">
                  <span className="text-7xl font-extrabold text-glow animate-pulse">{teamScore}</span>

                  {/* Tracing Border */}
                  <div className="absolute rounded-lg pointer-events-none"></div>
                </div>
              </div>
              
              {gameEnded && (
                <div className="mt-4">
                  <h2 className="text-4xl font-bold animate-pulse">GAME OVER 🎉</h2>
                </div>
              )}
            </div>

            {/* Styles for Tracing Border */}
            <style jsx>{`
              .text-glow {
                text-shadow: 0 0 2px rgba(255, 255, 255, 0.9), 0 0 2px rgba(255, 255, 255, 0.8), 0 0 2px rgba(255, 255, 255, 0.7),
                  0 0 2px rgba(255, 128, 0, 0.6), 0 0 2px rgba(255, 128, 0, 0.5);
              }

              @keyframes borderTrace {
                0% {
                  border-color: white;
                  box-shadow: 0 0 15px 10px rgba(255, 255, 255, 0.9);
                }
                50% {
                  border-color: transparent;
                  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                }
                100% {
                  border-color: white;
                  box-shadow: 0 0 15px 10px rgba(255, 255, 255, 0.9);
                }
              }

              .animate-border-trace {
                animation: borderTrace 2s ease-in-out infinite;
              }
            `}</style>
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
      {/* Score Alert Modal */}
      {showScoreAlert && newScore !== null && (
        <ScoreAlertModal onClose={handleDismissAlert}>
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-tenOrange mb-4">Score Update!</h2>
            <p className="text-lg mb-4 text-smokeGray">
              Vols new score: <span className="font-bold text-tenOrange">{newScore}</span>
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-tenOrange text-white px-4 py-2 rounded-lg" onClick={handlePlayTheme}>
                <span className="text-2xl">🎉</span> Celebrate <span className="text-2xl">🎉</span>
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={handleDismissAlert}>
                Dismiss
              </button>
            </div>
            <p className="text-tenOrange font-semibold pt-6">Turn up your media volume to celebrate!</p>
          </div>
        </ScoreAlertModal>
      )}
      {/* Confetti component for celebration */}
      <div ref={confettiRef}>
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            // 450 is rough estimate of height of fixed elements
            height={450 + players.length * 56}
            numberOfPieces={800}
            wind={0.01} // Adjust wind to control horizontal drift
            colors={["#FF8200", "#FFFFFF"]}
            gravity={0.1} // Adjust gravity to control fall speed
            recycle={true} // Keep confetti active until manually turned off
          />
        )}
      </div>
    </>
  );
};

export default ParentComponent;
