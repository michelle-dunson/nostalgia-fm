import { NostalgiaApp } from "@/components/NostalgiaApp";
import styles from "./page.module.css";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ spotify?: string; reason?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className={styles.page}>
      <div className={styles.scanlines} aria-hidden="true" />

      <main className={styles.main}>
        <header className={styles.hero}>
          <p className={styles.frequency}>FM</p>
          <h1 className={styles.title}>Nostalgia.FM</h1>
          <p className={styles.tagline}>
            The soundtrack of your life, tuned to your birth year.
          </p>
        </header>

        <NostalgiaApp
          spotifyStatus={params.spotify}
          spotifyReason={params.reason}
        />

        <footer className={styles.footer}>
          <p>Powered by Billboard chart data and Spotify</p>
        </footer>
      </main>
    </div>
  );
}
