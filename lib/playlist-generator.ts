import { getEligibleTimeframes, validateBirthYear } from "./age-ranges";
import { getChartForYear, type BillboardSong } from "./billboard";
import { searchTrack } from "./spotify";
import type {
  GeneratedPlaylist,
  LifeStage,
  PlaylistTrack,
  StageSummary,
  Timeframe,
} from "./types";

const SONGS_PER_STAGE = 5;
const INITIAL_POOL_SIZE = 15;
const EXPANDED_POOL_SIZE = 25;
const SEARCH_DELAY_MS = 100;

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

function dedupeCandidates(candidates: CandidateSong[]): CandidateSong[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidateKey(candidate.title, candidate.artist);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectCandidates(
  years: number[],
  poolSize: number,
): Promise<CandidateSong[]> {
  const candidates: CandidateSong[] = [];

  for (const year of years) {
    try {
      const chart = await getChartForYear(year, poolSize);
      for (const song of chart.songs) {
        candidates.push({ ...song, year });
      }
    } catch {
      // Skip years with missing chart data and continue with the other year.
    }
  }

  return dedupeCandidates(candidates);
}

async function matchCandidates(
  candidates: CandidateSong[],
  usedUris: Set<string>,
  targetCount: number,
  stage: Timeframe["stage"],
): Promise<PlaylistTrack[]> {
  const matches: PlaylistTrack[] = [];

  for (const candidate of candidates) {
    if (matches.length >= targetCount) {
      break;
    }

    await delay(SEARCH_DELAY_MS);
    const spotifyMatch = await searchTrack(candidate.title, candidate.artist);

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
    });
  }

  return matches;
}

async function selectTracksForStage(
  timeframe: Timeframe,
  usedUris: Set<string>,
): Promise<PlaylistTrack[]> {
  const candidates = await collectCandidates(timeframe.years, INITIAL_POOL_SIZE);
  let matches = await matchCandidates(
    candidates,
    usedUris,
    SONGS_PER_STAGE,
    timeframe.stage,
  );

  if (matches.length < SONGS_PER_STAGE) {
    const expandedCandidates = await collectCandidates(
      timeframe.years,
      EXPANDED_POOL_SIZE,
    );
    const triedKeys = new Set(
      candidates.map((song) => candidateKey(song.title, song.artist)),
    );
    const additionalCandidates = expandedCandidates.filter(
      (song) => !triedKeys.has(candidateKey(song.title, song.artist)),
    );

    const moreMatches = await matchCandidates(
      additionalCandidates,
      usedUris,
      SONGS_PER_STAGE - matches.length,
      timeframe.stage,
    );
    matches = [...matches, ...moreMatches];
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
  const usedUris = new Set<string>();
  const stageSummaries: StageSummary[] = [];
  const tracksByStage: PlaylistTrack[] = [];

  for (const timeframe of stages) {
    const stageTracks = await selectTracksForStage(timeframe, usedUris);
    stageSummaries.push({
      stage: timeframe.stage,
      label: timeframe.label,
      requested: SONGS_PER_STAGE,
      matched: stageTracks.length,
    });
    tracksByStage.push(...stageTracks);
  }

  return {
    birthYear,
    stages,
    stageSummaries,
    tracks: shuffle(tracksByStage),
  };
}

export function groupTracksByStage(
  tracks: PlaylistTrack[],
): Record<LifeStage, PlaylistTrack[]> {
  return tracks.reduce(
    (groups, track) => {
      groups[track.stage].push(track);
      return groups;
    },
    {
      early_years: [],
      middle_school: [],
      prom: [],
      college: [],
      adulthood: [],
    } as Record<LifeStage, PlaylistTrack[]>,
  );
}
