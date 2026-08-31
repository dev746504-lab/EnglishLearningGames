import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { buildFallbackCaseFile } from "@/lib/gameLogic";
import { generateHandle } from "@/lib/handles";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const runId = body?.runId as string | undefined;

  if (!runId || !ObjectId.isValid(runId)) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const db = await getDb();
  const run = await db.collection("runs").findOne({ _id: new ObjectId(runId) });
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const alreadyFinalized = run.outcome !== "in-progress";
  const outcome = alreadyFinalized ? run.outcome : "cracked";
  const isColdCase = run.vaultId === "cold-case";

  const vault = isColdCase ? null : await db.collection("vaults").findOne({ _id: new ObjectId(run.vaultId) });

  if (!alreadyFinalized) {
    await db
      .collection("runs")
      .updateOne({ _id: run._id }, { $set: { outcome: "cracked", completedAt: new Date().toISOString() } });

    // Reputation reflects core-vault mastery only — cold-case reviews and the
    // beginner training tier never inflate it (see docs/design.md).
    if (!isColdCase && vault?.tier !== "training") {
      const previousBest = await db
        .collection("runs")
        .find({ playerId: run.playerId, vaultId: run.vaultId, outcome: "cracked", _id: { $ne: run._id } })
        .sort({ score: -1 })
        .limit(1)
        .toArray();
      const oldBest = previousBest[0]?.score ?? 0;
      const delta = Math.max(0, run.score - oldBest);
      if (delta > 0) {
        // Upsert defensively: a player record should already exist from the landing
        // page, but a deep-linked or otherwise out-of-order visit must not silently
        // drop the reputation gain against a document that was never created.
        await db.collection("players").updateOne(
          { playerId: run.playerId },
          {
            $inc: { reputation: delta },
            $setOnInsert: { playerId: run.playerId, handle: generateHandle(), createdAt: new Date().toISOString() },
          },
          { upsert: true }
        );
      }
    }
  }

  let caseFile: string | null = null;
  let wordRecap: { word: string; ipa: string; definition: string }[] = [];

  if (outcome === "cracked") {
    const orderedIds = (run.runWords as { wordId: string }[]).map((w) => w.wordId);
    const wordDocs = await db
      .collection("words")
      .find({ _id: { $in: orderedIds.map((id) => new ObjectId(id)) } })
      .toArray();
    wordRecap = orderedIds
      .map((id) => wordDocs.find((w) => String(w._id) === id))
      .filter((w): w is NonNullable<typeof w> => Boolean(w))
      .map((w) => ({ word: w.word, ipa: w.ipa, definition: w.definition }));

    caseFile = isColdCase ? buildFallbackCaseFile(wordRecap.map((w) => w.word)) : (vault?.caseFile ?? null);
  }

  return NextResponse.json({
    runId: String(run._id),
    outcome,
    score: run.score,
    strikes: run.strikes,
    vaultId: run.vaultId,
    caseFile,
    words: wordRecap,
  });
}
