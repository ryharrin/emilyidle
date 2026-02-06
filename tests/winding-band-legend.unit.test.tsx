import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WindingMiniGameModal } from "../src/ui/components/WindingMiniGameModal";
import type { UseWindingRunResult } from "../src/ui/components/winding/useWindingRun";

const baseBind = {
  onPointerDown: vi.fn(),
  onPointerMove: vi.fn(),
  onPointerUp: vi.fn(),
  onPointerCancel: vi.fn(),
};

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
  softPenalty: false,
  strictPenalty: false,
  stop: vi.fn(),
  bind: baseBind,
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
    softPenalty: false,
    strictPenalty: false,
    stop: vi.fn(),
    bind: baseBind,
  };

  beforeEach(() => {
    mockUseWindingRun.mockImplementation(() => ({
      ...defaultState,
      stop: vi.fn(),
      bind: { ...baseBind },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the legend, highlights the active band, and updates the live region", async () => {
    const user = userEvent.setup();
    render(
      <WindingMiniGameModal
        open
        itemId="chronograph"
        itemLabel="Prototype"
        mode="normal"
        onModeChange={vi.fn()}
        currentPerfectStreak={0}
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
    expect(live).toHaveTextContent(/Keep dragging/i);
    expect(live).toHaveTextContent(/Tension 60%/i);

    const surface = screen.getByTestId("winding-surface");
    await user.click(surface);
    expect(live).toHaveTextContent(/Stopped at/i);
  });
});
