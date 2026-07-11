export interface SpotifyTrackMatch {
  id: string;
  title: string;
  artist: string;
  uri: string;
  url: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: Array<{
      id: string;
      name: string;
      uri: string;
      external_urls: { spotify: string };
      is_playable?: boolean;
      artists: Array<{ name: string }>;
    }>;
  };
}

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

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

export function buildTrackSearchQuery(title: string, artist: string): string {
  const cleanTitle = title.replace(/"/g, "").trim();
  const cleanArtist = artist.replace(/"/g, "").trim();
  return `track:${cleanTitle} artist:${cleanArtist}`;
}

export function getPrimaryArtist(artist: string): string {
  return artist
    .split(/\s+(?:feat\.?|ft\.?|featuring)\s+/i)[0]
    .split(/\s+&\s+/)[0]
    .trim();
}

function parseSearchResult(
  data: SpotifySearchResponse,
  fallbackArtist: string,
): SpotifyTrackMatch | null {
  const track = data.tracks.items.find((item) => item.is_playable !== false);

  if (!track) {
    return null;
  }

  return {
    id: track.id,
    title: track.name,
    artist: track.artists[0]?.name ?? fallbackArtist,
    uri: track.uri,
    url: track.external_urls.spotify,
  };
}

async function searchWithQuery(
  token: string,
  query: string,
  fallbackArtist: string,
): Promise<SpotifyTrackMatch | null> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "5",
  });

  const response = await fetch(`${API_BASE}/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Spotify search failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = (await response.json()) as SpotifySearchResponse;
  return parseSearchResult(data, fallbackArtist);
}

async function getClientCredentialsToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

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
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(
      `Spotify token request failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };

  return data.access_token;
}

export async function searchTrack(
  title: string,
  artist: string,
): Promise<SpotifyTrackMatch | null> {
  const token = await getClientCredentialsToken();
  const primaryArtist = getPrimaryArtist(artist);

  const queries = [
    buildTrackSearchQuery(title, artist),
    buildTrackSearchQuery(title, primaryArtist),
  ];

  const uniqueQueries = [...new Set(queries)];

  for (const query of uniqueQueries) {
    const match = await searchWithQuery(token, query, primaryArtist);
    if (match) {
      return match;
    }
  }

  return null;
}

export function clearSpotifyTokenCache(): void {
  tokenCache = null;
}
