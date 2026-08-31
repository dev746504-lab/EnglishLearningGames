import { NavBar } from "@/components/ui/NavBar";
import { CaseFileReveal } from "@/components/CaseFileReveal";

export default async function CaseFilePage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  return (
    <main>
      <NavBar />
      <CaseFileReveal runId={runId} />
    </main>
  );
}
