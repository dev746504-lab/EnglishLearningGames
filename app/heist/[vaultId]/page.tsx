import { NavBar } from "@/components/ui/NavBar";
import { HeistGame } from "@/components/HeistGame";

export default async function HeistPage({ params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = await params;

  return (
    <main>
      <NavBar />
      <HeistGame vaultId={vaultId} />
    </main>
  );
}
