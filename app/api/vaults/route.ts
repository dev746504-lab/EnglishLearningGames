import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getEligibleColdCaseWordIds } from "@/lib/coldCase";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const allVaults = await db.collection("vaults").find({}).sort({ order: 1 }).toArray();
  const coreVaults = allVaults.filter((v) => v.tier !== "training");
  const trainingVaults = allVaults.filter((v) => v.tier === "training");

  const playerId = req.nextUrl.searchParams.get("playerId");
  let crackedVaultIds = new Set<string>();
  let coldCaseCount = 0;
  if (playerId) {
    const runs = await db
      .collection("runs")
      .find({ playerId, outcome: "cracked" })
      .project({ vaultId: 1 })
      .toArray();
    crackedVaultIds = new Set(runs.map((r) => String(r.vaultId)));
    coldCaseCount = (await getEligibleColdCaseWordIds(db, playerId)).length;
  }

  // Core vaults unlock sequentially by cracking the one before them. Training
  // vaults are optional practice content — always unlocked, never part of the chain.
  const result = coreVaults.map((v, i) => ({
    _id: String(v._id),
    code: v.code,
    name: v.name,
    description: v.description,
    order: v.order,
    wordCount: v.wordCount,
    unlocked: i === 0 || crackedVaultIds.has(String(coreVaults[i - 1]._id)),
    cracked: crackedVaultIds.has(String(v._id)),
  }));

  const trainingResult = trainingVaults.map((v) => ({
    _id: String(v._id),
    code: v.code,
    name: v.name,
    description: v.description,
    order: v.order,
    wordCount: v.wordCount,
    unlocked: true,
    cracked: crackedVaultIds.has(String(v._id)),
  }));

  return NextResponse.json({ vaults: result, trainingVaults: trainingResult, coldCaseCount });
}
