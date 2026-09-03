"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/constants";
import { HoverText } from "@/components/ui/HoverText";

interface Entry {
  rank: number;
  handle: string;
  reputation: number;
}

export function Leaderboard() {
  const reduceMotion = useReducedMotion();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => setEntries(data.players))
      .catch(() => setError("The ledger's locked. Try again shortly."));
  }, []);

  if (error) {
    return (
      <p className="px-6 py-16 text-danger md:px-14">
        <HoverText keyPrefix="lb-error" text={error} />
      </p>
    );
  }
  if (!entries) {
    return (
      <p className="px-6 py-16 font-mono text-sm text-text-48 md:px-14">
        <HoverText keyPrefix="lb-loading" text="Reading the ledger..." />
      </p>
    );
  }
  if (entries.length === 0) {
    return (
      <p className="px-6 py-16 text-text-72 md:px-14">
        <HoverText keyPrefix="lb-empty" text="No reputations on file yet. Crack a vault to be first." />
      </p>
    );
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const chunks: Entry[][] = [];
  for (let i = 0; i < rest.length; i += 5) chunks.push(rest.slice(i, i + 5));

  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="px-6 py-12 md:px-14">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {podiumOrder.map((entry) => {
          const isFirst = entry.rank === 1;
          return (
            <motion.div
              key={entry.rank}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className={`flex flex-col items-center justify-center border p-8 text-center ${
                isFirst
                  ? "sm:order-2 border-brass bg-bg-elevated"
                  : "sm:mt-6 border-[var(--border-hairline-strong)] bg-bg-elevated"
              } ${entry.rank === 2 ? "sm:order-1" : ""} ${entry.rank === 3 ? "sm:order-3" : ""}`}
            >
              <span className="font-mono text-xs text-text-48">RANK {entry.rank}</span>
              <span className={`font-display mt-2 ${isFirst ? "text-4xl text-brass" : "text-3xl text-text-100"}`}>
                {entry.handle}
              </span>
              <span className="mt-2 font-mono text-lg text-text-72">{entry.reputation} rep</span>
            </motion.div>
          );
        })}
      </div>

      {chunks.map((chunk, ci) => (
        <div key={ci} className="mt-10 border-t border-[var(--border-hairline)] pt-6">
          <ul className="space-y-3">
            {chunk.map((entry) => (
              <li key={entry.rank} className="flex items-center justify-between">
                <span className="text-text-72">
                  <span className="mr-3 font-mono text-sm text-text-48">{entry.rank}</span>
                  {entry.handle}
                </span>
                <span className="font-mono text-sm text-text-100">{entry.reputation}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
