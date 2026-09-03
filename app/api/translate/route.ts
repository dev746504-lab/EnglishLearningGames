import { NextRequest, NextResponse } from "next/server";

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
  responseStatus?: number | string;
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
    const translation = data.responseData?.translatedText?.trim();
    // MyMemory falls back to echoing the query untranslated when it has no match.
    const isUseful = translation && translation.toLowerCase() !== word.toLowerCase();
    return NextResponse.json({ word, translation: isUseful ? translation : null });
  } catch {
    return NextResponse.json({ word, translation: null });
  }
}
