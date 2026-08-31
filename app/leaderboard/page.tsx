import { NavBar } from "@/components/ui/NavBar";
import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <main>
      <NavBar />
      <div className="px-6 pt-10 md:px-14">
        <p className="font-mono text-xs tracking-[0.2em] text-text-48 uppercase">Reputation</p>
        <h1 className="font-display mt-3 text-4xl text-text-100 md:text-5xl">The Ledger</h1>
      </div>
      <Leaderboard />
    </main>
  );
}
