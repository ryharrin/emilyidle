import type { CareerNodeId, CareerTrackId } from "../model/types";

export type CareerTrackDefinition = {
  id: CareerTrackId;
  label: string;
  description: string;
  hasSessions: boolean;
};

type CareerNodeTrackId = CareerTrackId | "core";

export type CareerNodeDefinition = {
  id: CareerNodeId;
  trackId: CareerNodeTrackId;
  label: string;
  description: string;
  costPoints: number;
  prerequisites: CareerNodeId[];
};

export const TRACK_CHOICE_UNLOCK_LEVEL = 3;

export const CAREER_TRACKS: ReadonlyArray<CareerTrackDefinition> = [
  {
    id: "private-practice",
    label: "Private practice",
    description: "Session-based focus with premium client pacing.",
    hasSessions: true,
  },
  {
    id: "va-hospital",
    label: "VA hospital",
    description: "Steady salary work rooted in coordinated care.",
    hasSessions: false,
  },
  {
    id: "research-teaching",
    label: "Research & teaching",
    description: "Long-term impact through studies and instruction.",
    hasSessions: false,
  },
];

export const CAREER_NODES: ReadonlyArray<CareerNodeDefinition> = [
  {
    id: "core-foundation",
    trackId: "core",
    label: "Foundational practice",
    description: "Establish a consistent intake and note rhythm.",
    costPoints: 1,
    prerequisites: [],
  },
  {
    id: "core-ethics",
    trackId: "core",
    label: "Ethical scaffolding",
    description: "Ground decisions in a clear, repeatable framework.",
    costPoints: 1,
    prerequisites: ["core-foundation"],
  },
  {
    id: "core-casework",
    trackId: "core",
    label: "Casework cadence",
    description: "Build a dependable weekly flow before specializing.",
    costPoints: 1,
    prerequisites: ["core-ethics"],
  },
  {
    id: "private-intake",
    trackId: "private-practice",
    label: "Private intake flow",
    description: "Craft a premium, client-ready intake experience.",
    costPoints: 1,
    prerequisites: ["core-casework"],
  },
  {
    id: "private-referrals",
    trackId: "private-practice",
    label: "Referral network",
    description: "Strengthen reputation through referral partners.",
    costPoints: 1,
    prerequisites: ["private-intake"],
  },
  {
    id: "private-session-mastery",
    trackId: "private-practice",
    label: "Session mastery",
    description: "Refine session pacing for higher-impact outcomes.",
    costPoints: 2,
    prerequisites: ["private-referrals"],
  },
  {
    id: "va-rotation",
    trackId: "va-hospital",
    label: "VA rotation",
    description: "Learn the rhythm of multi-unit rotations.",
    costPoints: 1,
    prerequisites: ["core-casework"],
  },
  {
    id: "va-protocols",
    trackId: "va-hospital",
    label: "Care protocols",
    description: "Coordinate care using structured protocols.",
    costPoints: 1,
    prerequisites: ["va-rotation"],
  },
  {
    id: "va-coordination",
    trackId: "va-hospital",
    label: "Interdisciplinary coordination",
    description: "Align with the broader care team for steady impact.",
    costPoints: 2,
    prerequisites: ["va-protocols"],
  },
  {
    id: "research-grants",
    trackId: "research-teaching",
    label: "Research grants",
    description: "Secure funding for long-term studies.",
    costPoints: 1,
    prerequisites: ["core-casework"],
  },
  {
    id: "research-lab",
    trackId: "research-teaching",
    label: "Lab collaboration",
    description: "Scale findings through shared research pipelines.",
    costPoints: 1,
    prerequisites: ["research-grants"],
  },
  {
    id: "research-lectures",
    trackId: "research-teaching",
    label: "Teaching lecture series",
    description: "Translate research into clear, repeatable instruction.",
    costPoints: 2,
    prerequisites: ["research-lab"],
  },
];
