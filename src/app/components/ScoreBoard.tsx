"use client";

import React, { useEffect } from "react";
import { getPlayersAndScores } from "../actions";

interface Player {
  name: string;
  score: number;
}

interface PlayerTableProps {
  players: Player[];
}

interface TeamScoreProps {
  teamScore: number;
}

const PlayerTable: React.FC<PlayerTableProps & TeamScoreProps> = ({ players, teamScore }) => {
  // const [players, setPlayers] = React.useState<Player[]>([]); // This is the initial state of the players

  // useEffect(() => {
  //   const fetchPlayers = async () => {
  //     const data = await getPlayersAndScores();
  //     setPlayers(data);
  //   };

  //   fetchPlayers();
  // }, []);

  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-md mx-auto mt-8">
      <table className="min-w-full border border-smokeGray dark:border-white">
        <thead className="bg-tenOrange text-white">
          <tr>
            <th className="py-2 px-4 border-b border-r border-smokeGray dark:border-white">Player Name</th>
            <th className="py-2 px-4 border-b border-smokeGray dark:border-white">Predicted Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={index} className="text-center">
              {player.score < teamScore ? (
                <td className="py-2 px-4 border-b border-r border-smokeGray dark:border-white bg-red-500 text-white">{player.name} is a LOSER</td>
              ) : (
                <td className="py-2 px-4 border-b border-r border-smokeGray dark:border-white">{player.name}</td>
              )}
              {player.score < teamScore ? (
                <td className="py-2 px-4 border-b border-smokeGray dark:border-white bg-red-500 text-white">{player.score}</td>
              ) : (
                <td className="py-2 px-4 border-b border-smokeGray dark:border-white">{player.score}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
