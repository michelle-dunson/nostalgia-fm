import { describe, expect, it } from "vitest";
import {
  getChartDatesForYear,
  mergeBillboardSongs,
  resolveNearestChartDate,
  resolveNearestChartDateForMonth,
} from "./billboard";

describe("resolveNearestChartDate", () => {
  const validDates = [
    "1999-02-06",
    "1999-05-01",
    "1999-06-19",
    "1999-06-26",
    "1999-07-03",
    "1999-07-10",
    "1999-08-14",
    "1999-11-06",
    "2007-06-30",
    "2007-07-07",
    "2007-07-14",
  ];

  it("picks the valid date closest to mid-year", () => {
    expect(resolveNearestChartDate(1999, validDates)).toBe("1999-07-10");
    expect(resolveNearestChartDate(2007, validDates)).toBe("2007-07-14");
  });

  it("picks the valid date closest to a target month", () => {
    expect(resolveNearestChartDateForMonth(1999, 2, validDates)).toBe(
      "1999-02-06",
    );
    expect(resolveNearestChartDateForMonth(1999, 11, validDates)).toBe(
      "1999-11-06",
    );
  });

  it("returns multiple chart dates across the year", () => {
    expect(getChartDatesForYear(1999, validDates)).toEqual([
      "1999-02-06",
      "1999-05-01",
      "1999-08-14",
      "1999-11-06",
    ]);
  });

  it("throws when no dates exist for the year", () => {
    expect(() => resolveNearestChartDate(1900, validDates)).toThrow(
      "No Billboard chart dates found for 1900.",
    );
  });
});

describe("mergeBillboardSongs", () => {
  it("deduplicates songs and keeps the best chart rank", () => {
    const merged = mergeBillboardSongs([
      [{ title: "Song A", artist: "Artist", rank: 5, peakPosition: 1, weeksOnChart: 10 }],
      [{ title: "Song A", artist: "Artist", rank: 2, peakPosition: 1, weeksOnChart: 12 }],
      [{ title: "Song B", artist: "Artist B", rank: 1, peakPosition: 1, weeksOnChart: 8 }],
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0].title).toBe("Song B");
    expect(merged[1]).toMatchObject({ title: "Song A", rank: 2 });
  });
});
