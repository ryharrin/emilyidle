import { CAREER_TRACKS } from "../data/career";
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

export function selectPrimaryCareerTrack(state: GameState, trackId: CareerTrackId): GameState {
  const career = state.therapistCareer;
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

export function chooseCareerModality(state: GameState, modalityId: CareerModalityId): GameState {
  const career = state.therapistCareer;
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
