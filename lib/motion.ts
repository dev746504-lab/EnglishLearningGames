import type { Variants } from "motion/react";
import { EASE_OUT } from "./constants";

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: EASE_OUT } },
};

export const revealUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const shakeKeyframes = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: 0.12 },
};

export function staggerDelay(index: number, step = 0.06): number {
  return index * step;
}
