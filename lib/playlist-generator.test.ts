import { describe, expect, it } from "vitest";
import { candidateKey, shuffle } from "./playlist-generator";

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
