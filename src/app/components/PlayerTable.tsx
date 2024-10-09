"use client";

import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

interface Player {
  name: string;
  score: number;
  winner?: boolean;
}

interface PlayerTableProps {
  players: Player[];
}

interface TeamScoreProps {
  teamScore: number;
}

const PlayerTable: React.FC<PlayerTableProps & TeamScoreProps> = ({ players, teamScore }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    const winner = players.find((player) => player.winner);
    if (winner) {
      setWinnerName(winner.name);
      setShowConfetti(true);

      // Stop confetti after 10 seconds
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
        setWinnerName(null);
      }, 10000);

      return () => clearTimeout(confettiTimeout);
    }
  }, [players]);

  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  return (
    <div className=" w-full mx-auto">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          // 450 is rough estimate of height of fixed elements
          height={450 + players.length * 56}
          numberOfPieces={600}
          wind={0.01} // Adjust wind to control horizontal drift
          colors={["#FF8200", "#FFFFFF"]}
          gravity={0.1} // Adjust gravity to control fall speed
          recycle={true} // Keep confetti active until manually turned off
        />
      )}
      {showConfetti && winnerName && (
        <div className="absolute inset-0 flex items-center justify-center h-screen w-screen text-center z-20">
          <div className="flex flex-col content-center justify-center text-3xl font-bold text-white bg-tenOrange bg-opacity-95 p-4 rounded-lg gap-2 w-screen md:w-auto">
            <p className="">Congrats,</p>
            <p className="">{winnerName}!</p>
            <p className="text-5xl">You Win!</p>
          </div>
        </div>
      )}
      <table className="min-w-full border border-smokeGray dark:border-white">
        <thead className="bg-tenOrange text-white">
          <tr>
            <th className="py-2 px-4 border-b border-r border-smokeGray dark:border-white">Name</th>
            <th className="py-2 px-4 border-b border-smokeGray dark:border-white">Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={index} className="text-center second-element">
              {player.winner ? (
                <>
                  <td className="relative py-2 px-4 text-lg font-semibold border-b border-r border-smokeGray dark:border-white bg-green-500 text-white">
                    {player.name}
                    <span className="absolute top-1/2 -right-4 transform -translate-x-1/2 -translate-y-1/2 rotate-[8deg] text-4xl font-bold text-smokeGray opacity-95 pointer-events-none winner-text">
                      Winner
                    </span>
                  </td>
                  <td className="py-2 px-4 text-lg font-semibold border-b border-smokeGray dark:border-white bg-green-500 text-white winner-border">
                    {player.score}
                  </td>
                </>
              ) : player.score < teamScore ? (
                <>
                  <td className="relative py-2 px-4 text-lg font-semibold border-b border-r border-smokeGray dark:border-white bg-red-500 text-white">
                    {player.name}
                    <span className="absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 rotate-[8deg] text-4xl font-bold text-smokeGray opacity-80 pointer-events-none">
                      Loser
                    </span>
                  </td>
                  <td className="py-2 px-4 text-lg font-semibold border-b border-smokeGray dark:border-white bg-red-500 text-white">
                    {player.score}
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 text-lg font-semibold border-b border-r border-smokeGray dark:border-white">{player.name}</td>
                  <td className="py-2 px-4 text-lg font-semibold border-b border-smokeGray dark:border-white">{player.score}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
