// Documented z-index scale (Section 6.F) — never spam arbitrary z-10/z-50.
export const Z = {
  base: 0,
  raised: 10,
  nav: 40,
  overlay: 50,
  grain: 60,
  modal: 70,
} as const;

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const HEIST_RULES = {
  wordsPerHeist: 7,
  strikesAllowed: 3,
  timerSecondsByDifficulty: { 1: 20, 2: 16, 3: 12 } as Record<1 | 2 | 3, number>,
  coldCaseRequeueHours: 24,
} as const;
