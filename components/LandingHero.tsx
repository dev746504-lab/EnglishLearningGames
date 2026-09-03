"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { getOrCreatePlayerId } from "@/lib/playerId";
import { EASE_OUT } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { HoverText } from "@/components/ui/HoverText";

export function LandingHero() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.handle) setHandle(data.handle);
      })
      .catch(() => {});
  }, []);

  async function handleTakeCase() {
    const trimmed = handle.trim();
    if (!trimmed) {
      setError("Every operative needs an alias.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const playerId = getOrCreatePlayerId();
      await fetch("/api/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, handle: trimmed }),
      });
      router.push("/vaults");
    } catch {
      setError("The line went dead. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] grid-cols-1 md:grid-cols-5">
      <div className="col-span-3 flex flex-col justify-center px-6 py-16 md:px-14">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="font-mono text-xs tracking-[0.2em] text-text-48 uppercase"
        >
          Case file open
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
          className="font-display mt-4 text-5xl leading-none tracking-tight text-text-100 md:text-7xl"
        >
          Word Heist
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT }}
          className="mt-5 max-w-md text-base leading-relaxed text-text-72"
        >
          <HoverText
            keyPrefix="hero-sub"
            text="Every vault holds seven words worth stealing. Crack the definitions, read the room, beat the clock. Three wrong moves and the alarm goes off."
          />
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: EASE_OUT }}
          className="mt-10 max-w-sm"
        >
          <label
            htmlFor="handle"
            className="mb-2 block font-mono text-xs tracking-[0.15em] text-text-48 uppercase"
          >
            Operative alias
          </label>
          <div className="flex items-stretch gap-0 border border-[var(--border-hairline-strong)] bg-bg-elevated">
            <input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTakeCase()}
              maxLength={24}
              placeholder="The Whisper"
              className="w-full bg-transparent px-4 py-3 font-sans text-text-100 placeholder:text-text-28 focus:outline-none"
              aria-describedby={error ? "handle-error" : undefined}
            />
          </div>
          {error && (
            <p id="handle-error" className="mt-2 text-sm text-danger">
              <HoverText keyPrefix="hero-error" text={error} />
            </p>
          )}

          <Button className="mt-4 w-full" onClick={handleTakeCase} disabled={loading}>
            {loading ? "Opening the file..." : "Take the case"}
          </Button>
        </motion.div>
      </div>

      <div className="relative col-span-2 hidden overflow-hidden md:block">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/word-heist-vault-door/1200/1600"
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(0.65) contrast(1.15) brightness(0.5) sepia(0.2)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgb(14 11 8 / 0.15) 0%, rgb(14 11 8 / 0.65) 100%), linear-gradient(90deg, rgb(14 11 8 / 0.9) 0%, transparent 18%)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
