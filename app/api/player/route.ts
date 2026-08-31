import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { generateHandle } from "@/lib/handles";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const playerId = body?.playerId as string | undefined;
  const requestedHandle = (body?.handle as string | undefined)?.trim().slice(0, 24);

  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 });
  }

  const db = await getDb();
  const players = db.collection("players");

  const existing = await players.findOne({ playerId });

  if (existing) {
    if (requestedHandle && requestedHandle !== existing.handle) {
      await players.updateOne({ playerId }, { $set: { handle: requestedHandle } });
      return NextResponse.json({
        playerId,
        handle: requestedHandle,
        reputation: existing.reputation,
      });
    }
    return NextResponse.json({
      playerId,
      handle: existing.handle,
      reputation: existing.reputation,
    });
  }

  const handle = requestedHandle || generateHandle();
  await players.insertOne({
    playerId,
    handle,
    reputation: 0,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ playerId, handle, reputation: 0 });
}
