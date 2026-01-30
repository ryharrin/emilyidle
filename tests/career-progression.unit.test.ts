import { describe, expect, it } from "vitest";

import { createInitialState } from "../src/game/state";
import { step } from "../src/game/sim";

describe("career progression", () => {
  it("starts with a spendable point and gains points on passive level-ups", () => {
    let state = createInitialState();
    expect(state.therapistCareer.level).toBe(1);
    expect(state.therapistCareer.pointsAvailable).toBeGreaterThanOrEqual(1);

    let nowMs = 0;
    for (let i = 0; i < 50; i += 1) {
      state = step(state, 100, nowMs);
      nowMs += 100;
    }

    expect(state.therapistCareer.level).toBeGreaterThanOrEqual(2);
    expect(state.therapistCareer.pointsAvailable).toBeGreaterThanOrEqual(2);
  });
});
