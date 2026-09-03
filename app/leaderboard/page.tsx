import { NavBar } from "@/components/ui/NavBar";
import { Leaderboard } from "@/components/Leaderboard";
import { HoverText } from "@/components/ui/HoverText";

export default function LeaderboardPage() {
  return (
    <main>
      <NavBar />
      <div className="px-6 pt-10 md:px-14">
        <p className="font-mono text-xs tracking-[0.2em] text-text-48 uppercase">
          <HoverText keyPrefix="leaderboard-eyebrow" text="Reputation" />
        </p>
        <h1 className="font-display mt-3 text-4xl text-text-100 md:text-5xl">
          <HoverText keyPrefix="leaderboard-h1" text="The Ledger" />
        </h1>
      </div>
      <Leaderboard />
    </main>
  );
}
