import { getEligibleTimeframes } from "../lib/age-ranges";
import { generatePlaylist, getStageWeights, TOTAL_TRACKS } from "../lib/playlist-generator";

const REFERENCE_YEAR = 2026;

interface TestCase {
  birthYear: number;
  expectedStages: number;
  shouldFail?: boolean;
}

const cases: TestCase[] = [
  { birthYear: 1990, expectedStages: 5 },
  { birthYear: 1999, expectedStages: 4 },
  { birthYear: 2004, expectedStages: 2 },
  { birthYear: 2012, expectedStages: 0, shouldFail: true },
];

function expectedTrackCount(stages: ReturnType<typeof getEligibleTimeframes>): number {
  return getStageWeights(stages.length).reduce((sum, weight) => sum + weight, 0);
}

async function main() {
  console.log("Nostalgia.FM flow verification\n");

  for (const testCase of cases) {
    const label = `Birth year ${testCase.birthYear}`;
    process.stdout.write(`${label}... `);

    if (testCase.shouldFail) {
      try {
        await generatePlaylist(testCase.birthYear, REFERENCE_YEAR);
        console.log("FAIL (expected error)");
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        console.log(`OK (rejected: ${message.slice(0, 50)}...)`);
      }
      continue;
    }

    const stages = getEligibleTimeframes(testCase.birthYear, REFERENCE_YEAR);
    if (stages.length !== testCase.expectedStages) {
      console.log(
        `FAIL (expected ${testCase.expectedStages} stages, got ${stages.length})`,
      );
      continue;
    }

    const playlist = await generatePlaylist(testCase.birthYear, REFERENCE_YEAR);
    const expected = expectedTrackCount(stages);

    if (expected !== TOTAL_TRACKS) {
      console.log(`FAIL (weighting does not total ${TOTAL_TRACKS})`);
      continue;
    }

    if (playlist.tracks.length > TOTAL_TRACKS) {
      console.log(
        `FAIL (expected at most ${TOTAL_TRACKS} tracks, got ${playlist.tracks.length})`,
      );
      continue;
    }

    const uniqueUris = new Set(playlist.tracks.map((t) => t.spotifyUri));
    if (uniqueUris.size !== playlist.tracks.length) {
      console.log("FAIL (duplicate tracks found)");
      continue;
    }

    const gaps = playlist.stageSummaries.filter((s) => s.matched < s.requested);
    const gapNote =
      gaps.length > 0
        ? `, gaps: ${gaps.map((g) => `${g.label} ${g.matched}/${g.requested}`).join("; ")}`
        : "";

    console.log(
      `OK (${playlist.tracks.length}/${expected} tracks, ${stages.length} stages${gapNote})`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
