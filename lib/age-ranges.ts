import type { StageDefinition, Timeframe } from "./types";

export const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  {
    stage: "childhood",
    label: "Childhood",
    minAge: 8,
    maxAge: 10,
  },
  {
    stage: "middle_school",
    label: "Middle School",
    minAge: 12,
    maxAge: 14,
  },
  {
    stage: "high_school",
    label: "High School",
    minAge: 16,
    maxAge: 18,
  },
  {
    stage: "college",
    label: "College",
    minAge: 20,
    maxAge: 22,
  },
  {
    stage: "post_grad",
    label: "Post-Grad",
    minAge: 24,
    maxAge: 26,
  },
] as const;

export const MIN_BIRTH_YEAR = 1940;

export const TOO_YOUNG_MESSAGE =
  "Come back when you're a bit older — your nostalgia playlist needs at least 15 years of life!";

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
  const years: number[] = [];
  for (let age = stage.minAge; age <= stage.maxAge; age += 1) {
    years.push(birthYear + age);
  }
  return years;
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
