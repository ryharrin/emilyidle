import { CAREER_TRACKS } from "../data/career";
import { CAREER_NODES } from "../data/career";
import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
} from "../data/careerStages";
import type {
  CareerExpansionFocusId,
  CareerModalityId,
  CareerOperatingStyleId,
  CareerTrackId,
  GameState,
} from "../model/types";

import { getTherapistSalaryActiveWindowMs } from "../selectors/therapistSalary";

const LEVEL_UNLOCK_PRIMARY_TRACK = 3;
const LEVEL_UNLOCK_MODALITY = 6;
const LEVEL_UNLOCK_OPERATING_STYLE = 10;
const LEVEL_UNLOCK_EXPANSION_FOCUS = 15;

const TRACK_ID_SET = new Set<CareerTrackId>(CAREER_TRACKS.map((track) => track.id));
const MODALITY_ID_SET = new Set<CareerModalityId>(CAREER_MODALITIES.map((choice) => choice.id));
const OPERATING_STYLE_ID_SET = new Set<CareerOperatingStyleId>(
  CAREER_OPERATING_STYLES.map((choice) => choice.id),
);
const EXPANSION_FOCUS_ID_SET = new Set<CareerExpansionFocusId>(
  CAREER_EXPANSION_FOCUSES.map((choice) => choice.id),
);

const CAREER_NODE_ID_SET = new Set(CAREER_NODES.map((node) => node.id));

export function selectPrimaryCareerTrack(state: GameState, trackId: CareerTrackId): GameState {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return state;
  }
  if (career.level < LEVEL_UNLOCK_PRIMARY_TRACK) {
    return state;
  }
  if (!TRACK_ID_SET.has(trackId)) {
    return state;
  }
  if (career.primaryTrackId !== null || career.activeTrackId !== null) {
    return state;
  }

  return {
    ...state,
    therapistCareer: {
      ...career,
      primaryTrackId: trackId,
      activeTrackId: trackId,
    },
  };
}

export function enterPhdProgram(state: GameState, nowMs: number): GameState {
  const career = state.therapistCareer;
  if (career.careerStartId !== null) {
    return state;
  }

  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const salaryWindowMs = getTherapistSalaryActiveWindowMs(state);

  return {
    ...state,
    therapistCareer: {
      ...career,
      careerStartId: "phd-program",
      salaryActiveUntilMs: clampedNowMs + salaryWindowMs,
    },
  };
}

export function chooseCareerModality(state: GameState, modalityId: CareerModalityId): GameState {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return state;
  }
  if (career.level < LEVEL_UNLOCK_MODALITY) {
    return state;
  }
  if (!MODALITY_ID_SET.has(modalityId)) {
    return state;
  }
  if (career.modalityId !== null) {
    return state;
  }

  return {
    ...state,
    therapistCareer: {
      ...career,
      modalityId,
    },
  };
}

export function chooseCareerOperatingStyle(
  state: GameState,
  operatingStyleId: CareerOperatingStyleId,
): GameState {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return state;
  }
  if (career.level < LEVEL_UNLOCK_OPERATING_STYLE) {
    return state;
  }
  if (!OPERATING_STYLE_ID_SET.has(operatingStyleId)) {
    return state;
  }
  if (career.operatingStyleId !== null) {
    return state;
  }

  return {
    ...state,
    therapistCareer: {
      ...career,
      operatingStyleId,
    },
  };
}

export function chooseCareerExpansionFocus(
  state: GameState,
  expansionFocusId: CareerExpansionFocusId,
): GameState {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return state;
  }
  if (career.level < LEVEL_UNLOCK_EXPANSION_FOCUS) {
    return state;
  }
  if (!EXPANSION_FOCUS_ID_SET.has(expansionFocusId)) {
    return state;
  }
  if (career.expansionFocusId !== null) {
    return state;
  }

  return {
    ...state,
    therapistCareer: {
      ...career,
      expansionFocusId,
    },
  };
}

export function spendCareerNode(state: GameState, nodeId: string, nowMs: number): GameState {
  const career = state.therapistCareer;
  if (!CAREER_NODE_ID_SET.has(nodeId)) {
    return state;
  }

  const node = CAREER_NODES.find((entry) => entry.id === nodeId);
  if (!node) {
    return state;
  }

  if (career.spentNodes[node.id]) {
    return state;
  }
  if (!node.prerequisites.every((id) => career.spentNodes[id])) {
    return state;
  }
  if (career.pointsAvailable < node.costPoints) {
    return state;
  }
  if (node.trackId !== "core" && node.trackId !== career.activeTrackId) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    therapistCareer: {
      ...career,
      pointsAvailable: career.pointsAvailable - node.costPoints,
      spentNodes: {
        ...career.spentNodes,
        [node.id]: true,
      },
    },
  };

  if (career.careerStartId === null) {
    return nextState;
  }

  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  if (clampedNowMs >= career.salaryActiveUntilMs) {
    return nextState;
  }

  const salaryWindowMs = getTherapistSalaryActiveWindowMs(nextState);
  const extendedSalaryUntilMs = clampedNowMs + salaryWindowMs;
  return {
    ...nextState,
    therapistCareer: {
      ...nextState.therapistCareer,
      salaryActiveUntilMs: Math.max(career.salaryActiveUntilMs, extendedSalaryUntilMs),
    },
  };
}

export function respecCareerNodes(state: GameState, nowMs: number): GameState {
  const career = state.therapistCareer;
  const totalSpentPoints = CAREER_NODES.reduce(
    (total, node) => total + (career.spentNodes[node.id] ? node.costPoints : 0),
    0,
  );

  if (totalSpentPoints <= 0) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    therapistCareer: {
      ...career,
      pointsAvailable: career.pointsAvailable + totalSpentPoints,
      spentNodes: {},
    },
  };

  if (career.careerStartId === null) {
    return nextState;
  }

  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  if (clampedNowMs >= career.salaryActiveUntilMs) {
    return nextState;
  }

  const salaryWindowMs = getTherapistSalaryActiveWindowMs(nextState);
  const maxAllowedUntilMs = clampedNowMs + salaryWindowMs;
  return {
    ...nextState,
    therapistCareer: {
      ...nextState.therapistCareer,
      salaryActiveUntilMs: Math.min(career.salaryActiveUntilMs, maxAllowedUntilMs),
    },
  };
}
