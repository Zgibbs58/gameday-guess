"use client";

import { useState, useEffect } from "react";
import { getTotalPlayers, updateTotalPlayers } from "../actions"; // Import the server actions

export default function TeamScoreUpdate() {
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [newTotalPlayers, setNewTotalPlayers] = useState<number>(totalPlayers); // Local state for form input

  // Fetch the current total players when the component mounts
  useEffect(() => {
    const fetchTotalPlayers = async () => {
      const currentTotalPlayers = await getTotalPlayers();
      setTotalPlayers(currentTotalPlayers);
      setNewTotalPlayers(currentTotalPlayers); // Set the local state to the fetched score
    };

    fetchTotalPlayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedTotalPlayers = await updateTotalPlayers(newTotalPlayers); // Call the server action to update the total players
      setTotalPlayers(updatedTotalPlayers.value); // Update the global total players
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTotalPlayers(Number(e.target.value)); // Update local state with new value
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl text-tenOrange text-center">Player Count</h2>
      <form className="text-smokeGray flex flex-col" onSubmit={handleSubmit}>
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          name="totalPlayers"
          placeholder={totalPlayers.toString()}
          min={0}
          max={100}
          value={newTotalPlayers}
          onChange={handleChange}
          required
        />
        <button className="bg-tenOrange text-white rounded-xl py-2 mt-4" type="submit">
          Submit
        </button>
      </form>
    </section>
  );
}
