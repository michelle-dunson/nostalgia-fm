import { describe, expect, it } from "vitest";
import {
  buildPlaylistDescription,
  buildPlaylistName,
} from "./spotify-playlist";

describe("buildPlaylistName", () => {
  it("includes the birth year", () => {
    expect(buildPlaylistName(1990)).toBe("Nostalgia.FM — 1990 Baby");
  });
});

describe("buildPlaylistDescription", () => {
  it("returns the fixed playlist tagline", () => {
    expect(buildPlaylistDescription()).toBe(
      "The soundtrack to moments you didn't know you'd miss",
    );
  });
});
