import type { GeneratedPlaylist } from "@/lib/types";
import styles from "./PlaylistPreview.module.css";

interface PlaylistPreviewProps {
  playlist: GeneratedPlaylist;
}

export function PlaylistPreview({ playlist }: PlaylistPreviewProps) {
  return (
    <div className={styles.preview}>
      <header className={styles.header}>
        <h2 className={styles.title}>Your Nostalgia Playlist</h2>
        <p className={styles.meta}>
          Born {playlist.birthYear} · {playlist.tracks.length} tracks
        </p>
      </header>

      <ul className={styles.trackList}>
        {playlist.tracks.map((track) => (
          <li key={track.spotifyUri} className={styles.track}>
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.trackLink}
            >
              <span className={styles.trackTitle}>{track.title}</span>
              <span className={styles.trackArtist}>
                {track.artist} · {track.year}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
