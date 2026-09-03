import { Fragment } from "react";
import { WordTooltip } from "@/components/ui/WordTooltip";

/**
 * Wraps every alphabetic word in `text` with a hover-to-translate tooltip.
 * Pass `interactive={false}` when nesting inside a Link/Button — a focusable
 * span per word would otherwise create invalid nested-interactive markup.
 */
export function hoverWords(text: string, keyPrefix: string, interactive = true) {
  const tokens = text.split(/([A-Za-z']+)/);
  return tokens.map((token, i) =>
    /[A-Za-z]/.test(token) ? (
      <WordTooltip key={`${keyPrefix}-${i}`} word={token} interactive={interactive} />
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{token}</Fragment>
    )
  );
}

export function HoverText({
  text,
  keyPrefix = "w",
  interactive = true,
}: {
  text: string;
  keyPrefix?: string;
  interactive?: boolean;
}) {
  return <>{hoverWords(text, keyPrefix, interactive)}</>;
}
