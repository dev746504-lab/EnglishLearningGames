"use client";

import { useId, useState } from "react";
import { Z } from "@/lib/constants";

interface WordTooltipProps {
  word: string;
  /** Present only for the run's target vault words. */
  ipa?: string;
  definition?: string;
  /** Set false when nesting inside a Link/Button to avoid nested-focusable markup. */
  interactive?: boolean;
}

// Shared across every WordTooltip instance on the page so repeated words
// (e.g. "the", "a") only ever trigger one network request each.
const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

async function translateWord(word: string): Promise<string | null> {
  const key = word.toLowerCase();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = fetch(`/api/translate?word=${encodeURIComponent(word)}`)
    .then((res) => (res.ok ? res.json() : { translation: null }))
    .catch(() => ({ translation: null }))
    .then((result: { translation: string | null }) => {
      cache.set(key, result.translation);
      inflight.delete(key);
      return result.translation;
    });

  inflight.set(key, promise);
  return promise;
}

type TranslationState = { status: "idle" } | { status: "loading" } | { status: "done"; text: string | null };

export function WordTooltip({ word, ipa, definition, interactive = true }: WordTooltipProps) {
  const isKnown = definition !== undefined;
  const [translation, setTranslation] = useState<TranslationState>({ status: "idle" });
  const tooltipId = useId();

  // Visibility is pure CSS (group-hover/group-focus-within) so the tooltip
  // can never get stuck open from a missed mouseleave/blur event — only the
  // async lookup needs JS state, triggered once per word via this handler.
  function handleTrigger() {
    if (translation.status !== "idle") return;

    const key = word.toLowerCase();
    const cached = cache.get(key);
    if (cached !== undefined) {
      setTranslation({ status: "done", text: cached });
      return;
    }

    setTranslation({ status: "loading" });
    translateWord(word).then((text) => setTranslation({ status: "done", text }));
  }

  const viMeaning =
    translation.status === "done" ? (
      translation.text ?? <span className="text-text-48">Không tìm thấy nghĩa.</span>
    ) : (
      <span className="text-text-48">Đang tra...</span>
    );

  return (
    <span
      className="group/wt relative inline-block"
      onMouseEnter={handleTrigger}
      onFocus={interactive ? handleTrigger : undefined}
    >
      <span
        tabIndex={interactive ? 0 : undefined}
        aria-describedby={interactive ? tooltipId : undefined}
        className={
          isKnown
            ? "cursor-help font-semibold text-brass underline decoration-dotted decoration-brass-dim underline-offset-4 outline-none"
            : "cursor-help underline decoration-dotted decoration-[var(--border-hairline-strong)] underline-offset-4 outline-none"
        }
      >
        {word}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        style={{ zIndex: Z.overlay }}
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-56 -translate-x-1/2 border border-[var(--border-hairline-strong)] bg-bg-elevated-2 px-3 py-2 text-left opacity-0 shadow-[var(--shadow-panel)] transition-opacity duration-150 group-hover/wt:opacity-100 motion-reduce:transition-none ${interactive ? "group-focus-within/wt:opacity-100" : ""}`}
      >
        {ipa && <span className="block font-mono text-xs text-text-48">{ipa}</span>}
        {isKnown && <span className="mt-1 block text-sm leading-snug font-sans text-text-100">{definition}</span>}
        <span
          className={`block text-sm leading-snug font-sans text-brass ${isKnown ? "mt-1 border-t border-[var(--border-hairline)] pt-1" : ""}`}
        >
          {viMeaning}
        </span>
      </span>
    </span>
  );
}
