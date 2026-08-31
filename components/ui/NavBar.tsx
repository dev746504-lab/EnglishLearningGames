import Link from "next/link";

export function NavBar() {
  return (
    <header className="relative z-40 flex h-16 items-center justify-between border-b border-[var(--border-hairline)] px-6 md:px-10">
      {/* z-40 == Z.nav in lib/constants.ts */}
      <Link href="/" className="font-display text-lg tracking-tight text-text-100">
        Word Heist
      </Link>
      <Link
        href="/leaderboard"
        className="font-sans text-sm text-text-72 transition-colors hover:text-brass"
      >
        Leaderboard
      </Link>
    </header>
  );
}
