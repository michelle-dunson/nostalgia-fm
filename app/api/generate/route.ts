import { NextResponse } from "next/server";
import { generatePlaylist } from "@/lib/playlist-generator";

export const maxDuration = 300;

interface GenerateRequestBody {
  birthYear?: unknown;
}

export async function POST(request: Request) {
  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const birthYear = body.birthYear;

  if (typeof birthYear !== "number" || !Number.isFinite(birthYear)) {
    return NextResponse.json(
      { error: "birthYear must be a number." },
      { status: 400 },
    );
  }

  try {
    const playlist = await generatePlaylist(birthYear);
    return NextResponse.json(playlist);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate playlist.";

    const status = message.includes("Come back when you're a bit older")
      ? 400
      : message.includes("Birth year")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
