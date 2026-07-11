import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildSpotifyAuthUrl, createOAuthState } from "./spotify-auth";

describe("createOAuthState", () => {
  it("returns a unique uuid", () => {
    expect(createOAuthState()).not.toBe(createOAuthState());
  });
});

describe("buildSpotifyAuthUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SPOTIFY_CLIENT_ID: "test-client-id",
      SPOTIFY_CLIENT_SECRET: "test-client-secret",
      SPOTIFY_REDIRECT_URI: "http://localhost:3000/api/auth/callback",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("builds a Spotify authorize URL with required params", () => {
    const url = new URL(buildSpotifyAuthUrl("state-123"));
    expect(url.origin + url.pathname).toBe(
      "https://accounts.spotify.com/authorize",
    );
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/callback",
    );
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("scope")).toContain("playlist-modify-public");
  });
});
