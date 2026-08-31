"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { LockSimple, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getOrCreatePlayerId } from "@/lib/playerId";
import { EASE_OUT } from "@/lib/constants";

interface VaultListItem {
  _id: string;
  code: string;
  name: string;
  description: string;
  wordCount: number;
  unlocked: boolean;
  cracked: boolean;
}

function VaultCard({ vault, featured, index }: { vault: VaultListItem; featured: boolean; index: number }) {
  const reduceMotion = useReducedMotion();
  const cardClass = `group relative block h-full border p-6 transition-transform duration-200 ${
    vault.unlocked
      ? "border-[var(--border-hairline-strong)] bg-bg-elevated hover:-translate-y-1 hover:rotate-[0.5deg] hover:border-brass"
      : "cursor-not-allowed border-[var(--border-hairline)] bg-bg-elevated/50 grayscale"
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs tracking-[0.15em] text-text-48">{vault.code}</span>
        {!vault.unlocked && <LockSimple size={16} className="text-text-48" />}
        {vault.cracked && (
          <span className="font-mono text-xs tracking-[0.15em] text-success">CRACKED</span>
        )}
      </div>

      <h3
        className={`font-display mt-3 ${featured ? "text-3xl md:text-4xl" : "text-2xl"} leading-tight text-text-100`}
      >
        {vault.name}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-72">{vault.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-text-48">{vault.wordCount} words</span>
        {vault.unlocked && (
          <span className="flex items-center gap-1 text-xs text-brass opacity-0 transition-opacity group-hover:opacity-100">
            Enter <ArrowRight size={14} />
          </span>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE_OUT }}
      className={featured ? "md:col-span-2" : ""}
    >
      {vault.unlocked ? (
        <Link href={`/heist/${vault._id}`} className={cardClass}>
          {content}
        </Link>
      ) : (
        <div className={cardClass} aria-disabled="true">
          {content}
        </div>
      )}
    </motion.div>
  );
}

export function VaultGrid() {
  const [vaults, setVaults] = useState<VaultListItem[] | null>(null);
  const [trainingVaults, setTrainingVaults] = useState<VaultListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    fetch(`/api/vaults?playerId=${encodeURIComponent(playerId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        const list: VaultListItem[] = data.vaults;
        if (data.coldCaseCount > 0) {
          list.push({
            _id: "cold-case",
            code: "COLD CASE",
            name: "Cold Case",
            description: "Words that got away are back on the board, waiting for a second look.",
            wordCount: data.coldCaseCount,
            unlocked: true,
            cracked: false,
          });
        }
        setVaults(list);
        setTrainingVaults(data.trainingVaults ?? []);
      })
      .catch(() => setError("The board's gone dark. Refresh to try again."));
  }, []);

  if (error) {
    return <p className="px-6 py-16 text-danger md:px-14">{error}</p>;
  }

  if (!vaults) {
    return (
      <div className="grid grid-cols-1 gap-4 px-6 py-16 md:grid-cols-3 md:px-14">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-40 animate-pulse bg-bg-elevated ${i === 0 ? "md:col-span-2" : ""}`}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-6 py-16 md:grid-cols-3 md:px-14">
        {vaults.map((vault, i) => (
          <VaultCard key={vault._id} vault={vault} featured={i === 0} index={i} />
        ))}
      </div>

      {trainingVaults.length > 0 && (
        <div className="border-t border-[var(--border-hairline)] px-6 pt-12 pb-16 md:px-14">
          <p className="font-mono text-xs tracking-[0.2em] text-text-48 uppercase">
            Optional practice
          </p>
          <h2 className="font-display mt-3 text-3xl text-text-100">Training Files</h2>
          <p className="mt-2 max-w-md text-sm text-text-72">
            Foundational vocabulary drills. Doesn&apos;t count toward reputation or gate the
            real vaults — always open, just practice.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {trainingVaults.map((vault, i) => (
              <VaultCard key={vault._id} vault={vault} featured={false} index={i} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
