import { describe, expect, it } from "vitest";
import {
  getCurrentAge,
  getEligibleTimeframes,
  getYearsForStage,
  isStageEligible,
  STAGE_DEFINITIONS,
  TOO_YOUNG_MESSAGE,
  validateBirthYear,
} from "./age-ranges";

const REFERENCE_YEAR = 2026;

describe("getCurrentAge", () => {
  it("computes age from birth year", () => {
    expect(getCurrentAge(1999, REFERENCE_YEAR)).toBe(27);
    expect(getCurrentAge(2004, REFERENCE_YEAR)).toBe(22);
    expect(getCurrentAge(2013, REFERENCE_YEAR)).toBe(13);
  });
});

describe("isStageEligible", () => {
  it("requires current age to be at least maxAge + 5", () => {
    expect(isStageEligible(1999, 25, REFERENCE_YEAR)).toBe(false); // 27 < 30
    expect(isStageEligible(1999, 21, REFERENCE_YEAR)).toBe(true); // 27 >= 26
    expect(isStageEligible(2004, 21, REFERENCE_YEAR)).toBe(false); // 22 < 26
    expect(isStageEligible(2004, 18, REFERENCE_YEAR)).toBe(false); // 22 < 23
    expect(isStageEligible(2004, 14, REFERENCE_YEAR)).toBe(true); // 22 >= 19
    expect(isStageEligible(2013, 8, REFERENCE_YEAR)).toBe(true); // 13 >= 13
    expect(isStageEligible(2013, 14, REFERENCE_YEAR)).toBe(false); // 13 < 19
  });
});

describe("getEligibleTimeframes", () => {
  it("returns all five stages for birth year 1990 (age 36)", () => {
    const stages = getEligibleTimeframes(1990, REFERENCE_YEAR);
    expect(stages).toHaveLength(5);
    expect(stages.map((s) => s.stage)).toEqual([
      "early_years",
      "middle_school",
      "prom",
      "college",
      "adulthood",
    ]);
  });

  it("excludes entering adulthood for birth year 1999 (age 27)", () => {
    const stages = getEligibleTimeframes(1999, REFERENCE_YEAR);
    expect(stages).toHaveLength(4);
    expect(stages.map((s) => s.stage)).toEqual([
      "early_years",
      "middle_school",
      "prom",
      "college",
    ]);
  });

  it("excludes prom, college, and adulthood for birth year 2004 (age 22)", () => {
    const stages = getEligibleTimeframes(2004, REFERENCE_YEAR);
    expect(stages).toHaveLength(2);
    expect(stages.map((s) => s.stage)).toEqual([
      "early_years",
      "middle_school",
    ]);
  });

  it("returns only early years for birth year 2013 (age 13)", () => {
    const stages = getEligibleTimeframes(2013, REFERENCE_YEAR);
    expect(stages).toHaveLength(1);
    expect(stages[0]).toEqual({
      stage: "early_years",
      label: "Early Years",
      years: [2020, 2021],
    });
  });

  it("maps calendar years correctly for birth year 1999", () => {
    const stages = getEligibleTimeframes(1999, REFERENCE_YEAR);
    const byStage = Object.fromEntries(stages.map((s) => [s.stage, s.years]));

    expect(byStage.early_years).toEqual([2006, 2007]);
    expect(byStage.middle_school).toEqual([2012, 2013]);
    expect(byStage.prom).toEqual([2016, 2017]);
    expect(byStage.college).toEqual([2019, 2020]);
  });
});

describe("getYearsForStage", () => {
  it("returns two consecutive calendar years per stage", () => {
    const earlyYears = STAGE_DEFINITIONS[0];
    expect(getYearsForStage(1990, earlyYears)).toEqual([1997, 1998]);
  });
});

describe("validateBirthYear", () => {
  it("rejects non-integer birth years", () => {
    expect(validateBirthYear(1999.5, REFERENCE_YEAR)).toBe(
      "Birth year must be a whole number.",
    );
  });

  it("rejects birth years before 1940", () => {
    expect(validateBirthYear(1939, REFERENCE_YEAR)).toBe(
      "Birth year must be 1940 or later.",
    );
  });

  it("rejects future birth years", () => {
    expect(validateBirthYear(2027, REFERENCE_YEAR)).toBe(
      "Birth year cannot be in the future.",
    );
  });

  it("rejects users too young for any stage", () => {
    expect(validateBirthYear(2014, REFERENCE_YEAR)).toBe(TOO_YOUNG_MESSAGE);
  });

  it("accepts valid birth years", () => {
    expect(validateBirthYear(1999, REFERENCE_YEAR)).toBeNull();
  });
});
