const BASE_POINTS_BY_DIFFICULTY: Record<1 | 2 | 3, number> = {
  1: 100,
  2: 150,
  3: 220,
};

/** Streak multiplier climbs from x1.0 to x2.5, capping at a 6-correct streak. */
export function streakMultiplier(streak: number): number {
  const capped = Math.min(streak, 6);
  return Math.round((1 + capped * 0.25) * 100) / 100;
}

export function pointsForAnswer(difficulty: 1 | 2 | 3, streakBeforeThisAnswer: number): number {
  const base = BASE_POINTS_BY_DIFFICULTY[difficulty];
  return Math.round(base * streakMultiplier(streakBeforeThisAnswer));
}

/** Accepts minor typos in typed answers (audio-safe challenge). Levenshtein distance <= 1. */
export function levenshteinWithinOne(a: string, b: string): boolean {
  const s = a.trim().toLowerCase();
  const t = b.trim().toLowerCase();
  if (s === t) return true;
  if (Math.abs(s.length - t.length) > 1) return false;

  const m = s.length;
  const n = t.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n] <= 1;
}
