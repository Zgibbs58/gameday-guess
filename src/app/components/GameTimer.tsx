"use client";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Noto_Serif_Armenian } from "next/font/google";

const serif = Noto_Serif_Armenian({ subsets: ["latin"] });

export default function GameTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      setTimeLeft(difference);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);

    return (
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center border-2 rounded-lg border-white p-2 w-20">
          <div className="text-4xl font-extrabold">{days}</div>
          <div className="text-xl">Days</div>
        </div>
        <div className="flex flex-col items-center border-2 rounded-lg border-white p-2 w-20">
          <div className="text-4xl font-extrabold">{hours}</div>
          <div className="text-xl">Hrs</div>
        </div>
        <div className="flex flex-col items-center border-2 rounded-lg border-white p-2 w-20">
          <div className="text-4xl font-extrabold">{minutes}</div>
          <div className="text-xl">Min</div>
        </div>
        <div className="flex flex-col items-center border-2 rounded-lg border-white p-2 w-20">
          <div className="text-4xl font-extrabold">{seconds}</div>
          <div className="text-xl">Sec</div>
        </div>
      </div>
    );
  };

  // Format Central Time for display
  const centralTimeZone = "America/Chicago";

  // Ensure targetDate is treated as UTC and converted to Central Time
  const formattedCentralTime = formatInTimeZone(targetDate, centralTimeZone, "hh:mm a zzz");

  return (
    <div className="flex flex-col items-center shadow-2xl">
      <h3 className="relative text-lg font-extrabold text-center bg-tenOrange px-4 text-white rounded-t-lg border border-b-1 dark:border-smokeGray">
        NEYLAND <span className={`text-5xl text-white ${serif.className}`}>T</span> STADIUM
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="animate-spin-slow w-4 h-4 rounded-full"></div>
        </div>
      </h3>
      <div className="flex flex-col items-center gap-4 text-white bg-tenOrange rounded-lg p-2 text-center">
        <h1 className="text-2xl font-bold">Countdown to Gametime</h1>
        <div className="text-5xl font-extrabold">{formatTime(timeLeft)}</div>
        <p className="text-xl">Gametime: {formattedCentralTime}.</p>
      </div>
    </div>
  );
}
