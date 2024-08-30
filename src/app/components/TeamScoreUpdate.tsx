"use client";

import { useState, useEffect } from "react";
import { getTeamScore, updateScore } from "../actions"; // Import the server actions

export default function TeamScoreUpdate() {
  const [teamScore, setTeamScore] = useState<number>(0);
  const [newScore, setNewScore] = useState<number>(teamScore); // Local state for form input

  // Fetch the current team score when the component mounts
  useEffect(() => {
    const fetchScore = async () => {
      const currentScore = await getTeamScore();
      setTeamScore(currentScore);
      setNewScore(currentScore); // Set the local state to the fetched score
    };

    fetchScore();
  }, [setTeamScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      await updateScore(newScore); // Call the server action to update the score
      setTeamScore(newScore); // Update the global team score
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewScore(Number(e.target.value)); // Update local state with new value
  };

  return (
    <>
      <form className="text-smokeGray flex flex-col" onSubmit={handleSubmit}>
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          name="teamScore"
          placeholder={teamScore.toString()}
          min={0}
          max={400}
          value={newScore}
          onChange={handleChange}
          required
        />
        <button className="bg-tenOrange text-white rounded-xl py-2" type="submit">
          Submit
        </button>
      </form>
    </>
  );
}
