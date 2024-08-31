"use client";

import React, { use, useState } from "react";
import { saveUserAndScore, getPlayersAndScores } from "../actions";

interface Player {
  name: string;
  score: number;
}

interface PlayerFormProps {
  onAddPlayer: (newPlayer: Player) => void;
}

export default function UserForm({ onAddPlayer }: PlayerFormProps) {
  const [name, setName] = useState<string>("");
  const [score, setScore] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const result = await saveUserAndScore(formData);
      alert(result.message);
      onAddPlayer({ name, score: Number(score) });
      setName("");
      setScore("");
    } catch (error: any) {
      alert(error.message);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-2 text-smokeGray">
      <input
        className="border-2 focus:outline-tenOrange rounded-md p-1"
        type="text"
        name="name"
        placeholder="Enter your name"
        minLength={2}
        maxLength={10}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border-2 focus:outline-tenOrange rounded-md p-1"
        type="number"
        name="score"
        placeholder="Enter your guess"
        min={0}
        max={400}
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
      />
      <button type="submit" className="bg-tenOrange text-white rounded-lg py-2">
        Submit
      </button>
    </form>
  );
}
