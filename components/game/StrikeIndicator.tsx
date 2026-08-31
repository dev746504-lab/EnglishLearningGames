interface StrikeIndicatorProps {
  strikes: number;
  max: number;
}

export function StrikeIndicator({ strikes, max }: StrikeIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${strikes} of ${max} alarm strikes`}>
      {Array.from({ length: max }).map((_, i) => {
        const struck = i < strikes;
        return (
          <span
            key={i}
            aria-hidden
            className="h-3 w-3 border transition-colors duration-300"
            style={{
              backgroundColor: struck ? "var(--danger)" : "transparent",
              borderColor: struck ? "var(--danger)" : "var(--border-hairline-strong)",
            }}
          />
        );
      })}
    </div>
  );
}
