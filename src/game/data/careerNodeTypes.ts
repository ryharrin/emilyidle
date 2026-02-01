import type { CareerNodeId, CareerTrackId, TherapistCareerEffectMultipliers } from "../model/types";

export type CareerNodeTrackId = CareerTrackId | "core";

export type CareerNodeDefinition = {
  id: CareerNodeId;
  trackId: CareerNodeTrackId;
  label: string;
  description: string;
  costPoints: number;
  prerequisites: CareerNodeId[];
  effects?: Partial<TherapistCareerEffectMultipliers>;
};
