import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  OAUTH_STATE_COOKIE,
  setUserTokenCookies,
} from "@/lib/spotify-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const redirectHome = (query: string) =>
    NextResponse.redirect(new URL(`/?${query}`, request.url));

  if (error) {
    return redirectHome(`spotify=error&reason=${encodeURIComponent(error)}`);
  }

  if (!code || !state || !storedState || state !== storedState) {
    return redirectHome("spotify=error&reason=invalid_state");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await setUserTokenCookies(tokens);

    const cookieStore = await cookies();
    cookieStore.delete(OAUTH_STATE_COOKIE);

    return redirectHome("spotify=connected");
  } catch (callbackError) {
    const reason =
      callbackError instanceof Error ? callbackError.message : "auth_failed";
    return redirectHome(`spotify=error&reason=${encodeURIComponent(reason)}`);
  }
}
