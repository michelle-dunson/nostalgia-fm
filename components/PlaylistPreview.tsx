import type { CSSProperties } from "react";
import type { GeneratedPlaylist } from "@/lib/types";
import { Cassette } from "@/components/Decorations";
import styles from "./PlaylistPreview.module.css";

const ACCENT_COLORS = [
    "var(--color-burnt-orange)",
    "var(--color-muted-teal)",
    "var(--color-retro-purple)",
    "var(--color-olive)",
    "var(--color-dusty-coral)",
    "var(--color-golden-yellow)",
];

interface PlaylistPreviewProps {
    playlist: GeneratedPlaylist;
}

function getAccentColor(index: number): string {
    return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

export function PlaylistPreview({ playlist }: PlaylistPreviewProps) {
    return (
        <div className={styles.preview}>
            <header className={styles.header}>
                <div className={styles.headerMain}>
                    <p className={styles.eyebrow}>Now playing</p>
                    <h2 className={styles.title}>
                        Your <em>Soundtrack</em>
                    </h2>
                    <div className={styles.meta}>
                        <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>Born</span>
                            <span className={styles.metaValue}>
                                {playlist.birthYear}
                            </span>
                        </span>
                        <span className={styles.metaDivider} aria-hidden="true">
                            ·
                        </span>
                        <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>Tracks</span>
                            <span className={styles.metaValue}>
                                {playlist.tracks.length}
                            </span>
                        </span>
                    </div>
                </div>
                <div className={styles.headerCassette} aria-hidden="true">
                    <Cassette />
                </div>
            </header>

            <ul className={styles.trackList}>
                {playlist.tracks.map((track, index) => (
                    <li key={track.spotifyUri} className={styles.track}>
                        <a
                            href={track.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.trackLink}
                            style={
                                {
                                    "--track-accent": getAccentColor(index),
                                } as CSSProperties
                            }
                        >
                            <div className={styles.artwork}>
                                {track.imageUrl ? (
                                    <img
                                        src={track.imageUrl}
                                        alt=""
                                        className={styles.artworkImage}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div
                                        className={styles.artworkFallback}
                                        aria-hidden="true"
                                    >
                                        <span>{track.title.charAt(0)}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.trackInfo}>
                                <span className={styles.trackTitle}>
                                    {track.title}
                                </span>
                                <span className={styles.trackArtist}>
                                    {track.artist}
                                </span>
                            </div>

                            <span className={styles.trackYear}>
                                {track.year}
                            </span>

                            <span
                                className={styles.playIcon}
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        d="M8 5v14l11-7z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
