export type LifeStage =
  | "early_years"
  | "middle_school"
  | "prom"
  | "college"
  | "adulthood";

export interface StageDefinition {
  stage: LifeStage;
  label: string;
  minAge: number;
  maxAge: number;
}

export interface Timeframe {
  stage: LifeStage;
  label: string;
  years: number[];
}

export interface PlaylistTrack {
  title: string;
  artist: string;
  year: number;
  stage: LifeStage;
  spotifyUri: string;
  spotifyUrl: string;
}

export interface GeneratedPlaylist {
  birthYear: number;
  tracks: PlaylistTrack[];
  stages: Timeframe[];
  stageSummaries: StageSummary[];
}

export interface StageSummary {
  stage: LifeStage;
  label: string;
  requested: number;
  matched: number;
}
