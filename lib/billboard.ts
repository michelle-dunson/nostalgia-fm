export interface BillboardSong {
  title: string;
  artist: string;
  rank: number;
  peakPosition: number;
  weeksOnChart: number;
}

interface RawBillboardChart {
  date: string;
  data: Array<{
    song: string;
    artist: string;
    this_week: number;
    last_week: number | null;
    peak_position: number;
    weeks_on_chart: number;
  }>;
}

const BASE_URL =
  "https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main";

const CHART_MONTHS = [2, 5, 8, 11];

const validDatesCache: { dates: string[] | null } = { dates: null };
const chartCache = new Map<string, BillboardSong[]>();

export function resolveNearestChartDate(
  year: number,
  validDates: string[],
): string {
  return resolveNearestChartDateForMonth(year, 7, validDates);
}

export function resolveNearestChartDateForMonth(
  year: number,
  month: number,
  validDates: string[],
): string {
  const target = new Date(
    `${year}-${String(month).padStart(2, "0")}-15T12:00:00Z`,
  ).getTime();
  const datesInYear = validDates.filter((date) =>
    date.startsWith(`${year}-`),
  );

  if (datesInYear.length === 0) {
    throw new Error(`No Billboard chart dates found for ${year}.`);
  }

  return datesInYear.reduce((closest, date) => {
    const closestDistance = Math.abs(
      new Date(`${closest}T12:00:00Z`).getTime() - target,
    );
    const dateDistance = Math.abs(
      new Date(`${date}T12:00:00Z`).getTime() - target,
    );
    return dateDistance < closestDistance ? date : closest;
  });
}

export function getChartDatesForYear(
  year: number,
  validDates: string[],
): string[] {
  const dates = CHART_MONTHS.map((month) => {
    try {
      return resolveNearestChartDateForMonth(year, month, validDates);
    } catch {
      return null;
    }
  }).filter((date): date is string => date !== null);

  return [...new Set(dates)];
}

function songKey(title: string, artist: string): string {
  return `${title.toLowerCase()}::${artist.toLowerCase()}`;
}

export function mergeBillboardSongs(
  songGroups: BillboardSong[][],
): BillboardSong[] {
  const bestBySong = new Map<string, BillboardSong>();

  for (const songs of songGroups) {
    for (const song of songs) {
      const key = songKey(song.title, song.artist);
      const existing = bestBySong.get(key);
      if (!existing || song.rank < existing.rank) {
        bestBySong.set(key, song);
      }
    }
  }

  return Array.from(bestBySong.values()).sort((a, b) => a.rank - b.rank);
}

async function getValidDates(): Promise<string[]> {
  if (validDatesCache.dates) {
    return validDatesCache.dates;
  }

  const response = await fetch(`${BASE_URL}/valid_dates.json`);
  if (!response.ok) {
    throw new Error(
      `Failed to load Billboard valid dates (${response.status}).`,
    );
  }

  const dates = (await response.json()) as string[];
  validDatesCache.dates = dates;
  return dates;
}

function normalizeChart(raw: RawBillboardChart): BillboardSong[] {
  return raw.data.map((entry) => ({
    title: entry.song,
    artist: entry.artist,
    rank: entry.this_week,
    peakPosition: entry.peak_position,
    weeksOnChart: entry.weeks_on_chart,
  }));
}

export async function getChartForDate(
  date: string,
  topN = 100,
): Promise<{ date: string; songs: BillboardSong[] }> {
  const cacheKey = `${date}:${topN}`;
  const cached = chartCache.get(cacheKey);
  if (cached) {
    return { date, songs: cached };
  }

  const response = await fetch(`${BASE_URL}/date/${date}.json`);
  if (!response.ok) {
    throw new Error(
      `Failed to load Billboard chart for ${date} (${response.status}).`,
    );
  }

  const raw = (await response.json()) as RawBillboardChart;
  const songs = normalizeChart(raw).slice(0, topN);
  chartCache.set(cacheKey, songs);
  return { date: raw.date, songs };
}

export async function getChartForYear(
  year: number,
  topN = 100,
): Promise<{ date: string; songs: BillboardSong[] }> {
  const validDates = await getValidDates();
  const chartDate = resolveNearestChartDate(year, validDates);
  const chart = await getChartForDate(chartDate, topN);
  return chart;
}

export async function getSongsForYear(
  year: number,
  topNPerChart = 25,
): Promise<BillboardSong[]> {
  const validDates = await getValidDates();
  const chartDates = getChartDatesForYear(year, validDates);

  if (chartDates.length === 0) {
    throw new Error(`No Billboard chart dates found for ${year}.`);
  }

  const charts = await Promise.all(
    chartDates.map((date) => getChartForDate(date, topNPerChart)),
  );

  return mergeBillboardSongs(charts.map((chart) => chart.songs));
}

export function clearBillboardCache(): void {
  validDatesCache.dates = null;
  chartCache.clear();
}
