import styles from "./SpotifyButton.module.css";

interface SpotifyButtonProps {
  isAuthenticated: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function SpotifyButton({
  isAuthenticated,
  isSaving,
  onSave,
}: SpotifyButtonProps) {
  if (!isAuthenticated) {
    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.button} onClick={onSave}>
          Connect Spotify to Save
        </button>
        <p className={styles.hint}>
          You&apos;ll connect your account, then save your playlist.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save to Spotify"}
      </button>
    </div>
  );
}
