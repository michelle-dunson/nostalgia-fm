import { getChartForYear } from "../lib/billboard";

async function main() {
  for (const year of [1999, 2007, 2017]) {
    const chart = await getChartForYear(year, 5);
    console.log(`\n=== ${year} (chart week ${chart.date}) ===`);
    for (const song of chart.songs) {
      console.log(`${song.rank}. ${song.title} — ${song.artist}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
