import { Fire } from "@phosphor-icons/react/dist/ssr";

interface TimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

/** The burning fuse: a shrinking brass track that reddens as time runs out. */
export function Timer({ secondsLeft, totalSeconds }: TimerProps) {
  const ratio = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const urgent = ratio <= 0.3;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 w-32 bg-bg-elevated-2 md:w-40">
        <div
          className="h-full transition-[width] duration-1000 ease-linear"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: urgent ? "var(--danger)" : "var(--accent-brass)",
          }}
        />
        <Fire
          size={14}
          weight="fill"
          className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-1000 ease-linear"
          style={{ left: `calc(${ratio * 100}% - 7px)`, color: urgent ? "var(--danger)" : "var(--accent-brass)" }}
        />
      </div>
      <span className="font-mono text-sm tabular-nums text-text-72">{secondsLeft}s</span>
    </div>
  );
}
