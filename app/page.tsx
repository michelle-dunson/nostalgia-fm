import styles from "./page.module.css";

export default function Home() {
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

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>When were you born?</h2>
          <p className={styles.cardDescription}>
            Enter your birth year and we&apos;ll pull the Billboard hits from
            the chapters of your life — early years, middle school, prom,
            college, and beyond.
          </p>

          <form className={styles.form} aria-label="Birth year (coming soon)">
            <label htmlFor="birth-year" className={styles.label}>
              Birth year
            </label>
            <input
              id="birth-year"
              type="number"
              className={styles.input}
              placeholder="e.g. 1990"
              min={1940}
              max={new Date().getFullYear()}
              disabled
            />
            <button type="button" className={styles.button} disabled>
              Generate Playlist
            </button>
          </form>

          <p className={styles.comingSoon}>
            Playlist generation coming in the next step.
          </p>
        </section>

        <footer className={styles.footer}>
          <p>Powered by Billboard chart data and Spotify</p>
        </footer>
      </main>
    </div>
  );
}
