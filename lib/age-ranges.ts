import type { StageDefinition, Timeframe } from "./types";

export const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  {
    stage: "early_years",
    label: "Early Years",
    minAge: 7,
    maxAge: 8,
  },
  {
    stage: "middle_school",
    label: "Middle School Years",
    minAge: 13,
    maxAge: 14,
  },
  {
    stage: "prom",
    label: "Junior/Senior Prom",
    minAge: 17,
    maxAge: 18,
  },
  {
    stage: "college",
    label: "College Years",
    minAge: 20,
    maxAge: 21,
  },
  {
    stage: "adulthood",
    label: "Entering Adulthood",
    minAge: 24,
    maxAge: 25,
  },
] as const;

export const MIN_BIRTH_YEAR = 1940;

export const TOO_YOUNG_MESSAGE =
  "Come back when you're a bit older — your nostalgia playlist needs at least 13 years of life!";

export function getCurrentAge(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): number {
  return referenceYear - birthYear;
}

export function isStageEligible(
  birthYear: number,
  maxAge: number,
  referenceYear: number = new Date().getFullYear(),
): boolean {
  return getCurrentAge(birthYear, referenceYear) >= maxAge + 5;
}

export function getYearsForStage(
  birthYear: number,
  stage: StageDefinition,
): number[] {
  return [birthYear + stage.minAge, birthYear + stage.maxAge];
}

export function getEligibleTimeframes(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): Timeframe[] {
  return STAGE_DEFINITIONS.filter((stage) =>
    isStageEligible(birthYear, stage.maxAge, referenceYear),
  ).map((stage) => ({
    stage: stage.stage,
    label: stage.label,
    years: getYearsForStage(birthYear, stage),
  }));
}

export function validateBirthYear(
  birthYear: number,
  referenceYear: number = new Date().getFullYear(),
): string | null {
  if (!Number.isInteger(birthYear)) {
    return "Birth year must be a whole number.";
  }

  if (birthYear < MIN_BIRTH_YEAR) {
    return `Birth year must be ${MIN_BIRTH_YEAR} or later.`;
  }

  if (birthYear > referenceYear) {
    return "Birth year cannot be in the future.";
  }

  if (getEligibleTimeframes(birthYear, referenceYear).length === 0) {
    return TOO_YOUNG_MESSAGE;
  }

  return null;
}
