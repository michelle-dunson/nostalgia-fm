import type { LifeStage, PlaylistTrack } from "./types";

export function groupTracksByStage(
  tracks: PlaylistTrack[],
): Record<LifeStage, PlaylistTrack[]> {
  return tracks.reduce(
    (groups, track) => {
      groups[track.stage].push(track);
      return groups;
    },
    {
      early_years: [],
      middle_school: [],
      prom: [],
      college: [],
      adulthood: [],
    } as Record<LifeStage, PlaylistTrack[]>,
  );
}
