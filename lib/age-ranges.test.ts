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
    expect(isStageEligible(1999, 26, REFERENCE_YEAR)).toBe(false); // 27 < 31
    expect(isStageEligible(1999, 22, REFERENCE_YEAR)).toBe(true); // 27 >= 27
    expect(isStageEligible(1999, 18, REFERENCE_YEAR)).toBe(true); // 27 >= 23
    expect(isStageEligible(2004, 18, REFERENCE_YEAR)).toBe(false); // 22 < 23
    expect(isStageEligible(2004, 14, REFERENCE_YEAR)).toBe(true); // 22 >= 19
    expect(isStageEligible(2011, 10, REFERENCE_YEAR)).toBe(true); // 15 >= 15
    expect(isStageEligible(2012, 10, REFERENCE_YEAR)).toBe(false); // 14 < 15
  });
});

describe("getEligibleTimeframes", () => {
  it("returns all five stages for birth year 1990 (age 36)", () => {
    const stages = getEligibleTimeframes(1990, REFERENCE_YEAR);
    expect(stages).toHaveLength(5);
    expect(stages.map((s) => s.stage)).toEqual([
      "childhood",
      "middle_school",
      "high_school",
      "college",
      "post_grad",
    ]);
  });

  it("excludes post-grad for birth year 1999 (age 27)", () => {
    const stages = getEligibleTimeframes(1999, REFERENCE_YEAR);
    expect(stages).toHaveLength(4);
    expect(stages.map((s) => s.stage)).toEqual([
      "childhood",
      "middle_school",
      "high_school",
      "college",
    ]);
  });

  it("returns childhood and middle school for birth year 2004 (age 22)", () => {
    const stages = getEligibleTimeframes(2004, REFERENCE_YEAR);
    expect(stages).toHaveLength(2);
    expect(stages.map((s) => s.stage)).toEqual(["childhood", "middle_school"]);
  });

  it("returns only childhood for birth year 2011 (age 15)", () => {
    const stages = getEligibleTimeframes(2011, REFERENCE_YEAR);
    expect(stages).toHaveLength(1);
    expect(stages[0]).toEqual({
      stage: "childhood",
      label: "Childhood",
      years: [2019, 2020, 2021],
    });
  });

  it("maps all calendar years in each stage for birth year 1999", () => {
    const stages = getEligibleTimeframes(1999, REFERENCE_YEAR);
    const byStage = Object.fromEntries(stages.map((s) => [s.stage, s.years]));

    expect(byStage.childhood).toEqual([2007, 2008, 2009]);
    expect(byStage.middle_school).toEqual([2011, 2012, 2013]);
    expect(byStage.high_school).toEqual([2015, 2016, 2017]);
    expect(byStage.college).toEqual([2019, 2020, 2021]);
  });
});

describe("getYearsForStage", () => {
  it("returns every year in the stage age range", () => {
    const childhood = STAGE_DEFINITIONS[0];
    expect(getYearsForStage(1990, childhood)).toEqual([1998, 1999, 2000]);
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
    expect(validateBirthYear(2012, REFERENCE_YEAR)).toBe(TOO_YOUNG_MESSAGE);
  });

  it("accepts valid birth years", () => {
    expect(validateBirthYear(1999, REFERENCE_YEAR)).toBeNull();
  });
});
