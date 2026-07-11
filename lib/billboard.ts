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

const validDatesCache: { dates: string[] | null } = { dates: null };
const chartCache = new Map<string, BillboardSong[]>();

export function resolveNearestChartDate(
  year: number,
  validDates: string[],
): string {
  const target = new Date(`${year}-07-01T12:00:00Z`).getTime();
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

export function clearBillboardCache(): void {
  validDatesCache.dates = null;
  chartCache.clear();
}
