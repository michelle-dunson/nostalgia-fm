import styles from "./EmptyState.module.css";

export function EmptyState() {
    return (
        <div className={styles.empty} aria-hidden="true">
            <div className={styles.stack}>
                <div className={`${styles.sleeve} ${styles.sleeve1}`} />
                <div className={`${styles.sleeve} ${styles.sleeve2}`} />
                <div className={`${styles.sleeve} ${styles.sleeve3}`}>
                    <div className={styles.vinylHole} />
                </div>
            </div>
            <p className={styles.caption}>
                <span className={styles.captionAccent}>Your soundtrack</span> is
                waiting to be discovered.
            </p>
        </div>
    );
}
