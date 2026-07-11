import { describe, expect, it } from "vitest";
import { buildTrackSearchQuery, getPrimaryArtist } from "./spotify";

describe("buildTrackSearchQuery", () => {
  it("formats a track and artist search query", () => {
    expect(
      buildTrackSearchQuery("If You Had My Love", "Jennifer Lopez"),
    ).toBe("track:If You Had My Love artist:Jennifer Lopez");
  });

  it("strips quotes from titles and artists", () => {
    expect(buildTrackSearchQuery('"Hello"', '"Adele"')).toBe(
      "track:Hello artist:Adele",
    );
  });
});

describe("getPrimaryArtist", () => {
  it("strips featured artist credits", () => {
    expect(getPrimaryArtist("Rihanna Featuring Jay-Z")).toBe("Rihanna");
    expect(
      getPrimaryArtist("Luis Fonsi & Daddy Yankee Featuring Justin Bieber"),
    ).toBe("Luis Fonsi");
  });
});
