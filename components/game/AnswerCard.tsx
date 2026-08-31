"use client";

import { motion, useReducedMotion } from "motion/react";

interface AnswerCardProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  /** null = no feedback shown yet; true/false marks this specific card once answered. */
  state: "idle" | "correct" | "incorrect" | "muted";
  index: number;
}

export function AnswerCard({ label, onClick, disabled, state, index }: AnswerCardProps) {
  const reduceMotion = useReducedMotion();

  const stateClass =
    state === "correct"
      ? "border-success bg-success/10 text-text-100"
      : state === "incorrect"
        ? "border-danger bg-danger/10 text-text-100"
        : state === "muted"
          ? "border-[var(--border-hairline)] text-text-48"
          : "border-[var(--border-hairline-strong)] bg-bg-elevated text-text-100 hover:border-brass";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={disabled ? undefined : { y: -4, rotate: index % 2 === 0 ? -1 : 1 }}
      className={`border p-4 text-left text-sm leading-snug transition-colors duration-200 disabled:cursor-not-allowed ${stateClass}`}
      style={state === "idle" ? { boxShadow: "var(--shadow-panel)" } : undefined}
    >
      {label}
    </motion.button>
  );
}
