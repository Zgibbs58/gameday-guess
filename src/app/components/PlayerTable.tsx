"use client";

import React, { useEffect } from "react";
import { getPlayersAndScores } from "../actions";

interface Player {
  name: string;
  score: number;
  winner?: boolean;
}

interface PlayerTableProps {
  players: Player[];
  winner?: number;
}

interface TeamScoreProps {
  teamScore: number;
}

const PlayerTable: React.FC<PlayerTableProps & TeamScoreProps> = ({ players, teamScore, winner }) => {
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
    <div className=" w-full mx-auto">
      <table className="min-w-full border border-smokeGray dark:border-white">
        <thead className="bg-tenOrange text-white">
          <tr>
            <th className="py-2 px-4 border-b border-r border-smokeGray dark:border-white">Player Name</th>
            <th className="py-2 px-4 border-b border-smokeGray dark:border-white">Predicted Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={index} className="text-center second-element">
              {player.winner ? (
                <>
                  <td className="py-2 px-4 text-xl font-semibold border-b border-r border-smokeGray dark:border-white bg-green-500 text-white">
                    {player.name}
                  </td>
                  <td className="relative py-2 px-4 text-xl font-semibold border-b border-smokeGray dark:border-white bg-green-500 text-white">
                    {player.score}
                    <span className="absolute top-1/2 left-2 transform -translate-x-1/2 -translate-y-1/2 rotate-[8deg] text-4xl font-bold text-smokeGray opacity-75 pointer-events-none">
                      Winner
                    </span>
                  </td>
                </>
              ) : player.score < teamScore ? (
                <>
                  <td className="py-2 px-4 text-xl font-semibold border-b border-r border-smokeGray dark:border-white bg-red-500 text-white">
                    {player.name}
                  </td>
                  <td className="relative py-2 px-4 text-xl font-semibold border-b border-smokeGray dark:border-white bg-red-500 text-white">
                    {player.score}
                    <span className="absolute top-1/2 left-2 transform -translate-x-1/2 -translate-y-1/2 rotate-[8deg] text-4xl font-bold text-smokeGray opacity-75 pointer-events-none">
                      Loser
                    </span>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 text-xl font-semibold border-b border-r border-smokeGray dark:border-white">{player.name}</td>
                  <td className="py-2 px-4 text-xl font-semibold border-b border-smokeGray dark:border-white">{player.score}</td>
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
