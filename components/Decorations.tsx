import styles from "./Decorations.module.css";

function polarPoint(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function describeArc(
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    endDeg: number,
) {
    const start = polarPoint(cx, cy, r, startDeg);
    const end = polarPoint(cx, cy, r, endDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0;

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x} ${end.y}`;
}

const GROOVE_ARCS = [
    { r: 52, left: [145, 215], right: [-35, 35] },
    { r: 44, left: [135, 225], right: [-45, 45] },
    { r: 36, left: [155, 205], right: [-25, 25] },
];

export function VinylRecord({ className }: { className?: string }) {
    const cx = 60;
    const cy = 60;

    return (
        <svg
            className={`${styles.vinyl} ${className ?? ""}`}
            viewBox="0 0 120 120"
            aria-hidden="true"
        >
            <g className={styles.disc}>
                <circle cx={cx} cy={cy} r="58" fill="var(--color-dark)" />
                {GROOVE_ARCS.map((groove) => (
                    <g key={groove.r}>
                        <path
                            d={describeArc(cx, cy, groove.r, groove.left[0], groove.left[1])}
                            fill="none"
                            stroke="var(--color-cream)"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            opacity="0.45"
                        />
                        <path
                            d={describeArc(cx, cy, groove.r, groove.right[0], groove.right[1])}
                            fill="none"
                            stroke="var(--color-cream)"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            opacity="0.45"
                        />
                    </g>
                ))}
                <circle cx={cx} cy={cy} r="14" fill="var(--color-burnt-orange)" />
                <circle cx={cx} cy={cy} r="4" fill="var(--color-cream)" />
            </g>

            <g className={styles.needle}>
                <circle
                    cx="99"
                    cy="13"
                    r="4"
                    fill="var(--color-cream)"
                    stroke="var(--color-dark)"
                    strokeWidth="1.5"
                />
                <path
                    d="M 99 13 L 84 38"
                    stroke="var(--color-cream)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <path
                    d="M 84 38 L 78 46 L 72 44 Z"
                    fill="var(--color-burnt-orange)"
                    stroke="var(--color-dark)"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                />
                <path
                    d="M 74 45 L 71 50"
                    stroke="var(--color-cream)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <circle cx="70.5" cy="50.5" r="1.25" fill="var(--color-cream)" />
            </g>
        </svg>
    );
}

export function EqualizerBars({ className }: { className?: string }) {
    return (
        <svg
            className={`${styles.equalizer} ${className ?? ""}`}
            viewBox="0 0 48 40"
            aria-hidden="true"
        >
            <rect
                className={styles.bar1}
                x="4"
                y="16"
                width="6"
                height="24"
                rx="2"
                fill="var(--color-muted-teal)"
            />
            <rect
                className={styles.bar2}
                x="14"
                y="8"
                width="6"
                height="32"
                rx="2"
                fill="var(--color-retro-purple)"
            />
            <rect
                className={styles.bar3}
                x="24"
                y="12"
                width="6"
                height="28"
                rx="2"
                fill="var(--color-burnt-orange)"
            />
            <rect
                className={styles.bar4}
                x="34"
                y="4"
                width="6"
                height="36"
                rx="2"
                fill="var(--color-golden-yellow)"
            />
        </svg>
    );
}

export function StarBurst({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
            <path
                d="M16 2 L18.5 12 L29 14 L18.5 16 L16 26 L13.5 16 L3 14 L13.5 12 Z"
                fill="var(--color-golden-yellow)"
            />
        </svg>
    );
}

export function SoundWave({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 80 24" aria-hidden="true">
            <path
                d="M0 12 Q10 4, 20 12 T40 12 T60 12 T80 12"
                fill="none"
                stroke="var(--color-dusty-coral)"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CassetteSpool({ cx, cy }: { cx: number; cy: number }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r="6.5" fill="#3d5560" />
            <circle cx={cx} cy={cy} r="3.75" fill="var(--color-dark)" />
            <rect
                x={cx - 1.25}
                y={cy - 6.5}
                width="2.5"
                height="3.25"
                rx="0.4"
                fill="#3d5560"
            />
            <rect
                x={cx - 1.25}
                y={cy + 3.25}
                width="2.5"
                height="3.25"
                rx="0.4"
                fill="#3d5560"
            />
            <rect
                x={cx - 6.5}
                y={cy - 1.25}
                width="3.25"
                height="2.5"
                rx="0.4"
                fill="#3d5560"
            />
            <rect
                x={cx + 3.25}
                y={cy - 1.25}
                width="3.25"
                height="2.5"
                rx="0.4"
                fill="#3d5560"
            />
        </g>
    );
}

export function Cassette({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 72 48" aria-hidden="true">
            <rect
                x="5"
                y="5"
                width="62"
                height="38"
                rx="5"
                fill="#5a7282"
                stroke="#3d5560"
                strokeWidth="2.5"
            />
            <rect
                x="1"
                y="19"
                width="6"
                height="10"
                rx="2"
                fill="#5a7282"
                stroke="#3d5560"
                strokeWidth="2"
            />
            <rect
                x="65"
                y="19"
                width="6"
                height="10"
                rx="2"
                fill="#5a7282"
                stroke="#3d5560"
                strokeWidth="2"
            />

            <circle cx="9" cy="9" r="2" fill="#3d5560" />
            <circle cx="63" cy="9" r="2" fill="#3d5560" />
            <circle cx="9" cy="39" r="2" fill="#3d5560" />
            <circle cx="63" cy="39" r="2" fill="#3d5560" />

            <rect
                x="10"
                y="10"
                width="52"
                height="24"
                rx="2.5"
                fill="var(--color-cream)"
            />
            <rect
                x="10"
                y="10"
                width="52"
                height="8"
                fill="var(--color-cream)"
            />
            <rect
                x="10"
                y="18"
                width="52"
                height="8"
                fill="var(--color-dusty-coral)"
            />
            <rect
                x="10"
                y="26"
                width="52"
                height="8"
                fill="var(--color-olive)"
            />

            <rect
                x="14"
                y="12.5"
                width="8"
                height="2.5"
                rx="1.25"
                fill="#3d5560"
            />
            <rect
                x="26"
                y="12.5"
                width="14"
                height="2.5"
                rx="1.25"
                fill="#3d5560"
            />

            <CassetteSpool cx={24} cy={22} />
            <CassetteSpool cx={48} cy={22} />

            <path
                d="M27 43 L31 36 L41 36 L45 43 Z"
                fill="#708899"
                stroke="#3d5560"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <circle cx="30" cy="40" r="1.5" fill="#3d5560" />
            <circle cx="42" cy="40" r="1.5" fill="#3d5560" />
        </svg>
    );
}
