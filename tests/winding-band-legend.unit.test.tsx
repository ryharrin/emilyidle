import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WindingMiniGameModal } from "../src/ui/components/WindingMiniGameModal";
import type { UseWindingRunResult } from "../src/ui/components/winding/useWindingRun";

const defaultState: UseWindingRunResult = {
  progress01: 0.5,
  crownAngleDeg: 5,
  tension01: 0.6,
  band: "good",
  phase: "running",
  progressVelocity: 0.02,
  velocity01: 0.75,
  progressPercent: 50,
  tensionPercent: 60,
  velocityPercent: 75,
  stop: vi.fn(),
};

const mockUseWindingRun = vi.fn<[], UseWindingRunResult>(() => defaultState);

vi.mock("../src/ui/components/winding/useWindingRun", () => ({
  useWindingRun: () => mockUseWindingRun(),
}));

describe("winding band legend", () => {
  const defaultState: UseWindingRunResult = {
    progress01: 0.5,
    crownAngleDeg: 5,
    tension01: 0.6,
    band: "good",
    phase: "running",
    progressVelocity: 0.02,
    velocity01: 0.75,
    progressPercent: 50,
    tensionPercent: 60,
    velocityPercent: 75,
    stop: vi.fn(),
  };

  beforeEach(() => {
    mockUseWindingRun.mockImplementation(() => ({ ...defaultState, stop: vi.fn() }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the legend, highlights the active band, and updates the live region", async () => {
    const user = userEvent.setup();
    render(
      <WindingMiniGameModal
        open
        itemLabel="Prototype"
        rewardRangeLabel="Reward"
        cooldownLabel="Cooldown"
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const legend = await screen.findByTestId("winding-band-legend");
    expect(legend).toBeInTheDocument();
    const goodChip = within(legend).getByTestId("winding-band-good");
    expect(goodChip).toHaveClass("active");

    const live = screen.getByTestId("winding-live");
    expect(live).toHaveTextContent(/Tension 60% — Good wind/i);

    const stopButton = screen.getByTestId("winding-stop");
    await user.click(stopButton);
    expect(live).toHaveTextContent(/Stopped at/i);
  });
});
