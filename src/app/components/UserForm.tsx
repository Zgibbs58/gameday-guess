"use client";

import React, { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [score, setScore] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to submit a guess.");
      router.push("/auth/signin");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("score", score);
      const result = await saveUserAndScore(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message || "Guess submitted successfully!");
        onAddPlayer({ name: session.user.name || "Anonymous", score: Number(score) });
        setScore("");
      }
    } catch (error: any) {
      console.error("Unexpected error in form submission:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center gap-2 text-smokeGray">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center gap-4 text-center">
        <p className="text-smokeGray">You must be signed in to submit a guess.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => router.push("/auth/signin")}
            className="bg-tenOrange text-white rounded-lg py-2 px-4"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/auth/signup")}
            className="bg-gray-500 text-white rounded-lg py-2 px-4"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-2 text-smokeGray">
        <div className="text-center mb-2">
          <span className="text-tenOrange font-semibold">Playing as: {session.user.name}</span>
        </div>
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
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="bg-tenOrange text-white rounded-lg py-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Guess"}
        </button>
      </form>
    </>
  );
}
