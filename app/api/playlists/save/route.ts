import { NextResponse } from "next/server";
import { ensureUserAccessToken } from "@/lib/spotify-auth";
import { savePlaylistToSpotify } from "@/lib/spotify-playlist";
import type { PlaylistTrack } from "@/lib/types";

interface SavePlaylistBody {
  birthYear?: unknown;
  tracks?: unknown;
  stages?: unknown;
}

function isPlaylistTrack(value: unknown): value is PlaylistTrack {
  if (!value || typeof value !== "object") {
    return false;
  }

  const track = value as PlaylistTrack;
  return (
    typeof track.spotifyUri === "string" &&
    track.spotifyUri.startsWith("spotify:track:")
  );
}

export async function POST(request: Request) {
  const accessToken = await ensureUserAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with Spotify. Connect your account first." },
      { status: 401 },
    );
  }

  let body: SavePlaylistBody;
  try {
    body = (await request.json()) as SavePlaylistBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { birthYear, tracks, stages } = body;

  if (typeof birthYear !== "number" || !Number.isFinite(birthYear)) {
    return NextResponse.json(
      { error: "birthYear must be a number." },
      { status: 400 },
    );
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return NextResponse.json(
      { error: "tracks must be a non-empty array." },
      { status: 400 },
    );
  }

  if (!tracks.every(isPlaylistTrack)) {
    return NextResponse.json(
      { error: "Each track must include a valid spotifyUri." },
      { status: 400 },
    );
  }

  if (!Array.isArray(stages) || stages.length === 0) {
    return NextResponse.json(
      { error: "stages must be a non-empty array." },
      { status: 400 },
    );
  }

  const uris = [...new Set(tracks.map((track) => track.spotifyUri))];

  try {
    const saved = await savePlaylistToSpotify(accessToken, birthYear, uris);

    return NextResponse.json(saved);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save playlist.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
