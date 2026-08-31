import type { ChallengeType, HeistWord } from "./types";

interface WordForChallenge {
  _id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  distractors: string[];
  clozeSentence: string;
  difficulty: 1 | 2 | 3;
  ipa: string;
}

export interface BuiltChallenge {
  clientWord: HeistWord;
  /** Kept server-side only — never sent to the client until answer submission. */
  correctAnswer: string;
}

const CHALLENGE_TYPES: ChallengeType[] = ["definition", "context", "audio"];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Builds the client-safe challenge payload plus the server-only correct
 * answer for one word. `decoyPool` supplies other words from the same vault
 * to use as wrong candidates for context-fill challenges.
 */
export function buildChallenge(word: WordForChallenge, decoyPool: WordForChallenge[]): BuiltChallenge {
  const challengeType = pickRandom(CHALLENGE_TYPES);

  if (challengeType === "definition") {
    const options = shuffle([word.definition, ...word.distractors.slice(0, 3)]);
    return {
      clientWord: {
        wordId: word._id,
        ipa: word.ipa,
        partOfSpeech: word.partOfSpeech,
        difficulty: word.difficulty,
        challengeType,
        word: word.word,
        options,
      },
      correctAnswer: word.definition,
    };
  }

  if (challengeType === "context") {
    const others = shuffle(decoyPool.filter((w) => w._id !== word._id)).slice(0, 3);
    const options = shuffle([word.word, ...others.map((w) => w.word)]);
    return {
      clientWord: {
        wordId: word._id,
        ipa: word.ipa,
        partOfSpeech: word.partOfSpeech,
        difficulty: word.difficulty,
        challengeType,
        clozeSentence: word.clozeSentence,
        options,
      },
      correctAnswer: word.word,
    };
  }

  // audio: the word text must reach the client to drive SpeechSynthesis,
  // but it is never rendered — the player only hears it and types what they heard.
  return {
    clientWord: {
      wordId: word._id,
      ipa: word.ipa,
      partOfSpeech: word.partOfSpeech,
      difficulty: word.difficulty,
      challengeType,
      word: word.word,
    },
    correctAnswer: word.word,
  };
}

/**
 * Cold Case heists draw a different word set every time, so there is no
 * hand-authored micro-story for them. This stitches a serviceable noir
 * paragraph out of whatever seven words the player cracked.
 */
export function buildFallbackCaseFile(words: string[]): string {
  const [w1, w2, w3, w4, w5, w6, w7] = words;
  return (
    `The file was thin, seven names deep. It started with ${w1}, the way these things always do. ` +
    `${w2} came next, quiet at first, then impossible to ignore. By the time anyone connected it to ${w3}, ` +
    `the trail had already bent toward ${w4}. Somebody had banked on ${w5} to keep it buried. ` +
    `They hadn't counted on ${w6}, or on ${w7} surfacing last of all. Case closed. Word by word.`
  );
}
