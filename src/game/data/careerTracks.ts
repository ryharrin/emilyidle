import type { CareerTrackId } from "../model/types";

export type CareerTrackDefinition = {
  id: CareerTrackId;
  label: string;
  description: string;
  hasSessions: boolean;
};

export const TRACK_CHOICE_UNLOCK_LEVEL = 3;

export const CAREER_TRACKS: ReadonlyArray<CareerTrackDefinition> = [
  {
    id: "private-practice",
    label: "Outpatient clinic",
    description: "Session-based work with a structured caseload.",
    hasSessions: true,
  },
  {
    id: "va-hospital",
    label: "VA hospital",
    description: "Steady salary work rooted in coordinated care.",
    hasSessions: true,
  },
  {
    id: "research-teaching",
    label: "Research & teaching",
    description: "Long-term impact through studies and instruction.",
    hasSessions: true,
  },
];
