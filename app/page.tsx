import { NostalgiaApp } from "@/components/NostalgiaApp";
import {
    EqualizerBars,
    SoundWave,
    StarBurst,
    VinylRecord,
} from "@/components/Decorations";
import styles from "./page.module.css";

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ spotify?: string; reason?: string }>;
}) {
    const params = await searchParams;

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <header className={styles.hero}>
                    <div className={styles.heroDecor} aria-hidden="true">
                        <div className={styles.vinylWrap}>
                            <VinylRecord />
                        </div>
                        <div className={styles.equalizerWrap}>
                            <EqualizerBars />
                        </div>
                        <div className={styles.starWrap}>
                            <StarBurst />
                        </div>
                        <div className={styles.waveWrap}>
                            <SoundWave />
                        </div>
                    </div>

                    <p className={styles.brand}>Nostalgia.FM</p>
                    <h1 className={styles.headline}>
                        Your Life,
                        <br />
                        <span className={styles.headlineAccent}>
                            One Playlist
                        </span>
                        <br />
                        at a Time.
                    </h1>
                    <p className={styles.tagline}>
                        Enter the year you were born and rediscover the songs
                        that soundtracked your childhood, first crush, road
                        trips, graduation, and everything in between.
                    </p>
                </header>

                <NostalgiaApp
                    spotifyStatus={params.spotify}
                    spotifyReason={params.reason}
                />

                <footer className={styles.footer}>
                    <p className={styles.footerText}>
                        Powered by Billboard chart data &amp; Spotify
                    </p>
                </footer>
            </main>
        </div>
    );
}
