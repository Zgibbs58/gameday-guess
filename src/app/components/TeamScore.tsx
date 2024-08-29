"use client";

import { useEffect, useState } from "react";

const fetchScore = async () => {
  try {
    const response = await fetch("https://ncaa-api.henrygd.me/scoreboard/football/fbs/2024");
    const data = await response.json();
    const utGameData = data.games.filter((game: { game: { home: { names: { full: string } }; away: { names: { full: string } } } }) => {
      game.game.home.names.full === "University of Tennessee, Knoxville" || game.game.away.names.full === "University of Tennessee, Knoxville";
    });
    return utGameData;
  } catch (error) {
    console.error(error);
  }
};

export default function TeamScore() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchScore().then((data) => {
      console.log(data);
      //   setScore(data);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold"></h1>
      <p className="text-lg">This is a team score component</p>
    </div>
  );
}
