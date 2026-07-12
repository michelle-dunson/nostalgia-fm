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
      childhood: [],
      middle_school: [],
      high_school: [],
      college: [],
      post_grad: [],
    } as Record<LifeStage, PlaylistTrack[]>,
  );
}
