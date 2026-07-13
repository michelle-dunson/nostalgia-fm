"use client";

import { FormEvent, useState } from "react";
import styles from "./BirthYearForm.module.css";

interface BirthYearFormProps {
    minYear: number;
    maxYear: number;
    isLoading: boolean;
    onSubmit: (birthYear: number) => void;
}

export function BirthYearForm({
    minYear,
    maxYear,
    isLoading,
    onSubmit,
}: BirthYearFormProps) {
    const [birthYear, setBirthYear] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    function submitYear() {
        const year = Number(birthYear);

        if (!Number.isInteger(year)) {
            setValidationError("Enter a whole year, e.g. 1994.");
            return;
        }

        if (year < minYear || year > maxYear) {
            setValidationError(
                `Enter a year between ${minYear} and ${maxYear}.`,
            );
            return;
        }

        setValidationError(null);
        onSubmit(year);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitYear();
    }

    function adjustYear(delta: number) {
        const current = Number(birthYear) || maxYear;
        const next = Math.min(maxYear, Math.max(minYear, current + delta));
        setBirthYear(String(next));
        setValidationError(null);
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <label htmlFor="birth-year" className={styles.label}>
                    Born in
                </label>

                <div className={styles.inputRow}>
                    <button
                        type="button"
                        className={styles.stepper}
                        onClick={() => adjustYear(-1)}
                        disabled={isLoading}
                        aria-label="Decrease year"
                    >
                        −
                    </button>

                    <input
                        id="birth-year"
                        type="number"
                        className={styles.input}
                        placeholder="1994"
                        min={minYear}
                        max={maxYear}
                        value={birthYear}
                        onChange={(event) => {
                            setBirthYear(event.target.value);
                            setValidationError(null);
                        }}
                        disabled={isLoading}
                        required
                        inputMode="numeric"
                    />

                    <button
                        type="button"
                        className={styles.stepper}
                        onClick={() => adjustYear(1)}
                        disabled={isLoading}
                        aria-label="Increase year"
                    >
                        +
                    </button>
                </div>
            </div>

            <span className={styles.arrow} aria-hidden="true">
                ↓
            </span>

            <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
            >
                {isLoading ? "Tuning in..." : "Generate My Soundtrack"}
            </button>

            {validationError && (
                <p className={styles.validationError} role="alert">
                    {validationError}
                </p>
            )}
        </form>
    );
}
