import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { pointsForAnswer, levenshteinWithinOne } from "@/lib/scoring";
import { HEIST_RULES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const runId = body?.runId as string | undefined;
  const wordId = body?.wordId as string | undefined;
  const answer = (body?.answer as string | undefined)?.trim() ?? "";

  if (!runId || !wordId || !ObjectId.isValid(runId)) {
    return NextResponse.json({ error: "runId and wordId are required" }, { status: 400 });
  }

  const db = await getDb();
  const run = await db.collection("runs").findOne({ _id: new ObjectId(runId) });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (run.outcome !== "in-progress") {
    return NextResponse.json({ error: "This run is already finished" }, { status: 400 });
  }

  const runWord = (run.runWords as {
    wordId: string;
    difficulty: 1 | 2 | 3;
    challengeType: "definition" | "context" | "audio";
    correctAnswer: string;
    answered: boolean;
  }[]).find((w) => w.wordId === wordId);

  if (!runWord) {
    return NextResponse.json({ error: "Word not part of this run" }, { status: 400 });
  }
  if (runWord.answered) {
    return NextResponse.json({ error: "Word already answered" }, { status: 400 });
  }

  // Definition/context are multiple-choice against fixed option strings, so only an
  // exact (case-insensitive) match counts. Only typed audio-safe answers get typo tolerance.
  const correct =
    runWord.challengeType === "audio"
      ? levenshteinWithinOne(answer, runWord.correctAnswer)
      : answer.toLowerCase() === runWord.correctAnswer.toLowerCase();

  const streakBefore = run.streak as number;
  const scoreDelta = correct ? pointsForAnswer(runWord.difficulty, streakBefore) : 0;
  const newStreak = correct ? streakBefore + 1 : 0;
  const newStrikes = correct ? run.strikes : run.strikes + 1;
  const newScore = run.score + scoreDelta;
  const busted = newStrikes >= HEIST_RULES.strikesAllowed;

  await db.collection("runs").updateOne(
    { _id: run._id, "runWords.wordId": wordId },
    {
      $set: {
        score: newScore,
        strikes: newStrikes,
        streak: newStreak,
        "runWords.$.answered": true,
        ...(busted ? { outcome: "busted", completedAt: new Date().toISOString() } : {}),
      },
    }
  );

  if (!correct) {
    await db
      .collection<{ wrongWords: ObjectId[] }>("runs")
      .updateOne({ _id: run._id }, { $push: { wrongWords: new ObjectId(wordId) } });
  }

  // The round for this word is over either way, so it's safe to reveal the
  // full explanation (word, definition, example) the client never got up front.
  const wordDoc = await db.collection("words").findOne({ _id: new ObjectId(wordId) });

  return NextResponse.json({
    correct,
    correctAnswer: runWord.correctAnswer,
    scoreDelta,
    totalScore: newScore,
    strikes: newStrikes,
    streak: newStreak,
    busted,
    explanation: wordDoc
      ? {
          word: wordDoc.word as string,
          ipa: wordDoc.ipa as string,
          partOfSpeech: wordDoc.partOfSpeech as string,
          definition: wordDoc.definition as string,
          exampleSentence: wordDoc.exampleSentence as string,
        }
      : null,
  });
}

