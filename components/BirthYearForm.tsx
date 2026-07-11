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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const year = Number(birthYear);

    if (!Number.isInteger(year)) {
      setValidationError("Enter a whole year, e.g. 1990.");
      return;
    }

    if (year < minYear || year > maxYear) {
      setValidationError(`Enter a year between ${minYear} and ${maxYear}.`);
      return;
    }

    setValidationError(null);
    onSubmit(year);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="birth-year" className={styles.label}>
        Birth year
      </label>
      <input
        id="birth-year"
        type="number"
        className={styles.input}
        placeholder="e.g. 1990"
        min={minYear}
        max={maxYear}
        value={birthYear}
        onChange={(event) => {
          setBirthYear(event.target.value);
          setValidationError(null);
        }}
        disabled={isLoading}
        required
      />
      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Playlist"}
      </button>
      {validationError && (
        <p className={styles.validationError}>{validationError}</p>
      )}
    </form>
  );
}
