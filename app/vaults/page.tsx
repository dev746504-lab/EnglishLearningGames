import { NavBar } from "@/components/ui/NavBar";
import { VaultGrid } from "@/components/VaultGrid";

export default function VaultsPage() {
  return (
    <main>
      <NavBar />
      <div className="px-6 pt-10 md:px-14">
        <p className="font-mono text-xs tracking-[0.2em] text-text-48 uppercase">
          Pick your entry
        </p>
        <h1 className="font-display mt-3 text-4xl text-text-100 md:text-5xl">
          The board
        </h1>
      </div>
      <VaultGrid />
    </main>
  );
}
