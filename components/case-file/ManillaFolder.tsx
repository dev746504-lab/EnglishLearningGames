"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface WordRecap {
  word: string;
  ipa: string;
  definition: string;
}

interface ManillaFolderProps {
  caseFile: string;
  words: WordRecap[];
  score: number;
}

function highlightWords(text: string, words: string[]) {
  if (words.length === 0) return [text];
  const escaped = [...words].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  const wordSet = new Set(words.map((w) => w.toLowerCase()));

  return parts.map((part, i) =>
    wordSet.has(part.toLowerCase()) ? (
      <strong key={i} className="font-semibold text-brass">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function ManillaFolder({ caseFile, words, score }: ManillaFolderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { scaleY: 0.06, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      style={{ transformOrigin: "top" }}
      className="mx-auto max-w-4xl border border-[var(--border-hairline-strong)] bg-bg-elevated p-6 md:p-10"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-success uppercase">Vault cracked</p>
        <h1 className="font-display mt-3 text-4xl text-text-100 md:text-5xl">The Case File</h1>
        <p className="mt-2 font-mono text-sm text-text-48">Take: {score} brass</p>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.15em] text-text-48 uppercase">Field report</p>
            <p className="text-base leading-relaxed text-text-72">{highlightWords(caseFile, words.map((w) => w.word))}</p>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.15em] text-text-48 uppercase">Words taken</p>
            <ul className="space-y-4">
              {words.map((w) => (
                <li key={w.word} className="border-t border-[var(--border-hairline)] pt-3 first:border-t-0 first:pt-0">
                  <p className="text-text-100">
                    <span className="font-semibold">{w.word}</span>{" "}
                    <span className="font-mono text-xs text-text-48">{w.ipa}</span>
                  </p>
                  <p className="mt-1 text-sm text-text-72">{w.definition}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <Link href="/vaults">
            <Button>Next vault</Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
