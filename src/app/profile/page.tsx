"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserStats, getUserGuesses, updateUserName } from "../actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserStats {
  totalGames: number;
  totalWins: number;
  bestScore: number | null;
  lastPlayed: Date | null;
  winRate: number;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface UserGuess {
  id: number;
  score: number;
  isWinner: boolean;
  gameId: string | null;
  createdAt: Date;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userGuesses, setUserGuesses] = useState<UserGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchUserData = async () => {
      try {
        const [stats, guesses] = await Promise.all([
          getUserStats(session.user.id),
          getUserGuesses(session.user.id, 10),
        ]);
        
        setUserStats(stats);
        setUserGuesses(guesses);
        setCurrentName(session.user.name || "");
        setNewName(session.user.name || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  const handleNameUpdate = async () => {
    if (!newName || newName.trim() === currentName) {
      setIsEditingName(false);
      setNewName(currentName);
      return;
    }

    try {
      await updateUserName(newName.trim());
      setCurrentName(newName.trim());
      setIsEditingName(false);
      toast.success("Name updated successfully!");
      
      // Update the session name display
      if (session) {
        session.user.name = newName.trim();
      }
    } catch (error) {
      console.error("Failed to update name:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update name: ${errorMessage}`);
      setNewName(currentName); // Reset to current name on error
    }
  };

  const handleCancelEdit = () => {
    setNewName(currentName);
    setIsEditingName(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-tenOrange text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-tenOrange">Welcome back, </h1>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-3xl font-bold text-tenOrange bg-transparent border-b-2 border-tenOrange focus:outline-none"
                    maxLength={50}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameUpdate();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <span className="text-3xl font-bold text-tenOrange">!</span>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-tenOrange">
                  Welcome back, {currentName || "User"}!
                </h1>
              )}
              <p className="text-smokeGray mt-2">{session.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <>
                  <button
                    onClick={handleNameUpdate}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Edit Name
                </button>
              )}
            </div>
          </div>
        </div>

        {userStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-tenOrange">{userStats.totalGames}</div>
              <div className="text-smokeGray">Games Played</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{userStats.totalWins}</div>
              <div className="text-smokeGray">Games Won</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {userStats.winRate.toFixed(1)}%
              </div>
              <div className="text-smokeGray">Win Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {userStats.bestScore || "—"}
              </div>
              <div className="text-smokeGray">Best Score</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-smokeGray mb-2">
              No game statistics yet
            </h2>
            <p className="text-smokeGray">
              Submit your first guess to start tracking your stats!
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-tenOrange mb-4">Recent Guesses</h2>
          {userGuesses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-smokeGray">Date</th>
                    <th className="text-left p-2 text-smokeGray">Score</th>
                    <th className="text-left p-2 text-smokeGray">Result</th>
                    <th className="text-left p-2 text-smokeGray">Game</th>
                  </tr>
                </thead>
                <tbody>
                  {userGuesses.map((guess) => (
                    <tr key={guess.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(guess.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2 font-semibold text-tenOrange">
                        {guess.score}
                      </td>
                      <td className="p-2">
                        {guess.isWinner ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            Winner 🏆
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                            In Play
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-smokeGray">
                        {guess.gameId || "Current Game"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-smokeGray text-lg">No guesses yet!</p>
              <p className="text-smokeGray">Head back to the game to make your first guess.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-tenOrange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}