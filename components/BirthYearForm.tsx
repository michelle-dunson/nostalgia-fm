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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const year = Number(birthYear);

    if (!Number.isInteger(year) || year < minYear || year > maxYear) {
      return;
    }

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
        onChange={(event) => setBirthYear(event.target.value)}
        disabled={isLoading}
        required
      />
      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Playlist"}
      </button>
    </form>
  );
}
