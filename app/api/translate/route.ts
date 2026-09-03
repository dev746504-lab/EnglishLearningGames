import { NextRequest, NextResponse } from "next/server";

interface MyMemoryMatch {
  translation?: string;
  match?: number;
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string; match?: number };
  matches?: MyMemoryMatch[];
}

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get("word")?.trim() ?? "";

  if (!word || !/^[A-Za-z' -]+$/.test(word)) {
    return NextResponse.json({ word, translation: null });
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`,
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) throw new Error("translate failed");

    const data: MyMemoryResponse = await res.json();

    // MyMemory's top-level pick is sometimes a bad translation-memory entry
    // that just echoes the English word back untranslated, even though a
    // better match exists further down its own `matches` list — so rank all
    // candidates ourselves and take the best one that isn't just an echo.
    const candidates = [
      { translation: data.responseData?.translatedText, match: data.responseData?.match ?? 1 },
      ...(data.matches ?? []),
    ];

    const best = candidates
      .map((c) => ({ translation: c.translation?.trim(), match: c.match ?? 0 }))
      .filter((c) => c.translation && c.translation.toLowerCase() !== word.toLowerCase())
      .sort((a, b) => b.match - a.match)[0];

    return NextResponse.json({ word, translation: best?.translation ?? null });
  } catch {
    return NextResponse.json({ word, translation: null });
  }
}
