import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();
  const players = await db
    .collection("players")
    .find({ reputation: { $gt: 0 } })
    .sort({ reputation: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json({
    players: players.map((p, i) => ({ rank: i + 1, handle: p.handle, reputation: p.reputation })),
  });
}
