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
                <button
                    type="button"
                    className={styles.primary}
                    onClick={onSave}
                >
                    Connect Spotify to Save
                </button>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.primary}
                onClick={onSave}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save to Spotify"}
            </button>
        </div>
    );
}
