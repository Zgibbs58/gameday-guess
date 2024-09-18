import { useState } from "react";
import { updateGameTimer } from "../actions";

// Helper function to convert CDT to UTC
const convertCDTtoUTC = (year: number, month: number, day: number, hour: number, minute: number) => {
  const cdtDate = new Date(Date.UTC(year, month - 1, day, hour, minute)); // Create date object
  return cdtDate.toISOString(); // Convert to UTC and return in ISO format
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
      const targetDateUTC = convertCDTtoUTC(Number(year), Number(month), Number(day), Number(hour), Number(minute));

      // Update GameTimer in the database
      try {
        await updateGameTimer(targetDateUTC, isActive);
        alert("Timer updated successfully!");
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  return (
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
      <label>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active Timer
      </label>
      <button className="bg-tenOrange text-white rounded-xl py-2 mt-4" type="submit">
        Update Timer
      </button>
    </form>
  );
}
