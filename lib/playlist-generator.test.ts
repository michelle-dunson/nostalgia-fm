import { describe, expect, it } from "vitest";
import { candidateKey, getBonusStageTargets, shuffle } from "./playlist-generator";
import type { Timeframe } from "./types";

const allStages: Timeframe[] = [
  { stage: "early_years", label: "Early Years", years: [1997, 1998] },
  { stage: "middle_school", label: "Middle School Years", years: [2003, 2004] },
  { stage: "prom", label: "Junior/Senior Prom", years: [2007, 2008] },
  { stage: "college", label: "College Years", years: [2010, 2011] },
  { stage: "adulthood", label: "Entering Adulthood", years: [2014, 2015] },
];

describe("getBonusStageTargets", () => {
  it("splits 6 bonus tracks between prom and college when all stages are present", () => {
    const targets = getBonusStageTargets(allStages);
    expect(targets).toHaveLength(2);
    expect(targets[0]).toMatchObject({ timeframe: { stage: "prom" }, count: 3 });
    expect(targets[1]).toMatchObject({ timeframe: { stage: "college" }, count: 3 });
  });

  it("targets middle school and prom when entering adulthood is missing", () => {
    const withoutAdulthood = allStages.slice(0, 4);
    const targets = getBonusStageTargets(withoutAdulthood);
    expect(targets).toHaveLength(2);
    expect(targets[0].timeframe.stage).toBe("middle_school");
    expect(targets[1].timeframe.stage).toBe("prom");
    expect(targets.reduce((sum, target) => sum + target.count, 0)).toBe(6);
  });

  it("returns no bonus targets when only one stage is eligible", () => {
    expect(getBonusStageTargets([allStages[0]])).toEqual([]);
  });
});

describe("shuffle", () => {
  it("returns a permutation of the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("candidateKey", () => {
  it("normalizes title and artist for deduplication", () => {
    expect(candidateKey("Hello", "Adele")).toBe("hello::adele");
    expect(candidateKey("HELLO", "ADELE")).toBe("hello::adele");
  });
});
