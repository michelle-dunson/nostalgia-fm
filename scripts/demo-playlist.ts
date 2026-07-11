import { generatePlaylist } from "../lib/playlist-generator";
import { groupTracksByStage } from "../lib/playlist-utils";

const birthYear = Number(process.argv[2] ?? 1990);

async function main() {
  console.log(`Generating playlist for birth year ${birthYear}...\n`);
  const playlist = await generatePlaylist(birthYear);

  console.log(`Stages included: ${playlist.stages.length}`);
  for (const summary of playlist.stageSummaries) {
    const gap =
      summary.matched < summary.requested
        ? ` (${summary.matched}/${summary.requested} found)`
        : "";
    console.log(`- ${summary.label}${gap}`);
  }

  console.log(`\nTotal tracks: ${playlist.tracks.length}\n`);

  const grouped = groupTracksByStage(playlist.tracks);
  for (const stage of playlist.stages) {
    console.log(`== ${stage.label} (${stage.years.join(", ")}) ==`);
    for (const track of grouped[stage.stage]) {
      console.log(`  ${track.title} — ${track.artist} (${track.year})`);
      console.log(`  ${track.spotifyUrl}`);
    }
    console.log();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
