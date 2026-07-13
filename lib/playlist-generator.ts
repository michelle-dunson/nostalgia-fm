import { getEligibleTimeframes, validateBirthYear } from "./age-ranges";
import { getSongsForYear, type BillboardSong } from "./billboard";
import { searchTrack } from "./spotify";
import type { GeneratedPlaylist, PlaylistTrack, StageSummary, Timeframe } from "./types";

export const TOTAL_TRACKS = 50;

const STAGE_WEIGHTS_BY_COUNT: Record<number, number[]> = {
  1: [50],
  2: [25, 25],
  3: [15, 20, 15],
  4: [10, 15, 15, 10],
  5: [10, 10, 10, 10, 10],
};

const INITIAL_TOP_N_PER_CHART = 12;
const EXPANDED_TOP_N_PER_CHART = 20;
const SPOTIFY_SEARCH_BUDGET = 60;
const FILL_PASS_MIN_RATIO = 0.7;

interface CandidateSong extends BillboardSong {
  year: number;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function candidateKey(title: string, artist: string): string {
  return `${title.toLowerCase()}::${artist.toLowerCase()}`;
}

export function getStageWeights(stageCount: number): number[] {
  const weights = STAGE_WEIGHTS_BY_COUNT[stageCount];
  if (!weights) {
    throw new Error(`Unsupported stage count: ${stageCount}`);
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total !== TOTAL_TRACKS) {
    throw new Error(`Stage weights must total ${TOTAL_TRACKS}, got ${total}.`);
  }

  return weights;
}

export function distributeTrackCount(total: number, buckets: number): number[] {
  if (buckets <= 0) {
    return [];
  }

  const base = Math.floor(total / buckets);
  const remainder = total % buckets;

  return Array.from({ length: buckets }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

async function collectCandidatesForYear(
  year: number,
  topNPerChart: number,
): Promise<CandidateSong[]> {
  try {
    const songs = await getSongsForYear(year, topNPerChart);
    return songs.map((song) => ({ ...song, year }));
  } catch {
    return [];
  }
}

export function maxSearchAttempts(targetCount: number): number {
  return Math.min(Math.max(targetCount * 3, 6), 15);
}

class SearchBudget {
  constructor(private remaining: number) {}

  canSearch(): boolean {
    return this.remaining > 0;
  }

  consume(count = 1): void {
    this.remaining = Math.max(0, this.remaining - count);
  }
}

async function collectCandidates(
  years: number[],
  topNPerChart: number,
): Promise<CandidateSong[]> {
  const results = await Promise.all(
    years.map((year) => collectCandidatesForYear(year, topNPerChart)),
  );
  return results.flat();
}

async function matchCandidates(
  candidates: CandidateSong[],
  usedUris: Set<string>,
  targetCount: number,
  stage: Timeframe["stage"],
  budget: SearchBudget,
): Promise<PlaylistTrack[]> {
  const matches: PlaylistTrack[] = [];
  const attemptLimit = maxSearchAttempts(targetCount);

  for (let index = 0; index < candidates.length; index += 1) {
    if (
      matches.length >= targetCount ||
      index >= attemptLimit ||
      !budget.canSearch()
    ) {
      break;
    }

    const candidate = candidates[index];
    budget.consume();

    try {
      const spotifyMatch = await searchTrack(candidate.title, candidate.artist, {
        maxQueries: 1,
      });

      if (!spotifyMatch || usedUris.has(spotifyMatch.uri)) {
        continue;
      }

      usedUris.add(spotifyMatch.uri);
      matches.push({
        title: spotifyMatch.title,
        artist: spotifyMatch.artist,
        year: candidate.year,
        stage,
        spotifyUri: spotifyMatch.uri,
        spotifyUrl: spotifyMatch.url,
        imageUrl: spotifyMatch.imageUrl,
      });
    } catch {
      // Skip candidates that fail due to rate limits or transient API errors.
    }
  }

  return matches;
}

async function selectTracksForStage(
  timeframe: Timeframe,
  usedUris: Set<string>,
  targetCount: number,
  budget: SearchBudget,
): Promise<PlaylistTrack[]> {
  const perYearTargets = distributeTrackCount(
    targetCount,
    timeframe.years.length,
  );
  const matches: PlaylistTrack[] = [];

  for (let index = 0; index < timeframe.years.length; index += 1) {
    if (!budget.canSearch()) {
      break;
    }

    const year = timeframe.years[index];
    const yearTarget = perYearTargets[index];

    const candidates = await collectCandidatesForYear(year, INITIAL_TOP_N_PER_CHART);
    const yearMatches = await matchCandidates(
      shuffle(candidates),
      usedUris,
      yearTarget,
      timeframe.stage,
      budget,
    );
    matches.push(...yearMatches);
  }

  const fillThreshold = Math.ceil(targetCount * FILL_PASS_MIN_RATIO);
  if (matches.length < fillThreshold && budget.canSearch()) {
    const triedKeys = new Set(
      matches.map((track) => candidateKey(track.title, track.artist)),
    );
    const fillCandidates = shuffle(
      await collectCandidates(timeframe.years, EXPANDED_TOP_N_PER_CHART),
    ).filter((song) => !triedKeys.has(candidateKey(song.title, song.artist)));

    const fillMatches = await matchCandidates(
      fillCandidates,
      usedUris,
      targetCount - matches.length,
      timeframe.stage,
      budget,
    );
    matches.push(...fillMatches);
  }

  return shuffle(matches);
}

export async function generatePlaylist(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): Promise<GeneratedPlaylist> {
  const validationError = validateBirthYear(birthYear, referenceYear);
  if (validationError) {
    throw new Error(validationError);
  }

  const stages = getEligibleTimeframes(birthYear, referenceYear);
  const weights = getStageWeights(stages.length);
  const usedUris = new Set<string>();
  const searchesPerStage = Math.max(
    10,
    Math.ceil(SPOTIFY_SEARCH_BUDGET / stages.length),
  );
  const stageSummaries: StageSummary[] = [];
  const tracksByStage: PlaylistTrack[] = [];

  for (let index = 0; index < stages.length; index += 1) {
    const timeframe = stages[index];
    const targetCount = weights[index];
    const budget = new SearchBudget(searchesPerStage);
    const stageTracks = await selectTracksForStage(
      timeframe,
      usedUris,
      targetCount,
      budget,
    );

    stageSummaries.push({
      stage: timeframe.stage,
      label: timeframe.label,
      requested: targetCount,
      matched: stageTracks.length,
    });
    tracksByStage.push(...stageTracks);
  }

  if (tracksByStage.length === 0) {
    throw new Error(
      "Could not match any songs on Spotify. Please try again in a moment.",
    );
  }

  return {
    birthYear,
    stages,
    stageSummaries,
    tracks: shuffle(tracksByStage),
  };
}
