import React, { useEffect } from "react";

type Player = {
  name: string;
  score: number;
};

type PlayerTableProps = {
  players: Player[];
};

type TeamScoreProps = {
  teamScore: number;
};

const PlayerTable: React.FC<PlayerTableProps & TeamScoreProps> = ({ players, teamScore }) => {
  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-md mx-auto mt-8">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Player Name</th>
            <th className="py-2 px-4 border-b">Predicted Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={index} className="text-center">
              {player.score < teamScore ? (
                <td className="py-2 px-4 border-b bg-red-500 text-white">{player.name} is a LOSER</td>
              ) : (
                <td className="py-2 px-4 border-b">{player.name}</td>
              )}
              {player.score < teamScore ? (
                <td className="py-2 px-4 border-b bg-red-500 text-white">{player.score}</td>
              ) : (
                <td className="py-2 px-4 border-b">{player.score}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
