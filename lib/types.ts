export type ChallengeType = "definition" | "context" | "audio";

export interface WordDoc {
  _id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  distractors: string[];
  exampleSentence: string;
  clozeSentence: string;
  vaultId: string;
  difficulty: 1 | 2 | 3;
  ipa: string;
}

/**
 * "core" = the noir-heist B2/C1 vaults (the main game). "training" = the
 * beginner-level TOEFL Primary vaults — a separate, always-unlocked practice
 * tier that never mixes with or blocks the core progression.
 */
export type VaultTier = "core" | "training";

export interface VaultDoc {
  _id: string;
  code: string;
  name: string;
  description: string;
  order: number;
  wordCount: number;
  tier: VaultTier;
}

export interface PlayerDoc {
  _id: string;
  playerId: string;
  handle: string;
  reputation: number;
  createdAt: string;
}

export type RunOutcome = "cracked" | "busted";

export interface RunDoc {
  _id: string;
  playerId: string;
  vaultId: string;
  score: number;
  strikes: number;
  outcome: RunOutcome | "in-progress";
  wrongWords: string[];
  completedAt: string | null;
}

/**
 * A word paired with a randomly-assigned challenge presentation for one run.
 * `word` is present for "definition" (the target word to define) and "audio"
 * (needed client-side to drive SpeechSynthesis) but omitted for "context",
 * where it would give away the cloze answer. `options` never indicates which
 * entry is correct — that is validated server-side in /api/heist/answer.
 */
export interface HeistWord {
  wordId: string;
  ipa: string;
  partOfSpeech: string;
  difficulty: 1 | 2 | 3;
  challengeType: ChallengeType;
  word?: string;
  options?: string[];
  clozeSentence?: string;
}
