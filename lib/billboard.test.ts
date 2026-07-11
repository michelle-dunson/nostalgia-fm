import { describe, expect, it } from "vitest";
import { resolveNearestChartDate } from "./billboard";

describe("resolveNearestChartDate", () => {
  const validDates = [
    "1999-06-19",
    "1999-06-26",
    "1999-07-03",
    "1999-07-10",
    "2007-06-30",
    "2007-07-07",
    "2007-07-14",
  ];

  it("picks the valid date closest to mid-year", () => {
    expect(resolveNearestChartDate(1999, validDates)).toBe("1999-07-03");
    expect(resolveNearestChartDate(2007, validDates)).toBe("2007-06-30");
  });

  it("throws when no dates exist for the year", () => {
    expect(() => resolveNearestChartDate(1900, validDates)).toThrow(
      "No Billboard chart dates found for 1900.",
    );
  });
});
