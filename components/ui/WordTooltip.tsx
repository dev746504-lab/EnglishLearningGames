"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Z } from "@/lib/constants";

interface WordTooltipProps {
  word: string;
  ipa: string;
  definition: string;
}

export function WordTooltip({ word, ipa, definition }: WordTooltipProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const tooltipId = useId();

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <strong
        tabIndex={0}
        aria-describedby={tooltipId}
        className="cursor-help font-semibold text-brass underline decoration-dotted decoration-brass-dim underline-offset-4 outline-none"
      >
        {word}
      </strong>
      <AnimatePresence>
        {open && (
          <motion.span
            id={tooltipId}
            role="tooltip"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{ zIndex: Z.overlay }}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-56 -translate-x-1/2 border border-[var(--border-hairline-strong)] bg-bg-elevated-2 px-3 py-2 text-left shadow-[var(--shadow-panel)]"
          >
            <span className="block font-mono text-xs text-text-48">{ipa}</span>
            <span className="mt-1 block text-sm leading-snug font-sans text-text-100">{definition}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
