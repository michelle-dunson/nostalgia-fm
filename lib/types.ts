export type LifeStage =
  | "childhood"
  | "middle_school"
  | "high_school"
  | "college"
  | "post_grad";

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
  imageUrl?: string;
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
