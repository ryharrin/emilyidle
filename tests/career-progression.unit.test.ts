import { describe, expect, it } from "vitest";

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
});
