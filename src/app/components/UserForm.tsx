"use client";

import React, { useState } from "react";
import { saveUserAndScore } from "../actions";

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
    <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-2 py-10 text-smokeGray">
      <input
        className="border-2 focus:outline-tenOrange rounded-sm"
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
        className="border-2 focus:outline-tenOrange rounded-sm"
        type="number"
        name="score"
        placeholder="Enter your guess"
        min={0}
        max={400}
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
      />
      <button className="bg-tenOrange text-white rounded-xl" type="submit">
        Submit
      </button>
    </form>
  );
}
