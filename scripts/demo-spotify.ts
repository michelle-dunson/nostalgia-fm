import { searchTrack } from "../lib/spotify";

const samples = [
  { title: "If You Had My Love", artist: "Jennifer Lopez" },
  { title: "Umbrella", artist: "Rihanna Featuring Jay-Z" },
  { title: "Despacito", artist: "Luis Fonsi & Daddy Yankee Featuring Justin Bieber" },
];

async function main() {
  for (const sample of samples) {
    const match = await searchTrack(sample.title, sample.artist);
    if (match) {
      console.log(`✓ ${sample.title} — ${sample.artist}`);
      console.log(`  → ${match.title} by ${match.artist}`);
      console.log(`  → ${match.uri}`);
      console.log(`  → ${match.url}\n`);
    } else {
      console.log(`✗ No match: ${sample.title} — ${sample.artist}\n`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
