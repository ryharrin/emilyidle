import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CareerTimeline } from "../src/ui/components/CareerTimeline";
import type { CareerModalityId, CareerTrackId } from "../src/game/model/types";
import { CAREER_STAGES } from "../src/game/data/careerStages";
import { createInitialState, enterPhdProgram } from "../src/game/state";
import { step } from "../src/game/sim";

describe("career progression", () => {
  it("starts with a spendable point and gains points on passive level-ups", () => {
    let state = enterPhdProgram(createInitialState(), 0);
    expect(state.therapistCareer.level).toBe(1);
    expect(state.therapistCareer.pointsAvailable).toBe(0);

    let nowMs = 0;
    for (let i = 0; i < 120; i += 1) {
      state = step(state, 1_000, nowMs);
      nowMs += 1_000;
    }

    expect(state.therapistCareer.level).toBeGreaterThanOrEqual(2);
    expect(state.therapistCareer.pointsAvailable).toBeGreaterThanOrEqual(1);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders timeline nodes in deterministic stage order", () => {
    const state = enterPhdProgram(createInitialState(), 0);
    render(<CareerTimeline state={state} />);

    const nodes = screen.getAllByTestId("career-timeline-node");
    const stageOrder = nodes.map((node) => node.getAttribute("data-stage-id"));

    expect(stageOrder).toEqual(CAREER_STAGES.map((stage) => stage.id));
  });

  it("highlights the current stage based on career level", () => {
    const initialState = enterPhdProgram(createInitialState(), 0);
    const progressedState = {
      ...initialState,
      therapistCareer: {
        ...initialState.therapistCareer,
        level: 12,
      },
    };
    render(<CareerTimeline state={progressedState} />);

    const nodes = screen.getAllByTestId("career-timeline-node");
    const currentNode = nodes.find(
      (node) => node.getAttribute("data-stage-id") === "practice-builder",
    );
    expect(currentNode).toBeDefined();
    if (!currentNode) {
      return;
    }
    expect(currentNode).toHaveAttribute("data-status", "current");
  });

  it("describes permanent choice impact when selections exist", () => {
    const initialState = enterPhdProgram(createInitialState(), 0);
    const chosenState = {
      ...initialState,
      therapistCareer: {
        ...initialState.therapistCareer,
        level: 8,
        primaryTrackId: "va-hospital" as CareerTrackId,
        modalityId: "psychodynamic" as CareerModalityId,
      },
    };
    render(<CareerTimeline state={chosenState} />);

    expect(screen.getByText(/Permanent track: VA hospital/)).toBeInTheDocument();
    expect(screen.getAllByText(/Impact:/).length).toBeGreaterThanOrEqual(1);
  });
});
