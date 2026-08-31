"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ManillaFolder } from "@/components/case-file/ManillaFolder";
import { Button } from "@/components/ui/Button";

interface CompleteResponse {
  outcome: "cracked" | "busted" | "in-progress";
  score: number;
  caseFile: string | null;
  words: { word: string; ipa: string; definition: string }[];
}

export function CaseFileReveal({ runId }: { runId: string }) {
  const [data, setData] = useState<CompleteResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/heist/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("This file's gone missing. Try the board again."));
  }, [runId]);

  if (error) {
    return (
      <div className="px-6 py-16 text-center md:px-14">
        <p className="text-danger">{error}</p>
        <Link href="/vaults">
          <Button className="mt-6">Back to the board</Button>
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-6 py-16 md:px-14">
        <p className="font-mono text-sm text-text-48">Unfolding the file...</p>
      </div>
    );
  }

  if (data.outcome !== "cracked" || !data.caseFile) {
    return (
      <div className="px-6 py-16 text-center md:px-14">
        <p className="text-text-72">No case file for this one. The vault stayed sealed.</p>
        <Link href="/vaults">
          <Button className="mt-6">Back to the board</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 md:px-14">
      <ManillaFolder caseFile={data.caseFile} words={data.words} score={data.score} />
    </div>
  );
}
