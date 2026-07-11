const API_BASE = "https://api.spotify.com/v1";
const PLAYLIST_DESCRIPTION =
  "The soundtrack to moments you didn't know you'd miss";

interface SpotifyPlaylistResponse {
  id: string;
  external_urls: {
    spotify: string;
  };
}

export function buildPlaylistName(birthYear: number): string {
  return `Nostalgia.FM — ${birthYear} Baby`;
}

export function buildPlaylistDescription(): string {
  return PLAYLIST_DESCRIPTION;
}

export async function createUserPlaylist(
  accessToken: string,
  name: string,
  description: string,
): Promise<{ id: string; url: string }> {
  const response = await fetch(`${API_BASE}/me/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create Spotify playlist (${response.status}): ${await response.text()}`,
    );
  }

  const playlist = (await response.json()) as SpotifyPlaylistResponse;
  return {
    id: playlist.id,
    url: playlist.external_urls.spotify,
  };
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  uris: string[],
): Promise<void> {
  if (uris.length === 0) {
    return;
  }

  const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to add tracks to playlist (${response.status}): ${await response.text()}`,
    );
  }
}

export async function savePlaylistToSpotify(
  accessToken: string,
  birthYear: number,
  uris: string[],
): Promise<{ playlistId: string; playlistUrl: string }> {
  const playlist = await createUserPlaylist(
    accessToken,
    buildPlaylistName(birthYear),
    buildPlaylistDescription(),
  );

  await addTracksToPlaylist(accessToken, playlist.id, uris);
  return { playlistId: playlist.id, playlistUrl: playlist.url };
}
