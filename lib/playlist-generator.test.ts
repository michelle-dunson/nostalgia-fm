import { describe, expect, it } from "vitest";
import { candidateKey, distributeTrackCount, getStageWeights, maxSearchAttempts, shuffle } from "./playlist-generator";

describe("maxSearchAttempts", () => {
  it("scales with target count but stays capped", () => {
    expect(maxSearchAttempts(4)).toBe(12);
    expect(maxSearchAttempts(10)).toBe(15);
    expect(maxSearchAttempts(1)).toBe(6);
  });
});

describe("distributeTrackCount", () => {
  it("splits evenly across years", () => {
    expect(distributeTrackCount(10, 3)).toEqual([4, 3, 3]);
  });

  it("returns a single bucket for one year", () => {
    expect(distributeTrackCount(50, 1)).toEqual([50]);
  });
});

describe("getStageWeights", () => {
  it("returns 50 songs for one stage", () => {
    expect(getStageWeights(1)).toEqual([50]);
  });

  it("returns 25 songs each for two stages", () => {
    expect(getStageWeights(2)).toEqual([25, 25]);
  });

  it("weights middle school highest for three stages", () => {
    expect(getStageWeights(3)).toEqual([15, 20, 15]);
  });

  it("returns the four-stage distribution", () => {
    expect(getStageWeights(4)).toEqual([10, 15, 15, 10]);
  });

  it("returns 10 songs each for five stages", () => {
    expect(getStageWeights(5)).toEqual([10, 10, 10, 10, 10]);
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
