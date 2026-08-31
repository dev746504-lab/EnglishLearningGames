import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { buildChallenge } from "@/lib/gameLogic";
import { getEligibleColdCaseWordIds } from "@/lib/coldCase";
import type { HeistWord } from "@/lib/types";

const COLD_CASE_ID = "cold-case";

interface WordMongoDoc {
  _id: ObjectId;
  word: string;
  partOfSpeech: string;
  definition: string;
  distractors: string[];
  clozeSentence: string;
  vaultId: ObjectId;
  difficulty: 1 | 2 | 3;
  ipa: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const playerId = body?.playerId as string | undefined;
  const vaultId = body?.vaultId as string | undefined;

  if (!playerId || !vaultId) {
    return NextResponse.json({ error: "playerId and vaultId are required" }, { status: 400 });
  }

  const db = await getDb();

  let heistWords: Awaited<ReturnType<typeof loadVaultWords>> | Awaited<ReturnType<typeof loadColdCaseWords>>;
  const sourceVaultId: string = vaultId;

  if (vaultId === COLD_CASE_ID) {
    const coldCase = await loadColdCaseWords(db, playerId);
    if (coldCase.length === 0) {
      return NextResponse.json({ error: "No cold cases are ready yet" }, { status: 400 });
    }
    heistWords = coldCase;
  } else {
    if (!ObjectId.isValid(vaultId)) {
      return NextResponse.json({ error: "Invalid vaultId" }, { status: 400 });
    }
    heistWords = await loadVaultWords(db, vaultId);
    if (heistWords.length === 0) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }
  }

  const clientWords: HeistWord[] = [];
  const runWords: {
    wordId: string;
    difficulty: 1 | 2 | 3;
    challengeType: HeistWord["challengeType"];
    correctAnswer: string;
    answered: boolean;
  }[] = [];

  for (const { wordDoc, decoyPool } of heistWords) {
    const { clientWord, correctAnswer } = buildChallenge(wordDoc, decoyPool);
    clientWords.push(clientWord);
    runWords.push({
      wordId: wordDoc._id,
      difficulty: wordDoc.difficulty,
      challengeType: clientWord.challengeType,
      correctAnswer,
      answered: false,
    });
  }

  const run = await db.collection("runs").insertOne({
    playerId,
    vaultId: sourceVaultId,
    score: 0,
    strikes: 0,
    streak: 0,
    outcome: "in-progress",
    wrongWords: [],
    runWords,
    completedAt: null,
    startedAt: new Date().toISOString(),
  });

  return NextResponse.json({ runId: String(run.insertedId), words: clientWords });
}

async function loadVaultWords(db: Awaited<ReturnType<typeof getDb>>, vaultId: string) {
  const vault = await db.collection("vaults").findOne({ _id: new ObjectId(vaultId) });
  if (!vault) return [];

  const allWords = await db.collection<WordMongoDoc>("words").find({ vaultId: vault._id }).toArray();
  const heistIds = new Set((vault.heistWordIds as ObjectId[]).map(String));
  const decoyPool = allWords.map(toWordForChallenge);

  return (vault.heistWordIds as ObjectId[]).map((id) => {
    const doc = allWords.find((w) => String(w._id) === String(id));
    if (!doc) throw new Error("Seed data inconsistent: missing heist word");
    return { wordDoc: toWordForChallenge(doc), decoyPool: decoyPool.filter((w) => heistIds.has(w._id)) };
  });
}

async function loadColdCaseWords(db: Awaited<ReturnType<typeof getDb>>, playerId: string) {
  const eligibleIds = await getEligibleColdCaseWordIds(db, playerId);
  if (eligibleIds.length === 0) return [];

  const words = await db.collection<WordMongoDoc>("words").find({ _id: { $in: eligibleIds } }).toArray();
  const vaultIds = [...new Set(words.map((w) => String(w.vaultId)))].map((id) => new ObjectId(id));
  const siblingWords = await db
    .collection<WordMongoDoc>("words")
    .find({ vaultId: { $in: vaultIds } })
    .toArray();
  const decoyPool = siblingWords.map(toWordForChallenge);

  return words.map((doc) => ({ wordDoc: toWordForChallenge(doc), decoyPool }));
}

function toWordForChallenge(doc: WordMongoDoc) {
  return {
    _id: String(doc._id),
    word: doc.word,
    partOfSpeech: doc.partOfSpeech,
    definition: doc.definition,
    distractors: doc.distractors,
    clozeSentence: doc.clozeSentence,
    difficulty: doc.difficulty,
    ipa: doc.ipa,
  };
}
