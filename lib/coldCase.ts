import { ObjectId, type Db } from "mongodb";
import { isColdCaseEligible } from "./spacing";

/** Word ids the player missed more than 24h ago, oldest miss first, capped at 7. */
export async function getEligibleColdCaseWordIds(db: Db, playerId: string): Promise<ObjectId[]> {
  const runs = await db
    .collection("runs")
    .find({ playerId, wrongWords: { $exists: true, $ne: [] } })
    .toArray();

  const missedAt = new Map<string, Date>();
  for (const run of runs) {
    const completedAt = run.completedAt ? new Date(run.completedAt) : null;
    if (!completedAt) continue;
    for (const wordId of run.wrongWords as ObjectId[]) {
      const key = String(wordId);
      const existing = missedAt.get(key);
      if (!existing || completedAt < existing) missedAt.set(key, completedAt);
    }
  }

  return [...missedAt.entries()]
    .filter(([, when]) => isColdCaseEligible(when))
    .sort((a, b) => a[1].getTime() - b[1].getTime())
    .map(([id]) => new ObjectId(id))
    .slice(0, 7);
}
