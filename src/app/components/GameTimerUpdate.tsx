import { useState } from "react";
import { updateGameTimer } from "../actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to convert to readable date format
const convertToDate = (year: number, month: number, day: number, hour: number, minute: number) => {
  const cdtDate = new Date(year, month - 1, day, hour, minute); // Create date object
  return cdtDate.toISOString(); // return in ISO format
};

export default function GameTimerUpdate() {
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");
  const [hour, setHour] = useState<number | "">("");
  const [minute, setMinute] = useState<number | "">("");
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (year && month && day && hour !== "" && minute !== "") {
      // Convert CDT to UTC
      const gameDate = convertToDate(Number(year), Number(month), Number(day), Number(hour), Number(minute));

      // Update GameTimer in the database
      try {
        await updateGameTimer(gameDate, isActive);
        toast.success("Timer updated successfully!");
      } catch (error) {
        console.error("Error updating timer:", error);
        toast.error("Failed to update timer.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="text-smokeGray flex flex-col space-y-3">
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          placeholder="Year (e.g., 2024)"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          required
        />
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          required
        />
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          placeholder="Day (1-31)"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          required
        />
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          placeholder="Hour (0-23, CDT)"
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          required
        />
        <input
          className="border-2 focus:outline-tenOrange rounded-sm"
          type="number"
          placeholder="Minute (0-59)"
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
          required
        />
        <label className="text-black dark:text-white">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active Timer
        </label>
        <button className="bg-tenOrange text-white rounded-xl py-2 mt-4" type="submit">
          Update Timer
        </button>
      </form>
    </>
  );
}
