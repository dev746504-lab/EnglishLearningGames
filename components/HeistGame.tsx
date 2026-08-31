"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SpeakerHigh } from "@phosphor-icons/react/dist/ssr";
import { getOrCreatePlayerId } from "@/lib/playerId";
import { HEIST_RULES } from "@/lib/constants";
import { shakeKeyframes } from "@/lib/motion";
import type { HeistWord } from "@/lib/types";
import { Timer } from "@/components/game/Timer";
import { StrikeIndicator } from "@/components/game/StrikeIndicator";
import { AnswerCard } from "@/components/game/AnswerCard";
import { Button } from "@/components/ui/Button";

type Phase = "loading" | "playing" | "feedback" | "busted" | "error";

interface AnswerResponse {
  correct: boolean;
  correctAnswer: string;
  scoreDelta: number;
  totalScore: number;
  strikes: number;
  streak: number;
  busted: boolean;
}

export function HeistGame({ vaultId }: { vaultId: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("loading");
  const [runId, setRunId] = useState<string | null>(null);
  const [words, setWords] = useState<HeistWord[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentWord = words[index];
  const submittedRef = useRef(false);

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    fetch("/api/heist/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, vaultId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        setRunId(data.runId);
        setWords(data.words);
        setSecondsLeft(HEIST_RULES.timerSecondsByDifficulty[data.words[0].difficulty as 1 | 2 | 3]);
        setPhase("playing");
      })
      .catch(() => {
        setErrorMessage("This vault won't open right now. Head back and try another entry.");
        setPhase("error");
      });
  }, [vaultId]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (submittedRef.current || !runId || !currentWord) return;
      submittedRef.current = true;
      setPhase("feedback");

      const res = await fetch("/api/heist/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, wordId: currentWord.wordId, answer }),
      });
      const data: AnswerResponse = await res.json();

      setScore(data.totalScore);
      setStrikes(data.strikes);
      setStreak(data.streak);
      setFeedback(data);
    },
    [runId, currentWord]
  );

  // Real-time countdown drives the timeout, independent of any visual animation.
  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsLeft <= 0) {
      submitAnswer("");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, submitAnswer]);

  async function advance() {
    if (!runId) return;
    const busted = feedback?.busted ?? false;
    const isLastWord = index === words.length - 1;

    if (busted) {
      await fetch("/api/heist/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      setPhase("busted");
      return;
    }

    if (isLastWord) {
      await fetch("/api/heist/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      router.push(`/case-file/${runId}`);
      return;
    }

    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSecondsLeft(HEIST_RULES.timerSecondsByDifficulty[words[nextIndex].difficulty]);
    setSelectedOption(null);
    setTypedAnswer("");
    setFeedback(null);
    submittedRef.current = false;
    setPhase("playing");
  }

  function playAudio() {
    if (!currentWord?.word || typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if (phase === "error") {
    return (
      <div className="px-6 py-16 md:px-14">
        <p className="text-danger">{errorMessage}</p>
        <Button className="mt-6" onClick={() => router.push("/vaults")}>
          Back to the board
        </Button>
      </div>
    );
  }

  if (phase === "loading" || !currentWord) {
    return (
      <div className="px-6 py-16 md:px-14">
        <p className="font-mono text-sm text-text-48">Cracking the entry code...</p>
      </div>
    );
  }

  if (phase === "busted") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-danger uppercase">Alarm tripped</p>
        <h1 className="font-display mt-4 text-5xl text-text-100">Busted</h1>
        <p className="mt-4 max-w-md text-text-72">
          Three wrong moves and the vault sealed itself. Final take: {score} brass.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => router.push("/vaults")}>Back to the board</Button>
        </div>
      </div>
    );
  }

  const showFeedback = phase === "feedback" && feedback !== null;
  const isCorrect = feedback?.correct ?? false;

  return (
    <div className="relative px-6 py-8 md:px-14">
      {showFeedback && !isCorrect && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 animate-[vignette-pulse_0.5s_ease-out]"
          style={{
            background: "radial-gradient(circle, transparent 40%, rgb(139 30 30 / 0.35) 100%)",
          }}
        />
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <Timer
          secondsLeft={secondsLeft}
          totalSeconds={HEIST_RULES.timerSecondsByDifficulty[currentWord.difficulty]}
        />
        <StrikeIndicator strikes={strikes} max={HEIST_RULES.strikesAllowed} />
        <div className="text-right">
          <p className="font-mono text-2xl tabular-nums text-brass">{score}</p>
          {streak > 1 && <p className="text-xs text-text-48">streak x{streak}</p>}
        </div>
      </div>

      <p className="font-mono text-xs tracking-[0.15em] text-text-48 uppercase">
        Word {index + 1} of {words.length}
      </p>

      <motion.div
        key={currentWord.wordId}
        animate={showFeedback && !isCorrect && !reduceMotion ? shakeKeyframes : {}}
        className="mt-4"
      >
        {currentWord.challengeType === "definition" && (
          <div>
            <h2 className="font-display text-4xl text-text-100 md:text-5xl">{currentWord.word}</h2>
            <p className="mt-1 font-mono text-sm text-text-48">
              {currentWord.ipa} · {currentWord.partOfSpeech}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentWord.options?.map((opt, i) => (
                <AnswerCard
                  key={opt}
                  index={i}
                  label={opt}
                  disabled={phase !== "playing"}
                  onClick={() => {
                    setSelectedOption(opt);
                    submitAnswer(opt);
                  }}
                  state={cardState(opt, selectedOption, showFeedback, isCorrect, feedback?.correctAnswer)}
                />
              ))}
            </div>
          </div>
        )}

        {currentWord.challengeType === "context" && (
          <div>
            <p className="font-display max-w-2xl text-2xl leading-snug text-text-100 md:text-3xl">
              {currentWord.clozeSentence?.replace("___", "▁▁▁▁▁")}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentWord.options?.map((opt, i) => (
                <AnswerCard
                  key={opt}
                  index={i}
                  label={opt}
                  disabled={phase !== "playing"}
                  onClick={() => {
                    setSelectedOption(opt);
                    submitAnswer(opt);
                  }}
                  state={cardState(opt, selectedOption, showFeedback, isCorrect, feedback?.correctAnswer)}
                />
              ))}
            </div>
          </div>
        )}

        {currentWord.challengeType === "audio" && (
          <div className="max-w-sm">
            <button
              type="button"
              onClick={playAudio}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brass text-bg transition-transform active:scale-95"
              aria-label="Play the word"
            >
              <SpeakerHigh size={28} weight="fill" />
            </button>
            <p className="mt-3 text-sm text-text-48">Tap to hear it. Type what you hear.</p>
            <input
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer(typedAnswer)}
              disabled={phase !== "playing"}
              placeholder="safe combination"
              className="mt-4 w-full border border-[var(--border-hairline-strong)] bg-bg-elevated px-4 py-3 font-mono text-lg tracking-wide text-text-100 placeholder:text-text-28 focus:border-brass focus:outline-none"
            />
            <Button className="mt-4" onClick={() => submitAnswer(typedAnswer)} disabled={phase !== "playing"}>
              Crack it
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex items-center justify-between border-t border-[var(--border-hairline)] pt-6"
          >
            <p className={`text-sm ${isCorrect ? "text-success" : "text-danger"}`}>
              {isCorrect ? "The tumbler clicks into place." : diegeticWrongLine(currentWord.challengeType)}
            </p>
            <Button variant="ghost" onClick={advance}>
              {index === words.length - 1 && !feedback?.busted ? "Open the file" : "Next"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cardState(
  option: string,
  selected: string | null,
  showFeedback: boolean,
  isCorrect: boolean,
  correctAnswer: string | undefined
): "idle" | "correct" | "incorrect" | "muted" {
  if (!showFeedback) return "idle";
  if (correctAnswer && option === correctAnswer) return "correct";
  if (option === selected && !isCorrect) return "incorrect";
  return "muted";
}

function diegeticWrongLine(type: HeistWord["challengeType"]): string {
  if (type === "audio") return "The combination doesn't match. The safe stays shut.";
  return "Wrong tumbler. The lock resists.";
}
