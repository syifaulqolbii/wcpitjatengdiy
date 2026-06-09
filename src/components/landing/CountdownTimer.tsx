"use client";

import { useEffect, useMemo, useState } from "react";

const TARGET_DATE = new Date("2026-06-11T18:00:00Z");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(TARGET_DATE.getTime() - Date.now(), 0);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const units = useMemo(
    () => [
      { label: "DAYS", value: timeLeft.days },
      { label: "HOURS", value: timeLeft.hours },
      { label: "MIN", value: timeLeft.minutes },
      { label: "SEC", value: timeLeft.seconds },
    ],
    [timeLeft]
  );

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8" aria-label="Countdown to first kickoff">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="flex h-16 w-14 items-center justify-center rounded-md bg-primary shadow-[0_0_28px_rgba(0,230,118,0.18)] sm:h-20 sm:w-16 md:h-28 md:w-24">
            <span suppressHydrationWarning className="font-display text-2xl font-black tabular-nums text-primary-foreground sm:text-3xl md:text-5xl">
              {String(unit.value).padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
