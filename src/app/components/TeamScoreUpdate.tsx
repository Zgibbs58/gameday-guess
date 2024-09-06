"use client";

import { useState, useEffect } from "react";
import { updateScore } from "../actions"; // Import the server actions
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TeamScoreUpdateProps {
  teamScore: number;
}

const TeamScoreUpdate: React.FC<TeamScoreUpdateProps> = ({ teamScore }) => {
  const [newScore, setNewScore] = useState<number>(teamScore); // Local state for form input

  // Fetch the current team score when the component mounts
  useEffect(() => {
    const fetchScore = async () => {
      setNewScore(teamScore); // Set the local state to the fetched score
    };

    fetchScore();
  }, [teamScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      await updateScore(newScore); // Call the server action to update the score
      toast.success("Score Updated!");
    } catch (error) {
      toast.error("Failed to update score.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewScore(Number(e.target.value)); // Update local state with new value
  };

  return (
    <section className="space-y-4">
      <ToastContainer />
      <h2 className="text-2xl text-tenOrange text-center">Team Score</h2>
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
        <button className="bg-tenOrange text-white rounded-xl py-2 mt-4" type="submit">
          Submit
        </button>
      </form>
    </section>
  );
};

export default TeamScoreUpdate;
