import { NextRequest, NextResponse } from "next/server";

const MAX_SENSES = 6;

interface MyMemoryMatch {
  translation?: string;
  match?: number;
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string; match?: number };
  matches?: MyMemoryMatch[];
}

// MyMemory's translation-memory entries are crowd-sourced and inconsistently
// styled (stray quotes, a trailing full stop on a single-word gloss, random
// capitalization) — normalize them into a plain lowercase gloss.
function cleanTranslation(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^["'‘’“”]+|["'‘’“”]+$/g, "").trim();
  t = t.replace(/^[-•*]+\s*/, "").trim();
  t = t.replace(/[.!?]+$/, "").trim();
  if (t.length > 1 && t !== t.toUpperCase()) {
    t = t.charAt(0).toLowerCase() + t.slice(1);
  }
  return t;
}

// A single MyMemory entry often already bundles multiple senses of a word
// separated by ";" (e.g. "light" -> "ánh sáng; nhẹ; đốt, thắp sáng" covers
// noun/adjective/verb). Commas inside one segment are near-synonyms of the
// SAME sense, not separate meanings, so only split on ";".
function splitSenses(raw: string): string[] {
  return raw
    .split(";")
    .map((s) => cleanTranslation(s))
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("word")?.trim() ?? "";
  const word = raw.toLowerCase();

  if (!word || !/^[a-z' -]+$/.test(word)) {
    return NextResponse.json({ word: raw, translations: null });
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`,
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) throw new Error("translate failed");

    const data: MyMemoryResponse = await res.json();

    const candidates = [
      { translation: data.responseData?.translatedText, match: data.responseData?.match ?? 1 },
      ...(data.matches ?? []),
    ].sort((a, b) => (b.match ?? 0) - (a.match ?? 0));

    // Collect every distinct sense across all candidate entries (highest
    // match first), skipping ones that just echo the English word back.
    const seen = new Set<string>();
    const senses: string[] = [];
    for (const c of candidates) {
      if (!c.translation) continue;
      for (const sense of splitSenses(c.translation)) {
        const key = sense.toLowerCase();
        if (key === word || seen.has(key)) continue;
        seen.add(key);
        senses.push(sense);
        if (senses.length >= MAX_SENSES) break;
      }
      if (senses.length >= MAX_SENSES) break;
    }

    return NextResponse.json({ word: raw, translations: senses.length ? senses : null });
  } catch {
    return NextResponse.json({ word: raw, translations: null });
  }
}
