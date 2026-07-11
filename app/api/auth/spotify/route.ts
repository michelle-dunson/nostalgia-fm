import { NextResponse } from "next/server";
import {
  buildSpotifyAuthUrl,
  createOAuthState,
  OAUTH_STATE_COOKIE,
} from "@/lib/spotify-auth";

export async function GET() {
  try {
    const state = createOAuthState();
    const authUrl = buildSpotifyAuthUrl(state);
    const response = NextResponse.redirect(authUrl);

    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Spotify login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
