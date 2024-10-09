"use client";

import React, { use, useState } from "react";
import { saveUserAndScore, getPlayersAndScores } from "../actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      await saveUserAndScore(formData);
      toast.success("User and score saved successfully!");
      onAddPlayer({ name, score: Number(score) });
      setName("");
      setScore("");
    } catch (error: any) {
      toast.error("Failed to save user and score. Try using a different score.");
    }
  };
  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-2 text-smokeGray">
        <input
          className="border-2 focus:outline-tenOrange rounded-md p-1"
          type="text"
          name="name"
          placeholder="Enter your name"
          minLength={2}
          maxLength={16}
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
    </>
  );
}
