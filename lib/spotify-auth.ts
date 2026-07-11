import { cookies } from "next/headers";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";

export const SPOTIFY_SCOPES = [
  "playlist-modify-public",
  "user-read-private",
].join(" ");

export const OAUTH_STATE_COOKIE = "spotify_oauth_state";
export const ACCESS_TOKEN_COOKIE = "spotify_access_token";
export const REFRESH_TOKEN_COOKIE = "spotify_refresh_token";
export const TOKEN_EXPIRES_COOKIE = "spotify_token_expires_at";

export interface SpotifyUserTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SpotifyAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

function getSpotifyCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment.",
    );
  }

  return { clientId, clientSecret };
}

export function getRedirectUri(): string {
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!redirectUri) {
    throw new Error("Missing SPOTIFY_REDIRECT_URI in environment.");
  }
  return redirectUri;
}

export function createOAuthState(): string {
  return crypto.randomUUID();
}

export function buildSpotifyAuthUrl(state: string): string {
  const { clientId } = getSpotifyCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    state,
  });

  return `${AUTHORIZE_URL}?${params.toString()}`;
}

async function requestUserTokens(
  body: URLSearchParams,
): Promise<SpotifyAuthTokenResponse> {
  const { clientId, clientSecret } = getSpotifyCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Spotify user token request failed (${response.status}): ${await response.text()}`,
    );
  }

  return (await response.json()) as SpotifyAuthTokenResponse;
}

function toUserTokens(
  data: SpotifyAuthTokenResponse,
  fallbackRefreshToken?: string,
): SpotifyUserTokens {
  const refreshToken = data.refresh_token ?? fallbackRefreshToken;
  if (!refreshToken) {
    throw new Error("Spotify did not return a refresh token.");
  }

  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function exchangeCodeForTokens(
  code: string,
): Promise<SpotifyUserTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
  });

  const data = await requestUserTokens(body);
  return toUserTokens(data);
}

export async function refreshUserTokens(
  refreshToken: string,
): Promise<SpotifyUserTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const data = await requestUserTokens(body);
  return toUserTokens(data, refreshToken);
}

function cookieBaseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setUserTokenCookies(tokens: SpotifyUserTokens): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = Math.max(
    60,
    Math.floor((tokens.expiresAt - Date.now()) / 1000),
  );

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...cookieBaseOptions(),
    maxAge,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set(TOKEN_EXPIRES_COOKIE, String(tokens.expiresAt), {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserTokenCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(TOKEN_EXPIRES_COOKIE);
}

export async function isUserAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ||
      cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  );
}

export async function ensureUserAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const expiresAt = Number(cookieStore.get(TOKEN_EXPIRES_COOKIE)?.value ?? 0);

  if (accessToken && expiresAt > Date.now() + 60_000) {
    return accessToken;
  }

  if (!refreshToken) {
    return null;
  }

  const tokens = await refreshUserTokens(refreshToken);
  await setUserTokenCookies(tokens);
  return tokens.accessToken;
}
